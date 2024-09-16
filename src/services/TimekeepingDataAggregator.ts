import type { Athlete } from "@skateresults/api-client";
import { formatISO, subSeconds } from "date-fns";
import objectHash from "object-hash";
import type { LeaderboardData } from "../clients/leaderboardClient.js";
import type {
  TimekeepingRaceFastestLap,
  TimekeepingRaceLapRace,
  TimekeepingRaceWithId,
} from "../clients/skateResultsClient.js";
import type { Logger } from "../Logger.js";
import { parseTime } from "../utils/time.js";

const UNLIMITED_LAPS_FROM = 200;

interface Options {
  athletes: Athlete[];
  leaderboardData: LeaderboardData | null;
}

export class TimekeepingDataAggregator {
  #logger: Logger;
  #bibsWithoutAthlete = new Set<string>();

  constructor(logger: Logger) {
    this.#logger = logger;
  }

  calculate({
    athletes: allAthletes,
    leaderboardData,
  }: Options): TimekeepingRaceWithId | null {
    const name = leaderboardData?.raceName ?? "";

    if (name.length === 0) {
      return null;
    }

    if (leaderboardData === null) {
      return null;
    }

    if (leaderboardData.flagStatus === "NONE") {
      return null;
    }

    if (isQualiMode(leaderboardData)) {
      return this.#calculateFastestLap({
        athletes: allAthletes,
        leaderboardData,
      });
    }

    return this.#calculateLapRace({
      athletes: allAthletes,
      leaderboardData,
    });
  }

  #calculateFastestLap({
    athletes: allAthletes,
    leaderboardData,
  }: Options): (TimekeepingRaceFastestLap & { id: string }) | null {
    if (!leaderboardData) {
      return null;
    }

    const athleteIdByBIB = new Map<string, string>();
    for (const athlete of allAthletes) {
      if (!athlete.bib) {
        continue;
      }
      athleteIdByBIB.set(`${athlete.bib}`, athlete.id);
    }

    const athletes: TimekeepingRaceFastestLap["athletes"] = {};
    for (const competitor of leaderboardData.competitors) {
      const athleteId = this.#getAthleteIdByBIB(allAthletes, competitor.number);
      if (!athleteId) {
        continue;
      }

      athletes[athleteId] = {
        rank: competitor.position,
        lastSeenAt: parseAthleteTime(competitor.totalTime),
        // TODO: Use lap times from leaderboard API
        lapTimes: parseAthleteTime(competitor.lastLap)
          ? [parseAthleteTime(competitor.lastLap)!]
          : [],
        bestTime: parseAthleteTime(competitor.bestLap)
          ? parseAthleteTime(competitor.bestLap)
          : competitor.lapsComplete === 1
          ? parseAthleteTime(competitor.totalTime)
          : null,
      };
    }

    return {
      id: getRaceId(leaderboardData),
      type: "fastest-lap",
      name: leaderboardData.raceName,
      status: getStatus(leaderboardData),
      timePrecision: 3,
      startedAt: getStart(leaderboardData),
      athletes,
    };
  }

  #calculateLapRace({
    athletes: allAthletes,
    leaderboardData,
  }: Options): (TimekeepingRaceLapRace & { id: string }) | null {
    if (!leaderboardData) {
      return null;
    }

    const athletes: TimekeepingRaceLapRace["athletes"] = {};
    for (const competitor of leaderboardData.competitors) {
      const athleteId = this.#getAthleteIdByBIB(allAthletes, competitor.number);
      if (!athleteId) {
        continue;
      }

      athletes[athleteId] = {
        rank: competitor.position,
        lastSeenAt: parseAthleteTime(competitor.totalTime),
        lapsCompleted: competitor.lapsComplete,
        // TODO: Use lap times from leaderboard API
        lapTimes: parseAthleteTime(competitor.lastLap)
          ? [parseAthleteTime(competitor.lastLap)!]
          : [],
        totalTimes: parseAthleteTime(competitor.totalTime)
          ? [parseAthleteTime(competitor.totalTime)!]
          : [],
        totalTime: parseAthleteTime(competitor.totalTime)
          ? parseAthleteTime(competitor.totalTime)
          : null,
      };
    }

    const lapsTotal = leaderboardData.lapsToGo + leaderboardData.lapsComplete;
    if (lapsTotal === 0) {
      return null;
    }

    return {
      id: getRaceId(leaderboardData),
      type: "lap-race",
      name: leaderboardData.raceName,
      status: getStatus(leaderboardData),
      timePrecision: 3,
      startedAt: getStart(leaderboardData),
      athletes,
      laps: {
        completed: leaderboardData.lapsComplete,
        total: lapsTotal,
      },
    };
  }

  #getAthleteIdByBIB(athletes: Athlete[], bib: string): string | undefined {
    const athleteIdByBIB: Record<string, string> = Object.fromEntries(
      athletes
        .filter((athlete) => !!athlete.bib)
        .map((athlete) => [`${athlete.bib}`, athlete.id])
    );

    if (athleteIdByBIB[bib]) {
      return athleteIdByBIB[bib];
    }

    if (!this.#bibsWithoutAthlete.has(bib)) {
      this.#logger.warn(
        `[ResultCalculator] Could not find athlete for bib "${bib}"`
      );
      this.#bibsWithoutAthlete.add(bib);
    }

    return undefined;
  }
}

function parseAthleteTime(str: string): number | null {
  const result = parseTime(str);
  if (!result) {
    return null;
  }

  if (result.seconds === 0) {
    return null;
  }

  return result.seconds;
}

function isQualiMode(leaderboardData: LeaderboardData): boolean {
  return leaderboardData.lapsToGo > UNLIMITED_LAPS_FROM;
}

function getStatus(
  leaderboardData: LeaderboardData
): "ready" | "running" | "finished" {
  switch (leaderboardData.flagStatus) {
    case "PURPLE":
      return "ready";
    case "FINISH":
      return "finished";
    default:
      return "running";
  }
}

function getStart(leaderboardData: LeaderboardData): string | null {
  const status = getStatus(leaderboardData);
  if (status === "ready") {
    return null;
  }

  const elapsedSeconds = parseTime(leaderboardData.elapsedTime)?.seconds ?? 0;
  const start = subSeconds(new Date(), elapsedSeconds);
  return formatISO(start);
}

function getRaceId(leaderboardData: LeaderboardData): string {
  return objectHash({
    id: leaderboardData.raceID,
    name: leaderboardData.raceName,
  });
}
