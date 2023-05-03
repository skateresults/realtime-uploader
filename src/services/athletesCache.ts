import type { createSkateResultsClient } from "./skateResultsClient.js";
import { createPoller } from "../utils/poller.js";
import type { Logger } from "../Logger.js";

interface Options {
  client: ReturnType<typeof createSkateResultsClient>;
  eventId: string;
  logger: Logger;
  signal: AbortSignal;
}

export async function createAthletesCache({
  client,
  eventId,
  logger,
  signal,
}: Options) {
  let athletes = await client.athlete.getAll(eventId);
  if (!athletes) {
    throw new Error("Could not find athletes");
  }

  createPoller({
    name: "Athletes",
    interval: 5 * 60 * 1_000,
    logger,
    poll: () => client.athlete.getAll(eventId),
    onChange: (newAthletes) => {
      athletes = newAthletes;
    },
    signal,
  });

  return {
    getAthletes() {
      return athletes.items;
    },
  };
}
