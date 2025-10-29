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
      console.log(`[Webhooks] received -> sig=${sig} rawLength=${raw?.length}`);
      const verified = this.btcpayService.verifySignature(raw, sig);
      const payload = req.body;
      const eventId = payload?.id || payload?.eventId || payload?.invoiceId || ('evt_' + Date.now());
      console.log(`[Webhooks] payload -> eventId=${eventId} payloadType=${payload?.type || payload?.event}`);
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
          console.log(`[Webhooks] deposit confirmed -> depositId=${dep.id} invoiceId=${invoiceId} amount=${dep.amount}`);
          const amountDecimal = dep.amount || (payload?.data?.amount?.value ? Number(payload.data.amount.value) : 0);
          // For TRON USDT (default decimals 6) convert to minor units using env override
          const decimals = Number(process.env.TRON_USDT_DECIMALS || 6);
          const minor = Math.round((amountDecimal || 0) * Math.pow(10, decimals));
          await this.ledgerService.post(null, `Assets:Custody:${dep.currency}`, BigInt(minor), dep.currency, 'deposit', dep.id);
          await this.ledgerService.post(dep.userId, `Liabilities:User:${dep.userId}:${dep.currency}`, BigInt(-minor), dep.currency, 'deposit', dep.id);
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
