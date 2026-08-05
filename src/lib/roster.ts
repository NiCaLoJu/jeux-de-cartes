// Persistence for the saved player roster (name + photo), so recurring
// players (family, regular group) sync across devices via Firestore when
// signed in, and fall back to localStorage in local/offline demo mode —
// same pattern as lib/history.ts.

import { collection, deleteDoc, doc, getDocs, orderBy, query, setDoc } from "firebase/firestore";
import { db, firebaseEnabled } from "@/lib/firebase";

export interface SavedPlayer {
  id: string;
  name: string;
  /** Small square JPEG data URL, or undefined for the initial-letter fallback avatar. */
  photo?: string;
}

function localKey(uid: string) {
  return `sbp_roster_${uid}`;
}

function readLocal(uid: string): SavedPlayer[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(localKey(uid));
    return raw ? (JSON.parse(raw) as SavedPlayer[]) : [];
  } catch {
    return [];
  }
}

function writeLocal(uid: string, roster: SavedPlayer[]) {
  window.localStorage.setItem(localKey(uid), JSON.stringify(roster));
}

export async function listRoster(uid: string): Promise<SavedPlayer[]> {
  if (firebaseEnabled && db) {
    const q = query(collection(db, "users", uid, "roster"), orderBy("name"));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<SavedPlayer, "id">) }));
  }
  return readLocal(uid).sort((a, b) => a.name.localeCompare(b.name));
}

export async function saveSavedPlayer(uid: string, player: SavedPlayer): Promise<void> {
  // Firestore rejects `undefined` field values (a player with no photo yet).
  const sanitized: Omit<SavedPlayer, "id"> = JSON.parse(JSON.stringify({ name: player.name, photo: player.photo }));

  if (firebaseEnabled && db) {
    await setDoc(doc(db, "users", uid, "roster", player.id), sanitized);
    return;
  }
  const existing = readLocal(uid);
  const next = existing.some((p) => p.id === player.id)
    ? existing.map((p) => (p.id === player.id ? { ...p, ...sanitized } : p))
    : [...existing, { id: player.id, ...sanitized }];
  writeLocal(uid, next);
}

export async function deleteSavedPlayer(uid: string, id: string): Promise<void> {
  if (firebaseEnabled && db) {
    await deleteDoc(doc(db, "users", uid, "roster", id));
    return;
  }
  writeLocal(uid, readLocal(uid).filter((p) => p.id !== id));
}
