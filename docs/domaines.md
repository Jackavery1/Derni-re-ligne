# Domaines applicatifs (`js/`)

Le code est organisé par **dossiers physiques** sous `js/<domaine>/`, complétés par des modules transverses à la racine (`js/main.js`, `js/achievements.js`, etc.).

| Domaine          | Dossier                | Préfixes / exemples                                                     | Rôle                        |
| ---------------- | ---------------------- | ----------------------------------------------------------------------- | --------------------------- |
| **Config**       | `js/config/`           | `config-*`, `biomes`                                                    | Constantes jeu, biomes      |
| **État**         | `js/etat/`             | `store-*`, `mode-histoire`, `bus-jeu`, `registre-modes`                 | Store central, flags modes  |
| **I/O**          | `js/io/`               | `progression*`, `charger-histoire-textes`                               | Persistance, chargement     |
| **Logique**      | `js/logique/`          | `logique-*`, `piece-jeu`, `score-partie`, `vivant*`, `meteo*`, `coop-*` | Règles Tetris, scoring, IA  |
| **Rendu**        | `js/rendu/`            | `rendu-*`, `decorations-*`, `hud-*`, `layout-*`                         | Canvas, HUD, décorations    |
| **UI**           | `js/ui/`               | `ui-*`, `navigation-*`, `ecrans-*`, `mascotte-*`                        | DOM, navigation, fragments  |
| **Audio**        | `js/audio/`            | `audio-*`, `melodie`, `haptique`                                        | SFX, musique, vibrations    |
| **Histoire**     | `js/histoire/`         | `histoire-*` (hors `histoire-textes/`)                                  | Campagne, cutscenes, carte  |
| **Achievements** | `js/achievements/`     | `achievements-*` (hors barrels racine)                                  | Succès, stats, UI           |
| **Codex**        | `js/codex/`            | `codex-*` (hors `codex-donnees`, `codex.js`)                            | Encyclopédie, illustrations |
| **Données**      | racine + sous-dossiers | `*-donnees/`, `histoire-textes/`, `data/`                               | Contenu éditorial, JSON     |

Migrations domaines (vagues 1–3) : déjà appliquées ; historique Git.
Puis : `node scripts/corriger-imports-js.mjs` et `npm run sync:sw`.

Voir aussi `docs/architecture.md` pour les découpages détaillés (coop, logique-partie, mécaniques-histoire).
