import { differenceInSeconds } from "date-fns";
import { TimekeepingRaceWithId } from "../clients/skateResultsClient.js";

const DIFF_THRESHOLD = 3;

/**
 * Caches the start time per race to avoid flakiness due to rounding errors.
 */
export class TimekeepingRaceStartCache {
  #startTimeByRaceId = new Map<string, string>();

  applyCachedStartTime = (
    timekeepingRace: TimekeepingRaceWithId | null
  ): TimekeepingRaceWithId | null => {
    if (timekeepingRace === null) {
      return timekeepingRace;
    }

    if (
      timekeepingRace.status === "ready" ||
      timekeepingRace.startetAt === null
    ) {
      return timekeepingRace;
    }

    const cachedStartTime = this.#startTimeByRaceId.get(timekeepingRace.id);
    if (
      cachedStartTime === undefined ||
      Math.abs(
        differenceInSeconds(
          new Date(timekeepingRace.startetAt),
          new Date(cachedStartTime)
        )
      ) > DIFF_THRESHOLD
    ) {
      this.#startTimeByRaceId.set(
        timekeepingRace.id,
        timekeepingRace.startetAt
      );
    }

    return {
      ...timekeepingRace,
      startetAt: this.#startTimeByRaceId.get(timekeepingRace.id)!,
    };
  };
}
