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
});
