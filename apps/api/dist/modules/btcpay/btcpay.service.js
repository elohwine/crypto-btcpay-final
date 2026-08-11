"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BtcpayService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const axios_1 = require("axios");
const crypto = require("crypto");
let BtcpayService = class BtcpayService {
    constructor(configService) {
        this.configService = configService;
        this.host = 'http://localhost:49392';
        this.apiKey = '';
        this.storeId = '';
        this.webhookSecret = '';
        this.client = axios_1.default.create();
    }
    onModuleInit() {
        this.reloadClientFromEnv();
    }
    reloadClientFromEnv() {
        this.host = this.configService.get('BTCPAY_HOST') || process.env.BTCPAY_HOST || this.host;
        this.apiKey = this.configService.get('BTCPAY_API_KEY') || process.env.BTCPAY_API_KEY || this.apiKey;
        this.storeId = this.configService.get('BTCPAY_STORE_ID') || process.env.BTCPAY_STORE_ID || this.storeId;
        this.webhookSecret = this.configService.get('BTCPAY_WEBHOOK_SECRET') || process.env.BTCPAY_WEBHOOK_SECRET || this.webhookSecret;
        try {
            const masked = this.apiKey ? `${this.apiKey.slice(0, 6)}...${this.apiKey.slice(-4)}` : '<missing>';
            console.log(`[BtcpayService] init host=${this.host} apiKey=${masked} storeId=${this.storeId ? this.storeId : '<missing>'}`);
        }
        catch (e) { }
        this.client = axios_1.default.create({ baseURL: this.host + '/api/v1', timeout: 30000, headers: { Authorization: `token ${this.apiKey}` } });
    }
    async getStoreId() {
        if (this.storeId)
            return this.storeId;
        try {
            const res = await this.client.get('/stores');
            const id = Array.isArray(res.data) && res.data[0]?.id;
            if (!id)
                throw new Error('No store found for the API key');
            this.storeId = id;
            return id;
        }
        catch (e) {
            const detail = e?.response?.data || e?.message || String(e);
            throw new common_1.HttpException(`BTCPay store discovery failed: ${detail}`, common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async createInvoice(amount, currency = 'USDT', metadata = {}) {
        const sid = await this.getStoreId();
        const baseBody = { currency };
        if (amount != null)
            baseBody.amount = String(amount);
        baseBody.metadata = metadata;
        const preferredCheckout = { paymentMethods: ['USDT-TRON'], defaultPaymentMethod: 'USDT-TRON' };
        try {
            const body = { ...baseBody, checkout: preferredCheckout };
            const res = await this.client.post(`/stores/${sid}/invoices`, body);
            console.log(`[BtcpayService] Created invoice response:`, JSON.stringify(res.data, null, 2));
            console.log(`[BtcpayService] Invoice ID extracted: ${res.data?.data?.id || res.data?.id || 'NONE'}`);
            console.log(`[BtcpayService] Invoice status: ${res.data?.data?.status || res.data?.status || 'unknown'}`);
            return res.data;
        }
        catch (e) {
            const detail = e?.response?.data || e?.message || String(e);
            const message = (typeof detail === 'string') ? detail : JSON.stringify(detail);
            console.warn('[BtcpayService] preferred invoice creation failed, will attempt fallback. Detail:', message);
            const fallbackTriggers = [
                'Unable to get rate',
                'Payment method unavailable',
                'Error retrieving a matching payment method',
                'Rate rule error',
                'ERR_TOO_MUCH_NESTED_CALLS',
                'Invalid PaymentMethodId',
                'Invalid PaymentMethod'
            ];
            const shouldFallback = fallbackTriggers.some(t => message.includes(t)) || message.includes('ENOTFOUND') || message.includes('getaddrinfo');
            if (!shouldFallback) {
                console.error('BTCPay create invoice error (no fallback):', message);
                throw new common_1.HttpException(`Failed to create invoice: ${message}`, common_1.HttpStatus.BAD_REQUEST);
            }
            try {
                const retryRes = await this.client.post(`/stores/${sid}/invoices`, baseBody);
                console.log(`[BtcpayService] Fallback invoice response:`, JSON.stringify(retryRes.data, null, 2));
                console.log(`[BtcpayService] Fallback invoice ID extracted: ${retryRes.data?.data?.id || retryRes.data?.id || 'NONE'}`);
                console.log(`[BtcpayService] Fallback invoice status: ${retryRes.data?.data?.status || retryRes.data?.status || 'unknown'}`);
                return retryRes.data;
            }
            catch (e2) {
                const d2 = e2?.response?.data || e2?.message || String(e2);
                console.error('BTCPay create invoice fallback also failed:', d2);
                throw new common_1.HttpException(`Failed to create invoice: ${JSON.stringify(d2)}`, common_1.HttpStatus.BAD_REQUEST);
            }
        }
    }
    async getStoreWalletAddressStatus(currency = 'USDT', storeId) {
        const sid = storeId || await this.getStoreId();
        try {
            console.log('[BtcpayService] Requesting wallet address with headers:', this.client.defaults.headers);
            const res = await this.client.get(`/stores/${sid}/payment-methods?includeConfig=true`);
            console.log('[BtcpayService] DEBUG raw payment-methods response:', JSON.stringify(res.data));
            const methods = Array.isArray(res.data) ? res.data : [];
            for (const pm of methods) {
                const id = String(pm.paymentMethodId || pm.cryptoCode || '').toUpperCase();
                const cfg = pm.config || pm.data || {};
                if (cfg) {
                    if (Array.isArray(cfg.addresses) && cfg.addresses.length > 0) {
                        const a = String(cfg.addresses[0]);
                        if (a && a.startsWith('T'))
                            return { address: a, source: 'store' };
                    }
                    const possible = cfg.address || cfg.account || cfg.depositAddress || cfg.wallet || cfg.trc20Address;
                    if (possible && String(possible).startsWith('T'))
                        return { address: String(possible), source: 'store' };
                }
                if (pm && pm.config && typeof pm.config === 'object') {
                    const flat = JSON.stringify(pm.config);
                    const re = /\b(T[1-9A-HJ-NP-Za-km-z]{33,})\b/;
                    const m = flat.match(re);
                    if (m && m[1])
                        return { address: m[1], source: 'store' };
                }
                if (/TRON|TRX|USDT-TRON|USDT_TRON|USDTTRON/i.test(id) && pm.config) {
                    const cfgStr = JSON.stringify(pm.config || {});
                    const re = /\b(T[1-9A-HJ-NP-Za-km-z]{33,})\b/;
                    const m = cfgStr.match(re);
                    if (m && m[1])
                        return { address: m[1], source: 'store' };
                }
            }
            const serialized = JSON.stringify(res.data || {});
            const re = /\b(T[1-9A-HJ-NP-Za-km-z]{33,})\b/;
            const m = serialized.match(re);
            if (m && m[1])
                return { address: m[1], source: 'store' };
            return { address: null };
        }
        catch (e) {
            const detail = e?.response?.data || e?.message || String(e);
            console.warn('[BtcpayService] getStoreWalletAddressStatus failed', detail);
            console.warn('[BtcpayService] DEBUG error object:', JSON.stringify(e));
            if (e?.response) {
                console.log('[BtcpayService] Error response headers:', e.response.headers);
                console.log('[BtcpayService] Error response status:', e.response.status);
            }
            if (detail && typeof detail === 'object' && detail.missingPermission) {
                return { address: null, missingPermission: detail.missingPermission, error: detail.message || JSON.stringify(detail) };
            }
            return { address: null, error: String(detail) };
        }
    }
    async getStoreWalletAddress(currency = 'USDT', storeId) {
        const status = await this.getStoreWalletAddressStatus(currency, storeId);
        return status.address || null;
    }
    verifySignature(raw, sigHeader) {
        if (!this.webhookSecret)
            return false;
        const expected = 'sha256=' + crypto.createHmac('sha256', this.webhookSecret).update(raw).digest('hex');
        try {
            return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(sigHeader));
        }
        catch (e) {
            return false;
        }
    }
    async settleInvoice(invoiceId, status = 'Settled', force = false) {
        const sid = await this.getStoreId();
        try {
            console.log(`[BtcpayService] Fetching invoice ${invoiceId} from store ${sid}`);
            const currentInvoice = await this.client.get(`/stores/${sid}/invoices/${invoiceId}`);
            console.log(`[BtcpayService] Invoice ${invoiceId} fetch response:`, JSON.stringify(currentInvoice.data, null, 2));
            const currentStatus = currentInvoice.data.status;
            console.log(`[BtcpayService] Current invoice ${invoiceId} status: ${currentStatus}`);
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
            const res = await this.client.post(`/stores/${sid}/invoices/${invoiceId}/status`, { status });
            console.log(`[BtcpayService] Successfully settled invoice ${invoiceId} with status ${status}`);
            return res.data;
        }
        catch (err) {
            const errorMsg = err?.response?.data?.message || err?.response?.data || err?.message || 'Failed to settle invoice';
            console.log(`[BtcpayService] settleInvoice failed for ${invoiceId}:`, errorMsg);
            console.log(`[BtcpayService] Error response:`, JSON.stringify(err?.response?.data, null, 2));
            if (err?.response?.status === 404) {
                console.log(`[BtcpayService] Invoice ${invoiceId} not found (404)`);
                return { error: `Invoice not found: ${invoiceId}` };
            }
            return { error: errorMsg };
        }
    }
    async getInvoice(invoiceId) {
        const sid = await this.getStoreId();
        try {
            const res = await this.client.get(`/stores/${sid}/invoices/${invoiceId}`);
            return res.data;
        }
        catch (e) {
            if (e?.response?.status === 404)
                return null;
            const detail = e?.response?.data || e?.message || String(e);
            console.warn('[BtcpayService] getInvoice failed', detail);
            throw new common_1.HttpException(`Failed to fetch invoice: ${detail}`, common_1.HttpStatus.BAD_GATEWAY);
        }
    }
};
exports.BtcpayService = BtcpayService;
exports.BtcpayService = BtcpayService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], BtcpayService);
//# sourceMappingURL=btcpay.service.js.map