import { describe, expect, it } from "vitest";
import { roundWinnerIds } from "../roundWinner";
import { RoundRecord } from "@/store/gameSessionStore";

describe("roundWinnerIds", () => {
  it("cumulative: highest points wins when not inverted", () => {
    const round: RoundRecord = {
      module: "cumulative",
      roundNumber: 1,
      points: { alice: 10, bob: 20, carol: 20 },
    };
    expect(roundWinnerIds(round, false)).toEqual(["bob", "carol"]);
  });

  it("cumulative-inverted (5 Rois): lowest points wins", () => {
    const round: RoundRecord = {
      module: "cumulative-inverted",
      roundNumber: 1,
      points: { alice: 5, bob: 8 },
    };
    expect(roundWinnerIds(round, true)).toEqual(["alice"]);
  });

  it("belote: whichever side scored more that donne", () => {
    const round: RoundRecord = {
      module: "belote",
      roundNumber: 1,
      input: { attackingTeam: "A", attackScore: 100, mode: "normal" },
      result: {
        attackingTeam: "A",
        defendingTeam: "B",
        mode: "normal",
        contractType: "normal",
        trumpSuit: null,
        success: true,
        cardPoints: { attack: 100, defense: 62 },
        teamPoints: { A: 100, B: 62 },
      },
      attackTeamPlayerIds: ["p1", "p2"],
      defenseTeamPlayerIds: ["p3", "p4"],
    };
    expect(roundWinnerIds(round, false)).toEqual(["p1", "p2"]);
  });

  it("tarot: preneur (+ partner) win on success, defenders otherwise", () => {
    const base = {
      module: "tarot" as const,
      roundNumber: 1,
      input: { pointsPreneur: 50, bouts: 3 as const, contract: "petite" as const, petitAuBout: false, poignee: null },
      preneurId: "preneur",
      defenderIds: ["d1", "d2", "d3"],
      partnerId: null,
    };
    const success: RoundRecord = {
      ...base,
      result: { threshold: 36, difference: 14, success: true, base: 39, contractValue: 39, finalValue: 39 },
    };
    expect(roundWinnerIds(success, false)).toEqual(["preneur"]);

    const failure: RoundRecord = {
      ...base,
      result: { threshold: 36, difference: -10, success: false, base: 25, contractValue: 25, finalValue: -25 },
    };
    expect(roundWinnerIds(failure, false)).toEqual(["d1", "d2", "d3"]);
  });
});
