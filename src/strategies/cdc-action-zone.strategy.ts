import { ema } from 'technicalindicators';
import type { Exchange } from '../exchanges';
import type { Strategy } from './types';

type Status = 'Idle' | 'Buy' | 'Sell';

export class CdcActionZoneStrategy implements Strategy {
  private status: Status = 'Idle';

  constructor(
    private readonly bot: Exchange,
    private readonly fastPeriod: number = 12,
    private readonly slowPeriod: number = 26
  ) {}

  public async execute(): Promise<void> {
    const ohlcv = await this.bot.fetchOHLCV();

    const closes = ohlcv.map(candle => candle.close);

    const ap = ema({ values: closes, period: 2 });
    const fast = ema({ values: ap, period: this.fastPeriod });
    const slow = ema({ values: ap, period: this.slowPeriod });

    const prevAp = ap[ap.length - 2];
    const prevClose = closes[closes.length - 2];
    const prevFast = fast[fast.length - 2];
    const prevSlow = slow[slow.length - 2];

    const isUpTrend = prevFast > prevSlow;
    const isDownTrend = prevFast < prevSlow;

    const isPreBuy = isDownTrend && prevAp > prevFast;
    const isShouldBuy = isUpTrend && prevAp > prevFast;
    const isPreSell = isUpTrend && prevAp < prevFast;
    const isShouldSell = isDownTrend && prevAp < prevFast;

    if (this.status === 'Sell' && isPreBuy) {
      await this.bot.closeAllPositions();
      this.status = 'Idle';
    }

    if (this.status === 'Idle' && isShouldBuy) {
      const order = await this.bot.createMarketBuyOrder(1, prevClose);
      console.info(`${new Date().toISOString()} [INFO]`, order);
      this.status = 'Buy';
    }

    if (this.status === 'Buy' && isPreSell) {
      await this.bot.closeAllPositions();
      this.status = 'Idle';
    }

    if (this.status === 'Idle' && isShouldSell) {
      const order = await this.bot.createMarketSellOrder(1, prevClose);
      console.info(`${new Date().toISOString()} [INFO]`, order);
      this.status = 'Sell';
    }

    console.info(`${new Date().toISOString()} [INFO] close="${prevClose}", status="${this.status}"`);
  }
}
