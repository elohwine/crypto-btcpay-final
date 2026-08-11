import { BadRequestException, Body, Controller, Get, Param, Post, Query, Req, UnauthorizedException, UseGuards } from '@nestjs/common';
import { SpotService } from './spot.service';
import {
  CreditSpotBalanceDto,
  MarketsQueryDto,
  OrderBookQueryDto,
  OrdersQueryDto,
  PlaceSpotOrderDto,
  TradesQueryDto,
} from './dto/spot.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('api/spot')
export class SpotController {
  constructor(private readonly spotService: SpotService) {}

  @Get('balances/me')
  @UseGuards(JwtAuthGuard)
  async myBalances(@Req() req: any) {
    const authUserId = req?.user?.sub;
    if (!authUserId) throw new UnauthorizedException('unauthorized');
    return await this.spotService.getBalances(authUserId);
  }

  @Post('balances/credit')
  @UseGuards(JwtAuthGuard)
  async creditBalance(@Req() req: any, @Body() dto: CreditSpotBalanceDto) {
    const authUserId = req?.user?.sub;
    if (!authUserId) throw new UnauthorizedException('unauthorized');
    return await this.spotService.creditBalance(authUserId, dto.currency, Number(dto.amount));
  }

  @Get('markets')
  async markets(@Query() query: MarketsQueryDto) {
    const includeOrderBookTop = query.includeOrderBookTop === 'true';
    return await this.spotService.listMarkets(includeOrderBookTop);
  }

  @Get('orderbook/:symbol')
  async orderBook(@Param('symbol') symbol: string, @Query() query: OrderBookQueryDto) {
    try {
      return await this.spotService.getOrderBook(symbol, query.depth || 20);
    } catch (e: any) {
      throw new BadRequestException(e?.message || 'invalid symbol');
    }
  }

  @Get('trades/:symbol')
  async trades(@Param('symbol') symbol: string, @Query() query: TradesQueryDto) {
    try {
      return await this.spotService.getTrades(symbol, query.limit || 50);
    } catch (e: any) {
      throw new BadRequestException(e?.message || 'invalid symbol');
    }
  }

  @Get('orders/:userId')
  @UseGuards(JwtAuthGuard)
  async orders(
    @Param('userId') userId: string,
    @Req() req: any,
    @Query() query: OrdersQueryDto,
  ) {
    const authUserId = req?.user?.sub;
    if (!authUserId) throw new UnauthorizedException('unauthorized');
    if (authUserId !== userId) throw new UnauthorizedException('forbidden');
    return await this.spotService.getOrdersByUser(authUserId, query.symbol);
  }

  @Post('orders')
  @UseGuards(JwtAuthGuard)
  async placeOrder(@Body() dto: PlaceSpotOrderDto, @Req() req: any) {
    const authUserId = req?.user?.sub;
    if (!authUserId) throw new UnauthorizedException('unauthorized');

    try {
      return await this.spotService.placeOrder({ ...dto, userId: authUserId });
    } catch (e: any) {
      if (e instanceof UnauthorizedException) throw e;
      throw new BadRequestException(e?.message || 'failed to place order');
    }
  }

  @Post('orders/:id/cancel')
  @UseGuards(JwtAuthGuard)
  async cancelOrder(@Param('id') id: string, @Req() req: any) {
    const authUserId = req?.user?.sub;
    if (!authUserId) throw new UnauthorizedException('unauthorized');
    const result = await this.spotService.cancelOrder(id, authUserId);
    if ((result as any)?.error) {
      throw new BadRequestException((result as any).error);
    }
    return result;
  }
}
