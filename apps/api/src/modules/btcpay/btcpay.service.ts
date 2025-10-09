import { Injectable, HttpException, HttpStatus, Inject } from '@nestjs/common';
import axios from 'axios';
import * as crypto from 'crypto';

@Injectable()
export class BtcpayService {
  // Default to localhost for smoother local dev; override via BTCPAY_HOST in Docker
  private host = process.env.BTCPAY_HOST || 'http://localhost:49392';
  private apiKey = process.env.BTCPAY_API_KEY || '';
  private storeId = process.env.BTCPAY_STORE_ID || '';
  private webhookSecret = process.env.BTCPAY_WEBHOOK_SECRET || '';

  private client = axios.create();

  constructor() {
    // Build the axios client using current environment variables (ensures .env loaded by the process is picked up)
    this.reloadClientFromEnv();
  }

  private reloadClientFromEnv() {
    this.host = process.env.BTCPAY_HOST || this.host;
    this.apiKey = process.env.BTCPAY_API_KEY || this.apiKey;
    this.storeId = process.env.BTCPAY_STORE_ID || this.storeId;
    this.webhookSecret = process.env.BTCPAY_WEBHOOK_SECRET || this.webhookSecret;
    this.client = axios.create({ baseURL: this.host + '/api/v1', timeout: 30000, headers: { Authorization: `token ${this.apiKey}` } });
  }

  private async getStoreId(): Promise<string> {
    if (this.storeId) return this.storeId;
    try {
      const res = await this.client.get('/stores');
      const id = Array.isArray(res.data) && res.data[0]?.id;
      if (!id) throw new Error('No store found for the API key');
      this.storeId = id;
      return id;
    } catch (e: any) {
      const detail = e?.response?.data || e?.message || String(e);
      throw new HttpException(`BTCPay store discovery failed: ${detail}`, HttpStatus.BAD_REQUEST);
    }
  }

  async createInvoice(amount?: number, currency = 'USDT', metadata: any = {}){
    try {
      const sid = await this.getStoreId();
      const body: any = { currency };
      if (amount != null) body.amount = String(amount);
      body.metadata = metadata;
      const res = await this.client.post(`/stores/${sid}/invoices`, body);
      return res.data;
    } catch (e: any) {
      const status = e?.response?.status;
      const detail = e?.response?.data || e?.message || String(e);
      if (status === 404) {
        console.error('BTCPay create invoice 404. Check Store ID and token permissions. Detail:', detail);
      } else {
        console.error('BTCPay create invoice error', detail);
      }
      throw new HttpException(`Failed to create invoice: ${detail}`, HttpStatus.BAD_REQUEST);
    }
  }

  verifySignature(raw: Buffer, sigHeader: string){
    if(!this.webhookSecret) return false;
    const expected = 'sha256=' + crypto.createHmac('sha256', this.webhookSecret).update(raw).digest('hex');
    try{ return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(sigHeader)); }catch(e){ return false; }
  }
}
