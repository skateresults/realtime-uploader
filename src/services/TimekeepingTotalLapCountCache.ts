import { differenceInSeconds } from "date-fns";
import { TimekeepingRaceWithId } from "../clients/index.js";

const CACHE_DURATION = 5;

type CacheData = {
  totalLapCount: number;
  lastUpdated: Date;
};

/**
 * The total lap count of a race is calculated by `lapsToGo + lapsComplete`. Both variables are not updated at the same time, so the total lap count can be off by 1.
 * This class caches the total lap count for a few seconds to avoid flakiness
 */
export class TimekeepingTotalLapCountCache {
  totalLapCountCache = new Map<string, CacheData>();

  applyCachedTotalLapCount = (
    timekeepingData: TimekeepingRaceWithId | null
  ): TimekeepingRaceWithId | null => {
    if (timekeepingData === null) {
      return timekeepingData;
    }

    if (timekeepingData.status === "ready") {
      return timekeepingData;
    }

    if (timekeepingData.type !== "lap-race") {
      return timekeepingData;
    }

    let totalLapCountToUser = timekeepingData.laps.total;

    const cacheData = this.totalLapCountCache.get(timekeepingData.id);
    if (
      cacheData &&
      differenceInSeconds(new Date(), cacheData.lastUpdated) < CACHE_DURATION
    ) {
      totalLapCountToUser = cacheData.totalLapCount;
    }

    this.totalLapCountCache.set(timekeepingData.id, {
      totalLapCount: totalLapCountToUser,
      lastUpdated: new Date(),
    });

    return {
      ...timekeepingData,
      laps: {
        ...timekeepingData.laps,
        total: totalLapCountToUser,
      },
    };
  };
}
