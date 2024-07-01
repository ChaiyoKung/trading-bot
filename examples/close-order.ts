import { BingX } from '../src/exchanges';

const exchange = new BingX('BTC-USDT', '5m', 125);
await exchange.closeAllPositions();
await exchange.cancelAllOrders();
