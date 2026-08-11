import { IsEnum, IsIn, IsNumber, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export enum SpotOrderSide {
  BUY = 'BUY',
  SELL = 'SELL',
}

export enum SpotOrderType {
  LIMIT = 'LIMIT',
  MARKET = 'MARKET',
}

export class PlaceSpotOrderDto {
  @IsString()
  @MaxLength(20)
  symbol: string;

  @IsEnum(SpotOrderSide)
  side: SpotOrderSide;

  @IsEnum(SpotOrderType)
  type: SpotOrderType;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 8 })
  @Min(0.00000001)
  price?: number;

  @IsNumber({ maxDecimalPlaces: 8 })
  @Min(0.00000001)
  quantity: number;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  userId?: string;
}

export class OrderBookQueryDto {
  @IsOptional()
  @IsNumber()
  @Min(1)
  depth?: number;
}

export class TradesQueryDto {
  @IsOptional()
  @IsNumber()
  @Min(1)
  limit?: number;
}

export class OrdersQueryDto {
  @IsOptional()
  @IsString()
  @MaxLength(20)
  symbol?: string;
}

export class MarketsQueryDto {
  @IsOptional()
  @IsIn(['true', 'false'])
  includeOrderBookTop?: string;
}

export class CreditSpotBalanceDto {
  @IsString()
  @MaxLength(20)
  currency: string;

  @IsNumber({ maxDecimalPlaces: 8 })
  @Min(0.00000001)
  amount: number;
}
