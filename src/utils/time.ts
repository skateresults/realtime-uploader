const PATTERN =
  /(((((([0-9]?[0-9]:)?)[0-9])?[0-9]:)?)[0-9])?[0-9]((\.|,)[0-9]+)?/g;

export function parseTime(
  str: string
): { seconds: number; precision: number } | undefined {
  const matches: RegExpMatchArray[] = Array.from(str.matchAll(PATTERN));
  matches.sort((a, b) => b[0].length - a[0].length);

  const timeStr = matches[0];
  if (!timeStr) {
    return;
  }

  const parts = timeStr[0].replace(",", ".").split(":").reverse();
  const partsParsed = parts.map((p) => Number.parseFloat(p));
  if (partsParsed.some((p) => Number.isNaN(p))) {
    return;
  }

  const [seconds = 0, minutes = 0, hours = 0] = partsParsed;
  const precision = (parts[0] ?? "").split(".")[1]?.length ?? 0;

  return {
    seconds: hours * 60 * 60 + minutes * 60 + seconds,
    precision,
  };
}
