import 'dotenv/config';
import type { Order, Position, bingx } from 'ccxt';
import { Exchange } from './types';
import ccxt from 'ccxt';
import { z } from 'zod';

export enum OrderType {
  Limit = 'LIMIT',
  Market = 'MARKET',
  TrailingStopMarket = 'TRAILING_STOP_MARKET',
  TriggerLimit = 'TRIGGER_LIMIT',
  Stop = 'STOP',
  TakeProfit = 'TAKE_PROFIT',
  StopMarket = 'STOP_MARKET',
  TakeProfitMarket = 'TAKE_PROFIT_MARKET',
  TriggerMarket = 'TRIGGER_MARKET',
}

export enum OrderSide {
  Buy = 'BUY',
  Sell = 'SELL',
}

export enum OrderPositionSide {
  Both = 'BOTH',
  Long = 'LONG',
  Short = 'SHORT',
}

const envSchema = z.object({
  BINGX_API_KEY: z.string(),
  BINGX_SECRET_KEY: z.string(),
});

export class BingX extends Exchange {
  protected readonly exchange: bingx;

  constructor(
    protected readonly symbol: string,
    protected readonly timeframe: string,
    protected readonly laverage: number
  ) {
    super(symbol, timeframe, laverage);
    const env = envSchema.parse(process.env);
    this.exchange = new ccxt.bingx({
      apiKey: env.BINGX_API_KEY,
      secret: env.BINGX_SECRET_KEY,
      options: { defaultType: 'swap' },
    });
  }

  public async createMarketBuyOrder(usdt: number, price: number): Promise<Order> {
    const amount = this.calculateAmount(usdt, price);
    console.info(`${new Date().toISOString()} [INFO] create market buy order with usdt="${usdt}", amount="${amount}"`);
    return this.exchange.createOrder(this.symbol, OrderType.Market, OrderSide.Buy, amount, price, {
      positionSide: OrderPositionSide.Both,
    });
  }

  public async createMarketSellOrder(usdt: number, price: number): Promise<Order> {
    const amount = this.calculateAmount(usdt, price);
    console.info(`${new Date().toISOString()} [INFO] create market sell order with usdt="${usdt}", amount="${amount}"`);
    return this.exchange.createOrder(this.symbol, OrderType.Market, OrderSide.Sell, amount, price, {
      positionSide: OrderPositionSide.Both,
    });
  }

  public async closeAllPositions(): Promise<Array<Position>> {
    console.info(`${new Date().toISOString()} [INFO] close all positions`);
    return this.exchange.closeAllPositions(this.symbol);
  }

  public async cancelAllOrders(): Promise<Array<Order>> {
    console.info(`${new Date().toISOString()} [INFO] canncel all orders`);
    return this.exchange.cancelAllOrders(this.symbol);
  }
}
