import { bingx } from "ccxt";
import { z } from "zod";
import { FourEmaTrend } from "./strategies/four-ema-trend";

const envSchema = z.object({
  BINGX_API_KEY: z.string(),
  BINGX_SECRET_KEY: z.string(),
});

const env = envSchema.parse(process.env);

const exchange = new bingx({
  apiKey: env.BINGX_API_KEY,
  secret: env.BINGX_SECRET_KEY,
});
exchange.setSandboxMode(true);
const markets = await exchange.fetchMarkets();
console.table(
  markets
    .filter((market) => market !== undefined)
    .map((market) => market.symbol)
    .filter((symbol) => symbol.includes("BTC"))
);

const symbol = "BTC/USDT:USDT";
const timeframe = "4h";
const strategy = new FourEmaTrend(exchange, symbol, timeframe);
await strategy.run();
