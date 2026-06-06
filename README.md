# Dernière Ligne ✦

Jeu de Tetris narratif en Vanilla JS + Canvas 2D. PWA jouable hors-ligne.
Mode Arcade et Mode Histoire « La Fragmentation ».

**Version actuelle : 2.5.0** — voir [CHANGELOG.md](CHANGELOG.md) pour l'historique complet.

## Le jeu

- Mécaniques : hold, ghost, NEXT×3, 7-bag, SRS, DAS/ARR, lock delay
- Modes Marathon et Sprint (40 lignes)
- **Mode Coop** : deux joueurs sur un plateau partagé
- **Mode Architecte** : 17 puzzles de placement sans gravité automatique
- 9 biomes (couleurs, musique, reliques, météo), progression et records par biome
- **Achievements** : défis débloquables avec décorations visuelles
- **Profil de jeu** : analyse de style (APM, réactions, colonnes préférées)
- **Codex** : encyclopédie des mondes, reliques et mécaniques
- **Mode Histoire** : campagne narrative « La Fragmentation », boss, journaux VERA
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

### Développement (modules ES natifs)

```bash
npm install
npm start              # http://localhost:3000 — charge js/*.js directement
npm test               # tests unitaires Vitest
npm run test:coverage  # couverture logique
npm run prepare:e2e    # installer Chromium (première fois)
npm run test:e2e       # Playwright + Axe (accessibilité)
npm run typecheck      # vérification types (checkJs)
npm run lint           # ESLint
npm run sync:sw        # régénère la liste de cache PWA (modules dev)
```

### Production (bundle minifié)

```bash
npm run build          # esbuild → dist/ (1 bundle JS + assets)
npm run analyze        # top modules par taille (dist/metafile.json)
```

Le déploiement GitHub Pages sert le bundle prod depuis `dist/`. En local, `npm start` utilise les modules ES sans bundler.

Node 18+ (voir `.nvmrc`). Logs détaillés : `?debug=1` dans l'URL. Après mise à jour SW : **Ctrl+Shift+R** ou bannière « Nouvelle version ».

## Architecture

Vanilla ES modules en dev ; bundle esbuild en prod. Point d'entrée : `index.html` → `js/main.js` → `js/moteur.js` (orchestrateur).

Documentation détaillée : [docs/architecture.md](docs/architecture.md). Guide extension biomes : [docs/ajouter-un-biome.md](docs/ajouter-un-biome.md).

```
moteur.js
├── store-jeu.js       état partagé
├── piece-jeu.js       pièces, DAS, lock delay
├── logique-partie.js  score, actions joueur
├── boucle-jeu.js      boucle RAF solo
├── rendu-jeu.js       canvas
├── partie.js          cycle de partie solo
├── coop-jeu.js        mode coop 2 joueurs
├── archi-jeu.js       mode Architecte (puzzles)
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
| 2.5     | Coop, build prod, mode Architecte, rendu découpé |

Détails par version : [CHANGELOG.md](CHANGELOG.md).

## Déploiement

Statique — GitHub Pages via `deploy.yml` (tests requis avant publish). Preview PR : artefact `site-preview` (bundle prod) via `preview.yml`. Release : `npm run release`. Cache PWA : `npm run sync:sw` (automatique en release et deploy).

## Licence

MIT — [LICENSE](LICENSE). Contribuer : [CONTRIBUTING.md](CONTRIBUTING.md).
