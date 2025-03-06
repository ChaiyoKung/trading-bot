import type { Exchange, OHLCV } from "ccxt";
import { z } from "zod";

const ohlcvSchema = z.array(
  z.tuple([
    z.number(), // timestamp
    z.number(), // open
    z.number(), // high
    z.number(), // low
    z.number(), // close
    z.number(), // volume
  ])
);

export interface StrategyOptions {
  symbol: string;
  timeframe: string;
}

export abstract class BaseStrategy {
  constructor(
    protected readonly exchange: Exchange,
    protected readonly options: StrategyOptions
  ) {}

  protected async fetchOhlcv() {
    const { symbol, timeframe } = this.options;
    const ohlcv = await this.exchange.fetchOHLCV(symbol, timeframe);
    return this.parseOhlcv(ohlcv);
  }

  private parseOhlcv(ohlcv: OHLCV[]) {
    return ohlcvSchema.parse(ohlcv).map((candle) => ({
      timestamp: new Date(candle[0]),
      open: candle[1],
      high: candle[2],
      low: candle[3],
      close: candle[4],
      volume: candle[5],
    }));
  }

  public abstract run(): Promise<void>;
}
