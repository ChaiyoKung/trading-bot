import { bingx, Exchange, type Int } from "ccxt";
import { z } from "zod";

const envSchema = z.object({
  BINGX_API_KEY: z.string(),
  BINGX_SECRET_KEY: z.string(),
});

const env = envSchema.parse(process.env);

export class BingX extends Exchange {
  private readonly exchange: bingx;

  constructor(userConfig?: {}) {
    super();
    this.exchange = new bingx({
      apiKey: env.BINGX_API_KEY,
      secret: env.BINGX_SECRET_KEY,
      ...userConfig,
    });
  }

  public setSandboxMode(enable: boolean) {
    this.exchange.setSandboxMode(enable);
  }

  public async fetchMarkets(params?: {}) {
    return this.exchange.fetchMarkets(params);
  }

  public async fetchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}) {
    return this.exchange.fetchOHLCV(symbol, timeframe, since, limit, params);
  }

  public async createMarketBuyOrder(symbol: string, amount: number, params?: {}) {
    return this.exchange.createMarketBuyOrder(symbol, amount, params);
  }

  public async createMarketSellOrder(symbol: string, amount: number, params?: {}) {
    return this.exchange.createMarketSellOrder(symbol, amount, params);
  }

  public async cancelAllOrders(symbol: string, params?: {}) {
    return this.exchange.cancelAllOrders(symbol, params);
  }
}
