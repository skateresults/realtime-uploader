import { createClient } from "@skateresults/api-client";
import ky from "ky";
import type { Config } from "../config.js";

export function createSkateResultsClient(config: Config) {
  return {
    ...createClient({ host: config.apiURL }),
    live: {
      update: async (eventId: string, liveData: LiveData): Promise<void> => {
        await ky.put(new URL(`/events/${eventId}/live`, config.apiURL), {
          json: liveData,
          headers: {
            Authorization: `Bearer ${config.token}`,
            "X-Timestamp": new Date().toISOString(),
          },
        });
      },
      delete: async (eventId: string): Promise<void> => {
        await ky.delete(new URL(`/events/${eventId}/live`, config.apiURL), {
          headers: {
            Authorization: `Bearer ${config.token}`,
          },
        });
      },
    },
  };
}

export type SkateResultsClient = ReturnType<typeof createSkateResultsClient>;

export interface LiveData {
  id: string;
  name: string;
  points: boolean;
  start: string;
  status: "ready" | "running" | "finished";
  laps?:
    | {
        done: number;
        total: number;
      }
    | undefined;
  athletes: Record<string, LiveDataAthlete>;
  timePrecision: number;
}

export interface LiveDataAthlete {
  rank: number;
  rankOnTrack: number;
  time: number | undefined;
  bestLap: number | undefined;
  lastLap: number | undefined;
  lapsDone: number;
  points: number;
  eliminated: boolean;
}
