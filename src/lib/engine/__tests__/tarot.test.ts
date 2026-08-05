import { describe, expect, it } from "vitest";
import { applyTarotRound, computeTarotRound } from "../tarot";

describe("Module D - Tarot", () => {
  it("computes a successful petite contract with 3 bouts", () => {
    // threshold(3 bouts) = 36; points = 50 -> diff = 14; base = 39; petite x1 = 39
    const result = computeTarotRound({
      pointsPreneur: 50,
      bouts: 3,
      contract: "petite",
      petitAuBout: false,
      poignee: null,
    });
    expect(result.threshold).toBe(36);
    expect(result.difference).toBe(14);
    expect(result.success).toBe(true);
    expect(result.base).toBe(39);
    expect(result.finalValue).toBe(39);
  });

  it("computes a failed garde contract with 0 bouts", () => {
    // threshold(0 bouts) = 56; points = 40 -> diff = -16; base = 41; garde x2 = 82; failure -> negative
    const result = computeTarotRound({
      pointsPreneur: 40,
      bouts: 0,
      contract: "garde",
      petitAuBout: false,
      poignee: null,
    });
    expect(result.difference).toBe(-16);
    expect(result.success).toBe(false);
    expect(result.base).toBe(41);
    expect(result.finalValue).toBe(-82);
  });

  it("applies petit au bout before the contract multiplier", () => {
    // threshold(1 bout) = 51; points = 51 -> diff 0; base = 25; +10 petit = 35; garde-sans x4 = 140
    const result = computeTarotRound({
      pointsPreneur: 51,
      bouts: 1,
      contract: "garde-sans",
      petitAuBout: true,
      poignee: null,
    });
    expect(result.base).toBe(25);
    expect(result.contractValue).toBe(140);
    expect(result.finalValue).toBe(140);
  });

  it("adds poignee bonus after the multiplier", () => {
    // threshold(2 bouts) = 41; points = 61 -> diff 20; base = 45; garde-contre x6 = 270; + simple poignee 20 = 290
    const result = computeTarotRound({
      pointsPreneur: 61,
      bouts: 2,
      contract: "garde-contre",
      petitAuBout: false,
      poignee: "simple",
    });
    expect(result.contractValue).toBe(270);
    expect(result.finalValue).toBe(290);
  });

  it("distributes points: defenders get -finalValue each, preneur gets +finalValue * nbDefenders", () => {
    const result = computeTarotRound({
      pointsPreneur: 50,
      bouts: 3,
      contract: "petite",
      petitAuBout: false,
      poignee: null,
    }); // finalValue = 39
    const totals = applyTarotRound({}, "preneur", ["d1", "d2", "d3"], result);
    expect(totals).toEqual({ preneur: 117, d1: -39, d2: -39, d3: -39 });
  });

  it("generalizes to 3 players (2 defenders)", () => {
    const result = computeTarotRound({
      pointsPreneur: 30,
      bouts: 0,
      contract: "garde",
      petitAuBout: false,
      poignee: null,
    }); // diff -26, base 51, garde x2 = 102, failure -> -102
    const totals = applyTarotRound({}, "preneur", ["d1", "d2"], result);
    expect(totals).toEqual({ preneur: -204, d1: 102, d2: 102 });
  });
});
