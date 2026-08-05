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

## Déploiement (Firebase Hosting + GitHub Actions)

Le déploiement (Hosting + règles Firestore) est automatisé via
[`.github/workflows/firebase-deploy.yml`](./.github/workflows/firebase-deploy.yml) :
chaque push sur `main` (ou `claude/score-board-premium-app-l30088`) build et
déploie automatiquement, sans commande manuelle.

**Seule étape requise** : fournir un compte de service Google Cloud pouvant
déployer sur le projet `jeux-de-cartes-a34f7`, via un secret GitHub nommé
`FIREBASE_SERVICE_ACCOUNT`.

1. [Console Google Cloud → Service Accounts](https://console.cloud.google.com/iam-admin/serviceaccounts?project=jeux-de-cartes-a34f7) → *Create Service Account*.
2. Rôle : `Editor` (suffisant pour Hosting + Firestore + Cloud Run/Functions utilisés par le rendu SSR Next.js).
3. Onglet *Keys* → *Add Key* → *Create new key* → JSON → télécharger.
4. Dans le repo GitHub : *Settings → Secrets and variables → Actions → New repository secret*, nom `FIREBASE_SERVICE_ACCOUNT`, coller le contenu du JSON.
5. Relancer le workflow (`Actions` → *Deploy to Firebase* → *Run workflow*), ou pousser un commit — le déploiement se fait tout seul ensuite.

La config `NEXT_PUBLIC_FIREBASE_*` est déjà présente dans le workflow (ce sont
des valeurs publiques de config web Firebase, pas des secrets).

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
