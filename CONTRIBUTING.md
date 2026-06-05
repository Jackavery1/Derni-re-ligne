# Contribuer

Guide minimal pour développer sur Tetris Néo. Historique des versions : [CHANGELOG.md](CHANGELOG.md).

## Setup

```bash
npm install
npm start              # http://localhost:3000
npm test               # Vitest
npm run prepare:e2e    # première fois
npm run test:e2e       # Playwright
npm run lint
npm run format:check
```

Node 18+ (`.nvmrc`). Logs verbeux : `?debug=1`.

## Commits

Format [Conventional Commits](https://www.conventionalcommits.org/) :

- `feat(codex): …` — nouvelle fonctionnalité
- `fix(audio): …` — correction de bug
- `test(progression): …` — tests
- `docs(readme): …` — documentation
- `refactor(config): …` — refactoring sans changement fonctionnel

Branche `main` protégée : PR avec CI verte (lint, format, tests, E2E).

## Règles

- Noms en **français** (`demarrerJeu`, `estPositionValide`)
- Runtime **sans dépendances** npm (uniquement devDeps)
- Logger via `js/logger.js`, pas `console.log`
- **localStorage** uniquement via `js/progression.js` (`lireStockage`, `ecrireStockage`, `lireStockageJson`, `ecrireStockageJson`)
- **CSP stricte** : pas de `style=` ni script inline → classes dans `styles/main.css`
- `CONFIG.taille` (32px) = taille de référence des cellules

Fonctions sensibles (ne pas modifier sans raison) : `estPositionValide()`, `tourner()`, `utiliserReserve()`.

## Modules clés

| Zone          | Fichiers                                                                |
| ------------- | ----------------------------------------------------------------------- |
| Orchestration | `moteur.js`, `store-jeu.js`, `actions-jeu.js`                           |
| Gameplay      | `piece-jeu.js`, `logique-partie.js`, `boucle-jeu.js`, `partie.js`       |
| Rendu         | `rendu-jeu.js`, `rendu-blocs.js`                                        |
| UI            | `ecrans-ui.js`, `ui-init.js`, `options-ui.js`, `input-jeu.js`           |
| Contenu       | `config.js`, `biomes.js`, `constellation.js`, `meteo.js`, `reliques.js` |
| Méta-jeu      | `achievements.js`, `profil-jeu.js`, `codex.js`, `progression.js`        |
| Testable      | `logique-pure.js`                                                       |

Architecture : [docs/architecture.md](docs/architecture.md).

## Vérification statique (checkJs)

Le typecheck TypeScript (`npm run typecheck`) couvre progressivement les modules critiques via `jsconfig.json` :

- `types.js`, `logique-pure.js`, `moteur-piece.js`, `progression.js`
- `ecrans-config.js`, `actions-jeu.js`, `archi-logique.js`, `bus-jeu.js`, `store-core.js`

Étendre la liste `include` lors de modifications sur d'autres modules.

## Release

```bash
npm run sync:sw    # synchroniser la liste de cache SW avec js/ et html/
npm run release    # bump version, SW, cache-bust HTML
```

Puis compléter [CHANGELOG.md](CHANGELOG.md) et créer un tag `vX.Y.Z`.
