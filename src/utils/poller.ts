import deepEqual from "fast-deep-equal";
import { createInterval } from "./interval.js";
import type { Logger } from "../Logger.js";

interface Options<T> {
  name: string;
  poll: () => T | Promise<T>;
  onChange: (newValue: T) => void | Promise<void>;
  interval: number;
  logger: Logger;
  signal: AbortSignal;
}

export function createPoller<T>({
  name,
  poll,
  onChange,
  interval,
  logger,
  signal,
}: Options<T>): void {
  let prevResult: T | undefined;

  async function tick() {
    try {
      const result = await poll();

      if (deepEqual(prevResult, result)) {
        logger.debug(`[${name}] Result did not change`);
      } else {
        await onChange(result);
        prevResult = result;
      }
    } catch (e) {
      if (e instanceof Error) {
        logger.error(`[${name}]`, e.name, e.message, e.cause);
        logger.debug(e.stack);
      } else {
        logger.error(`[${name}]`, JSON.stringify(e));
      }
    }
  }

  createInterval({
    tick,
    interval,
    signal,
  });

  logger.info(`[${name}] Starting poller`);
}
