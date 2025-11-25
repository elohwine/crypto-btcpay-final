import { Controller, Get, Inject } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Controller('stats')
export class StatsController {
    constructor(
        @Inject('PRISMA') private prisma: PrismaClient,
    ) { }

    @Get('public')
    async getPublicStats() {
        const totalDepositAmount = await this.prisma.deposit.aggregate({
            where: { status: 'CONFIRMED' },
            _sum: { amount: true },
        });

        return {
            totalVolume: totalDepositAmount._sum.amount || 0,
        };
    }
}
