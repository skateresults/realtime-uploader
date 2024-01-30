import { Observer, noop } from "rxjs";
import { Logger } from "../../Logger.js";
import { LiveData } from "../../clients/index.js";

type Options = {
  logger: Logger;
};

export function createLiveDataLoggerObserver({
  logger,
}: Options): Observer<LiveData | null> {
  return {
    next: (data) => {
      if (data) {
        logger.info(
          [
            `'${data.name}'`,
            `(race ${data.id})`,
            "-",
            ...(data.laps
              ? [
                  `${data.laps.done.toString().padStart(2, " ")}/${
                    data.laps.total
                  }`,
                ]
              : []),
            data.status,
          ].join(" ")
        );
      } else {
        logger.info("Deleting live results");
      }
    },
    error: noop,
    complete: noop,
  };
}
