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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DepositsController = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const btcpay_service_1 = require("../btcpay/btcpay.service");
const tron_service_1 = require("../tron/tron.service");
const ledger_service_1 = require("../ledger/ledger.service");
let DepositsController = class DepositsController {
    constructor(prisma, btcpayService, tronService, ledgerService) {
        this.prisma = prisma;
        this.btcpayService = btcpayService;
        this.tronService = tronService;
        this.ledgerService = ledgerService;
    }
    async create(body) {
        const { currency, amount, userId, walletAddress } = body;
        const user = userId || 'seed-user';
        if ((currency || 'USDT') === 'USDT' && !walletAddress) {
            return { error: 'Wallet address required for USDT payments' };
        }
        const metadata = {
            userId: user,
            walletAddress: walletAddress || null
        };
        const invoice = await this.btcpayService.createInvoice(amount ? Number(amount) : undefined, currency || 'USDT', metadata);
        const invoiceId = invoice?.data?.id || invoice?.id;
        const checkout = invoice?.data?.checkoutLink || invoice?.checkoutLink || null;
        console.log(`[Deposits] create -> user=${user} amount=${amount} currency=${currency} invoiceId=${invoiceId} wallet=${walletAddress}`);
        const dep = await this.prisma.deposit.create({
            data: {
                userId: user,
                invoiceId,
                amount: amount ? Number(amount) : 0.0,
                currency: currency || 'USDT',
                status: 'PENDING',
                btcpayStatus: 'NEW',
                walletAddress: walletAddress || null
            }
        });
        console.log(`[Deposits] persisted -> depositId=${dep.id} invoiceId=${invoiceId} status=${dep.status}`);
        return {
            depositId: dep.id,
            paymentUrl: checkout,
            invoiceId,
            walletAddress: walletAddress,
            expiresAt: invoice?.data?.expirationTime || null
        };
    }
    async direct(body) {
        const { txHash, contract, toAddress, amount, userId } = body;
        const user = userId || 'seed-user';
        if (!txHash)
            return { error: 'txHash required' };
        console.log(`[Deposits] direct -> tx=${txHash} user=${user} contract=${contract} to=${toAddress} amount=${amount}`);
        const existingByTx = await this.prisma.deposit.findFirst({ where: { txHash } });
        if (existingByTx) {
            console.log(`[Deposits] direct -> already processed tx=${txHash} depositId=${existingByTx.id}`);
            return { ok: true, depositId: existingByTx.id, status: existingByTx.status };
        }
        if (!this.tronService)
            return { error: 'TronService not available' };
        const verified = await this.tronService.verifyTx(txHash);
        if (!verified || !verified.ok)
            return { error: 'tx not found or invalid', detail: verified?.raw };
        const txTo = verified.to || verified.raw?.to || null;
        const txContract = verified.contract || verified.raw?.token_address || null;
        const txAmount = verified.amount || (verified.raw?.amount ? Number(verified.raw.amount) : null);
        if (contract && txContract && contract.toLowerCase() !== txContract.toLowerCase()) {
            return { error: 'contract mismatch', txContract };
        }
        if (toAddress && txTo && toAddress !== txTo) {
            return { error: 'recipient mismatch', txTo };
        }
        const depData = {
            userId: user,
            invoiceId: `tx-${txHash}`,
            txHash,
            amount: amount ? Number(amount) : (txAmount ? Number(txAmount) : 0),
            currency: 'USDT',
            status: 'CONFIRMED',
            btcpayStatus: 'ONCHAIN',
            walletAddress: txTo || null,
            confirmedAt: new Date()
        };
        const dep = await this.prisma.deposit.create({ data: depData });
        console.log(`[Deposits] direct persisted -> depositId=${dep.id} tx=${txHash} amount=${dep.amount}`);
        if (this.ledgerService) {
            const decimals = Number(process.env.TRON_USDT_DECIMALS || 6);
            const minor = Math.round((dep.amount || 0) * Math.pow(10, decimals));
            await this.ledgerService.post(null, `Assets:Custody:${dep.currency}`, BigInt(minor), dep.currency, 'deposit', dep.id);
            await this.ledgerService.post(dep.userId, `Liabilities:User:${dep.userId}:${dep.currency}`, BigInt(-minor), dep.currency, 'deposit', dep.id);
        }
        return { ok: true, depositId: dep.id, status: dep.status };
    }
};
exports.DepositsController = DepositsController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DepositsController.prototype, "create", null);
__decorate([
    (0, common_1.Post)('direct'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DepositsController.prototype, "direct", null);
exports.DepositsController = DepositsController = __decorate([
    (0, common_1.Controller)('api/deposits'),
    __param(0, (0, common_1.Inject)('PRISMA')),
    __metadata("design:paramtypes", [client_1.PrismaClient,
        btcpay_service_1.BtcpayService,
        tron_service_1.TronService,
        ledger_service_1.LedgerService])
], DepositsController);
//# sourceMappingURL=deposits.controller.js.map