import { describe, expect, it } from "vitest";
import { rankInverted } from "../cumulativeInverted";

describe("Module B - cumulative inverted (5 Rois)", () => {
  it("ranks by ascending total (lowest wins)", () => {
    const players = [
      { id: "p1", name: "A" },
      { id: "p2", name: "B" },
      { id: "p3", name: "C" },
    ];
    const ranked = rankInverted({ p1: 40, p2: 5, p3: 20 }, players);
    expect(ranked.map((p) => p.id)).toEqual(["p2", "p3", "p1"]);
    expect(ranked[0].rank).toBe(1);
    expect(ranked[0].delta).toBe(0);
    expect(ranked[2].delta).toBe(35);
  });
});
