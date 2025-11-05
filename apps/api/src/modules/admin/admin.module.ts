import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { BtcpayModule } from '../btcpay/btcpay.module';

@Module({
  imports: [PrismaModule, BtcpayModule],
  controllers: [AdminController],
})
export class AdminModule {}
