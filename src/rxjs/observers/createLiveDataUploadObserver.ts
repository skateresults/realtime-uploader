import { Observer, noop } from "rxjs";
import { LiveData, SkateResultsClient } from "../../clients/index.js";
import { Logger } from "../../Logger.js";

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
        console.error(e);
        logger.error("Error updating live results:", e);
      }
    },
    error: noop,
    complete: noop,
  };
}
