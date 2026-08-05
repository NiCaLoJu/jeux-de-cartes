import { describe, expect, it } from "vitest";
import { applyCumulativeRound, rankCumulative, topSuccessRate } from "../cumulative";

describe("Module A - cumulative", () => {
  it("accumulates points across rounds", () => {
    let totals = {};
    totals = applyCumulativeRound(totals, { points: { p1: 10, p2: 5 } });
    totals = applyCumulativeRound(totals, { points: { p1: 3, p2: 20 } });
    expect(totals).toEqual({ p1: 13, p2: 25 });
  });

  it("ranks by descending total (highest wins)", () => {
    const players = [
      { id: "p1", name: "A" },
      { id: "p2", name: "B" },
    ];
    const ranked = rankCumulative({ p1: 13, p2: 25 }, players);
    expect(ranked[0].id).toBe("p2");
    expect(ranked[0].rank).toBe(1);
    expect(ranked[1].rank).toBe(2);
    expect(ranked[1].delta).toBe(12);
  });

  it("handles ties with equal rank", () => {
    const players = [
      { id: "p1", name: "A" },
      { id: "p2", name: "B" },
      { id: "p3", name: "C" },
    ];
    const ranked = rankCumulative({ p1: 10, p2: 10, p3: 5 }, players);
    expect(ranked[0].rank).toBe(1);
    expect(ranked[1].rank).toBe(1);
    expect(ranked[2].rank).toBe(3);
  });

  it("computes scrabble TOP success rate", () => {
    expect(topSuccessRate(45, 60)).toBe(75);
    expect(topSuccessRate(0, 60)).toBe(0);
    expect(topSuccessRate(10, 0)).toBe(0);
  });
});
