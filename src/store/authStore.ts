import { create } from "zustand";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { auth, firebaseEnabled, googleProvider } from "@/lib/firebase";

export interface AppUser {
  uid: string;
  displayName: string;
  email: string | null;
  photoURL: string | null;
}

interface AuthState {
  user: AppUser | null;
  loading: boolean;
  initialized: boolean;
  mode: "firebase" | "local";
  error: string | null;
  init: () => void;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, displayName: string) => Promise<void>;
  signOutUser: () => Promise<void>;
  clearError: () => void;
}

const LOCAL_USER_KEY = "sbp_local_user";

function loadLocalUser(): AppUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(LOCAL_USER_KEY);
    return raw ? (JSON.parse(raw) as AppUser) : null;
  } catch {
    return null;
  }
}

function saveLocalUser(user: AppUser) {
  window.localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(user));
}

function localUidFromEmail(email: string): string {
  return `local_${email.trim().toLowerCase()}`;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: true,
  initialized: false,
  mode: firebaseEnabled ? "firebase" : "local",
  error: null,

  init: () => {
    if (get().initialized) return;
    set({ initialized: true });

    if (firebaseEnabled && auth) {
      onAuthStateChanged(auth, (fbUser) => {
        if (fbUser) {
          set({
            user: {
              uid: fbUser.uid,
              displayName: fbUser.displayName ?? fbUser.email ?? "Joueur",
              email: fbUser.email,
              photoURL: fbUser.photoURL,
            },
            loading: false,
          });
        } else {
          set({ user: null, loading: false });
        }
      });
    } else {
      set({ user: loadLocalUser(), loading: false });
    }
  },

  signInWithGoogle: async () => {
    set({ error: null });
    if (firebaseEnabled && auth && googleProvider) {
      try {
        await signInWithPopup(auth, googleProvider);
      } catch (e) {
        set({ error: (e as Error).message });
      }
      return;
    }
    // Local demo mode: simulate a Google account.
    const user: AppUser = {
      uid: "local_google_demo",
      displayName: "Joueur Démo",
      email: "demo@scoreboard.app",
      photoURL: null,
    };
    saveLocalUser(user);
    set({ user });
  },

  signInWithEmail: async (email, password) => {
    set({ error: null });
    if (firebaseEnabled && auth) {
      try {
        await signInWithEmailAndPassword(auth, email, password);
      } catch (e) {
        set({ error: (e as Error).message });
      }
      return;
    }
    if (!email) {
      set({ error: "Merci de saisir un email." });
      return;
    }
    const user: AppUser = {
      uid: localUidFromEmail(email),
      displayName: email.split("@")[0],
      email,
      photoURL: null,
    };
    saveLocalUser(user);
    set({ user });
  },

  signUpWithEmail: async (email, password, displayName) => {
    set({ error: null });
    if (firebaseEnabled && auth) {
      try {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        const { updateProfile } = await import("firebase/auth");
        if (displayName) await updateProfile(cred.user, { displayName });
      } catch (e) {
        set({ error: (e as Error).message });
      }
      return;
    }
    const user: AppUser = {
      uid: localUidFromEmail(email),
      displayName: displayName || email.split("@")[0],
      email,
      photoURL: null,
    };
    saveLocalUser(user);
    set({ user });
  },

  signOutUser: async () => {
    if (firebaseEnabled && auth) {
      await signOut(auth);
      return;
    }
    window.localStorage.removeItem(LOCAL_USER_KEY);
    set({ user: null });
  },

  clearError: () => set({ error: null }),
}));
