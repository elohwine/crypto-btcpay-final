import { Module } from '@nestjs/common';
import { DepositsController } from './deposits.controller';
import { BtcpayModule } from '../btcpay/btcpay.module';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({ imports: [BtcpayModule, PrismaModule], controllers: [DepositsController] })
export class DepositsModule {}
