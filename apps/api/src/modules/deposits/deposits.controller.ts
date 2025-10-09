import { Controller, Post, Body, Inject } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { BtcpayService } from '../btcpay/btcpay.service';

@Controller('api/deposits')
export class DepositsController {
  constructor(
    @Inject('PRISMA') private prisma: PrismaClient,
    private btcpayService: BtcpayService,
  ){}

  @Post()
  async create(@Body() body: any){
    const { currency, amount, userId } = body;
    const user = userId || 'seed-user'; // replace with auth
    // create BTCPay invoice
    const invoice = await this.btcpayService.createInvoice(amount ? Number(amount) : undefined, currency || 'USDT', { userId: user });
    const invoiceId = invoice?.data?.id || invoice?.id;
    const checkout = invoice?.data?.checkoutLink || invoice?.checkoutLink || null;
    // persist deposit using Prisma client
    const dep = await this.prisma.deposit.create({ data: { userId: user, invoiceId, amount: amount ? Number(amount) : 0.0, currency: currency || 'USDT', status: 'PENDING', btcpayStatus: 'NEW' } });
    return { depositId: dep.id, paymentUrl: checkout, invoiceId, expiresAt: invoice?.data?.expirationTime || null };
  }
}
