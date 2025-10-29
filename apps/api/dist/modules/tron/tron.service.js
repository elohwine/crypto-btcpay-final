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
            const network = process.env.TRON_NETWORK || (process.env.TRON_PROVIDER_URL && process.env.TRON_PROVIDER_URL.includes('shasta') ? 'shasta' : 'mainnet');
            const tronscanBase = network === 'mainnet' ? 'https://apilist.tronscan.org' : 'https://shastapi.tronscan.org';
            const url = `${tronscanBase}/api/transaction-info?hash=${txHash}`;
            const resp = await this.client.get(url);
            const tx = resp.data;
            if (!tx) {
                return { ok: false, raw: tx };
            }
            const confirmations = (typeof tx.confirmations === 'number') ? tx.confirmations : (tx.confirmed ? 1 : 0);
            if (confirmations < 1 && tx.confirmed !== true) {
                return { ok: false, raw: tx };
            }
            if ((tx.contractRet || '').toString().toUpperCase() !== 'SUCCESS') {
                return { ok: false, raw: tx };
            }
            const tinfo = (tx.trc20TransferInfo && tx.trc20TransferInfo[0]) || (tx.tokenTransferInfo && tx.tokenTransferInfo[0]) || null;
            if (!tinfo) {
                return { ok: false, raw: tx };
            }
            const contract = tinfo.contract_address || tinfo.token_address;
            const to = tinfo.to_address;
            const amountStr = tinfo.amount_str;
            const decimals = tinfo.decimals || this.defaultDecimals;
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