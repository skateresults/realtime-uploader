import { Observer, noop } from "rxjs";
import { LiveData, SkateResultsClient } from "../../clients/index.js";
import { Logger } from "../../Logger.js";
import { HTTPError } from "ky";

type Options = {
  client: SkateResultsClient;
  eventId: string;
  logger: Logger;
};

export function createLiveDataUploadObserver({
  client,
  eventId,
  logger,
}: Options): Observer<LiveData | null> {
  return {
    next: async (data) => {
      try {
        if (data) {
          await client.live.update(eventId, data);
        } else {
          await client.live.delete(eventId);
        }
      } catch (e) {
        if (e instanceof HTTPError) {
          logger.error(
            `Error updating live results: ${e.response.status} ${e.response.statusText}`
          );
          logger.error(await e.response.text());
        } else {
          logger.error("Error updating live results", e);
        }
      }
    },
    error: noop,
    complete: noop,
  };
}
