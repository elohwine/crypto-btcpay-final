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
exports.WebhooksController = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const btcpay_service_1 = require("../btcpay/btcpay.service");
const ledger_service_1 = require("../ledger/ledger.service");
let WebhooksController = class WebhooksController {
    constructor(prisma, btcpayService, ledgerService) {
        this.prisma = prisma;
        this.btcpayService = btcpayService;
        this.ledgerService = ledgerService;
    }
    async handleBtcpay(req, res) {
        try {
            const sig = req.headers['btcpay-sig'] || req.headers['btcpay_sig'] || req.headers['btcpaysig'] || '';
            const raw = req.rawBody || Buffer.from('');
            console.log(`[Webhooks] received -> sig=${sig} rawLength=${raw?.length}`);
            const verified = this.btcpayService.verifySignature(raw, sig);
            const payload = req.body;
            const eventId = payload?.id || payload?.eventId || payload?.invoiceId || ('evt_' + Date.now());
            console.log(`[Webhooks] payload -> eventId=${eventId} payloadType=${payload?.type || payload?.event}`);
            const existing = await this.prisma.webhookEvent.findUnique({ where: { eventId } });
            if (existing && existing.processed) {
                return res.json({ ok: true, reason: 'already processed' });
            }
            await this.prisma.webhookEvent.upsert({ where: { eventId }, create: { eventId, eventType: payload?.type || payload?.event || 'btcpay', payload }, update: { payload } });
            if (!verified) {
                console.warn('invalid webhook signature');
                return res.status(400).json({ ok: false, reason: 'invalid signature' });
            }
            const status = payload?.status || payload?.data?.status;
            const invoiceId = payload?.invoiceId || payload?.id || payload?.data?.id;
            if (status === 'complete' || status === 'paid') {
                const dep = await this.prisma.deposit.findUnique({ where: { invoiceId } });
                if (dep && dep.status !== 'CONFIRMED') {
                    await this.prisma.deposit.update({ where: { id: dep.id }, data: { status: 'CONFIRMED', btcpayStatus: status, confirmedAt: new Date() } });
                    console.log(`[Webhooks] deposit confirmed -> depositId=${dep.id} invoiceId=${invoiceId} amount=${dep.amount}`);
                    const amountDecimal = dep.amount || (payload?.data?.amount?.value ? Number(payload.data.amount.value) : 0);
                    const decimals = Number(process.env.TRON_USDT_DECIMALS || 6);
                    const minor = Math.round((amountDecimal || 0) * Math.pow(10, decimals));
                    await this.ledgerService.post(null, `Assets:Custody:${dep.currency}`, BigInt(minor), dep.currency, 'deposit', dep.id);
                    await this.ledgerService.post(dep.userId, `Liabilities:User:${dep.userId}:${dep.currency}`, BigInt(-minor), dep.currency, 'deposit', dep.id);
                }
            }
            await this.prisma.webhookEvent.update({ where: { eventId }, data: { processed: true } });
            return res.json({ ok: true });
        }
        catch (e) {
            console.error(e);
            return res.status(500).json({ error: e.message });
        }
    }
};
exports.WebhooksController = WebhooksController;
__decorate([
    (0, common_1.Post)('btcpay'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], WebhooksController.prototype, "handleBtcpay", null);
exports.WebhooksController = WebhooksController = __decorate([
    (0, common_1.Controller)('api/webhooks'),
    __param(0, (0, common_1.Inject)('PRISMA')),
    __metadata("design:paramtypes", [client_1.PrismaClient,
        btcpay_service_1.BtcpayService,
        ledger_service_1.LedgerService])
], WebhooksController);
//# sourceMappingURL=webhooks.controller.js.map