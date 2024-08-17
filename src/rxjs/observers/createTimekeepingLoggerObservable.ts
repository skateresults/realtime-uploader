import { Observer, noop } from "rxjs";
import { TimekeepingRaceWithId } from "../../clients/index.js";
import { Logger } from "../../Logger.js";

type Options = {
  logger: Logger;
};

export function createTimekeepingLoggerObservable({
  logger,
}: Options): Observer<TimekeepingRaceWithId | null> {
  return {
    next: (data) => {
      if (data) {
        logger.info(
          [
            `'${data.name}'`,
            `(race ${data.id})`,
            "-",
            ...(data.type === "lap-race"
              ? [
                  `${data.laps.completed.toString().padStart(2, " ")}/${
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
