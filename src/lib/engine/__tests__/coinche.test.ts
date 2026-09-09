import { describe, expect, it } from "vitest";
import { applyCoincheRound, computeCoincheRound, isCoincheDedans } from "../coinche";

describe("Module E - Coinche / Contrée", () => {
  it("success: attack scores the announced bid, defense scores its real card points", () => {
    const result = computeCoincheRound({ attackingTeam: "A", bidValue: 100, attackScore: 110, mode: "normal" });
    expect(result.success).toBe(true);
    expect(result.cardPoints).toEqual({ attack: 100, defense: 52 });
    expect(result.teamPoints).toEqual({ A: 100, B: 52 });
  });

  it("flags dedans when the attack score is below the announced bid", () => {
    expect(isCoincheDedans(70, 80)).toBe(true);
    expect(isCoincheDedans(80, 80)).toBe(false);
  });

  it("chute (below bid, or explicit 'dedans'): attack 0, defense gets 162 + the bid", () => {
    const implicit = computeCoincheRound({ attackingTeam: "A", bidValue: 100, attackScore: 90, mode: "normal" });
    expect(implicit.success).toBe(false);
    expect(implicit.teamPoints).toEqual({ A: 0, B: 262 }); // 162 + 100

    const explicit = computeCoincheRound({ attackingTeam: "A", bidValue: 100, attackScore: 0, mode: "dedans" });
    expect(explicit.success).toBe(false);
    expect(explicit.teamPoints).toEqual({ A: 0, B: 262 });
  });

  it("capot: attack gets 252 regardless of the announced bid", () => {
    const result = computeCoincheRound({ attackingTeam: "B", bidValue: 80, attackScore: 0, mode: "capot" });
    expect(result.success).toBe(true);
    expect(result.teamPoints).toEqual({ A: 0, B: 252 });
  });

  it("coinche doubles and surcoinche quadruples the final score", () => {
    const simple = computeCoincheRound({ attackingTeam: "A", bidValue: 100, attackScore: 110, mode: "normal" });
    expect(simple.teamPoints).toEqual({ A: 100, B: 52 });

    const coinche = computeCoincheRound({
      attackingTeam: "A",
      bidValue: 100,
      attackScore: 110,
      mode: "normal",
      coincheLevel: "coinche",
    });
    expect(coinche.teamPoints).toEqual({ A: 200, B: 104 });

    const surcoinche = computeCoincheRound({
      attackingTeam: "A",
      bidValue: 100,
      attackScore: 110,
      mode: "normal",
      coincheLevel: "surcoinche",
    });
    expect(surcoinche.teamPoints).toEqual({ A: 400, B: 208 });
  });

  it("combines the color multiplier (sans-atout x2 / tout-atout x4) with the coinche multiplier", () => {
    const result = computeCoincheRound({
      attackingTeam: "A",
      bidValue: 100,
      attackScore: 110,
      mode: "normal",
      contractType: "tout-atout",
      coincheLevel: "coinche",
    });
    // x4 (tout-atout) * x2 (coinche) = x8
    expect(result.teamPoints).toEqual({ A: 800, B: 416 });
  });

  it("annonces and belote bonus are added unmultiplied, on top of the contract score", () => {
    const result = computeCoincheRound({
      attackingTeam: "A",
      bidValue: 100,
      attackScore: 110,
      mode: "normal",
      coincheLevel: "coinche",
      annonces: [{ team: "A", value: 20 }],
      beloteTeam: "B",
    });
    expect(result.teamPoints).toEqual({ A: 220, B: 124 }); // 200 + 20 annonce, 104 + 20 belote
  });

  it("distributes team points to all 4 players", () => {
    const result = computeCoincheRound({ attackingTeam: "A", bidValue: 90, attackScore: 100, mode: "normal" });
    const totals = applyCoincheRound({}, ["p1", "p2"], ["p3", "p4"], result);
    expect(totals).toEqual({ p1: 90, p2: 90, p3: 62, p4: 62 });
  });
});
