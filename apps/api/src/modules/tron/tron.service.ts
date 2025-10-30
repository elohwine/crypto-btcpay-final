import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class TronService {
  private provider = process.env.TRON_PROVIDER_URL || 'https://api.trongrid.io';
  private apiKey = process.env.TRON_PROVIDER_KEY || '';
  private client = null as any;
  // default USDT on TRON decimals
  private defaultDecimals = Number(process.env.TRON_USDT_DECIMALS || 6);

  constructor(){
    this.reloadClient();
  }

  reloadClient(){
    this.provider = process.env.TRON_PROVIDER_URL || this.provider;
    this.apiKey = process.env.TRON_PROVIDER_KEY || this.apiKey;
    this.client = axios.create({ baseURL: this.provider, timeout: 15000, headers: this.apiKey ? { 'TRON-PRO-API-KEY': this.apiKey } : {} });
  }

  // Normalize token transfer amount using decimals
  private normalizeAmount(rawAmount: any, decimals?: number){
    const dec = typeof decimals === 'number' ? decimals : this.defaultDecimals;
    // rawAmount is usually integer string
    const n = Number(rawAmount);
    if(Number.isNaN(n)) return null;
    return n / Math.pow(10, dec);
  }

  // Verify a TRC-20 transfer by txHash. Returns { ok, to, amount, contract, raw }
  async verifyTx(txHash: string){
    if(!txHash) throw new HttpException('txHash required', HttpStatus.BAD_REQUEST);
    try {
      // Use TronScan API for better TRC20 transaction info
      const network = process.env.TRON_NETWORK || (process.env.TRON_PROVIDER_URL && process.env.TRON_PROVIDER_URL.includes('shasta') ? 'shasta' : 'mainnet');
      const tronscanBase = network === 'mainnet' ? 'https://apilist.tronscan.org' : 'https://shastapi.tronscan.org';
      const url = `${tronscanBase}/api/transaction-info?hash=${txHash}`;
      
      const resp = await this.client.get(url);
      const tx = resp.data;
      
      // Basic mined + executed checks
      if (!tx) {
        return { ok: false, raw: tx };
      }

      // tronscan may return `confirmed: false` even when confirmations are present
      // (different API semantics). Prefer confirmations >= 1 or explicit confirmed === true.
      const confirmations = (typeof tx.confirmations === 'number') ? tx.confirmations : (tx.confirmed ? 1 : 0);
      if (confirmations < 1 && tx.confirmed !== true) {
        return { ok: false, raw: tx };
      }

      // Ensure the contract execution succeeded (contractRet) when available
      if ((tx.contractRet || '').toString().toUpperCase() !== 'SUCCESS') {
        return { ok: false, raw: tx };
      }
      
      // Find TRC20 transfer info
      const tinfo = (tx.trc20TransferInfo && tx.trc20TransferInfo[0]) || (tx.tokenTransferInfo && tx.tokenTransferInfo[0]) || null;
      if (!tinfo) {
        return { ok: false, raw: tx };
      }
      
      // Extract transfer details
      const contract = tinfo.contract_address || tinfo.token_address;
      const to = tinfo.to_address;
      const amountStr = tinfo.amount_str;
      const decimals = tinfo.decimals || this.defaultDecimals;
      
      // Convert amount to human readable
      const amount = amountStr ? Number(amountStr) / Math.pow(10, decimals) : null;
      
      return { 
        ok: true, 
        to, 
        amount, 
        contract, 
        raw: tx,
        confirmations: tx.confirmations,
        block: tx.block
      };
      
    } catch (e: any) {
      if (e instanceof HttpException) throw e;
      const detail = e?.response?.data || e?.message || String(e);
      throw new HttpException(`TRON provider error: ${detail}`, HttpStatus.BAD_GATEWAY);
    }
  }
}
