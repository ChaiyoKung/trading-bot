import type { Exchange, OHLCV as CCXTOHLCV } from 'ccxt';
import { z } from 'zod';

export interface OHLCV {
  timestamp: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export class ExchangeHandler {
  private exchange: Exchange;

  constructor(exchange: Exchange) {
    this.exchange = exchange;
  }

  async fetchOHLCV(symbol: string, timeframe: string, limit: number = 300): Promise<OHLCV[]> {
    const ohlcv = await this.exchange.fetchOHLCV(symbol, timeframe, undefined, limit);
    const ohlcvParsed = this.parseOHLCV(ohlcv);
    return ohlcvParsed.map(candle => ({
      timestamp: new Date(candle[0]),
      open: candle[1],
      high: candle[2],
      low: candle[3],
      close: candle[4],
      volume: candle[5],
    }));
  }

  private parseOHLCV(ohlcv: CCXTOHLCV[]) {
    const ohlcvTupleSchema = z.tuple([
      z.number(), // timestamp
      z.number(), // open
      z.number(), // high
      z.number(), // low
      z.number(), // close
      z.number(), // volume
    ]);

    return z.array(ohlcvTupleSchema).parse(ohlcv);
  }
}
