import { Event } from "@skateresults/api-client";
import { isEqual } from "lodash-es";
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
  TimekeepingRaceWithId,
  createLeaderboardClient,
  createResultboardClient,
  createSkateResultsClient,
} from "./clients/index.js";
import { getConfig } from "./config.js";
import {
  createAthletesObservable,
  createLeaderboardObservable,
  createResultboardObservable,
  createTimekeepingAPIObserver,
  createTimekeepingLoggerObservable,
} from "./rxjs/index.js";
import { TimekeepingDataAggregator } from "./services/TimekeepingDataAggregator.js";
import { TimekeepingRaceStartCache } from "./services/TimekeepingRaceStartCache.js";
import { TimekeepingTotalLapCountCache } from "./services/TimekeepingTotalLapCountCache.js";

const config = getConfig(process.argv);
const logger = new Logger(console, config.verbose);
const skateResultsClient = createSkateResultsClient(config);
const leaderboardClient = createLeaderboardClient(config);
const resultboardClient = createResultboardClient(config);
const timekeepingDataAggregator = new TimekeepingDataAggregator(logger);

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

const timekeepingRaceStartCache = new TimekeepingRaceStartCache();
const timekeepingTotalLapCountCache = new TimekeepingTotalLapCountCache();

const timekeepingRaceSubject = new Subject<TimekeepingRaceWithId | null>();
timekeepingRaceSubject.subscribe(createTimekeepingLoggerObservable({ logger }));
timekeepingRaceSubject.subscribe(
  createTimekeepingAPIObserver({
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
      timekeepingDataAggregator.calculate({
        leaderboardData,
        athletes,
        resultboardData,
      })
    ),
    map(timekeepingRaceStartCache.applyCachedStartTime),
    map(timekeepingTotalLapCountCache.applyCachedTotalLapCount),
    catchError((err, caught) => {
      logger.error(err);
      return caught;
    }),
    distinctUntilChanged((prev, cur) => isEqual(prev, cur)),
    throttleTime(config.interval, undefined, { leading: true, trailing: true })
  )
  .subscribe(timekeepingRaceSubject);
