import { Module } from '@nestjs/common';
import { DepositsController } from './deposits.controller';
import { BtcpayModule } from '../btcpay/btcpay.module';
import { PrismaModule } from '../../prisma/prisma.module';
import { TronModule } from '../tron/tron.module';
import { LedgerModule } from '../ledger/ledger.module';

@Module({ imports: [BtcpayModule, PrismaModule, TronModule, LedgerModule], controllers: [DepositsController] })
export class DepositsModule {}
