import { FourEmaTrend } from "./strategies/four-ema-trend";
import { BingX } from "./exchanges/bingx";

const exchange = new BingX();

const isProd = process.env.NODE_ENV === "production";
if (!isProd) {
  console.log("Running in sandbox mode...");
  exchange.setSandboxMode(true);

  console.log("Fetching markets...");
  const markets = await exchange.fetchMarkets();
  console.table(
    markets
      .filter((market) => market !== undefined)
      .map((market) => market.symbol)
      .filter((symbol) => symbol.includes("BTC"))
  );
}

const symbol = "BTC/USDT:USDT";
const timeframe = "4h";
const strategy = new FourEmaTrend(exchange, { symbol, timeframe });
await strategy.run();
