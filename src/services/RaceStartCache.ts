import { LiveData } from "../clients/skateResultsClient.js";
import { differenceInSeconds, parseISO } from "date-fns";

const DIFF_THRESHOLD = 3;

/**
 * Caches the start time per race to avoid flakiness due to rounding errors.
 */
export class RaceStartCache {
  #startTimeByRaceId = new Map<string, string>();

  applyCachedStartTime = (liveData: LiveData | null): LiveData | null => {
    if (liveData === null) {
      return liveData;
    }

    if (liveData.status === "ready") {
      return liveData;
    }

    const cachedStartTime = this.#startTimeByRaceId.get(liveData.id);
    if (
      cachedStartTime === undefined ||
      Math.abs(
        differenceInSeconds(parseISO(liveData.start), parseISO(cachedStartTime))
      ) > DIFF_THRESHOLD
    ) {
      this.#startTimeByRaceId.set(liveData.id, liveData.start);
    }

    return {
      ...liveData,
      start: this.#startTimeByRaceId.get(liveData.id)!,
    };
  };
}
