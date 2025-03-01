import { binanceusdm } from 'ccxt';
import { ExchangeHandler } from './exchange-handler';

const symbol: string = 'BTC/USDT';
const timeframe: string = '4h';

const exchange = new binanceusdm();
exchange.setSandboxMode(true);

const exchangeHandler = new ExchangeHandler(exchange);
const ohlcv = await exchangeHandler.fetchOHLCV(symbol, timeframe);
console.table(ohlcv);
