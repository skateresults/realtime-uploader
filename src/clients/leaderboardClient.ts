import ky from "ky";
import type { Config } from "../config.js";
import type { RaceRef } from "./raceRef.js";

export function createLeaderboardClient(config: Config) {
  return {
    poll: async (): Promise<LeaderboardData> => {
      try {
        return await ky(config.leaderboardURL).json();
      } catch (e) {
        throw new Error("Could not fetch leaderboard", {
          cause: e,
        });
      }
    },
  };
}

export type LeaderboardClient = ReturnType<typeof createLeaderboardClient>;

export interface LeaderboardData {
  raceName: string;
  raceID: number;
  raceRef?: RaceRef;
  flagStatus: "PURPLE" | "GREEN" | "YELLOW" | "RED" | "FINISH" | "NONE";
  elapsedTime: string;
  timeOfDay: string;
  lapsComplete: number;
  lapsToGo: number;
  trackName: string;
  competitors: LeaderboardDataCompetitor[];
}

export interface LeaderboardDataCompetitor {
  number: string;
  position: number;
  lapsComplete: number;
  firstName: string;
  lastName: string;
  totalTime: string;
  bestLap: string;
  lastLap: string;
  qualiPosition: number;
}
