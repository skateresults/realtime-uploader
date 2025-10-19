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
import {
  PointsLapList,
  ResultboardData,
  ResultboardDataElimination,
  ResultboardDataPointResult,
} from "../clients/resultboardClient.js";
import { uniq } from "lodash-es";

const UNLIMITED_LAPS_FROM = 200;

interface Options {
  athletes: Athlete[];
  leaderboardData: LeaderboardData | null;
  resultboardData: ResultboardData | null;
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
    resultboardData,
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
        resultboardData,
      });
    }

    return this.#calculateLapRace({
      athletes: allAthletes,
      leaderboardData,
      resultboardData,
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
      const athleteId = this.#getAthleteId(allAthletes, {
        bib: competitor.number,
        firstName: competitor.firstName,
        lastName: competitor.lastName,
      });
      if (!athleteId) {
        continue;
      }

      athletes[athleteId] = {
        bib: isNaN(+competitor.number) ? null : +competitor.number,
        firstName: competitor.firstName,
        lastName: competitor.lastName,

        rank: competitor.qualiPosition,
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
    resultboardData,
  }: Options): (TimekeepingRaceLapRace & { id: string }) | null {
    if (!leaderboardData) {
      return null;
    }

    const athletes: TimekeepingRaceLapRace["athletes"] = {};
    for (const competitor of leaderboardData.competitors) {
      const athleteId = this.#getAthleteId(allAthletes, {
        bib: competitor.number,
        firstName: competitor.firstName,
        lastName: competitor.lastName,
      });
      if (!athleteId) {
        continue;
      }

      athletes[athleteId] = {
        bib: isNaN(+competitor.number) ? null : +competitor.number,
        firstName: competitor.firstName,
        lastName: competitor.lastName,
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
      pointsSprints: this.#getPointsSprints(
        allAthletes,
        leaderboardData,
        resultboardData
      ),
      dnfs: this.#getDNFs(allAthletes, leaderboardData, resultboardData),
    };
  }

  #getAthleteId(
    athletes: Athlete[],
    competitor: { bib: string; firstName: string; lastName: string }
  ): string | undefined {
    const { bib } = competitor;
    if (bib === "") {
      return;
    }

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

    return objectHash({
      bib,
      firstName: competitor.firstName,
      lastName: competitor.lastName,
    });
  }

  #getPointsSprints(
    athletes: Athlete[],
    loaderboardData: LeaderboardData,
    resultboardData: ResultboardData | null
  ): { athleteId: string; points: number }[][] | undefined {
    if (!resultboardData) {
      return;
    }

    if (
      resultboardData.Race.Type !== "Points" &&
      resultboardData.Race.Type !== "PointsElimination"
    ) {
      return;
    }

    const typedResultboardData = resultboardData as {
      PointResults: ResultboardDataPointResult[];
      PointsLapList: PointsLapList;
    };

    const allowedBIBs = loaderboardData.competitors
      .map((competitor) => +competitor.number)
      .filter((bib) => !isNaN(bib));

    const sprints: {
      points: number;
      athleteId: string;
    }[][] = Object.entries(typedResultboardData.PointsLapList)
      .toSorted(
        ([sprintIndexA], [sprintIndexB]) => +sprintIndexA - +sprintIndexB
      )
      .map(([_, sprint]) =>
        Object.entries(sprint)
          .toSorted(([bibA], [bibB]) => +bibA - +bibB)
          .filter(([bib]) => allowedBIBs.includes(+bib))
          .map(([bib, points]) => ({
            points,
            pointsResult: typedResultboardData.PointResults.find(
              (result) => result.Startnumber === +bib
            ),
          }))
          .filter(({ pointsResult }) => !!pointsResult)
          .map(({ pointsResult, points }) => ({
            athleteId: this.#getAthleteId(athletes, {
              bib: pointsResult!.Startnumber.toString(),
              firstName: pointsResult!.FirstName,
              lastName: pointsResult!.LastName,
            }),
            points,
          }))
          .filter(
            (result): result is { points: number; athleteId: string } =>
              !!result.athleteId
          )
      );

    if (sprints.length === 0) {
      return;
    }

    return sprints;
  }

  #getDNFs(
    athletes: Athlete[],
    loaderboardData: LeaderboardData,
    resultboardData: ResultboardData | null
  ): { athleteIds: string[]; type: "dnf" | "elimination" }[] | undefined {
    if (!resultboardData) {
      return;
    }

    if (
      resultboardData.Race.Type !== "Elimination" &&
      resultboardData.Race.Type !== "PointsElimination"
    ) {
      return;
    }

    const typedResultboardData = resultboardData as {
      Eliminations: ResultboardDataElimination[];
    };

    const eliminationNrs = uniq(
      typedResultboardData.Eliminations.map(
        (elimination) => +elimination.EliminationNr
      )
    ).sort((a, b) => a - b);

    const allowedBIBs = loaderboardData.competitors
      .map((competitor) => +competitor.number)
      .filter((bib) => !isNaN(bib));

    const dnfs = eliminationNrs
      .map((eliminationNr) => ({
        athleteIds: typedResultboardData.Eliminations.filter(
          (elimination) => elimination.EliminationNr === eliminationNr
        )
          .filter((elimination) =>
            allowedBIBs.includes(elimination.Startnumber)
          )
          .map((elimination) =>
            this.#getAthleteId(athletes, {
              bib: elimination.Startnumber.toString(),
              firstName: elimination.FirstName,
              lastName: elimination.LastName,
            })
          )
          .filter((id): id is string => !!id)
          .sort((a, b) => a.localeCompare(b)),
        type: "elimination" as const,
      }))
      .filter((elimination) => elimination.athleteIds.length > 0);

    if (dnfs.length === 0) {
      return;
    }

    return dnfs;
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
  return (
    leaderboardData.lapsToGo > UNLIMITED_LAPS_FROM ||
    ["dobbin", "agility", "parcours"].some((word) =>
      leaderboardData.raceName.toLowerCase().includes(word)
    )
  );
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
