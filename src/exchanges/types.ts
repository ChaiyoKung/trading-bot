import type { Exchange as CCXTExchange, Int, Order, Position } from 'ccxt';
import pl from 'nodejs-polars';

export type OHLCVProperty = 'timestamp' | 'open' | 'high' | 'low' | 'close' | 'volume';

export abstract class Exchange {
  protected abstract readonly exchange: CCXTExchange;

  constructor(
    protected readonly symbol: string,
    protected readonly timeframe: string,
    protected readonly laverage: number
  ) {}

  public calculateAmount(usdt: number, price: number): number {
    const amount = (usdt * this.laverage) / price;
    const rounded = amount.toFixed(3);
    return Number(rounded);
  }

  public async fetchOHLCV(
    since?: Int,
    limit?: Int,
    params?: Record<string, unknown> | undefined
  ): Promise<Record<OHLCVProperty, number>[]> {
    const ohlcv = await this.exchange.fetchOHLCV(this.symbol, this.timeframe, since, limit, params);
    const df = pl.DataFrame(ohlcv, { columns: ['timestamp', 'open', 'high', 'low', 'close', 'volume'] });
    return df.toRecords();
  }

  public abstract createMarketBuyOrder(usdt: number, price: number): Promise<Order>;
  public abstract createMarketSellOrder(usdt: number, price: number): Promise<Order>;
  public abstract closeAllPositions(): Promise<Array<Position>>;
  public abstract cancelAllOrders(): Promise<Array<Order>>;
}
