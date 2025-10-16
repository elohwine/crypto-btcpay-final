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
exports.TronService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("axios");
let TronService = class TronService {
    constructor() {
        this.provider = process.env.TRON_PROVIDER_URL || 'https://api.trongrid.io';
        this.apiKey = process.env.TRON_PROVIDER_KEY || '';
        this.client = null;
        this.defaultDecimals = Number(process.env.TRON_USDT_DECIMALS || 6);
        this.reloadClient();
    }
    reloadClient() {
        this.provider = process.env.TRON_PROVIDER_URL || this.provider;
        this.apiKey = process.env.TRON_PROVIDER_KEY || this.apiKey;
        this.client = axios_1.default.create({ baseURL: this.provider, timeout: 15000, headers: this.apiKey ? { 'TRON-PRO-API-KEY': this.apiKey } : {} });
    }
    normalizeAmount(rawAmount, decimals) {
        const dec = typeof decimals === 'number' ? decimals : this.defaultDecimals;
        const n = Number(rawAmount);
        if (Number.isNaN(n))
            return null;
        return n / Math.pow(10, dec);
    }
    async verifyTx(txHash) {
        if (!txHash)
            throw new common_1.HttpException('txHash required', common_1.HttpStatus.BAD_REQUEST);
        try {
            try {
                const res = await this.client.get(`/v1/transactions/${txHash}`);
                const data = res.data;
                const transfers = data?.token_transfers || [];
                if (transfers.length > 0) {
                    const t = transfers[0];
                    const amount = this.normalizeAmount(t.amount, t?.decimals);
                    return { ok: true, to: t.to, amount, contract: t.token_address, raw: t };
                }
            }
            catch (e) {
            }
            try {
                const res2 = await this.client.post('/wallet/gettransactionbyid', { value: txHash });
                const data2 = res2.data;
                const tokenTransfers = data2?.token_transfers || data2?.ret || [];
                if (tokenTransfers && tokenTransfers.length > 0) {
                    const t = tokenTransfers[0];
                    const amount = this.normalizeAmount(t.amount, t?.decimals || undefined);
                    return { ok: true, to: t.to || t?.contractAddress || null, amount, contract: t.token_address || t?.contractAddress || null, raw: t };
                }
                return { ok: false, raw: data2 };
            }
            catch (e2) {
                const detail = e2?.response?.data || e2?.message || String(e2);
                throw new common_1.HttpException(`TRON provider error: ${detail}`, common_1.HttpStatus.BAD_GATEWAY);
            }
        }
        catch (e) {
            if (e instanceof common_1.HttpException)
                throw e;
            const detail = e?.response?.data || e?.message || String(e);
            throw new common_1.HttpException(`TRON provider error: ${detail}`, common_1.HttpStatus.BAD_GATEWAY);
        }
    }
};
exports.TronService = TronService;
exports.TronService = TronService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], TronService);
//# sourceMappingURL=tron.service.js.map