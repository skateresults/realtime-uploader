import type { Athlete } from "@skateresults/api-client";
import { formatISO, subSeconds } from "date-fns";
import type { Logger } from "../Logger.js";
import { parseTime } from "../utils/time.js";
import type { LeaderboardData } from "./leaderboardClient.js";
import type { ResultboardData } from "./resultboardClient.js";
import {
  getEliminationOrderByBIB,
  getPointsByBIB,
} from "./resultboardUtils.js";
import type { LiveData } from "./skateResultsClient.js";

const UNLIMITED_LAPS_FROM = 200;

interface Options {
  athletes: Athlete[];
  leaderboardData: LeaderboardData | null;
  resultboardData: ResultboardData | null;
}

export class ResultCalculator {
  #logger: Logger;
  #bibsWithoutAthlete = new Set<string>();

  constructor(logger: Logger) {
    this.#logger = logger;
  }

  calculate({
    athletes: allAthletes,
    leaderboardData,
    resultboardData: resultboardDataInput,
  }: Options): LiveData | null {
    const name = leaderboardData?.raceName ?? "";
    if (isDualSprint(name)) {
      return this.#calculateDualSprintResults({
        athletes: allAthletes,
        leaderboardData,
        resultboardData: resultboardDataInput,
      });
    }

    const resultboardData = isPointsOrEliminationRace(name)
      ? resultboardDataInput
      : null;

    if (leaderboardData === null) {
      return null;
    }

    if (leaderboardData.flagStatus === "NONE") {
      return null;
    }

    const athleteIdByBIB = new Map<string, string>();
    for (const athlete of allAthletes) {
      if (!athlete.bib) {
        continue;
      }
      athleteIdByBIB.set(`${athlete.bib}`, athlete.id);
    }

    const laps: LiveData["laps"] = isQualiMode(leaderboardData)
      ? undefined
      : {
          done: leaderboardData.lapsComplete,
          total: leaderboardData.lapsToGo + leaderboardData.lapsComplete,
        };

    const ranks = this.#getRanks(leaderboardData, resultboardData);
    const pointsByBIB = getPointsByBIB(resultboardData);
    const eliminationOrder = getEliminationOrderByBIB(resultboardData);

    const athletes: LiveData["athletes"] = {};
    for (const competitor of leaderboardData.competitors) {
      if (athleteIdByBIB.has(competitor.number)) {
        const position = isQualiMode(leaderboardData)
          ? competitor.qualiPosition
          : competitor.position;
        athletes[athleteIdByBIB.get(competitor.number)!] = {
          rank: ranks.get(competitor.number) ?? position,
          rankOnTrack: position,
          lapsDone: competitor.lapsComplete,
          time: parseAthleteTime(competitor.totalTime),
          bestLap: parseAthleteTime(competitor.lastLap)
            ? parseAthleteTime(competitor.bestLap)
            : competitor.lapsComplete === 1
            ? parseAthleteTime(competitor.totalTime)
            : undefined,
          lastLap: parseAthleteTime(competitor.lastLap)
            ? parseAthleteTime(competitor.lastLap)
            : competitor.lapsComplete === 1
            ? parseAthleteTime(competitor.totalTime)
            : undefined,
          points: pointsByBIB.get(competitor.number) ?? 0,
          eliminated: eliminationOrder.has(competitor.number),
        };
      } else if (!this.#bibsWithoutAthlete.has(competitor.number)) {
        this.#logger.warn(
          `[ResultCalculator] Could not find athlete for bib "${competitor.number}"`
        );
        this.#bibsWithoutAthlete.add(competitor.number);
      }
    }

    const elapsedSeconds = parseTime(leaderboardData.elapsedTime)?.seconds ?? 0;
    const start = subSeconds(new Date(), elapsedSeconds);

    return {
      id: leaderboardData.raceID.toString(),
      name,
      points:
        resultboardData !== null &&
        (resultboardData.Race.Type === "Points" ||
          resultboardData.Race.Type === "PointsElimination"),
      start: formatISO(start),
      laps,
      status:
        leaderboardData.flagStatus === "PURPLE"
          ? "ready"
          : leaderboardData.flagStatus === "FINISH"
          ? "finished"
          : "running",
      athletes,
      timePrecision: 3,
    };
  }

  #calculateDualSprintResults({
    athletes: allAthletes,
    resultboardData,
  }: Options): LiveData | null {
    if (!resultboardData) {
      return null;
    }

    if (!("TimeResults" in resultboardData)) {
      return null;
    }

    const athleteIdByBIB = new Map<string, string>();
    for (const athlete of allAthletes) {
      if (!athlete.bib) {
        continue;
      }
      athleteIdByBIB.set(`${athlete.bib}`, athlete.id);
    }

    const athletes: LiveData["athletes"] = {};
    for (const competitor of resultboardData.TimeResults) {
      if (athleteIdByBIB.has(competitor.Startnumber.toString())) {
        athletes[athleteIdByBIB.get(competitor.Startnumber.toString())!] = {
          rank: competitor.Place ?? 99,
          rankOnTrack: competitor.Place ?? 99,
          lapsDone: competitor.Place ? 1 : 0,
          time: competitor.FinishTime
            ? parseAthleteTime(competitor.FinishTime)
            : undefined,
          bestLap: competitor.FinishTime
            ? parseAthleteTime(competitor.FinishTime)
            : undefined,
          lastLap: competitor.FinishTime
            ? parseAthleteTime(competitor.FinishTime)
            : undefined,
          points: 0,
          eliminated: false,
        };
      } else if (
        !this.#bibsWithoutAthlete.has(competitor.Startnumber.toString())
      ) {
        this.#logger.warn(
          `[ResultCalculator] Could not find athlete for bib "${competitor.Startnumber.toString()}"`
        );
        this.#bibsWithoutAthlete.add(competitor.Startnumber.toString());
      }
    }

    return {
      id: `timerace-${resultboardData.Race.ID}`,
      name: resultboardData.Race.Name,
      status: "running",
      points: false,
      start: formatISO(new Date()),
      timePrecision: 3,
      athletes,
    };
  }

  #getLeaderboardRankByBIB(
    leaderboardData: LeaderboardData
  ): Map<string, number> {
    const qualiMode = isQualiMode(leaderboardData);

    return new Map(
      leaderboardData.competitors.map((c) => [
        c.number.toString(),
        qualiMode ? c.qualiPosition : c.position,
      ])
    );
  }

  #getRanks(
    leaderboardData: LeaderboardData,
    resultboardData: ResultboardData | null
  ): Map<string, number> {
    const bibs = leaderboardData.competitors.map((c) => c.number.toString());
    const leaderboardRankByBIB = this.#getLeaderboardRankByBIB(leaderboardData);

    if (resultboardData === null || resultboardData.Race.Type === "Time") {
      return new Map(
        bibs.map((bib) => [bib, leaderboardRankByBIB.get(bib) ?? 0])
      );
    }

    const pointsByBIB = getPointsByBIB(resultboardData);
    const eliminationOrder = getEliminationOrderByBIB(resultboardData);

    const athletesWithData = bibs.map((bib) => ({
      bib,
      points: pointsByBIB.get(bib) ?? 0,
      eliminationOrder: eliminationOrder.get(bib) ?? null,
      leaderboardRank: leaderboardRankByBIB.get(bib) ?? Infinity,
    }));

    const finishedAthletes = athletesWithData
      .filter((item) => item.eliminationOrder === null)
      .sort(
        (a, b) => b.points - a.points || a.leaderboardRank - b.leaderboardRank
      )
      .map(({ bib }, index) => [bib, index + 1] satisfies [string, number]);

    const eliminatedAthletes = athletesWithData
      .filter(
        (
          item
        ): item is {
          bib: string;
          points: number;
          eliminationOrder: number;
          leaderboardRank: number;
        } => item.eliminationOrder !== null
      )
      .sort((a, b) => b.eliminationOrder! - a.eliminationOrder!)
      .map(({ bib, eliminationOrder }, _, arr) => {
        const numOfEliminationsAfterCurrent = arr.filter(
          ({ eliminationOrder: otherEliminationOrder }) =>
            otherEliminationOrder > eliminationOrder
        ).length;

        return [
          bib,
          finishedAthletes.length + numOfEliminationsAfterCurrent + 1,
        ] satisfies [string, number];
      });

    return new Map([...finishedAthletes, ...eliminatedAthletes]);
  }
}

function parseAthleteTime(str: string): number | undefined {
  const result = parseTime(str);
  if (!result) {
    return;
  }

  if (result.seconds === 0) {
    return undefined;
  }

  return result.seconds;
}

function isQualiMode(leaderboardData: LeaderboardData): boolean {
  return leaderboardData.lapsToGo > UNLIMITED_LAPS_FROM;
}

function isPointsOrEliminationRace(name: string): boolean {
  if (name.toLowerCase().includes("sprintausscheidung")) {
    return false;
  }

  return ["point", "punkte", "elimination", "ausscheidung"].some((keyword) =>
    name.toLowerCase().includes(keyword)
  );
}

function isDualSprint(name: string): boolean {
  return name.toLowerCase().includes("dual");
}
