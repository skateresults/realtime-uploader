import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { ENV_VARIABLES } from "./envVariables.js";

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
    .option("api", {
      type: "string",
      description: "URL of the Skate Results API",
      default: "https://api.skateresults.app",
    })
    .option("leaderboard", {
      type: "string",
      description: "URL of the leaderboard JSON server",
      demandOption: ENV_VARIABLES.leaderboardURL === undefined,
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
      demandOption: ENV_VARIABLES.event === undefined,
    })
    .option("token", {
      type: "string",
      description: "Token to authenticate against Skate Results",
      demandOption: ENV_VARIABLES.token === undefined,
    })
    .option("verbose", {
      alias: "v",
      type: "boolean",
      default: false,
    })
    .parseSync();

  return Object.freeze({
    apiURL: ENV_VARIABLES.apiURL ?? args.api,
    leaderboardURL: (ENV_VARIABLES.leaderboardURL ?? args.leaderboard)!,
    resultboardURL: ENV_VARIABLES.resultboardURL ?? args.resultboard,
    interval: (ENV_VARIABLES.interval ?? args.interval)! * 1_000,
    event: (ENV_VARIABLES.event ?? args.event)!,
    token: (ENV_VARIABLES.token ?? args.token)!,
    verbose: ENV_VARIABLES.verbose ?? args.verbose,
  });
}
