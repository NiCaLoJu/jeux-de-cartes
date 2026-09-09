import { GameModule } from "@/lib/engine";

export interface GameDefinition {
  id: string;
  name: string;
  emoji: string;
  tagline: string;
  module: GameModule;
  gradient: string; // tailwind gradient classes
  minPlayers: number;
  maxPlayers: number;
  /** Scrabble "duplicate" TOP % réussite tracking (Module A variant). */
  supportsTop?: boolean;
  /** "Divers" : direction du score (plus petit/plus grand gagne) choisie à la création de la partie. */
  supportsInvertedToggle?: boolean;
  /** "Divers" : permet de renommer la partie (ex. "Rami", "Yams") à la création. */
  supportsCustomName?: boolean;
  /** "Divers" : permet de fixer une fin de partie (score cible ou nombre de manches). */
  supportsEndCondition?: boolean;
  /** Coinche/Contrée : true = propose Coinché/Surcoinché (Coinchée uniquement, pas Contrée). */
  supportsCoincheLevel?: boolean;
}

export const GAME_LIBRARY: GameDefinition[] = [
  {
    id: "dixit",
    name: "Dixit",
    emoji: "🎨",
    tagline: "Score cumulatif classique",
    module: "cumulative",
    gradient: "from-violet-300 to-fuchsia-300",
    minPlayers: 3,
    maxPlayers: 8,
  },
  {
    id: "scrabble",
    name: "Scrabble",
    emoji: "🔤",
    tagline: "Cumulatif + TOP duplicate",
    module: "cumulative",
    gradient: "from-sky-300 to-cyan-300",
    minPlayers: 2,
    maxPlayers: 4,
    supportsTop: true,
  },
  {
    id: "divers",
    name: "Divers",
    emoji: "🎲",
    tagline: "Score cumulatif libre",
    module: "cumulative",
    gradient: "from-amber-200 to-orange-300",
    minPlayers: 2,
    maxPlayers: 10,
    supportsInvertedToggle: true,
    supportsCustomName: true,
    supportsEndCondition: true,
  },
  {
    id: "cinq-rois",
    name: "5 Rois",
    emoji: "👑",
    tagline: "Cumulatif inversé — le plus petit gagne",
    module: "cumulative-inverted",
    gradient: "from-rose-300 to-pink-300",
    minPlayers: 2,
    maxPlayers: 6,
  },
  {
    id: "belote",
    name: "Belote",
    emoji: "♠️",
    tagline: "Calcul déductif — 2, 3 ou 4 joueurs",
    module: "belote",
    gradient: "from-emerald-300 to-teal-300",
    minPlayers: 2,
    maxPlayers: 4,
  },
  {
    id: "tarot",
    name: "Tarot",
    emoji: "🃏",
    tagline: "Contrats, bouts & poignées",
    module: "tarot",
    gradient: "from-indigo-300 to-violet-400",
    minPlayers: 3,
    maxPlayers: 5,
  },
  {
    id: "coinche",
    name: "Belote Coinchée",
    emoji: "🎯",
    tagline: "Enchères, contre & surcontre — 4 joueurs",
    module: "coinche",
    gradient: "from-cyan-300 to-blue-400",
    minPlayers: 4,
    maxPlayers: 4,
    supportsCoincheLevel: true,
  },
  {
    id: "contree",
    name: "Belote Contrée",
    emoji: "📣",
    tagline: "Enchères chiffrées — 4 joueurs",
    module: "coinche",
    gradient: "from-lime-300 to-emerald-400",
    minPlayers: 4,
    maxPlayers: 4,
    supportsCoincheLevel: false,
  },
];

export function getGameById(id: string): GameDefinition | undefined {
  return GAME_LIBRARY.find((g) => g.id === id);
}
