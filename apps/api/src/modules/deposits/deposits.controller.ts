import { Controller, Post, Body, Inject } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { BtcpayService } from '../btcpay/btcpay.service';
import { TronService } from '../tron/tron.service';
import { LedgerService } from '../ledger/ledger.service';

@Controller('api/deposits')
export class DepositsController {
  constructor(
    @Inject('PRISMA') private prisma: PrismaClient,
    private btcpayService: BtcpayService,
    private tronService?: TronService,
    private ledgerService?: LedgerService,
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
  // debug log for visibility in container logs
  console.log(`[Deposits] create -> user=${user} amount=${amount} currency=${currency} invoiceId=${invoiceId} wallet=${walletAddress}`);
    
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
    console.log(`[Deposits] persisted -> depositId=${dep.id} invoiceId=${invoiceId} status=${dep.status}`);
    return { 
      depositId: dep.id, 
      paymentUrl: checkout, 
      invoiceId, 
      walletAddress: walletAddress,
      expiresAt: invoice?.data?.expirationTime || null 
    };
  }

  @Post('direct')
  async direct(@Body() body: any){
    const { txHash, contract, toAddress, amount, userId } = body;
    const user = userId || 'seed-user';
    if(!txHash) return { error: 'txHash required' };
    console.log(`[Deposits] direct -> tx=${txHash} user=${user} contract=${contract} to=${toAddress} amount=${amount}`);

    // idempotency: check if txHash already recorded
  const existingByTx = await this.prisma.deposit.findFirst({ where: { txHash } as any } as any);
    if(existingByTx){
      console.log(`[Deposits] direct -> already processed tx=${txHash} depositId=${existingByTx.id}`);
      return { ok: true, depositId: existingByTx.id, status: existingByTx.status };
    }

    // verify tx on TRON
    if(!this.tronService) return { error: 'TronService not available' };
    const verified = await this.tronService.verifyTx(txHash);
    if(!verified || !verified.ok) return { error: 'tx not found or invalid', detail: verified?.raw };

    // check recipient and contract if provided
    const txTo = verified.to || verified.raw?.to || null;
    const txContract = verified.contract || verified.raw?.token_address || null;
    const txAmount = verified.amount || (verified.raw?.amount ? Number(verified.raw.amount) : null);
    if(contract && txContract && contract.toLowerCase() !== txContract.toLowerCase()){
      return { error: 'contract mismatch', txContract };
    }
    if(toAddress && txTo && toAddress !== txTo){
      return { error: 'recipient mismatch', txTo };
    }

    // create Deposit and mark confirmed
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
    const dep = await this.prisma.deposit.create({ data: depData as any });
    console.log(`[Deposits] direct persisted -> depositId=${dep.id} tx=${txHash} amount=${dep.amount}`);

    // post ledger entries
    if(this.ledgerService){
      const decimals = Number(process.env.TRON_USDT_DECIMALS || 6);
      const minor = Math.round((dep.amount || 0) * Math.pow(10, decimals));
      await this.ledgerService.post(null, `Assets:Custody:${dep.currency}`, BigInt(minor), dep.currency, 'deposit', dep.id);
      await this.ledgerService.post(dep.userId, `Liabilities:User:${dep.userId}:${dep.currency}`, BigInt(-minor), dep.currency, 'deposit', dep.id);
    }

    return { ok: true, depositId: dep.id, status: dep.status };
  }
}
