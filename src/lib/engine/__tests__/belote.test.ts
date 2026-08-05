import { describe, expect, it } from "vitest";
import { applyBeloteRound, computeBeloteRound, isDedans } from "../belote";

describe("Module C - Belote", () => {
  it("computes normal success: defense gets 162 - attack", () => {
    const result = computeBeloteRound({ attackingTeam: "A", attackScore: 100, mode: "normal" });
    expect(result.cardPoints).toEqual({ attack: 100, defense: 62 });
    expect(result.success).toBe(true);
    expect(result.teamPoints).toEqual({ A: 100, B: 62 });
  });

  it("flags dedans when attack score is below 82", () => {
    expect(isDedans(81)).toBe(true);
    expect(isDedans(82)).toBe(false);
  });

  it("applies dedans (chute): attack 0, defense 162", () => {
    const result = computeBeloteRound({ attackingTeam: "A", attackScore: 70, mode: "dedans" });
    expect(result.cardPoints).toEqual({ attack: 0, defense: 162 });
    expect(result.success).toBe(false);
    expect(result.teamPoints).toEqual({ A: 0, B: 162 });
  });

  it("applies capot: attack 252, defense 0", () => {
    const result = computeBeloteRound({ attackingTeam: "B", attackScore: 0, mode: "capot" });
    expect(result.cardPoints).toEqual({ attack: 252, defense: 0 });
    expect(result.teamPoints).toEqual({ A: 0, B: 252 });
  });

  it("adds belote bonus independently of success", () => {
    const result = computeBeloteRound({
      attackingTeam: "A",
      attackScore: 60,
      mode: "dedans",
      beloteTeam: "B",
    });
    expect(result.teamPoints).toEqual({ A: 0, B: 182 });
  });

  it("adds annonces to the declaring team", () => {
    const result = computeBeloteRound({
      attackingTeam: "A",
      attackScore: 100,
      mode: "normal",
      annonces: [{ team: "A", value: 20 }, { team: "B", value: 50 }],
    });
    expect(result.teamPoints).toEqual({ A: 120, B: 112 });
  });

  it("distributes team points to all 4 players", () => {
    const result = computeBeloteRound({ attackingTeam: "A", attackScore: 100, mode: "normal" });
    const totals = applyBeloteRound({}, ["p1", "p2"], ["p3", "p4"], result);
    expect(totals).toEqual({ p1: 100, p2: 100, p3: 62, p4: 62 });
  });

  it("gives each of the two defenders the FULL defense score in 3-player mode", () => {
    const result = computeBeloteRound({ attackingTeam: "A", attackScore: 90, mode: "normal" });
    const totals = applyBeloteRound({}, ["preneur"], ["def1", "def2"], result);
    expect(totals).toEqual({ preneur: 90, def1: 72, def2: 72 });
  });

  it("tout-atout: score x4, success threshold stays 82/162 (unmultiplied)", () => {
    const result = computeBeloteRound({
      attackingTeam: "A",
      attackScore: 100,
      mode: "normal",
      contractType: "tout-atout",
    });
    // raw split 100/62 x4 = 400/248
    expect(result.cardPoints).toEqual({ attack: 400, defense: 248 });
    expect(result.success).toBe(true);

    const failed = computeBeloteRound({
      attackingTeam: "A",
      attackScore: 81,
      mode: "normal",
      contractType: "tout-atout",
    });
    expect(failed.success).toBe(false); // 81 < 82 threshold, independent of multiplier

    const capot = computeBeloteRound({
      attackingTeam: "A",
      attackScore: 0,
      mode: "capot",
      contractType: "tout-atout",
    });
    expect(capot.cardPoints).toEqual({ attack: 1008, defense: 0 }); // 252 x4
  });

  it("sans-atout: score x2", () => {
    const result = computeBeloteRound({
      attackingTeam: "A",
      attackScore: 90,
      mode: "normal",
      contractType: "sans-atout",
    });
    // raw split 90/72 x2 = 180/144
    expect(result.cardPoints).toEqual({ attack: 180, defense: 144 });

    const capot = computeBeloteRound({
      attackingTeam: "B",
      attackScore: 0,
      mode: "capot",
      contractType: "sans-atout",
    });
    expect(capot.teamPoints).toEqual({ A: 0, B: 504 }); // 252 x2

    const dedans = computeBeloteRound({
      attackingTeam: "A",
      attackScore: 40,
      mode: "dedans",
      contractType: "sans-atout",
    });
    expect(dedans.teamPoints).toEqual({ A: 0, B: 324 }); // 162 x2
  });
});
