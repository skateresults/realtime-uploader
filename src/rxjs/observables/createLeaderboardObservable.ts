import {
  Observable,
  catchError,
  filter,
  from,
  of,
  shareReplay,
  switchMap,
  timer,
} from "rxjs";
import { Logger } from "../../Logger.js";
import type {
  LeaderboardClient,
  LeaderboardData,
} from "../../clients/index.js";

interface Options {
  client: LeaderboardClient;
  interval: number;
  logger: Logger;
}

export function createLeaderboardObservable({
  client,
  interval,
  logger,
}: Options): Observable<LeaderboardData> {
  const getData: () => Observable<LeaderboardData | null> = () =>
    from(client.poll()).pipe(
      catchError((e) => {
        logger.error(e.message);
        return of(null);
      })
    );

  return timer(0, interval).pipe(
    switchMap(getData),
    filter((input): input is LeaderboardData => input !== null),
    shareReplay(1)
  );
}
