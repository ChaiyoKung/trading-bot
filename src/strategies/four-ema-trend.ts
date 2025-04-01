import { BaseStrategy } from "./base-strategy";
import { ema } from "technicalindicators";

export class FourEmaTrend extends BaseStrategy {
  async run(): Promise<void> {
    console.log("Fetching OHLCV data...");
    const ohlcv = await this.fetchOhlcv();
    ohlcv.pop(); // remove the last candle because it's not closed yet
    console.table(ohlcv.slice(-5));

    console.log("Calculating EMA values...");
    const reversedClosePrices = ohlcv.map((candle) => candle.close).reverse();
    const [latestClosePrice, prevClosePrice] = reversedClosePrices;

    const [shortestEma, shortEma, longEma, longestEma] = await Promise.all([
      ema({ values: reversedClosePrices, period: 20, reversedInput: true }),
      ema({ values: reversedClosePrices, period: 50, reversedInput: true }),
      ema({ values: reversedClosePrices, period: 100, reversedInput: true }),
      ema({ values: reversedClosePrices, period: 200, reversedInput: true }),
    ]);
    const [latestShortestEma, prevShortestEma] = shortestEma;
    const [latestShortEma, prevShortEma] = shortEma;
    const [latestLongEma, prevLongEma] = longEma;
    const [latestLongestEma, prevLongestEma] = longestEma;

    console.table({
      close: { prev: prevClosePrice.toFixed(2), latest: latestClosePrice.toFixed(2) },
      "shortest ema": { prev: prevShortestEma.toFixed(2), latest: latestShortestEma.toFixed(2) },
      "short ema": { prev: prevShortEma.toFixed(2), latest: latestShortEma.toFixed(2) },
      "long ema": { prev: prevLongEma.toFixed(2), latest: latestLongEma.toFixed(2) },
      "longest ema": { prev: prevLongestEma.toFixed(2), latest: latestLongestEma.toFixed(2) },
    });

    const isLatestUpTrend =
      latestShortestEma > latestShortEma && latestShortEma > latestLongEma && latestLongEma > latestLongestEma;
    const isPrevUpTrend = prevShortestEma > prevShortEma && prevShortEma > prevLongEma && prevLongEma > prevLongestEma;

    const isLatestDownTrend =
      latestShortestEma < latestShortEma && latestShortEma < latestLongEma && latestLongEma < latestLongestEma;
    const isPrevDownTrend =
      prevShortestEma < prevShortEma && prevShortEma < prevLongEma && prevLongEma < prevLongestEma;

    console.log("Determining trade actions...");
    /**
     * open long position if:
     * - prev is not up trend
     * - latest is up trend
     * - latest close price is higher than latest shortest ema
     */
    if (!isPrevUpTrend && isLatestUpTrend && latestClosePrice > latestShortestEma) {
      console.log("Creating buy market order...");
      await this.exchange.createMarketBuyOrder(this.options.symbol, 0.005);
      console.log("Buy market order created");
      return;
    }

    /**
     * close long position if:
     * - prev is up trend
     * - latest is up trend
     * - latest close price is lower than latest shortest ema
     */
    if (isPrevUpTrend && isLatestUpTrend && latestClosePrice < latestShortestEma) {
      console.log("Closing long position...");
      await this.exchange.closePosition(this.options.symbol, "buy");
      console.log("Long position closed");
      return;
    }

    /**
     * open short position if:
     * - prev is not down trend
     * - latest is down trend
     * - latest close price is lower than latest shortest ema
     */
    if (!isPrevDownTrend && isLatestDownTrend && latestClosePrice < latestShortestEma) {
      console.log("Creating sell market order...");
      await this.exchange.createMarketSellOrder(this.options.symbol, 0.005);
      console.log("Sell market order created");
      return;
    }

    /**
     * close short position if:
     * - prev is down trend
     * - latest is down trend
     * - latest close price is higher than latest shortest ema
     */
    if (isPrevDownTrend && isLatestDownTrend && latestClosePrice > latestShortestEma) {
      console.log("Closing short position...");
      await this.exchange.closePosition(this.options.symbol, "sell");
      console.log("Short position closed");
      return;
    }

    // do nothing
    console.log("No action taken");
  }
}
