import { getConfig } from "./config.js";
import { Logger } from "./Logger.js";
import { createLeaderboardClient } from "./services/leaderboardClient.js";
import { createResultboardClient } from "./services/resultboardClient.js";
import { createSkateResultsClient } from "./services/skateResultsClient.js";
import { createPoller } from "./utils/poller.js";
import { createAthletesCache } from "./services/athletesCache.js";
import { ResultCalculator } from "./services/ResultCalculator.js";
import { retryUntilSuccess } from "./utils/retry.js";

const abortController = new AbortController();

process.on("SIGINT", () => {
  abortController.abort();
  process.exit();
});

const config = getConfig(process.argv);
const logger = new Logger(console, config.verbose);
const skateResultsClient = createSkateResultsClient(config);
const leaderboardClient = createLeaderboardClient(config);
const resultboardClient = createResultboardClient(config);

logger.debug("Config", config);

const event = await retryUntilSuccess({
  fn: () => skateResultsClient.event.get(config.event),
  logger,
  signal: abortController.signal,
});
if (!event) {
  logger.error("Could not find event");
  process.exit(1);
}
logger.info(`Event: ${event.name}`);

const athletesCache = await retryUntilSuccess({
  fn: () =>
    createAthletesCache({
      client: skateResultsClient,
      eventId: event.id,
      logger,
      signal: abortController.signal,
    }),
  logger,
  signal: abortController.signal,
});

const resultsCalculator = new ResultCalculator(logger);

createPoller({
  name: "Upload",
  interval: config.interval,
  signal: abortController.signal,
  poll: async () => {
    const [leaderboardData, resultboardData] = await Promise.all([
      leaderboardClient.poll(),
      resultboardClient.poll().catch((e) => {
        logger.error(e);
        return null;
      }),
    ]);

    return resultsCalculator.calculate({
      leaderboardData,
      resultboardData,
      athletes: athletesCache.getAthletes(),
    });
  },
  onChange: async (data) => {
    if (data) {
      logger.info(
        [
          "[Upload]",
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
      await skateResultsClient.live.update(event.id, data);
    } else {
      logger.info("[Upload] Deleting live results");
      await skateResultsClient.live.delete(event.id);
    }
  },
  logger,
});
