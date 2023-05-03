import { scheduler } from "node:timers/promises";

interface Options {
  tick: () => void | Promise<void>;
  interval: number;
  signal: AbortSignal;
}

export function createInterval({ tick, interval, signal }: Options): void {
  async function run() {
    while (!signal.aborted) {
      try {
        await tick();
      } catch {}
      await scheduler.wait(interval, { signal });
    }
  }

  run();
}
