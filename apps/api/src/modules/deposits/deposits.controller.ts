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
    const { currency, amount, userId, walletAddress } = body;
    const user = userId || 'seed-user'; // replace with auth
    
    // Validate wallet address for USDT payments
    if ((currency || 'USDT') === 'USDT' && !walletAddress) {
      return { error: 'Wallet address required for USDT payments' };
    }
    
    // create BTCPay invoice with wallet metadata
    const metadata = { 
      userId: user,
      walletAddress: walletAddress || null
    };
    const invoice = await this.btcpayService.createInvoice(amount ? Number(amount) : undefined, currency || 'USDT', metadata);
    const invoiceId = invoice?.data?.id || invoice?.id;
    const checkout = invoice?.data?.checkoutLink || invoice?.checkoutLink || null;
    
    // persist deposit using Prisma client
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
    
    return { 
      depositId: dep.id, 
      paymentUrl: checkout, 
      invoiceId, 
      walletAddress: walletAddress,
      expiresAt: invoice?.data?.expirationTime || null 
    };
  }
}
