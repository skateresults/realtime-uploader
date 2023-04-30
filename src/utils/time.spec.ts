import { expect } from "chai";
import { describe, it } from "mocha";
import forEach from "mocha-each";
import { parseTime } from "./time.js";

describe("time", () => {
  describe("parseTime", () => {
    forEach([
      ["46", 46, 0],
      ["46.", 46, 0],
      ["46,", 46, 0],
      ["46,6", 46.6, 1],
      ["46,60", 46.6, 2],
      ["46,602", 46.602, 3],
      ["66,602", 66.602, 3],
      ["1:02,735", 62.735, 3],
      ["1:21:35,276", 4895.276, 3],
      ["00:00:46,602", 46.602, 3],
      ["00:46,602", 46.602, 3],
      ["06,602", 6.602, 3],
      ["00:00:00,602", 0.602, 3],
      ["00:00,602", 0.602, 3],
      ["00,602", 0.602, 3],
      ["01:21:35,276", 4895.276, 3],
      ["48,962(2F)", 48.962, 3],
      ["48,962(Q)", 48.962, 3],
      ["48,962DSQ", 48.962, 3],
      [":48,962DSQ", 48.962, 3],
      ["yolo 48,962 yolo", 48.962, 3],
      ["yolo 48,9625 yolo", 48.9625, 4],
      ["48,962 1:12", 48.962, 3],
    ]).it("%s", (input, seconds, precision) => {
      // All cases can be parsed
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const result = parseTime(input)!;
      expect(result.seconds).to.be.closeTo(seconds, 2);
      expect(result.precision).to.be.eq(precision);
    });

    it("handles inputs without time", () => {
      expect(parseTime("yolo")).to.be.undefined;
      expect(parseTime("")).to.be.undefined;
    });
  });
});
