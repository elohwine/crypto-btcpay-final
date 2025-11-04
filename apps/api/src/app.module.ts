import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { PrismaModule } from './prisma/prisma.module';
import { BtcpayModule } from './modules/btcpay/btcpay.module';
import { AuthModule } from './modules/auth/auth.module';
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
    // Serve frontend static files from public/ folder (exclude /api routes)
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
      exclude: ['/api*'],
    }),
    PrismaModule,
    BtcpayModule,
    AuthModule,
    LedgerModule,
    DepositsModule,
    WebhooksModule,
  ],
})
export class AppModule {}
