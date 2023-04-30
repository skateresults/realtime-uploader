import { scheduler } from "node:timers/promises";

interface Options {
  tick: () => void | Promise<void>;
  interval: number;
}

export function createInterval({ tick, interval }: Options): () => void {
  let running = true;
  const controller = new AbortController();

  async function run() {
    while (running) {
      try {
        await tick();
      } catch {}
      await scheduler.wait(interval, { signal: controller.signal });
    }
  }

  run();

  return () => {
    running = false;
    controller.abort();
  };
}
