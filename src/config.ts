import yargs from "yargs";
import { hideBin } from "yargs/helpers";

export interface Config {
  apiURL: string;
  leaderboardURL: string;
  resultboardURL: string | undefined;
  interval: number;
  event: string;
  token: string;
  verbose: boolean;
}

export function getConfig(argv: string[]): Readonly<Config> {
  const args = yargs(hideBin(argv))
    .env("REALTIME")
    .option("api", {
      type: "string",
      description: "URL of the Skate Results API",
      default: "https://api.skateresults.app",
    })
    .option("leaderboard", {
      type: "string",
      description: "URL of the leaderboard JSON server",
      demandOption: true,
    })
    .option("resultboard", {
      type: "string",
      description: "URL of the resultboard server",
    })
    .option("interval", {
      type: "number",
      default: 1,
      description: "Interval (in seconds) for polling and uploading data",
    })
    .option("event", {
      type: "string",
      description: "Id of the Skate Results event",
      demandOption: true,
    })
    .option("token", {
      type: "string",
      description: "Token to authenticate against Skate Results",
      demandOption: true,
    })
    .option("verbose", {
      alias: "v",
      type: "boolean",
      default: false,
    })
    .parseSync();

  return Object.freeze({
    apiURL: args.api,
    leaderboardURL: args.leaderboard,
    resultboardURL: args.resultboard,
    interval: args.interval * 1_000,
    event: args.event,
    token: args.token,
    verbose: args.verbose,
  });
}
