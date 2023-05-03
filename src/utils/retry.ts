import { scheduler } from "node:timers/promises";
import { Logger } from "../Logger.js";

interface Options<T> {
  fn: () => Promise<T>;
  logger: Logger;
  signal: AbortSignal;
}

export async function retryUntilSuccess<T>({
  fn,
  logger,
  signal,
}: Options<T>): Promise<T> {
  while (!signal.aborted) {
    try {
      return await fn();
    } catch (e) {
      logger.error(e);
      logger.info("Retrying in 5 seconds");
      await scheduler.wait(5000, {
        signal,
      });
    }
  }

  throw new Error("Aborted");
}
