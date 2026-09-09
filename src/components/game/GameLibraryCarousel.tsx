"use client";

import { GAME_LIBRARY } from "@/data/games";
import { GameTile } from "@/components/game/GameTile";

/** All games as a wrapping grid — every entry visible at once, no scroll to discover new ones. */
export function GameLibraryCarousel() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {GAME_LIBRARY.map((game, i) => (
        <GameTile key={game.id} game={game} index={i} href={`/game/new?game=${game.id}`} />
      ))}
    </div>
  );
}
