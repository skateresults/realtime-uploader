import { Athlete, List } from "@skateresults/api-client";
import {
  Observable,
  catchError,
  filter,
  from,
  map,
  of,
  switchMap,
  timer,
} from "rxjs";
import { Logger } from "../../Logger.js";
import type { createSkateResultsClient } from "../../clients/index.js";

const INTERVAL = 5 * 60 * 1_000;

interface Options {
  client: ReturnType<typeof createSkateResultsClient>;
  eventId: string;
  logger: Logger;
}

export function createAthletesObservable({
  client,
  eventId,
  logger,
}: Options): Observable<Athlete[]> {
  const getData: () => Observable<List<Athlete> | null> = () =>
    from(client.athlete.getAll(eventId)).pipe(
      catchError((e) => {
        logger.error(e.message);
        return of(null);
      })
    );

  return timer(0, INTERVAL).pipe(
    switchMap(getData),
    filter((input): input is List<Athlete> => input !== null),
    map((response) => response.items)
  );
}
