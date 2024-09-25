import {
  Observable,
  catchError,
  from,
  of,
  shareReplay,
  switchMap,
  timer,
} from "rxjs";
import type { Logger } from "../../Logger.js";
import type {
  ResultboardClient,
  ResultboardData,
} from "../../clients/index.js";

interface Options {
  client: ResultboardClient;
  interval: number;
  logger: Logger;
}

export function createResultboardObservable({
  client,
  interval,
  logger,
}: Options): Observable<ResultboardData | null> {
  const getData: () => Observable<ResultboardData | null> = () =>
    from(client.poll()).pipe(
      catchError((e) => {
        logger.error(e.message);
        return of(null);
      })
    );

  return timer(0, interval).pipe(switchMap(getData), shareReplay(1));
}
