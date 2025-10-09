import { Injectable, Inject } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class LedgerService {
  constructor(@Inject('PRISMA') private prisma: PrismaClient) {}

  async post(userId: string|null, account: string, deltaMinor: bigint, currency?: string, refType?: string, refId?: string){
    return this.prisma.ledgerEntry.create({ data: { userId, account, deltaMinor, currency, refType, refId } });
  }

  async balanceByUser(userId: string){
    return this.prisma.ledgerEntry.groupBy({ by: ['currency'], where: { userId }, _sum: { deltaMinor: true } });
  }
}
