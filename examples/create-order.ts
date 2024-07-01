import { BingX } from '../src/exchanges';

const exchange = new BingX('BTC-USDT', '5m', 125);
const ticker = await exchange.fetchTicker();
if (ticker.last === undefined) throw new Error('`ticker.last` is undefined');
await exchange.createMarketSellOrder(1, ticker.last);
