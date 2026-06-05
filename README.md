# Tetris Néo ✦

Tetris moderne en Vanilla JS + Canvas 2D. PWA jouable hors-ligne.

**Version actuelle : 2.4.2** — voir [CHANGELOG.md](CHANGELOG.md) pour l'historique complet.

## Le jeu

- Mécaniques : hold, ghost, NEXT×3, 7-bag, SRS, DAS/ARR, lock delay
- Modes Marathon et Sprint (40 lignes)
- 9 biomes (couleurs, musique, reliques, météo), progression et records par biome
- **Achievements** : défis débloquables avec décorations visuelles
- **Profil de jeu** : analyse de style (APM, réactions, colonnes préférées)
- **Codex** : encyclopédie des mondes, reliques et mécaniques
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
npm start              # http://localhost:3000
npm test               # tests unitaires
npm run prepare:e2e    # installer Chromium (première fois)
npm run test:e2e       # tests navigateur + accessibilité
npm run build          # bundle prod → dist/
npm run typecheck      # vérification types (checkJs)
```

Node 18+ (voir `.nvmrc`). Logs détaillés : `?debug=1` dans l'URL. Après mise à jour SW : **Ctrl+Shift+R** ou bannière « Nouvelle version ».

## Architecture

Vanilla ES modules, sans bundler. Point d'entrée : `index.html` → `js/main.js` → `js/moteur.js` (orchestrateur).

Documentation détaillée : [docs/architecture.md](docs/architecture.md).

```
moteur.js
├── store-jeu.js       état partagé
├── piece-jeu.js       pièces, DAS, lock delay
├── logique-partie.js  score, actions joueur
├── boucle-jeu.js      boucle RAF
├── rendu-jeu.js       canvas
├── partie.js          cycle de partie
├── ecrans-ui.js       menus et HUD
├── constellation.js   sélection biome
├── achievements.js    défis et stats globales
├── profil-jeu.js      analyse de style
├── codex.js           encyclopédie
├── meteo.js / reliques.js / audio.js
├── logique-pure.js    logique testable (7-bag, SRS)
└── config.js          réexporte config-jeu, biomes, contenu-jeu
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

Statique — GitHub Pages via `deploy.yml` (tests requis avant publish). Preview PR : artefact `site-preview` via `preview.yml`. Release : `npm run release`. Cache PWA : `npm run sync:sw` (automatique en release et deploy).

## Licence

MIT — [LICENSE](LICENSE). Contribuer : [CONTRIBUTING.md](CONTRIBUTING.md).
