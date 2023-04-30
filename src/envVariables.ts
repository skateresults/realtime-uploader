export const ENV_VARIABLES = {
  apiURL: process.env["API_URL"],
  leaderboardURL: process.env["LEADERBOARD_URL"],
  resultboardURL: process.env["RESULTBOARD_URL"],
  interval: parseNumber("INTERVAL"),
  event: process.env["EVENT"],
  token: process.env["TOKEN"],
  verbose: parseBoolean("VERBOSE"),
};

function parseNumber(name: string) {
  const raw = process.env[name];
  if (raw === undefined) {
    return undefined;
  }
  const parsed = parseInt(raw, 10);
  if (Number.isNaN(parsed)) {
    return;
  }
  return parsed;
}

function parseBoolean(name: string) {
  const raw = process.env[name];
  if (raw === undefined) {
    return undefined;
  }
  return raw === "true";
}
