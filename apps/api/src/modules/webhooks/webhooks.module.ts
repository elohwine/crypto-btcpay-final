import { Module } from '@nestjs/common';
import { WebhooksController } from './webhooks.controller';
import { BtcpayModule } from '../btcpay/btcpay.module';
import { PrismaModule } from '../../prisma/prisma.module';
import { LedgerModule } from '../ledger/ledger.module';

@Module({ imports: [BtcpayModule, PrismaModule, LedgerModule], controllers: [WebhooksController] })
export class WebhooksModule {}
