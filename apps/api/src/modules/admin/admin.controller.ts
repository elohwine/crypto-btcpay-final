import { Controller, Get, Query, Param, Res, HttpStatus, Post, Inject, Body, UseGuards, Patch } from '@nestjs/common';
import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { Inject as NestInject } from '@nestjs/common';
import { BtcpayService } from '../btcpay/btcpay.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from './admin.guard';

@Controller('admin')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminController {
  constructor(
    @NestInject('PRISMA') private prisma: PrismaClient,
    private btcpayService: BtcpayService,
  ) { }

  @Get('stats')
  async getStats() {
    const [totalUsers, totalDeposits, confirmedDeposits, pendingDeposits, totalWebhooks] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.deposit.count(),
      this.prisma.deposit.count({ where: { status: 'CONFIRMED' } }),
      this.prisma.deposit.count({ where: { status: 'PENDING' } }),
      this.prisma.webhookEvent.count(),
    ]);

    const totalDepositAmount = await this.prisma.deposit.aggregate({
      where: { status: 'CONFIRMED' },
      _sum: { amount: true },
    });

    return {
      totalUsers,
      totalDeposits,
      confirmedDeposits,
      pendingDeposits,
      totalWebhooks,
      totalDepositAmount: totalDepositAmount._sum.amount || 0,
    };
  }

  @Get('users')
  async listUsers(@Query() q: any) {
    const where: any = {};
    if (q.search) {
      where.OR = [
        { email: { contains: q.search, mode: 'insensitive' } },
        { name: { contains: q.search, mode: 'insensitive' } },
        { id: { contains: q.search } },
      ];
    }
    if (q.isAdmin !== undefined) {
      where.isAdmin = q.isAdmin === 'true';
    }

    const take = Math.min(Number(q.take) || 50, 500);
    const skip = Number(q.skip) || 0;

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          name: true,
          isAdmin: true,
          phone: true,
          referralCode: true,
          referredBy: true,
          createdAt: true,
          _count: {
            select: {
              deposits: true,
              chatMessages: true,
              supportTickets: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take,
        skip,
      }),
      this.prisma.user.count({ where }),
    ]);

    return { users, total, take, skip };
  }

  @Get('users/:id')
  async getUser(@Param('id') id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        isAdmin: true,
        phone: true,
        dateOfBirth: true,
        referralCode: true,
        referredBy: true,
        createdAt: true,
        updatedAt: true,
        deposits: {
          select: {
            id: true,
            amount: true,
            currency: true,
            status: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        _count: {
          select: {
            deposits: true,
            chatMessages: true,
            supportTickets: true,
          },
        },
      },
    });

    if (!user) {
      return { error: 'User not found' };
    }

    return user;
  }

  @Patch('users/:id/admin')
  async toggleAdmin(@Param('id') id: string, @Body() body: { isAdmin: boolean }) {
    const user = await this.prisma.user.update({
      where: { id },
      data: { isAdmin: body.isAdmin },
      select: {
        id: true,
        email: true,
        isAdmin: true,
      },
    });

    return { ok: true, user };
  }

  @Get('deposits')
  async listDeposits(@Query() q: any) {
    const where: any = {};
    if (q.status) where.status = String(q.status).toUpperCase();
    if (q.userId) where.userId = String(q.userId);
    if (q.walletAddress) where.walletAddress = String(q.walletAddress);
    const take = Math.min(Number(q.take) || 200, 2000);
    const skip = Number(q.skip) || 0;
    const rows = await this.prisma.deposit.findMany({ where, orderBy: { createdAt: 'desc' }, take, skip });
    return rows.map(r => ({ depositId: r.id, invoiceId: r.invoiceId, userId: r.userId, amount: r.amount, currency: r.currency, status: r.status, btcpayStatus: r.btcpayStatus, walletAddress: r.walletAddress, txHash: r.txHash, createdAt: r.createdAt, confirmedAt: r.confirmedAt }));
  }

  @Get('webhooks')
  async listWebhooks(@Query() q: any) {
    const take = Math.min(Number(q.take) || 200, 2000);
    const skip = Number(q.skip) || 0;
    const rows = await this.prisma.webhookEvent.findMany({ orderBy: { id: 'desc' }, take, skip });
    return rows.map(r => ({ id: r.id, eventId: r.eventId, processed: r.processed, payload: r.payload, createdAt: r.createdAt }));
  }

  // CSV exports
  @Get('export/deposits.csv')
  async exportDeposits(@Res() res: Response, @Query() q: any) {
    const rows = await this.prisma.deposit.findMany({ orderBy: { createdAt: 'desc' }, take: Math.min(Number(q.take) || 1000, 5000) });
    const headers = ['depositId', 'invoiceId', 'userId', 'amount', 'currency', 'status', 'btcpayStatus', 'walletAddress', 'txHash', 'createdAt', 'confirmedAt'];
    const lines = [headers.join(',')];
    for (const r of rows) {
      const vals = [r.id, r.invoiceId, r.userId, r.amount, r.currency, r.status, r.btcpayStatus, r.walletAddress, r.txHash, r.createdAt?.toISOString?.() || '', r.confirmedAt?.toISOString?.() || ''];
      lines.push(vals.map(v => '"' + String(v || '').replace(/"/g, '""') + '"').join(','));
    }
    const out = lines.join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=deposits.csv');
    res.status(HttpStatus.OK).send(out);
  }

  @Get('export/webhooks.csv')
  async exportWebhooks(@Res() res: Response, @Query() q: any) {
    const rows = await this.prisma.webhookEvent.findMany({ orderBy: { id: 'desc' }, take: Math.min(Number(q.take) || 1000, 5000) });
    const headers = ['id', 'eventId', 'processed', 'createdAt', 'payload'];
    const lines = [headers.join(',')];
    for (const r of rows) {
      const vals = [r.id, r.eventId, r.processed, r.createdAt?.toISOString?.() || '', JSON.stringify(r.payload || {})];
      lines.push(vals.map(v => '"' + String(v || '').replace(/"/g, '""') + '"').join(','));
    }
    const out = lines.join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=webhooks.csv');
    res.status(HttpStatus.OK).send(out);
  }

  // Reconcile a single deposit by id: search webhooks and (if BTCPay enabled) attempt settle
  @Post('deposits/:id/reconcile')
  async reconcileDeposit(@Param('id') id: string) {
    try {
      const dep = await this.prisma.deposit.findUnique({ where: { id } });
      if (!dep) return { ok: false, error: 'not found' };

      // If deposit already has a non-placeholder invoice, attempt settle if BTCPay enabled
      if (dep.invoiceId && !String(dep.invoiceId).startsWith('local-fallback-') && !String(dep.invoiceId).startsWith('tx-')) {
        // attempt to settle
        const settle = await this.btcpayService.settleInvoice(dep.invoiceId, 'Settled', true);
        return { ok: true, depositId: dep.id, invoiceId: dep.invoiceId, settle };
      }

      // Search webhook events for exact matching invoice id or matching amount + customerWallet
      const recent = await this.prisma.webhookEvent.findMany({ where: { processed: true }, orderBy: { id: 'desc' }, take: 1000 });
      let foundId: string | null = null;
      for (const ev of recent) {
        const payload: any = ev.payload as any;
        if (!payload) continue;
        const cand1 = payload?.id || payload?.invoiceId || (payload?.data && payload.data.id);
        if (cand1 && dep.invoiceId && String(cand1) === String(dep.invoiceId)) { foundId = String(cand1); break; }
        const amt = payload?.data?.amount?.value || payload?.data?.amount;
        const meta = payload?.data?.metadata || payload?.metadata || {};
        const custWallet = meta?.customerWallet || meta?.customer_wallet || meta?.wallet || null;
        if (amt && dep.amount && Number(amt) === Number(dep.amount) && custWallet && dep.walletAddress && String(custWallet) === String(dep.walletAddress)) {
          foundId = payload?.data?.id || payload?.id || payload?.invoiceId || null; if (foundId) break;
        }
      }
      if (!foundId) return { ok: false, note: 'no matching webhook found' };
      // attach found id and attempt settle if possible
      await this.prisma.deposit.update({ where: { id: dep.id }, data: { invoiceId: foundId } as any });
      const settleResult = await this.btcpayService.settleInvoice(foundId, 'Settled', true);
      return { ok: true, depositId: dep.id, foundId, settled: !settleResult.error, settleResult };
    } catch (e) {
      return { ok: false, error: e?.message || String(e) };
    }
  }
}
