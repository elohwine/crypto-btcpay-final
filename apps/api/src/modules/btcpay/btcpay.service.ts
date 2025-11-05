import { Injectable, HttpException, HttpStatus, Inject, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import * as crypto from 'crypto';

@Injectable()
export class BtcpayService implements OnModuleInit {
  // Do NOT default to localhost; only enable when explicitly configured
  private host = '';
  private apiKey = '';
  private storeId = '';
  private webhookSecret = '';
  private enabled = false;

  private client = axios.create();

  constructor(private configService: ConfigService) {
    // prefer ConfigService values; client will be (re)loaded on module init
  }

  onModuleInit() {
    this.reloadClientFromEnv();
  }

  private reloadClientFromEnv() {
    // Use ConfigService when available; fall back to process.env
    const envHost = this.configService.get<string>('BTCPAY_HOST') || process.env.BTCPAY_HOST || '';
    const envKey = this.configService.get<string>('BTCPAY_API_KEY') || process.env.BTCPAY_API_KEY || '';
    const envStore = this.configService.get<string>('BTCPAY_STORE_ID') || process.env.BTCPAY_STORE_ID || '';
    this.webhookSecret = this.configService.get<string>('BTCPAY_WEBHOOK_SECRET') || process.env.BTCPAY_WEBHOOK_SECRET || '';

    // Enable rules:
    // - If BTCPAY_ENABLED is explicitly 'true' => enabled
    // - If BTCPAY_ENABLED is 'false' => disabled
    // - Else: enabled only if host+key+store present AND SKIP_BTCPAY !== 'true'
    const explicit = (this.configService.get<string>('BTCPAY_ENABLED') || process.env.BTCPAY_ENABLED || '').toLowerCase();
    const skip = (this.configService.get<string>('SKIP_BTCPAY') || process.env.SKIP_BTCPAY || '').toLowerCase() === 'true';
    const hasCreds = !!(envHost && envKey && envStore);
    if (explicit === 'true') this.enabled = true;
    else if (explicit === 'false') this.enabled = false;
    else this.enabled = hasCreds && !skip;

    this.host = envHost;
    this.apiKey = envKey;
    this.storeId = envStore;

    // small masked debug log to confirm runtime env values (safe for logs)
    try {
      const masked = this.apiKey ? `${this.apiKey.slice(0,6)}...${this.apiKey.slice(-4)}` : '<missing>';
      console.log(`[BtcpayService] ${this.enabled ? 'enabled' : 'disabled'} host=${this.host || '<none>'} apiKey=${masked} storeId=${this.storeId ? this.storeId : '<missing>'}`);
    } catch (e) { /* ignore logging errors */ }
    this.client = axios.create({ baseURL: (this.host ? this.host + '/api/v1' : ''), timeout: 30000, headers: { Authorization: `token ${this.apiKey}` } });
  }

  isEnabled(){ return this.enabled; }

  private async getStoreId(): Promise<string> {
    if (!this.enabled) {
      throw new HttpException('BTCPay disabled', HttpStatus.BAD_REQUEST);
    }
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
    if (!this.enabled) {
      throw new HttpException('BTCPay disabled', HttpStatus.BAD_REQUEST);
    }
    const sid = await this.getStoreId();
    const baseBody: any = { currency };
    if (amount != null)
      baseBody.amount = String(amount);
    baseBody.metadata = metadata;

    // First attempt: prefer USDT-TRON (fast path for Tron-only flows)
    const preferredCheckout = { paymentMethods: ['USDT-TRON'], defaultPaymentMethod: 'USDT-TRON' };

    try {
      const body = { ...baseBody, checkout: preferredCheckout };
      const res = await this.client.post(`/stores/${sid}/invoices`, body);
      console.log(`[BtcpayService] Created invoice response:`, JSON.stringify(res.data, null, 2));
      console.log(`[BtcpayService] Invoice ID extracted: ${res.data?.data?.id || res.data?.id || 'NONE'}`);
      console.log(`[BtcpayService] Invoice status: ${res.data?.data?.status || res.data?.status || 'unknown'}`);
      return res.data;
    } catch (e: any) {
      // Inspect error to decide whether to retry without forcing methods.
      const detail = e?.response?.data || e?.message || String(e);
      const message = (typeof detail === 'string') ? detail : JSON.stringify(detail);
      console.warn('[BtcpayService] preferred invoice creation failed, will attempt fallback. Detail:', message);

      // Known plugin/rate errors that should trigger a fallback attempt
      const fallbackTriggers = ['Unable to get rate', 'Payment method unavailable', 'Error retrieving a matching payment method', 'Rate rule error', 'ERR_TOO_MUCH_NESTED_CALLS'];
      const shouldFallback = fallbackTriggers.some(t => message.includes(t)) || message.includes('ENOTFOUND') || message.includes('getaddrinfo');

      if (!shouldFallback) {
        // Not a graceful fallback case — surface original error
        console.error('BTCPay create invoice error (no fallback):', message);
        throw new HttpException(`Failed to create invoice: ${message}`, HttpStatus.BAD_REQUEST);
      }

      // Retry without forcing payment methods — allow BTCPay to select any available method
      try {
        const retryRes = await this.client.post(`/stores/${sid}/invoices`, baseBody);
        console.log(`[BtcpayService] Fallback invoice response:`, JSON.stringify(retryRes.data, null, 2));
        console.log(`[BtcpayService] Fallback invoice ID extracted: ${retryRes.data?.data?.id || retryRes.data?.id || 'NONE'}`);
        console.log(`[BtcpayService] Fallback invoice status: ${retryRes.data?.data?.status || retryRes.data?.status || 'unknown'}`);
        return retryRes.data;
      } catch (e2: any) {
        const d2 = e2?.response?.data || e2?.message || String(e2);
        console.error('BTCPay create invoice fallback also failed:', d2);
        throw new HttpException(`Failed to create invoice: ${JSON.stringify(d2)}`, HttpStatus.BAD_REQUEST);
      }
    }
  }

  /**
   * Attempt to derive a store-configured wallet address for the given currency.
   * This queries the store payment-methods and searches the returned JSON for
   * a Tron-style address (starts with 'T'). This is safer than trusting
   * arbitrary invoice metadata provided by callers.
   */
  /**
   * Returns a detailed status for the store wallet address lookup.
   * { address?: string|null, source?: 'store'|'env', missingPermission?: string, error?: string }
   */
  async getStoreWalletAddressStatus(currency = 'USDT', storeId?: string){
    if (!this.enabled) {
      return { address: null, error: 'BTCPay disabled' } as any;
    }
    const sid = storeId || await this.getStoreId();
    try {
      // Log request headers for debugging
      console.log('[BtcpayService] Requesting wallet address with headers:', this.client.defaults.headers);
      const res = await this.client.get(`/stores/${sid}/payment-methods?includeConfig=true`);
      console.log('[BtcpayService] DEBUG raw payment-methods response:', JSON.stringify(res.data));
      const methods = Array.isArray(res.data) ? res.data : [];
      // Prefer structured fields when present
      for (const pm of methods) {
        const id = String(pm.paymentMethodId || pm.cryptoCode || '').toUpperCase();
        const cfg = pm.config || pm.data || {};
        if (cfg) {
          if (Array.isArray(cfg.addresses) && cfg.addresses.length > 0) {
            const a = String(cfg.addresses[0]);
            if (a && a.startsWith('T')) return { address: a, source: 'store' };
          }
          const possible = cfg.address || cfg.account || cfg.depositAddress || cfg.wallet || cfg.trc20Address;
          if (possible && String(possible).startsWith('T')) return { address: String(possible), source: 'store' };
        }
        if (pm && pm.config && typeof pm.config === 'object') {
          const flat = JSON.stringify(pm.config);
          const re = /\b(T[1-9A-HJ-NP-Za-km-z]{33,})\b/;
          const m = flat.match(re);
          if (m && m[1]) return { address: m[1], source: 'store' };
        }
        if (/TRON|TRX|USDT-TRON|USDT_TRON|USDTTRON/i.test(id) && pm.config) {
          const cfgStr = JSON.stringify(pm.config || {});
          const re = /\b(T[1-9A-HJ-NP-Za-km-z]{33,})\b/;
          const m = cfgStr.match(re);
          if (m && m[1]) return { address: m[1], source: 'store' };
        }
      }
      const serialized = JSON.stringify(res.data || {});
      const re = /\b(T[1-9A-HJ-NP-Za-km-z]{33,})\b/;
      const m = serialized.match(re);
      if (m && m[1]) return { address: m[1], source: 'store' };
      return { address: null };
    } catch (e: any) {
      const detail = e?.response?.data || e?.message || String(e);
      console.warn('[BtcpayService] getStoreWalletAddressStatus failed', detail);
      console.warn('[BtcpayService] DEBUG error object:', JSON.stringify(e));
      if (e?.response) {
        console.log('[BtcpayService] Error response headers:', e.response.headers);
        console.log('[BtcpayService] Error response status:', e.response.status);
      }
      // If BTCPay reports missingPermission, return that in the status so callers can act.
      if (detail && typeof detail === 'object' && detail.missingPermission) {
        return { address: null, missingPermission: detail.missingPermission, error: detail.message || JSON.stringify(detail) };
      }
      return { address: null, error: String(detail) };
    }
  }

  async getStoreWalletAddress(currency = 'USDT', storeId?: string){
    const status = await this.getStoreWalletAddressStatus(currency, storeId);
    return status.address || null;
  }

  verifySignature(raw: Buffer, sigHeader: string){
    if(!this.webhookSecret) return false;
    const expected = 'sha256=' + crypto.createHmac('sha256', this.webhookSecret).update(raw).digest('hex');
    try{ return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(sigHeader)); }catch(e){ return false; }
  }

  async settleInvoice(invoiceId: string, status = 'Settled', force = false){
    if (!this.enabled) {
      return { error: 'BTCPay disabled' } as any;
    }
    const sid = await this.getStoreId();
    try {
      // First check current invoice status
      console.log(`[BtcpayService] Fetching invoice ${invoiceId} from store ${sid}`);
      const currentInvoice = await this.client.get(`/stores/${sid}/invoices/${invoiceId}`);
      console.log(`[BtcpayService] Invoice ${invoiceId} fetch response:`, JSON.stringify(currentInvoice.data, null, 2));
      const currentStatus = currentInvoice.data.status;
      console.log(`[BtcpayService] Current invoice ${invoiceId} status: ${currentStatus}`);
      
      // Only settle if invoice is in a payable state (unless forced for on-chain payments)
      if (currentStatus === 'Settled') {
        console.log(`[BtcpayService] Invoice ${invoiceId} is already settled`);
        return currentInvoice.data;
      }
      
      if (currentStatus === 'Invalid') {
        console.log(`[BtcpayService] Skipping settlement of invalid invoice ${invoiceId}`);
        return { error: `Cannot settle invalid invoice: ${invoiceId}` };
      }
      
      if (!force && !['New', 'Paid', 'Underpaid', 'Overpaid'].includes(currentStatus)) {
        console.log(`[BtcpayService] Cannot settle invoice ${invoiceId} with status: ${currentStatus} (use force=true for on-chain settlements)`);
        return { error: `Cannot settle invoice with status: ${currentStatus}` };
      }
      
      // BTCPay API to mark invoice as settled - use POST to /status endpoint
      const res = await this.client.post(`/stores/${sid}/invoices/${invoiceId}/status`, { status });
      console.log(`[BtcpayService] Successfully settled invoice ${invoiceId} with status ${status}`);
      return res.data;
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || err?.response?.data || err?.message || 'Failed to settle invoice';
      console.log(`[BtcpayService] settleInvoice failed for ${invoiceId}:`, errorMsg);
      console.log(`[BtcpayService] Error response:`, JSON.stringify(err?.response?.data, null, 2));
      
      // If it's a 404, the invoice might not exist
      if (err?.response?.status === 404) {
        console.log(`[BtcpayService] Invoice ${invoiceId} not found (404)`);
        return { error: `Invoice not found: ${invoiceId}` };
      }
      
      return { error: errorMsg };
    }
  }

  // Fetch a single invoice by id. Returns invoice object or null if not found.
  async getInvoice(invoiceId: string){
    if (!this.enabled) return null;
    const sid = await this.getStoreId();
    try {
      const res = await this.client.get(`/stores/${sid}/invoices/${invoiceId}`);
      return res.data;
    } catch (e: any) {
      if (e?.response?.status === 404) return null;
      const detail = e?.response?.data || e?.message || String(e);
      console.warn('[BtcpayService] getInvoice failed', detail);
      throw new HttpException(`Failed to fetch invoice: ${detail}`, HttpStatus.BAD_GATEWAY);
    }
  }
}
