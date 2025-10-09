import { Controller, Post, Req, Res, Inject } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { BtcpayService } from '../btcpay/btcpay.service';
import { LedgerService } from '../ledger/ledger.service';

@Controller('api/webhooks')
export class WebhooksController {
  constructor(
    @Inject('PRISMA') private prisma: PrismaClient,
    private btcpayService: BtcpayService,
    private ledgerService: LedgerService,
  ){}

  @Post('btcpay')
  async handleBtcpay(@Req() req, @Res() res){
    try {
      const sig = req.headers['btcpay-sig'] || req.headers['btcpay_sig'] || req.headers['btcpaysig'] || '';
      const raw = req.rawBody || Buffer.from('');
      const verified = this.btcpayService.verifySignature(raw, sig);
      const payload = req.body;
      const eventId = payload?.id || payload?.eventId || payload?.invoiceId || ('evt_' + Date.now());
      // idempotency: upsert webhook event by eventId
      const existing = await this.prisma.webhookEvent.findUnique({ where: { eventId } });
      if(existing && existing.processed){ return res.json({ ok:true, reason:'already processed' }); }
      await this.prisma.webhookEvent.upsert({ where: { eventId }, create: { eventId, eventType: payload?.type || payload?.event || 'btcpay', payload }, update: { payload } });
      if(!verified){ console.warn('invalid webhook signature'); return res.status(400).json({ ok:false, reason:'invalid signature' }); }
      // process invoice status
      const status = payload?.status || payload?.data?.status;
      const invoiceId = payload?.invoiceId || payload?.id || payload?.data?.id;
      if(status === 'complete' || status === 'paid'){
        const dep = await this.prisma.deposit.findUnique({ where: { invoiceId } });
        if(dep && dep.status !== 'CONFIRMED'){
          await this.prisma.deposit.update({ where: { id: dep.id }, data: { status: 'CONFIRMED', btcpayStatus: status, confirmedAt: new Date() } });
          const amountDecimal = dep.amount || (payload?.data?.amount?.value ? Number(payload.data.amount.value) : 0);
          const sats = Math.round((amountDecimal || 0) * 1e8);
          await this.ledgerService.post(null, `Assets:Custody:${dep.currency}`, BigInt(sats), dep.currency, 'deposit', dep.id);
          await this.ledgerService.post(dep.userId, `Liabilities:User:${dep.userId}:${dep.currency}`, BigInt(-sats), dep.currency, 'deposit', dep.id);
        }
      }
      await this.prisma.webhookEvent.update({ where: { eventId }, data: { processed: true } });
      return res.json({ ok:true });
    } catch(e){
      console.error(e);
      return res.status(500).json({ error: e.message });
    }
  }
}
