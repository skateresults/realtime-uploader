export class Logger
  implements Pick<Console, "info" | "warn" | "error" | "debug">
{
  #console: Console;
  #verbose: boolean;

  constructor(console: Console, verbose: boolean) {
    this.#console = console;
    this.#verbose = verbose;
  }

  info(...args: Parameters<Console["info"]>): void {
    this.#console.info(...args);
  }

  warn(...args: Parameters<Console["warn"]>): void {
    this.#console.warn(...args);
  }

  error(...args: Parameters<Console["error"]>): void {
    this.#console.error(
      ...args.map((arg) => {
        if (arg instanceof Error) {
          return getRootCauseMessage(arg);
        } else {
          return arg;
        }
      })
    );
  }

  debug(...args: Parameters<Console["debug"]>): void {
    if (!this.#verbose) {
      return;
    }

    this.#console.debug(...args);
  }
}

function getRootCauseMessage(error: Error): string {
  let e = error;
  while (e.cause) {
    e = e.cause as Error;
  }
  return e.message;
}
