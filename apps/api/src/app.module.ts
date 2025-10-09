import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { BtcpayModule } from './modules/btcpay/btcpay.module';
import { LedgerModule } from './modules/ledger/ledger.module';
import { DepositsModule } from './modules/deposits/deposits.module';
import { WebhooksModule } from './modules/webhooks/webhooks.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        '.env',          // apps/api/.env (local dev)
        '../../.env',    // repo root .env (docker compose / alternative dev)
      ],
    }),
    PrismaModule,
    BtcpayModule,
    LedgerModule,
    DepositsModule,
    WebhooksModule,
  ],
})
export class AppModule {}
