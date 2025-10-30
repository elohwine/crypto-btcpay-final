import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BtcpayService } from './btcpay.service';

@Module({ imports: [ConfigModule], providers: [BtcpayService], exports: [BtcpayService] })
export class BtcpayModule {}
