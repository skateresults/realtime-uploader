import {
  Observable,
  Subject,
  catchError,
  combineLatest,
  distinctUntilChanged,
  firstValueFrom,
  map,
  retry,
  switchMap,
  throttleTime,
  timer,
} from "rxjs";
import { Logger } from "./Logger.js";
import {
  LiveData,
  createLeaderboardClient,
  createResultboardClient,
  createSkateResultsClient,
} from "./clients/index.js";
import { getConfig } from "./config.js";
import {
  createAthletesObservable,
  createLeaderboardObservable,
  createLiveDataLoggerObserver,
  createLiveDataUploadObserver,
  createResultboardObservable,
} from "./rxjs/index.js";
import { ResultCalculator } from "./services/ResultCalculator.js";
import { isEqual } from "lodash-es";
import { Event } from "@skateresults/api-client";
import { RaceStartCache } from "./services/RaceStartCache.js";
import { TotalLapCountCache } from "./services/TotalLapCountCache.js";

const config = getConfig(process.argv);
const logger = new Logger(console, config.verbose);
const skateResultsClient = createSkateResultsClient(config);
const leaderboardClient = createLeaderboardClient(config);
const resultboardClient = createResultboardClient(config);
const resultsCalculator = new ResultCalculator(logger);

logger.debug("Config", config);

logger.info("Fetching event...");
const event$: Observable<Event> = timer(0, 5 * 1_000).pipe(
  switchMap(() => skateResultsClient.event.get(config.event)),
  retry({
    delay: (e) => {
      logger.error(e);
      logger.info("Retrying in 5 seconds");
      return timer(5 * 1_000);
    },
  })
);

const event = await firstValueFrom(event$);
logger.info(`Event: ${event.name}`);

const athletesObservable = createAthletesObservable({
  client: skateResultsClient,
  eventId: event.id,
  logger,
});
const leaderboardObservable = createLeaderboardObservable({
  client: leaderboardClient,
  interval: config.interval,
  logger,
});
const resultboardObservable = createResultboardObservable({
  client: resultboardClient,
  interval: config.interval,
  logger,
});
const raceStartCache = new RaceStartCache();
const totalLapCountCache = new TotalLapCountCache();

const liveDataSubject = new Subject<LiveData | null>();
liveDataSubject.subscribe(createLiveDataLoggerObserver({ logger }));
liveDataSubject.subscribe(
  createLiveDataUploadObserver({
    client: skateResultsClient,
    eventId: event.id,
    logger,
  })
);

combineLatest([
  athletesObservable,
  leaderboardObservable,
  resultboardObservable,
])
  .pipe(
    distinctUntilChanged((prev, cur) => isEqual(prev, cur)),
    map(([athletes, leaderboardData, resultboardData]) =>
      resultsCalculator.calculate({
        leaderboardData,
        resultboardData,
        athletes,
      })
    ),
    map(raceStartCache.applyCachedStartTime),
    map(totalLapCountCache.applyCachedTotalLapCount),
    catchError((err, caught) => {
      logger.error(err);
      return caught;
    }),
    distinctUntilChanged((prev, cur) => isEqual(prev, cur)),
    throttleTime(config.interval, undefined, { leading: true, trailing: true })
  )
  .subscribe(liveDataSubject);
