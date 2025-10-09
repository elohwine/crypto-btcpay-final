import { Module } from '@nestjs/common';
import { BtcpayService } from './btcpay.service';

@Module({ providers: [BtcpayService], exports: [BtcpayService] })
export class BtcpayModule {}
