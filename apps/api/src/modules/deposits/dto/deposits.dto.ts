import { IsNumber, IsOptional, IsString, Matches, MaxLength, Min, MinLength } from 'class-validator';

export class CreateDepositDto {
  @IsOptional()
  @IsString()
  @MaxLength(20)
  currency?: string;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 8 })
  @Min(0)
  amount?: number;

  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  userId?: string;

  @IsOptional()
  @IsString()
  @Matches(/^T[1-9A-HJ-NP-Za-km-z]{33}$/)
  walletAddress?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  network?: string;
}

export class DirectDepositDto {
  @IsString()
  @MinLength(10)
  @MaxLength(128)
  txHash: string;

  @IsOptional()
  @IsString()
  @MaxLength(128)
  contract?: string;

  @IsOptional()
  @IsString()
  @Matches(/^T[1-9A-HJ-NP-Za-km-z]{33}$/)
  toAddress?: string;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 8 })
  @Min(0)
  amount?: number;

  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  userId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  network?: string;
}
