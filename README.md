# SenegalScenario2026

Plateforme web d'analyse des scénarios de qualification des **meilleurs troisièmes** — Coupe du Monde FIFA 2026 (48 équipes), avec focus **Sénégal (groupe I)**.

**100 % données locales** — aucune API externe, aucun live score, aucune clé API.

## Fonctionnalités

- **495 scénarios** — C(12,8), mapping FIFA officiel
- **Analytique** — KPIs, Recharts, Monte Carlo
- **Manager** (`/manager`) — login admin, saisie résultats / événements / classements
- **`/statistics`** — buteurs, passeurs, cartons, suspendus
- **`/teams`** — 48 équipes + effectifs par poste
- **Calendrier & groupes** — depuis JSON local

## Données locales (`/data`)

| Fichier | Contenu |
|---------|---------|
| `teams.json` | Équipes, groupe, coach, drapeaux/logos locaux |
| `players.json` | Effectifs |
| `groups.json` | Classements par groupe (source unique) |
| `fixtures.json` | Calendrier & résultats |
| `scorers.json` | Meilleurs buteurs |
| `assists.json` | Meilleurs passeurs |
| `cards.json` | Cartons jaunes / rouges |
| `statistics.json` | Métadonnées + joueurs suspendus |
| `worldcup.json` | Source Manager (legacy) |

### Assets (`/public`)

- `/flags/{code}.svg` — drapeaux
- `/teams/{code}.svg` — logos équipes
- `/players/{id}.png` — photos joueurs

## Installation

```bash
npm install
cp .env.example .env.local
# MANAGER_SECRET=… pour /manager
npm run seed-worldcup    # si besoin
npm run parse-matchs     # calendrier + groups.json
npm run parse-players    # effectifs
npm run dev
```

## Scripts

| Commande | Description |
|----------|-------------|
| `npm run dev` | Développement |
| `npm run build` | Production |
| `npm run parse-matchs` | Calendrier depuis `data/matchs.txt` |
| `npm run seed-worldcup` | `worldcup.json` initial |

## Textes UI

- Fichier unique : `messages/fr.json` (libellés navigation, scénarios, etc.)
- Routes sans préfixe de langue : `/`, `/scenarios`, `/manager`, …
- Anciennes URLs `/fr/...` et `/en/...` redirigent vers les routes courtes
- Noms d’équipes et joueurs **non traduits**
- Projet **fan-first Sénégal** ; autres équipes via TeamSelector

## Page Scénarios (`/scenarios`)

Cœur du projet : **495 combinaisons** des meilleurs 3es (mapping FIFA), avec :

- **Probabilités intelligentes** (`lib/scenario-engine/`) — force des 3es, forme (fixtures), classements, pedigree
- **Tri** : plus/moins probables, meilleurs pour l’équipe sélectionnée
- **Filtres** : qualification, élimination, surprises, groupes qualifiés
- **Vue cartes** (liste virtualisée) ou **tableau** paginé
- **Équipe globale** : sélecteur header (défaut Sénégal) — KPIs qualification / 1er / 2e / huitièmes

`/senegal` redirige vers `/scenarios`.

## Base de données (Prisma + PostgreSQL)

Schéma dans `prisma/schema.prisma` — **données tournoi** (équipes, matchs, stats). Pas de comptes visiteurs.

**Admin `/manager`** : login par mot de passe (`MANAGER_SECRET` dans `.env`) — gestion des résultats, pas stocké en BDD.

| Modèle | Rôle |
|--------|------|
| `Team` | 48 équipes (`code`, `fifaCode`, `slug`, groupe) |
| `Coach` / `Player` | Effectifs (import depuis `squads.json`) |
| `Fixture` / `Venue` | Calendrier & scores |
| `MatchEvent` | Buts, cartons, remplacements, VAR |
| `GroupStanding` | Classements par groupe |
| `TournamentMeta` | Métadonnées tournoi |

Avec `DATABASE_URL` défini, l’app lit/écrit via **Prisma** (`lib/worldcup-db.ts`). Repli automatique sur `data/*.json` si la BDD est indisponible. `USE_DATABASE=false` force les JSON.

```bash
cp .env.example .env.local
# DATABASE_URL="postgresql://postgres:postgres@localhost:5432/senegalscenario2026"

npm run db:setup   # crée la base, tables, seed JSON → PostgreSQL
npm run db:studio  # interface Prisma
```

| Commande | Description |
|----------|-------------|
| `npm run db:generate` | Client Prisma |
| `npm run db:push` | Sync schéma → PostgreSQL |
| `npm run db:seed` | `prisma/seed.ts` ← JSON `data/` |
| `npm run db:reset` | Reset + seed |

## Architecture

```
lib/data/              # getTeams, getPlayers, getStatistics, …
lib/prisma.ts          # singleton PrismaClient
prisma/schema.prisma   # modèles PostgreSQL
lib/scenario-engine/   # probabilités, enrichissement, ranking
lib/scenarios.ts       # 495 scénarios FIFA (combinaisons)
data/*.json            # source locale + seed BDD
lib/worldcup-data.ts   # Manager + phases éliminatoires
```

## Déploiement

`MANAGER_SECRET` obligatoire en prod pour accéder au Manager (lecture + écriture API). Données tournoi versionnées dans Git ou seed BDD.

## Licence

MIT — Projet analytique éducatif / fan FIFA 2026.
