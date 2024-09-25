import { createClient } from "@skateresults/api-client";
import ky from "ky";
import type { Config } from "../config.js";

export function createSkateResultsClient(config: Config) {
  const authHeader = { Authorization: `Bearer ${config.token}` };
  return {
    ...createClient({ host: config.apiURL }),
    timekeepingCurrentRaces: {
      update: async (eventId: string, raceIds: string[]): Promise<void> => {
        await ky.put(
          new URL(
            `/events/${eventId}/timekeeping/current-races`,
            config.apiURL
          ),
          {
            json: raceIds,
            headers: { ...authHeader },
          }
        );
      },
    },
    timekeepingRace: {
      update: async (
        eventId: string,
        raceId: string,
        data: TimekeepingRace
      ): Promise<void> => {
        await ky.put(
          new URL(
            `/events/${eventId}/timekeeping/races/${raceId}`,
            config.apiURL
          ),
          {
            json: data,
            headers: { ...authHeader },
          }
        );
      },
      delete: async (eventId: string, raceId: string): Promise<void> => {
        await ky.delete(
          new URL(
            `/events/${eventId}/timekeeping/races/${raceId}`,
            config.apiURL
          ),
          { headers: { ...authHeader } }
        );
      },
    },
  };
}

export type SkateResultsClient = ReturnType<typeof createSkateResultsClient>;

export type TimekeepingRaceLapRace = {
  type: "lap-race";
  name: string;

  status: "ready" | "running" | "finished";
  startedAt: string | null;

  laps: {
    completed: number;
    total: number;
  };

  athletes: {
    [athleteId: string]: {
      rank: number | null;
      lapTimes: (number | null)[];
      totalTime: number | null;
      totalTimes: (number | null)[];
      lapsCompleted: number;
      lastSeenAt: number | null;
    };
  };
  timePrecision: number;
};

export type TimekeepingRaceFastestLap = {
  type: "fastest-lap";
  name: string;

  status: "ready" | "running" | "finished";
  startedAt: string | null;

  athletes: {
    [athleteId: string]: {
      rank: number | null;
      lapTimes: (number | null)[];
      bestTime: number | null;
      lastSeenAt: number | null;
    };
  };
  timePrecision: number;
};

export type TimekeepingRace =
  | TimekeepingRaceLapRace
  | TimekeepingRaceFastestLap;

export type TimekeepingRaceWithId = TimekeepingRace & { id: string };
