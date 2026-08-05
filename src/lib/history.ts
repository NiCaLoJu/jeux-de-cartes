// Persistence layer for finished games. Uses Firestore when configured,
// otherwise falls back to localStorage so the app works fully offline/demo.

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
} from "firebase/firestore";
import { db, firebaseEnabled } from "@/lib/firebase";
import { GameModule } from "@/lib/engine";
import { RoundRecord } from "@/store/gameSessionStore";

export interface GameRecordPlayer {
  id: string;
  name: string;
  total: number;
  rank: number;
}

export interface GameRecord {
  id: string;
  gameId: string;
  gameName: string;
  gameEmoji: string;
  module: GameModule;
  playedAt: string; // ISO date
  players: GameRecordPlayer[];
  winnerIds: string[];
  roundsCount: number;
  /** Round-by-round breakdown, so the history detail view can show how each score was made. */
  rounds?: RoundRecord[];
  /** true = the lowest total won this game (needed to replay round-winner badges correctly). */
  invertedScoring?: boolean;
}

function localKey(uid: string) {
  return `sbp_games_${uid}`;
}

function readLocal(uid: string): GameRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(localKey(uid));
    return raw ? (JSON.parse(raw) as GameRecord[]) : [];
  } catch {
    return [];
  }
}

function writeLocal(uid: string, records: GameRecord[]) {
  window.localStorage.setItem(localKey(uid), JSON.stringify(records));
}

export async function saveGameRecord(
  uid: string,
  record: Omit<GameRecord, "id">
): Promise<GameRecord> {
  // Firestore rejects `undefined` field values (e.g. an optional `top` on a
  // cumulative round, or a round's `dealerId`) — a JSON round-trip drops them.
  const sanitized: Omit<GameRecord, "id"> = JSON.parse(JSON.stringify(record));

  if (firebaseEnabled && db) {
    const ref = await addDoc(collection(db, "users", uid, "games"), sanitized);
    return { ...sanitized, id: ref.id };
  }
  const full: GameRecord = { ...sanitized, id: `local_${Date.now()}_${Math.random().toString(36).slice(2, 8)}` };
  const existing = readLocal(uid);
  writeLocal(uid, [full, ...existing]);
  return full;
}

export async function deleteGameRecord(uid: string, recordId: string): Promise<void> {
  if (firebaseEnabled && db) {
    await deleteDoc(doc(db, "users", uid, "games", recordId));
    return;
  }
  const existing = readLocal(uid);
  writeLocal(uid, existing.filter((r) => r.id !== recordId));
}

export async function listGameRecords(uid: string): Promise<GameRecord[]> {
  if (firebaseEnabled && db) {
    const q = query(collection(db, "users", uid, "games"), orderBy("playedAt", "desc"));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<GameRecord, "id">) }));
  }
  return readLocal(uid).sort((a, b) => (a.playedAt < b.playedAt ? 1 : -1));
}
