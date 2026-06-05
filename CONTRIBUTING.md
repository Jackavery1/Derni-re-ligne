# Contribuer

Guide minimal pour développer sur Tetris Néo. Historique des versions : [CHANGELOG.md](CHANGELOG.md).

## Setup

```bash
npm install
npm start          # http://localhost:3000
npm test           # Vitest
npm run lint
npm run format:check
```

Node 18+. Logs verbeux : `?debug=1`.

## Règles

- Noms en **français** (`demarrerJeu`, `estPositionValide`)
- Runtime **sans dépendances** npm (uniquement devDeps)
- Logger via `js/logger.js`, pas `console.log`
- **CSP stricte** : pas de `style=` ni script inline → classes dans `styles/main.css`
- `CONFIG.taille` (32px) = taille de référence des cellules

Fonctions sensibles (ne pas modifier sans raison) : `estPositionValide()`, `tourner()`, `utiliserReserve()`.

## Modules clés

| Zone          | Fichiers                                                          |
| ------------- | ----------------------------------------------------------------- |
| Orchestration | `moteur.js`, `registre-jeu.js`, `contexte-jeu.js`                 |
| Gameplay      | `piece-jeu.js`, `logique-partie.js`, `boucle-jeu.js`, `partie.js` |
| Rendu         | `rendu-jeu.js`, `rendu-blocs.js`                                  |
| UI            | `ecrans-ui.js`, `ui-init.js`, `options-ui.js`, `input-jeu.js`     |
| Contenu       | `config.js`, `constellation.js`, `meteo.js`, `reliques.js`        |
| Testable      | `logique-pure.js`, `progression.js`                               |

## Release

```bash
npm run release    # bump version, SW, cache-bust HTML
```

Puis compléter [CHANGELOG.md](CHANGELOG.md).
