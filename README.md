# Tetris Néo ✦

Tetris moderne en Vanilla JS + Canvas 2D. PWA jouable hors-ligne.

**Version actuelle : 2.4.2** — voir [CHANGELOG.md](CHANGELOG.md) pour l'historique complet.

## Le jeu

- Mécaniques : hold, ghost, NEXT×3, 7-bag, SRS, DAS/ARR, lock delay
- Modes Marathon et Sprint (40 lignes)
- 9 biomes (couleurs, musique, reliques, météo), progression et records par biome
- PWA installable, contraste élevé, contrôles clavier et tactile

| Touche    | Action                 |
| --------- | ---------------------- |
| ← →       | Déplacer               |
| ↑ / Z     | Tourner (horaire)      |
| X         | Tourner (anti-horaire) |
| ↓         | Chute lente            |
| Espace    | Chute rapide           |
| C / Maj   | Hold                   |
| P / Échap | Pause                  |

Guide détaillé : **Options → Contrôles**.

## Démarrage

```bash
npm install
npm start          # http://localhost:3000
npm test           # tests unitaires
npm run test:e2e   # tests navigateur (npx playwright install chromium si besoin)
```

Logs détaillés : `?debug=1` dans l'URL. Après mise à jour SW : **Ctrl+Shift+R** ou bannière « Nouvelle version ».

## Architecture

Vanilla ES modules, sans bundler. Point d'entrée : `index.html` → `js/main.js` → `js/moteur.js` (orchestrateur).

```
moteur.js
├── contexte-jeu.js    état partagé
├── piece-jeu.js       pièces, DAS, lock delay
├── logique-partie.js  score, actions joueur
├── boucle-jeu.js      boucle RAF
├── rendu-jeu.js       canvas
├── partie.js          cycle de partie
├── ecrans-ui.js       menus et HUD
├── constellation.js   sélection biome
├── meteo.js / reliques.js / audio.js
├── logique-pure.js    logique testable (7-bag, SRS)
└── config.js          données (biomes, constantes)
```

Styles : `styles/main.css`. Cache offline : `sw.js`.

## Évolution du projet

| Version | Changement principal                             |
| ------- | ------------------------------------------------ |
| 2.0     | Jeu Tetris complet (hold, SRS, biomes, FX)       |
| 2.1     | Sprint, musique, PWA offline, accessibilité      |
| 2.2     | Séparation `moteur.js`, logique pure, CI         |
| 2.3     | Audio Web API, progression, étoiles, E2E         |
| 2.4     | Outillage (Vitest, ESLint, CSP), CSS externalisé |
| 2.4.1   | Découpage modulaire du moteur (14 fichiers)      |
| 2.4.2   | Tests étendus, docs, alignement versions         |

Détails par version : [CHANGELOG.md](CHANGELOG.md).

## Déploiement

Statique — GitHub Pages via `deploy.yml` (tests requis avant publish). Release : `npm run release`.

## Licence

MIT — [LICENSE](LICENSE). Contribuer : [CONTRIBUTING.md](CONTRIBUTING.md).
