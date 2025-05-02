import { HTTPError } from "ky";
import { Observer, noop } from "rxjs";
import {
  SkateResultsClient,
  TimekeepingRaceWithId,
} from "../../clients/index.js";
import { Logger } from "../../Logger.js";

type Options = {
  client: SkateResultsClient;
  eventId: string;
  logger: Logger;
};

export function createTimekeepingAPIObserver({
  client,
  eventId,
  logger,
}: Options): Observer<TimekeepingRaceWithId | null> {
  return {
    next: async (data) => {
      try {
        if (data) {
          const { id, ...rest } = data;
          await Promise.all([
            client.timekeepingRace.update(eventId, data.id, rest),
            client.timekeepingCurrentRaces.update(eventId, [data.id]),
          ]);
        } else {
          await client.timekeepingCurrentRaces.update(eventId, []);
        }
      } catch (e) {
        if (e instanceof HTTPError) {
          logger.error(
            `Error updating live results: ${e.response.status} ${e.response.statusText}`
          );
          logger.error(await e.response.text());
          logger.info(JSON.stringify(data, undefined, 2));
        } else {
          logger.error("Error updating live results", e);
        }
      }
    },
    error: noop,
    complete: noop,
  };
}
