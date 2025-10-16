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
const axios_1 = require("axios");
const crypto = require("crypto");
let BtcpayService = class BtcpayService {
    constructor() {
        this.host = process.env.BTCPAY_HOST || 'http://localhost:49392';
        this.apiKey = process.env.BTCPAY_API_KEY || '';
        this.storeId = process.env.BTCPAY_STORE_ID || '';
        this.webhookSecret = process.env.BTCPAY_WEBHOOK_SECRET || '';
        this.client = axios_1.default.create();
        this.reloadClientFromEnv();
    }
    reloadClientFromEnv() {
        this.host = process.env.BTCPAY_HOST || this.host;
        this.apiKey = process.env.BTCPAY_API_KEY || this.apiKey;
        this.storeId = process.env.BTCPAY_STORE_ID || this.storeId;
        this.webhookSecret = process.env.BTCPAY_WEBHOOK_SECRET || this.webhookSecret;
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
        try {
            const sid = await this.getStoreId();
            const body = { currency };
            if (amount != null)
                body.amount = String(amount);
            body.metadata = metadata;
            body.checkout = {
                paymentMethods: ['USDT-TRON'],
                defaultPaymentMethod: 'USDT-TRON'
            };
            const res = await this.client.post(`/stores/${sid}/invoices`, body);
            return res.data;
        }
        catch (e) {
            const status = e?.response?.status;
            const detail = e?.response?.data || e?.message || String(e);
            if (status === 404) {
                console.error('BTCPay create invoice 404. Check Store ID and token permissions. Detail:', detail);
            }
            else {
                console.error('BTCPay create invoice error', detail);
            }
            throw new common_1.HttpException(`Failed to create invoice: ${detail}`, common_1.HttpStatus.BAD_REQUEST);
        }
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
};
exports.BtcpayService = BtcpayService;
exports.BtcpayService = BtcpayService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], BtcpayService);
//# sourceMappingURL=btcpay.service.js.map