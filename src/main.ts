import { bingx } from 'ccxt';
import { ExchangeHandler } from './exchange-handler';
import { ema } from 'technicalindicators';

const symbol: string = 'BTC/USDT:USDT';
const timeframe: string = '4h';

const exchange = new bingx();
exchange.setSandboxMode(true);

const exchangeHandler = new ExchangeHandler(exchange);
const ohlcv = await exchangeHandler.fetchOHLCV(symbol, timeframe);
ohlcv.pop(); // Remove the last candle because it is not closed yet
console.table(ohlcv);

const closePrices = ohlcv.map(candle => candle.close).reverse();
const [latestClosePrice, prevClosePrice] = closePrices;
console.table({ prevClosePrice, latestClosePrice });

const [ema20, ema50, ema100, ema200] = await Promise.all([
  ema({ values: closePrices, period: 20, reversedInput: true }),
  ema({ values: closePrices, period: 50, reversedInput: true }),
  ema({ values: closePrices, period: 100, reversedInput: true }),
  ema({ values: closePrices, period: 200, reversedInput: true }),
]);
const [latestEMA20, prevEMA20] = ema20;
const [latestEMA50, prevEMA50] = ema50;
const [latestEMA100, prevEMA100] = ema100;
const [latestEMA200, prevEMA200] = ema200;
console.table({
  ema20: { prev: prevEMA20, latest: latestEMA20 },
  ema50: { prev: prevEMA50, latest: latestEMA50 },
  ema100: { prev: prevEMA100, latest: latestEMA100 },
  ema200: { prev: prevEMA200, latest: latestEMA200 },
});

const latestIsUpTrend = latestEMA20 > latestEMA50 && latestEMA50 > latestEMA100 && latestEMA100 > latestEMA200;
const prevIsUpTrend = prevEMA20 > prevEMA50 && prevEMA50 > prevEMA100 && prevEMA100 > prevEMA200;

const latestIsDownTrend = latestEMA20 < latestEMA50 && latestEMA50 < latestEMA100 && latestEMA100 < latestEMA200;
const prevIsDownTrend = prevEMA20 < prevEMA50 && prevEMA50 < prevEMA100 && prevEMA100 < prevEMA200;

// open long position when the trend changes from not up to up and latest close price above latest ema20
if (!prevIsUpTrend && latestIsUpTrend && latestClosePrice > latestEMA20) {
  console.log('OPEN LONG POSITION');
}

// close long position when the latest and previous is up trend and latest close price below latest ema20
else if (prevIsUpTrend && latestIsUpTrend && latestClosePrice < latestEMA20) {
  console.log('CLOSE LONG POSITION');
}

// open short position when the trend changes from not down to down and latest close price below latest ema20
else if (!prevIsDownTrend && latestIsDownTrend && latestClosePrice < latestEMA20) {
  console.log('OPEN SHORT POSITION');
}

// close short position when the latest and previous is down trend and latest close price above latest ema20
else if (prevIsDownTrend && latestIsDownTrend && latestClosePrice > latestEMA20) {
  console.log('CLOSE SHORT POSITION');
}

// do nothing
else {
  console.log('DO NOTHING');
}
