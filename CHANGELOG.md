# Changelog

Historique des versions de Dernière Ligne. Format [semver](https://semver.org/) : `MAJEUR.MINEUR.PATCH`.

## Résumé par version

| Version    | Date       | En bref                                                                                                 |
| ---------- | ---------- | ------------------------------------------------------------------------------------------------------- |
| **2.5.34** | 2026-06-27 | Audits B/C/D E2E, portrait VERA sprite, presets cutscene, mute UI, pipeline esbuild/CSS prod            |
| **2.5.33** | 2026-06-23 | Audit A/D : bundle test hors budget, E2E post-monde texte+scène, campagne secrets narratif, docs 560 Ko |
| **2.5.32** | 2026-06-18 | Compléments audit : yeux VERA, haptique leaderboard, E2E entrées/fin vraie, ESLint 0 warn               |
| **2.5.31** | 2026-06-18 | Remédiation audit D : E2E post-monde 15 mondes, paradoxe, audio cutscene, VERA expressif                |
| **2.5.30** | 2026-06-18 | Remédiation audit C : cutscenes &lt;320px, archi/pause/game over paysage, safe-area harmonisée          |
| **2.5.29** | 2026-06-18 | Remédiation audit B : infobulles modes, haptique, briefing Distorsion carte, ROBO HUD                   |
| **2.5.28** | 2026-06-18 | Remédiation audit A : bundle, hotspots, ESLint, images UI, SW v53                                       |
| **2.5.27** | 2026-06-17 | Notifs hors canvas, modes Sans fin/Sprint, sélection mobile constellation, infobulles modes             |
| **2.5.25** | 2026-06-17 | Mobile accueil, precache textes histoire, cutscene découpée, bundle −1 Ko, SW v51                       |
| **2.5.24** | 2026-06-17 | Données jeu en JSON async, portraits VERA découpés, ROBO menu image, achievements conditions split      |
| **2.5.23** | 2026-06-16 | Fix boutons lazy-load (codex/coop/archi/profil), haptique meta, export profil, responsive audit         |
| **2.5.22** | 2026-06-16 | Remédiations audits A/B/C/D : lazy-load, precache −47 %, icônes, leaderboard filtres, E2E campagne      |
| **2.5.21** | 2026-06-16 | Remédiations audits A/B/C/D : splits modules, leaderboard, safe-area, narration post-monde              |
| **2.5.20** | 2026-06-15 | Timer niveau marathon, enchaînement campagne, contrôles tactiles, UI jeu & équilibrage difficulté       |
| **2.5.19** | 2026-06-15 | Remédiations audits A/B/C/D : sync cloud, haptique, swipe, narration, bundle/CSS                        |
| **2.5.18** | 2026-06-13 | Audits B/D, E2E dist coop/archi/histoire, teaser biomes, refactor ROBO/cutscenes, responsive 48px       |
| **2.5.17** | 2026-06-13 | ROBO arc neon, audits A/C/D, pont scènes cutscene, SW v33, responsive 768, bundle 605 Ko                |
| **2.5.16** | 2026-06-11 | Menu Continuer / Nouvelle partie, remediations G6–G15, mix audio, reset campagne unifie                 |
| **2.5.15** | 2026-06-11 | Découpage CSS modulaire, HUD Trame en run, constellation au clic, liens histoire                        |
| **2.5.14** | 2026-06-11 | Remédiation audits : UX histoire, défi du jour, ESLint 0 warn, E2E contraste, doc OPT                   |
| **2.5.13** | 2026-06-11 | OPT poids : audit CI, pipeline médias, cache SW deux étages, polices woff2                              |
| **2.5.12** | 2026-06-11 | Audit gameplay UX dims 1–10 : Sprint 40L, tutoriel étendu, records locaux, fallback audio               |
| **2.5.11** | 2026-06-11 | Remédiation audit technique 12 dimensions (qualité, perf, sécurité, a11y, versioning)                   |
| **2.5.10** | 2026-06-11 | Memorial Trame, profil VERA synthwave, codex icônes pixel, socle visuel meta                            |
| **2.5.9**  | 2026-06-10 | Expressions cutscene, réactions ROBO/boss, scènes fond PNG, mode narrateur cinématique                  |
| **2.5.8**  | 2026-06-10 | Accessibilité (daltonien, effets réduits), UI mobile histoire, file narrative                           |
| **2.5.7**  | 2026-06-10 | Narration enrichie, dialogues boss, cutscenes narration, UI sans accents                                |
| **2.5.6**  | 2026-06-10 | Audit gameplay, refactor archi, docs simplifiées                                                        |
| **2.5.5**  | 2026-06-10 | Correctifs audit : intro Jour 2 554, cutscenes, dev, objectifs, rendu, E2E                              |
| **2.5.4**  | 2026-06-09 | Carte histoire verticale : visibilité, mondes secrets, découpage modules, tests                         |
| **2.5.3**  | 2026-06-09 | ROBO restauré, modes masqués, carte histoire, CI factorisée, a11y overlays                              |
| **2.5.2**  | 2026-06-08 | Audit v2.5.2 : SW sync, E2E offline/gameplay, focus trap tutoriel                                       |
| **2.5.1**  | 2026-06-07 | Corrections audit : ROBO canvas, portraits cutscene, CSP fonts, versions alignées                       |
| **2.5.0**  | 2026-06-05 | Mode Architecte, coop, bundle prod, rendu découpé, CI renforcée, couverture étendue                     |
| **2.4.2**  | 2026-06-05 | Docs minimalistes + tableau d'évolution, tests, debug `?debug=1`, versions SW alignées                  |
| **2.4.1**  | 2026-06-05 | `moteur.js` découpé en 14 modules, E2E pause/options, ESLint propre                                     |
| **2.4.0**  | 2026-06-05 | CSS externalisé, CSP, Vitest/ESLint/Prettier, CI deploy, modules météo/reliques                         |
| **2.3.0**  | 2026-06-04 | Audio, progression, étoiles par biome, E2E Playwright                                                   |
| **2.2.0**  | 2026-06-04 | `main.js` + `moteur.js`, logique pure, CI, perf particules                                              |
| **2.1.0**  | 2026-06-04 | Sprint, musique, PWA offline, tests logique, accessibilité                                              |
| **2.0.0**  | 2026-06-04 | Jeu complet : 7-bag, SRS, hold, FX, Web Audio                                                           |

---

## [2.5.34] — 2026-06-27

### Remédiation audits B/C/D et pipeline prod

- **Audit B** : E2E gameplay (`e2e/audit-b-gameplay.spec.mjs`) — infobulles, haptique, briefing Distorsion
- **Audit C** : E2E responsive (`e2e/audit-c-responsive.spec.mjs`) — cutscenes &lt;320px, safe-area, paysage archi/pause
- **Audit D** : E2E narratif (`e2e/audit-d-narratif.spec.mjs`) — campagne, post-monde, expressions cutscene
- **VERA** : sprite `img/vera.png`, presets expressions (`expressions-cutscene-presets.js`), rendu portrait refactoré
- **Build** : options esbuild prod partagées, compression CSS, somme bundle prod ; mute UI extrait (`options-mute-ui.js`)
- **Git** : hooks Husky en Node (Windows/Cursor), `npm run release:publish` pour commit + tag + push

### Corrections post-audit (2026-07-13)

- **Gameplay** : buffer 3, coyote 120 ms, courbe Trame, samples SFX boss (`assets/sfx/boss/`), E2E équité/difficulté
- **Architecture** : `tick-rendu-solo.js`, logger → `js/io/logger.js`
- **UI/responsive/narration** : tokens contraste, focus trap tutoriel, E2E D9 découpé, helpers mobile
- SW `dl-shell-v73` ; `verify:versions` lit les marqueurs PRECACHE dans `sw-precache-list.js`

---

## [2.5.33] — 2026-06-23

### Remédiation audits A & D (suite)

- **Audit A** : API test extraite (`neo-test-init.js`) du bundle prod ; double entrée esbuild + `budget-exclus.json` (**557 Ko** / 560 max) ; CI E2E complète sur sources, smoke/perf sur dist
- **Audit D** : E2E post-monde — assertions **scène + texte** pour les 15 mondes ; campagne secrets (miroir/trame/finale) avec narratif ; intro multi-scènes (observatoire → trame → observatoire → fragmentation) ; audio `narratif_cutscene` sur 3 mondes
- **Docs** : budgets alignés à **560 Ko** (`architecture.md`, `optimisation-poids.md`, `CONTRIBUTING.md`)
- SW `dl-shell-v58` ; versions alignées **2.5.33**

---

## [2.5.32] — 2026-06-18

### Compléments audits (hors pistes audio)

- **VERA** : pupilles animées dans `portrait-vera-rendu.js` ; tests sourcils par humeur
- **Audit B** : haptique sur `btn-rafraichir-leaderboard`
- **Audit D** : E2E entrées `monde_cosmos`, `monde_vide`, `monde_trame` ; victoire finale → `fin_vraie`
- **ESLint** : 0 warning (imports/variables inutilisés E2E)
- **Docs** : `mode-histoire.md` — liste complète des specs E2E narration
- SW `dl-shell-v57` ; versions alignées **2.5.32**

---

## [2.5.31] — 2026-06-18

### Remédiation audit D (narration & E2E)

- **E2E post-monde** : `e2e/histoire-post-monde.spec.mjs` couvre les 15 mondes de `CUTSCENES_POST_MONDE`
- **Campagne fin secrète** : conditions Trame via localStorage organique (sans `injecterConditionsTrameDistorsion`)
- **Paradoxe** : E2E après outro fin secrète → monde paradoxe jouable avec cutscene d’entrée
- **Audio narratif** : assertion `obtenirMusiqueActive() === 'narratif_cutscene'` en cutscene post-monde
- **VERA expressif** : parle → humeur `douce`, écoute → `neutre` (comme ROBO) ; halo/particules animés existants
- SW `dl-shell-v56` ; versions alignées **2.5.31**

---

## [2.5.30] — 2026-06-18

### Remédiation audit C (responsivité)

- **Cutscenes &lt; 320 px** : barre contrôles en colonne, portraits compacts, typo plancher
- **Architecte paysage** : safe-area sur `#conteneur-principal-archi`, panneau stats scrollable, typo lisible
- **HUD / post-partie** : timer marathon compact en paysage ; overlays objectifs scrollables
- **Pause & game over** : layout paysage mobile avec safe-area (`var(--safe-*)`)
- **Tests** : `safe-area.test.mjs` étendu ; E2E cutscene 319px, archi 667×375, pause/game over paysage
- SW `dl-shell-v55` ; versions alignées **2.5.30**

---

## [2.5.29] — 2026-06-18

### Remédiation audit B (gameplay & UX)

- **Infobulles modes** : `INFOBULLES_MODES` restauré dans `contenu-jeu.json` (export pipeline corrigé)
- **Haptique** : `btn-mute`, `btn-reecouter`, sélecteur `.bouton-mode`, export/import profil, rafraîchir leaderboard
- **Campagne** : bouton **Briefing Distorsion** dans le panneau détail (boss 4 / finale) + tutoriel rejouable
- SW `dl-shell-v54` ; versions alignées **2.5.29**

---

## [2.5.28] — 2026-06-18

### Remédiation audit A (technique)

- **Bundle** : extraction `histoire-boutons-carte.js` (boot sans `histoire-map-ui`) ; lazy `options-ui` au mute ; **559 Ko** / 560 max
- **Hotspots** : `constellation-evenements.js` extrait ; **0 module > 450 L**
- **ESLint** : `portrait-distorsion-parties.js` — **0 warning**
- **Images** : `compresser-images-ui.mjs` — splash 72→62 Ko, robo 89→77 Ko ; precache **~1310 Ko**
- SW `dl-shell-v53` ; versions alignées **2.5.28**

---

## Versions antérieures

Le détail des releases **2.5.27** et plus anciennes est conservé dans l’historique Git (tags `v2.5.27` … `v2.0.0`). Le tableau « Résumé par version » ci-dessus reste la vue d’ensemble.
