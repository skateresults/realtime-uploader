import { LiveData } from "../clients/skateResultsClient.js";
import { differenceInSeconds } from "date-fns";

const CACHE_DURATION = 5;

type CacheData = {
  totalLapCount: number;
  lastUpdated: Date;
};

/**
 * The total lap count of a race is calculated by `lapsToGo + lapsComplete`. Both variables are not updated at the same time, so the total lap count can be off by 1.
 * This class caches the total lap count for a few seconds to avoid flakiness
 */
export class TotalLapCountCache {
  totalLapCountCache = new Map<string, CacheData>();

  applyCachedTotalLapCount = (liveData: LiveData | null): LiveData | null => {
    if (liveData === null) {
      return liveData;
    }

    if (liveData.status === "ready") {
      return liveData;
    }

    if (liveData.laps === undefined) {
      return liveData;
    }

    let totalLapCountToUser = liveData.laps.total;

    const cacheData = this.totalLapCountCache.get(liveData.id);
    if (
      cacheData &&
      differenceInSeconds(new Date(), cacheData.lastUpdated) < CACHE_DURATION
    ) {
      totalLapCountToUser = cacheData.totalLapCount;
    }

    this.totalLapCountCache.set(liveData.id, {
      totalLapCount: totalLapCountToUser,
      lastUpdated: new Date(),
    });

    return {
      ...liveData,
      laps: {
        ...liveData.laps,
        total: totalLapCountToUser,
      },
    };
  };
}
