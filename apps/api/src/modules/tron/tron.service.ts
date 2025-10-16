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
      // Try v1 Transactions (TronGrid) first
      try {
        const res = await this.client.get(`/v1/transactions/${txHash}`);
        const data = res.data;
        const transfers = data?.token_transfers || [];
        if(transfers.length > 0){
          const t = transfers[0];
          const amount = this.normalizeAmount(t.amount, t?.decimals);
          return { ok: true, to: t.to, amount, contract: t.token_address, raw: t };
        }
      } catch (e) {
        // ignore and try fallback
      }

      // Fallback to RPC endpoint used by full nodes
      try {
        const res2 = await this.client.post('/wallet/gettransactionbyid', { value: txHash });
        const data2 = res2.data;
        // try to inspect token transfers inside the receipt or contractResult
        const tokenTransfers = data2?.token_transfers || data2?.ret || [];
        if(tokenTransfers && tokenTransfers.length > 0){
          const t = tokenTransfers[0];
          const amount = this.normalizeAmount(t.amount, t?.decimals || undefined);
          return { ok: true, to: t.to || t?.contractAddress || null, amount, contract: t.token_address || t?.contractAddress || null, raw: t };
        }
        return { ok: false, raw: data2 };
      } catch (e2){
        // final fallback
        const detail = e2?.response?.data || e2?.message || String(e2);
        throw new HttpException(`TRON provider error: ${detail}`, HttpStatus.BAD_GATEWAY);
      }
    } catch (e: any) {
      if (e instanceof HttpException) throw e;
      const detail = e?.response?.data || e?.message || String(e);
      throw new HttpException(`TRON provider error: ${detail}`, HttpStatus.BAD_GATEWAY);
    }
  }
}
