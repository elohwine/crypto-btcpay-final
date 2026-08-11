import { Inject, Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { SpotOrderSide, SpotOrderType } from './dto/spot.dto';

@Injectable()
export class SpotService {
  private readonly markets = this.resolveMarkets();
  constructor(@Inject('PRISMA') private prisma: PrismaClient) {}

  async getBalances(userId: string) {
    const db: any = this.prisma as any;
    await this.ensureDefaultBalances(userId, db);
    return db.spotBalance.findMany({ where: { userId }, orderBy: { currency: 'asc' } });
  }

  async creditBalance(userId: string, currency: string, amount: number) {
    const db: any = this.prisma as any;
    const c = this.normalizeCurrency(currency);
    const next = await db.spotBalance.upsert({
      where: { userId_currency: { userId, currency: c } },
      create: {
        userId,
        currency: c,
        available: Number(amount),
        locked: 0,
        creditedDeposits: Number(amount),
      },
      update: {
        available: { increment: Number(amount) },
        creditedDeposits: { increment: Number(amount) },
      },
    });
    return { ok: true, balance: next };
  }

  async listMarkets(includeOrderBookTop = false) {
    const db: any = this.prisma as any;
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const rows = await Promise.all(
      this.markets.map(async (symbol) => {
        const [lastTrade, bestBid, bestAsk, recentTrades] = await Promise.all([
          db.spotTrade.findFirst({ where: { symbol }, orderBy: { createdAt: 'desc' } }),
          db.spotOrder.findFirst({
            where: {
              symbol,
              side: 'BUY',
              status: { in: ['OPEN', 'PARTIALLY_FILLED'] },
              remainingQuantity: { gt: 0 },
            },
            orderBy: [{ price: 'desc' }, { createdAt: 'asc' }],
          }),
          db.spotOrder.findFirst({
            where: {
              symbol,
              side: 'SELL',
              status: { in: ['OPEN', 'PARTIALLY_FILLED'] },
              remainingQuantity: { gt: 0 },
            },
            orderBy: [{ price: 'asc' }, { createdAt: 'asc' }],
          }),
          db.spotTrade.findMany({
            where: { symbol, createdAt: { gte: since } },
            orderBy: { createdAt: 'asc' },
            take: 500,
          }),
        ]);

        const prices = recentTrades
          .map((trade: any) => Number(trade.price))
          .filter((value: number) => Number.isFinite(value));
        const quantities = recentTrades
          .map((trade: any) => Number(trade.quantity))
          .filter((value: number) => Number.isFinite(value));
        const openPrice = prices.length ? prices[0] : null;
        const closePrice = prices.length ? prices[prices.length - 1] : null;
        const changePercent =
          openPrice && closePrice
            ? Number((((closePrice - openPrice) / openPrice) * 100).toFixed(4))
            : null;
        const high24h = prices.length ? Math.max(...prices) : null;
        const low24h = prices.length ? Math.min(...prices) : null;
        const volume24h = quantities.length
          ? Number(quantities.reduce((total: number, quantity: number) => total + quantity, 0).toFixed(8))
          : null;

        return {
          symbol,
          lastPrice: lastTrade?.price ?? null,
          lastTradeAt: lastTrade?.createdAt ?? null,
          changePercent,
          high24h,
          low24h,
          volume24h,
          ...(includeOrderBookTop
            ? {
                bestBid: bestBid?.price ?? null,
                bestAsk: bestAsk?.price ?? null,
                spread:
                  bestBid && bestAsk
                    ? Number((bestAsk.price - bestBid.price).toFixed(8))
                    : null,
              }
            : {}),
        };
      }),
    );
    return rows;
  }

  async getOrderBook(symbol: string, depth = 20) {
    const db: any = this.prisma as any;
    const normalized = this.normalizeSymbol(symbol);
    const [bids, asks] = await Promise.all([
      db.spotOrder.findMany({
        where: {
          symbol: normalized,
          side: 'BUY',
          status: { in: ['OPEN', 'PARTIALLY_FILLED'] },
          remainingQuantity: { gt: 0 },
        },
        orderBy: [{ price: 'desc' }, { createdAt: 'asc' }],
        take: 200,
      }),
      db.spotOrder.findMany({
        where: {
          symbol: normalized,
          side: 'SELL',
          status: { in: ['OPEN', 'PARTIALLY_FILLED'] },
          remainingQuantity: { gt: 0 },
        },
        orderBy: [{ price: 'asc' }, { createdAt: 'asc' }],
        take: 200,
      }),
    ]);

    return {
      symbol: normalized,
      bids: this.aggregateLevels(bids, depth),
      asks: this.aggregateLevels(asks, depth),
      updatedAt: new Date().toISOString(),
    };
  }

  async getTrades(symbol: string, limit = 50) {
    const db: any = this.prisma as any;
    const normalized = this.normalizeSymbol(symbol);
    return {
      symbol: normalized,
      trades: await db.spotTrade.findMany({
        where: { symbol: normalized },
        orderBy: { createdAt: 'desc' },
        take: limit,
      }),
    };
  }

  async getOrdersByUser(userId: string, symbol?: string) {
    const db: any = this.prisma as any;
    return db.spotOrder.findMany({
      where: {
        userId,
        ...(symbol ? { symbol: this.normalizeSymbol(symbol) } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: 500,
    });
  }

  async placeOrder(input: {
    symbol: string;
    side: SpotOrderSide;
    type: SpotOrderType;
    price?: number;
    quantity: number;
    userId: string;
  }) {
    const db: any = this.prisma as any;
    const symbol = this.normalizeSymbol(input.symbol);
    const [baseCurrency, quoteCurrency] = symbol.split('_');
    const requestedQuantity = Number(Number(input.quantity).toFixed(8));
    const requestedPrice = input.price == null ? null : Number(Number(input.price).toFixed(8));
    const user = await db.user.findUnique({ where: { id: input.userId }, select: { id: true } });
    if (!user) throw new Error('user not found');
    if (requestedQuantity <= 0) throw new Error('quantity must be greater than zero');
    if (input.type === SpotOrderType.LIMIT && (!requestedPrice || requestedPrice <= 0)) {
      throw new Error('limit price must be greater than zero');
    }

    return db.$transaction(async (tx: any) => {
      await this.ensureDefaultBalances(input.userId, tx);

      const makers = await this.findMatchingMakers(tx, {
        symbol,
        side: input.side,
        type: input.type,
        price: requestedPrice,
        quantity: requestedQuantity,
      });

      if (input.type === SpotOrderType.MARKET && makers.length < 1) {
        throw new Error('no liquidity available for market order');
      }

      const reserveCurrency = input.side === SpotOrderSide.BUY ? quoteCurrency : baseCurrency;
      const reserveAmount = this.calculateReserveAmount({
        side: input.side,
        type: input.type,
        price: requestedPrice,
        quantity: requestedQuantity,
        makers,
      });

      if (reserveAmount <= 0) {
        throw new Error('reserve amount must be greater than zero');
      }

      const reserved = await tx.spotBalance.updateMany({
        where: {
          userId: input.userId,
          currency: reserveCurrency,
          available: { gte: reserveAmount },
        },
        data: {
          available: { decrement: reserveAmount },
          locked: { increment: reserveAmount },
        },
      });

      if (!reserved || reserved.count < 1) {
        throw new Error(`insufficient ${reserveCurrency} balance`);
      }

      const order = await tx.spotOrder.create({
        data: {
          userId: input.userId,
          symbol,
          side: input.side,
          type: input.type,
          status: 'OPEN',
          price: requestedPrice ?? 0,
          quantity: requestedQuantity,
          remainingQuantity: requestedQuantity,
        },
      });

      let takerRemaining = Number(order.remainingQuantity);
      const trades: any[] = [];

      for (const maker of makers) {
        if (takerRemaining <= 0) break;
        const fillQty = Math.min(takerRemaining, Number(maker.remainingQuantity));
        if (fillQty <= 0) continue;

        const tradePrice = Number(maker.price);
        takerRemaining = Number((takerRemaining - fillQty).toFixed(8));
        const makerRemaining = Number((Number(maker.remainingQuantity) - fillQty).toFixed(8));

        await this.applyFillBalanceEffects(tx, {
          userId: input.userId,
          side: input.side,
          orderPrice:
            input.type === SpotOrderType.MARKET && input.side === SpotOrderSide.BUY
              ? tradePrice
              : requestedPrice || tradePrice,
          tradePrice,
          fillQty,
          baseCurrency,
          quoteCurrency,
        });

        await this.applyFillBalanceEffects(tx, {
          userId: maker.userId,
          side: maker.side,
          orderPrice: Number(maker.price),
          tradePrice,
          fillQty,
          baseCurrency,
          quoteCurrency,
        });

        await tx.spotOrder.update({
          where: { id: maker.id },
          data: {
            remainingQuantity: makerRemaining,
            status: makerRemaining === 0 ? 'FILLED' : 'PARTIALLY_FILLED',
          },
        });

        const trade = await tx.spotTrade.create({
          data: {
            symbol,
            price: tradePrice,
            quantity: Number(fillQty.toFixed(8)),
            makerOrderId: maker.id,
            takerOrderId: order.id,
            makerUserId: maker.userId,
            takerUserId: input.userId,
            takerSide: input.side,
          },
        });

        trades.push(trade);
      }

      if (input.type === SpotOrderType.MARKET && takerRemaining > 0) {
        throw new Error('market order could not be fully matched');
      }

      const finalOrder = await tx.spotOrder.update({
        where: { id: order.id },
        data: {
          remainingQuantity: takerRemaining,
          status:
            takerRemaining === 0
              ? 'FILLED'
              : takerRemaining === Number(order.quantity)
              ? 'OPEN'
              : 'PARTIALLY_FILLED',
        },
      });

      return {
        order: finalOrder,
        trades,
      };
    });
  }

  async cancelOrder(orderId: string, userId: string) {
    const db: any = this.prisma as any;
    const order = await db.spotOrder.findUnique({ where: { id: orderId } });
    if (!order) {
      return { error: 'order not found' };
    }

    if (order.userId !== userId) {
      return { error: 'forbidden: order does not belong to user' };
    }

    if (order.status === 'FILLED' || order.status === 'CANCELLED') {
      return { error: `cannot cancel order in status ${order.status}` };
    }

    const [baseCurrency, quoteCurrency] = String(order.symbol).split('_');

    const updated = await db.$transaction(async (tx: any) => {
      const current = await tx.spotOrder.findUnique({ where: { id: orderId } });
      if (!current) return null;
      if (current.status === 'FILLED' || current.status === 'CANCELLED') return current;

      if (Number(current.remainingQuantity) > 0) {
        if (current.side === 'BUY') {
          const release = Number((Number(current.remainingQuantity) * Number(current.price)).toFixed(8));
          await tx.spotBalance.updateMany({
            where: { userId, currency: quoteCurrency, locked: { gte: release } },
            data: { locked: { decrement: release }, available: { increment: release } },
          });
        } else {
          const release = Number(Number(current.remainingQuantity).toFixed(8));
          await tx.spotBalance.updateMany({
            where: { userId, currency: baseCurrency, locked: { gte: release } },
            data: { locked: { decrement: release }, available: { increment: release } },
          });
        }
      }

      return tx.spotOrder.update({
        where: { id: orderId },
        data: { status: 'CANCELLED' },
      });
    });

    return { ok: true, order: updated };
  }

  private normalizeSymbol(symbol: string) {
    const normalized = (symbol || '').trim().toUpperCase().replace('/', '_').replace('-', '_');
    if (!this.markets.includes(normalized)) {
      throw new Error(`unsupported symbol: ${symbol}`);
    }
    return normalized;
  }

  private normalizeCurrency(currency: string) {
    return String(currency || '').trim().toUpperCase();
  }

  private resolveMarkets() {
    const configured = String(process.env.SPOT_MARKETS || '')
      .split(',')
      .map((value) => value.trim().toUpperCase().replace('/', '_').replace('-', '_'))
      .filter(Boolean);

    if (configured.length > 0) {
      return Array.from(new Set(configured));
    }

    return [
      'BTC_USDT',
      'ETH_USDT',
      'TRX_USDT',
      'SOL_USDT',
      'XRP_USDT',
      'ADA_USDT',
      'DOGE_USDT',
      'BNB_USDT',
      'LTC_USDT',
      'AVAX_USDT',
    ];
  }

  private async ensureDefaultBalances(userId: string, tx: any) {
    const confirmedDeposits = await tx.deposit.groupBy({
      by: ['currency'],
      where: { userId, status: 'CONFIRMED' },
      _sum: { amount: true },
    });

    for (const row of confirmedDeposits) {
      const currency = this.normalizeCurrency(row.currency);
      const total = Number(row?._sum?.amount || 0);
      const existing = await tx.spotBalance.findUnique({
        where: { userId_currency: { userId, currency } },
      });

      if (!existing) {
        await tx.spotBalance.create({
          data: {
            userId,
            currency,
            available: total,
            locked: 0,
            creditedDeposits: total,
          },
        });
        continue;
      }

      const creditedDeposits = Number(existing.creditedDeposits || 0);
      const delta = Number((total - creditedDeposits).toFixed(8));
      if (delta > 0) {
        await tx.spotBalance.update({
          where: { userId_currency: { userId, currency } },
          data: {
            available: { increment: delta },
            creditedDeposits: total,
          },
        });
      } else if (creditedDeposits !== total) {
        await tx.spotBalance.update({
          where: { userId_currency: { userId, currency } },
          data: {
            creditedDeposits: total,
          },
        });
      }
    }

    const marketCurrencies = Array.from(
      new Set(this.markets.flatMap((market) => market.split('_').map((part) => this.normalizeCurrency(part)))),
    );

    for (const currency of marketCurrencies) {
      await tx.spotBalance.upsert({
        where: { userId_currency: { userId, currency } },
        create: { userId, currency, available: 0, locked: 0, creditedDeposits: 0 },
        update: {},
      });
    }
  }

  private async findMatchingMakers(
    tx: any,
    input: {
      symbol: string;
      side: SpotOrderSide;
      type: SpotOrderType;
      price: number | null;
      quantity: number;
    },
  ) {
    const oppositeSide = input.side === SpotOrderSide.BUY ? 'SELL' : 'BUY';
    const priceFilter =
      input.type === SpotOrderType.MARKET || input.price == null
        ? {}
        : input.side === SpotOrderSide.BUY
        ? { price: { lte: input.price } }
        : { price: { gte: input.price } };

    const makers = await tx.spotOrder.findMany({
      where: {
        symbol: input.symbol,
        side: oppositeSide,
        status: { in: ['OPEN', 'PARTIALLY_FILLED'] },
        remainingQuantity: { gt: 0 },
        ...priceFilter,
      },
      orderBy:
        input.side === SpotOrderSide.BUY
          ? [{ price: 'asc' }, { createdAt: 'asc' }]
          : [{ price: 'desc' }, { createdAt: 'asc' }],
      take: 200,
    });

    if (input.type === SpotOrderType.MARKET) {
      const availableQuantity = makers.reduce(
        (total: number, maker: any) => total + Number(maker.remainingQuantity || 0),
        0,
      );
      if (Number(availableQuantity.toFixed(8)) < input.quantity) {
        throw new Error('insufficient order book liquidity');
      }
    }

    return makers;
  }

  private calculateReserveAmount(input: {
    side: SpotOrderSide;
    type: SpotOrderType;
    price: number | null;
    quantity: number;
    makers: any[];
  }) {
    if (input.side === SpotOrderSide.SELL) {
      return Number(input.quantity.toFixed(8));
    }

    if (input.type === SpotOrderType.LIMIT) {
      return Number(((input.price || 0) * input.quantity).toFixed(8));
    }

    let remaining = input.quantity;
    let total = 0;
    for (const maker of input.makers) {
      if (remaining <= 0) break;
      const fillQty = Math.min(remaining, Number(maker.remainingQuantity || 0));
      if (fillQty <= 0) continue;
      total += fillQty * Number(maker.price || 0);
      remaining = Number((remaining - fillQty).toFixed(8));
    }

    return Number(total.toFixed(8));
  }

  private async applyFillBalanceEffects(
    tx: any,
    input: {
      userId: string;
      side: SpotOrderSide | string;
      orderPrice: number;
      tradePrice: number;
      fillQty: number;
      baseCurrency: string;
      quoteCurrency: string;
    },
  ) {
    const fillBase = Number(input.fillQty.toFixed(8));
    const lockedQuoteForFill = Number((input.fillQty * input.orderPrice).toFixed(8));
    const actualQuoteCost = Number((input.fillQty * input.tradePrice).toFixed(8));

    if (input.side === 'BUY') {
      const refund = Number((lockedQuoteForFill - actualQuoteCost).toFixed(8));

      await tx.spotBalance.upsert({
        where: { userId_currency: { userId: input.userId, currency: input.quoteCurrency } },
        create: {
          userId: input.userId,
          currency: input.quoteCurrency,
          available: refund > 0 ? refund : 0,
          locked: 0,
        },
        update: {
          locked: { decrement: lockedQuoteForFill },
          ...(refund > 0 ? { available: { increment: refund } } : {}),
        },
      });

      await tx.spotBalance.upsert({
        where: { userId_currency: { userId: input.userId, currency: input.baseCurrency } },
        create: { userId: input.userId, currency: input.baseCurrency, available: fillBase, locked: 0 },
        update: { available: { increment: fillBase } },
      });
      return;
    }

    await tx.spotBalance.upsert({
      where: { userId_currency: { userId: input.userId, currency: input.baseCurrency } },
      create: { userId: input.userId, currency: input.baseCurrency, available: 0, locked: 0 },
      update: { locked: { decrement: fillBase } },
    });

    await tx.spotBalance.upsert({
      where: { userId_currency: { userId: input.userId, currency: input.quoteCurrency } },
      create: { userId: input.userId, currency: input.quoteCurrency, available: actualQuoteCost, locked: 0 },
      update: { available: { increment: actualQuoteCost } },
    });
  }

  private aggregateLevels(orders: any[], depth: number) {
    const levels = new Map<number, number>();

    for (const order of orders) {
      if (order.remainingQuantity <= 0) continue;
      const current = levels.get(order.price) || 0;
      levels.set(order.price, current + order.remainingQuantity);
    }

    return Array.from(levels.entries())
      .slice(0, depth)
      .map(([price, quantity]) => ({
        price,
        quantity: Number(quantity.toFixed(8)),
      }));
  }
}
