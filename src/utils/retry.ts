import { scheduler } from "node:timers/promises";
import { Logger } from "../Logger.js";

export async function retryUntilSuccess<T>(
  fn: () => Promise<T>,
  logger: Logger
): Promise<T> {
  while (true) {
    try {
      return await fn();
    } catch (e) {
      logger.error(e);
      logger.info("Retrying in 5 seconds");
      await scheduler.wait(5000);
    }
  }
}
