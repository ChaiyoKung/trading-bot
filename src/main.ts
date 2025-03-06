import { bingx } from "ccxt";
import { ema } from "technicalindicators";
import { z } from "zod";

const exchange = new bingx();
const markets = await exchange.fetchMarkets();
console.table(
  markets
    .filter((market) => market !== undefined)
    .map((market) => market.symbol)
    .filter((symbol) => symbol.includes("BTC"))
);

const symbol = "BTC/USDT:USDT";
const timeframe = "4h";
const ohlcv = await exchange.fetchOHLCV(symbol, timeframe);
const parsedOhlcv = z
  .array(z.tuple([z.number(), z.number(), z.number(), z.number(), z.number(), z.number()]))
  .parse(ohlcv)
  .map((candle) => ({
    timestamp: new Date(candle[0]),
    open: candle[1],
    high: candle[2],
    low: candle[3],
    close: candle[4],
    volume: candle[5],
  }));
parsedOhlcv.pop(); // remove the last candle because it's not closed yet
console.table(parsedOhlcv.slice(-5));

const reversedClosePrices = parsedOhlcv.map((candle) => candle.close).reverse();
const [latestClosePrice, prevClosePrice] = reversedClosePrices;
console.table([{ prev: prevClosePrice, latest: latestClosePrice }]);

const [ema20, ema50, ema100, ema200] = await Promise.all([
  ema({ values: reversedClosePrices, period: 20, reversedInput: true }),
  ema({ values: reversedClosePrices, period: 50, reversedInput: true }),
  ema({ values: reversedClosePrices, period: 100, reversedInput: true }),
  ema({ values: reversedClosePrices, period: 200, reversedInput: true }),
]);
const [latestEma20, prevEma20] = ema20;
const [latestEma50, prevEma50] = ema50;
const [latestEma100, prevEma100] = ema100;
const [latestEma200, prevEma200] = ema200;
console.table([
  { period: 20, prev: prevEma20, latest: latestEma20 },
  { period: 50, prev: prevEma50, latest: latestEma50 },
  { period: 100, prev: prevEma100, latest: latestEma100 },
  { period: 200, prev: prevEma200, latest: latestEma200 },
]);

const isLatestUpTrend = latestEma20 > latestEma50 && latestEma50 > latestEma100 && latestEma100 > latestEma200;
const isPrevUpTrend = prevEma20 > prevEma50 && prevEma50 > prevEma100 && prevEma100 > prevEma200;

const isLatestDownTrend = latestEma20 < latestEma50 && latestEma50 < latestEma100 && latestEma100 < latestEma200;
const isPrevDownTrend = prevEma20 < prevEma50 && prevEma50 < prevEma100 && prevEma100 < prevEma200;

// create buy market order if prev is not up trend and latest is up trend and latest close price is higher than latest ema20
if (!isPrevUpTrend && isLatestUpTrend && latestClosePrice > latestEma20) {
  console.log("create buy market order");
}

// cancel buy market order if prev is up trend and latest is up trend and latest close price is lower than latest ema20
else if (isPrevUpTrend && isLatestUpTrend && latestClosePrice < latestEma20) {
  console.log("cancel buy market order");
}

// create sell market order if prev is not down trend and latest is down trend and latest close price is lower than latest ema20
else if (!isPrevDownTrend && isLatestDownTrend && latestClosePrice < latestEma20) {
  console.log("create sell market order");
}

// cancel sell market order if prev is down trend and latest is down trend and latest close price is higher than latest ema20
else if (isPrevDownTrend && isLatestDownTrend && latestClosePrice > latestEma20) {
  console.log("cancel sell market order");
}

// do nothing
else {
  console.log("do nothing");
}
