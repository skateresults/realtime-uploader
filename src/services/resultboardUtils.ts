import type {
  ResultboardData,
  ResultboardDataPointResult,
  ResultboardDataElimination,
} from "../clients/index.js";

export function getPointsByBIB(
  resultboardData: ResultboardData | null
): Map<string, number> {
  if (resultboardData === null || resultboardData.Race.Type === "Time") {
    return new Map<string, number>();
  }

  if (
    resultboardData.Race.Type === "Points" ||
    resultboardData.Race.Type === "PointsElimination"
  ) {
    return new Map(
      (resultboardData.PointResults as ResultboardDataPointResult[]).map(
        (result) => [result.Startnumber.toString(), result.Points]
      )
    );
  }

  return new Map<string, number>();
}

export function getEliminationOrderByBIB(
  resultboardData: ResultboardData | null
): Map<string, number> {
  if (resultboardData === null || resultboardData.Race.Type === "Time") {
    return new Map<string, number>();
  }

  if (
    resultboardData.Race.Type === "Points" ||
    resultboardData.Race.Type === "PointsElimination"
  ) {
    return new Map(
      (resultboardData.PointResults as ResultboardDataPointResult[])
        .map(
          (result) =>
            [result.Startnumber.toString(), result.Eliminated] as const
        )
        .filter(([_, value]) => value > 0)
    );
  }

  if (resultboardData.Race.Type === "Elimination") {
    return new Map(
      (resultboardData.Eliminations as ResultboardDataElimination[])
        .map(
          (result) =>
            [result.Startnumber.toString(), result.EliminationNr] as const
        )
        .filter(([_, value]) => value > 0)
    );
  }

  return new Map<string, number>();
}
