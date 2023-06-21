import ky from "ky";
import type { Config } from "../config";

export function createResultboardClient(config: Config) {
  return {
    poll: async (): Promise<ResultboardData | null> => {
      if (!config.resultboardURL) {
        return null;
      }

      try {
        return await ky(config.resultboardURL).json();
      } catch (e) {
        throw new Error("Could not fetch resultboard", {
          cause: e,
        });
      }
    },
  };
}

export type ResultboardData =
  | ResultboardDataTime
  | ResultboardDataPoints
  | ResultboardDataElimination
  | ResultboardDataPointsElimination;

export interface ResultboardDataTime {
  Race: ResultboardDataRace<"Time">;
  PointResults: [];
  Eliminations: [];
  FinishOrder: [];
  EliminationResults: [];
  TimeResults: ResultboardDataTimeResult[];
}

export interface ResultboardDataPoints {
  Race: ResultboardDataRace<"Points">;
  PointResults: ResultboardDataPointResult[];
  Eliminations: [];
  FinishOrder: [];
  EliminationResults: [];
}

export interface ResultboardDataElimination {
  Race: ResultboardDataRace<"Elimination">;
  PointResults: [];
  Eliminations: ResultboardDataElimination[];
  FinishOrder: ResultboardDataFinishOrder[];
  EliminationResults: ResultboardDataEliminationResult[];
}

export interface ResultboardDataPointsElimination {
  Race: ResultboardDataRace<"PointsElimination">;
  PointResults: ResultboardDataPointResult[];
  Eliminations: ResultboardDataElimination[];
  FinishOrder: ResultboardDataFinishOrder[];
}

export interface ResultboardDataRace<
  Type extends "Time" | "Elimination" | "Points" | "PointsElimination"
> {
  Name: string;
  Type: Type;
  ID: number;
}

export interface ResultboardDataPointResult {
  Place: number;
  Startnumber: number;
  FirstName: string;
  LastName: string;
  FinishOrder: number;
  Eliminated: number;
  Points: number;
}

export interface ResultboardDataElimination {
  Startnumber: number;
  FirstName: string;
  LastName: string;
  EliminationNr: number;
}

export interface ResultboardDataFinishOrder {
  Startnumber: number;
  FirstName: string;
  LastName: string;
  FinishOrder: number;
}

export interface ResultboardDataEliminationResult {
  Place: number;
  Startnumber: number;
  FirstName: string;
  LastName: string;
  FinishOrder: number;
  Eliminated: number;
}

export interface ResultboardDataTimeResult {
  Place: number | null;
  Startnumber: number;
  FirstName: string;
  LastName: string;
  FinishTime: string | null;
}
