# Déploiement — Vercel + Neon/Supabase

Ce guide déploie Fenrir en production : base Postgres managée (Neon ou
Supabase) + hébergement Vercel.

## 1. Base de données managée

Choisis Neon **ou** Supabase (les deux fonctionnent, Neon est légèrement plus
simple pour un projet Prisma).

### Option A — Neon

1. Crée un compte sur [neon.tech](https://neon.tech) et un nouveau projet.
2. Copie la **connection string** (onglet "Connection Details"), avec `?sslmode=require`.
3. Note-la : ce sera `DATABASE_URL`.

### Option B — Supabase

1. Crée un projet sur [supabase.com](https://supabase.com).
2. Va dans Project Settings → Database → Connection string → **URI**.
3. Utilise la variante "Connection pooling" (port 6543) pour `DATABASE_URL` en
   production — Vercel est serverless, chaque requête peut ouvrir une nouvelle
   connexion, et le pooler évite d'épuiser les connexions Postgres.

## 2. Variables d'environnement

Dans Vercel (Project Settings → Environment Variables), configure :

| Variable | Valeur |
|---|---|
| `DATABASE_URL` | La connection string Neon/Supabase de l'étape 1 |
| `AUTH_SECRET` | Génère avec `npx auth secret` (une valeur différente de celle du `.env` local) |
| `AUTH_URL` | L'URL de production, ex. `https://ton-app.vercel.app` (Auth.js la déduit normalement tout seul sur Vercel via `VERCEL_URL`, mais la définir explicitement évite des surprises) |

## 3. Migrations

Le script `build` (`package.json`) exécute automatiquement
`prisma migrate deploy` avant `next build` — donc **chaque déploiement Vercel
applique les migrations en attente** sur la base configurée dans
`DATABASE_URL`. Aucune étape manuelle n'est nécessaire pour les déploiements
suivants.

Pour le tout premier déploiement (base vide), il faut aussi seeder les
exercices intégrés. Depuis ta machine, avec `DATABASE_URL` pointé vers la base
de prod (dans un `.env.production.local` temporaire, jamais commité) :

```bash
npm run db:seed
```

## 4. Déployer sur Vercel

1. Pousse le repo sur GitHub/GitLab.
2. Sur [vercel.com/new](https://vercel.com/new), importe le repo.
3. Vercel détecte Next.js automatiquement — aucune configuration de build
   custom nécessaire (le `package.json` s'en charge).
4. Vérifie que les 3 variables d'environnement de l'étape 2 sont bien
   renseignées, puis déploie.

## 5. Après le déploiement

- Crée un compte via `/register` pour vérifier que l'auth + la base
  fonctionnent de bout en bout.
- Vérifie `/api/exercises` : la base d'exercices intégrés doit apparaître
  (confirme que le seed a fonctionné).

## Limites connues à ce stade (volontairement hors scope)

- **Rate limiting** : un limiteur en mémoire protège `/login`,
  `/register` et le changement de mot de passe, mais il est par-instance —
  sur Vercel (serverless), chaque cold start repart de zéro. Pour une
  protection réelle en production, brancher [Upstash Redis](https://upstash.com)
  (nécessite un compte Upstash).
- **OAuth / vérification d'e-mail** : le schéma est prêt (table `Account`,
  colonne `emailVerified`), mais non branché — ajouter un provider Google
  et un envoi d'e-mail transactionnel (ex. Resend) nécessite des clés API
  à fournir.
- **Langue** : seul le français est implémenté (pas d'infrastructure i18n).
