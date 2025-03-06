import type { Exchange } from "ccxt";
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

export abstract class BaseStrategy {
  constructor(
    protected readonly exchange: Exchange,
    protected readonly symbol: string,
    protected readonly timeframe: string
  ) {}

  protected async fetchOhlcv() {
    const ohlcv = await this.exchange.fetchOHLCV(this.symbol, this.timeframe);
    const parsedOhlcv = ohlcvSchema.parse(ohlcv).map((candle) => ({
      timestamp: new Date(candle[0]),
      open: candle[1],
      high: candle[2],
      low: candle[3],
      close: candle[4],
      volume: candle[5],
    }));
    return parsedOhlcv;
  }

  public abstract run(): Promise<void>;
}
