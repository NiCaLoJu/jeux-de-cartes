# Score Board Premium 🏆

Une webapp glossy, mobile-first, pour compter les points des soirées jeux
(Dixit, Scrabble, 5 Rois, Belote, Tarot, et jeux "Divers"), avec animations
premium et un mode "Cast" pensé pour la TV.

## Stack

- **Next.js 16** (App Router, TypeScript) + **TailwindCSS v4**
- **Framer Motion** pour les animations (classement live, podium)
- **canvas-confetti** pour la célébration de fin de partie
- **Firebase** (Auth + Firestore) — optionnel, voir ci-dessous
- **Zustand** pour l'état (session de jeu, authentification)
- **Vitest** pour les tests du moteur de calcul

## Démarrage

```bash
npm install
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000).

### Mode démo local (sans Firebase)

Par défaut, sans configuration Firebase, l'application fonctionne
entièrement en local : l'authentification (email/mot de passe ou "Google")
et l'historique des parties sont stockés dans le `localStorage` du
navigateur. Aucune donnée n'est envoyée à un serveur.

### Activer Firebase (comptes réels + synchro cloud)

Copier `.env.example` vers `.env.local` et renseigner les clés d'un projet
Firebase (Authentication avec les providers Google + Email/Password, et
Firestore activés) :

```bash
cp .env.example .env.local
```

## Scripts

- `npm run dev` — serveur de développement
- `npm run build` — build de production
- `npm run lint` — ESLint
- `npm test` — tests unitaires du moteur de calcul (`src/lib/engine`)

## Architecture

- `src/lib/engine/` — moteur de calcul pur (sans état, sans React) pour les
  4 modules du cahier des charges : cumulatif classique (Dixit/Scrabble/
  Divers), cumulatif inversé (5 Rois), Belote déductive, Tarot (contrats,
  bouts, poignées). Couvert par des tests unitaires.
- `src/store/` — état applicatif (Zustand) : session de jeu en cours
  (joueurs, manches, classement live, mode cast) et authentification.
- `src/lib/history.ts` / `src/lib/stats.ts` — persistance de l'historique
  des parties et calcul des statistiques (taux de victoire, pire défaite,
  trophées).
- `src/components/game/` — formulaires de saisie par module, classement
  animé, podium, confettis.
- `src/app/` — routes : `/login`, `/dashboard`, `/game/new`,
  `/game/[id]/play` (saisie du Maître du Jeu + mode Cast plein écran).
