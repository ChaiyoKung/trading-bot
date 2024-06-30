import { CronJob } from 'cron';
import { BingX } from './exchanges';
import { CdcActionZoneStrategy } from './strategies';

const symbol: string = 'BTC-USDT';
const timeframe: string = '5m';
const cronTime: string = '0 */5 * * * *'; // At every 5th minute.
const laverage: number = 125;

async function main() {
  console.info(`${new Date().toISOString()} [INFO] initialized`);

  const exchange = new BingX(symbol, timeframe, laverage);
  const strategy = new CdcActionZoneStrategy(exchange);

  const cronTask = async () => {
    try {
      await strategy.execute();
    } catch (error) {
      console.error(`${new Date().toISOString()} [ERROR]`, error);
    }
  };

  new CronJob(cronTime, cronTask, null, true);
}

main();
