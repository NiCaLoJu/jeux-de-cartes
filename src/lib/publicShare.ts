// Public, read-only, no-account-needed sharing of a finished game's recap.
// Publishes a redacted copy (no uid) to a top-level `public_shares`
// collection so /share/[id] can read it without being signed in.

import { addDoc, collection, doc, getDoc } from "firebase/firestore";
import { db, firebaseEnabled } from "@/lib/firebase";
import { GameModule } from "@/lib/engine";
import { GameRecord, GameRecordPlayer } from "@/lib/history";
import { RoundRecord } from "@/store/gameSessionStore";

export interface PublicShare {
  gameId: string;
  gameName: string;
  gameEmoji: string;
  module: GameModule;
  playedAt: string;
  players: GameRecordPlayer[];
  winnerIds: string[];
  rounds?: RoundRecord[];
  invertedScoring?: boolean;
}

function localKey(id: string) {
  return `sbp_share_${id}`;
}

export async function createPublicShare(record: GameRecord): Promise<string> {
  const payload: PublicShare = JSON.parse(
    JSON.stringify({
      gameId: record.gameId,
      gameName: record.gameName,
      gameEmoji: record.gameEmoji,
      module: record.module,
      playedAt: record.playedAt,
      players: record.players,
      winnerIds: record.winnerIds,
      rounds: record.rounds,
      invertedScoring: record.invertedScoring,
    })
  );

  if (firebaseEnabled && db) {
    const ref = await addDoc(collection(db, "public_shares"), payload);
    return ref.id;
  }
  const id = `local_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  window.localStorage.setItem(localKey(id), JSON.stringify(payload));
  return id;
}

export async function getPublicShare(id: string): Promise<PublicShare | null> {
  if (firebaseEnabled && db) {
    const snap = await getDoc(doc(db, "public_shares", id));
    return snap.exists() ? (snap.data() as PublicShare) : null;
  }
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(localKey(id));
  return raw ? (JSON.parse(raw) as PublicShare) : null;
}
