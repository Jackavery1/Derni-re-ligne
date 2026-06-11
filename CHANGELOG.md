# Changelog

Historique des versions de Dernière Ligne. Format [semver](https://semver.org/) : `MAJEUR.MINEUR.PATCH`.

## Résumé par version

| Version    | Date       | En bref                                                                                   |
| ---------- | ---------- | ----------------------------------------------------------------------------------------- |
| **2.5.16** | 2026-06-11 | Menu Continuer / Nouvelle partie, remediations G6–G15, mix audio, reset campagne unifie   |
| **2.5.15** | 2026-06-11 | Découpage CSS modulaire, HUD Trame en run, constellation au clic, liens histoire          |
| **2.5.14** | 2026-06-11 | Remédiation audits : UX histoire, défi du jour, ESLint 0 warn, E2E contraste, doc OPT     |
| **2.5.13** | 2026-06-11 | OPT poids : audit CI, pipeline médias, cache SW deux étages, polices woff2                |
| **2.5.12** | 2026-06-11 | Audit gameplay UX dims 1–10 : Sprint 40L, tutoriel étendu, records locaux, fallback audio |
| **2.5.11** | 2026-06-11 | Remédiation audit technique 12 dimensions (qualité, perf, sécurité, a11y, versioning)     |
| **2.5.10** | 2026-06-11 | Memorial Trame, profil VERA synthwave, codex icônes pixel, socle visuel meta              |
| **2.5.9**  | 2026-06-10 | Expressions cutscene, réactions ROBO/boss, scènes fond PNG, mode narrateur cinématique    |
| **2.5.8**  | 2026-06-10 | Accessibilité (daltonien, effets réduits), UI mobile histoire, file narrative             |
| **2.5.7**  | 2026-06-10 | Narration enrichie, dialogues boss, cutscenes narration, UI sans accents                  |
| **2.5.6**  | 2026-06-10 | Audit gameplay, refactor archi, docs simplifiées                                          |
| **2.5.5**  | 2026-06-10 | Correctifs audit : intro Jour 2 554, cutscenes, dev, objectifs, rendu, E2E                |
| **2.5.4**  | 2026-06-09 | Carte histoire verticale : visibilité, mondes secrets, découpage modules, tests           |
| **2.5.3**  | 2026-06-09 | ROBO restauré, modes masqués, carte histoire, CI factorisée, a11y overlays                |
| **2.5.2**  | 2026-06-08 | Audit v2.5.2 : SW sync, E2E offline/gameplay, focus trap tutoriel                         |
| **2.5.1**  | 2026-06-07 | Corrections audit : ROBO canvas, portraits cutscene, CSP fonts, versions alignées         |
| **2.5.0**  | 2026-06-05 | Mode Architecte, coop, bundle prod, rendu découpé, CI renforcée, couverture étendue       |
| **2.4.2**  | 2026-06-05 | Docs minimalistes + tableau d'évolution, tests, debug `?debug=1`, versions SW alignées    |
| **2.4.1**  | 2026-06-05 | `moteur.js` découpé en 14 modules, E2E pause/options, ESLint propre                       |
| **2.4.0**  | 2026-06-05 | CSS externalisé, CSP, Vitest/ESLint/Prettier, CI deploy, modules météo/reliques           |
| **2.3.0**  | 2026-06-04 | Audio, progression, étoiles par biome, E2E Playwright                                     |
| **2.2.0**  | 2026-06-04 | `main.js` + `moteur.js`, logique pure, CI, perf particules                                |
| **2.1.0**  | 2026-06-04 | Sprint, musique, PWA offline, tests logique, accessibilité                                |
| **2.0.0**  | 2026-06-04 | Jeu complet : 7-bag, SRS, hold, FX, Web Audio                                             |

---

## [2.5.16] — 2026-06-11

### Menu titre — campagne

- **Continuer** / **Nouvelle partie** / **Options** en tête de l'écran titre
- **Nouvelle partie** : reset complet (campagne, intro, tutoriels, codex, achievements, records, modes) avec dialogue de confirmation ; préférences conservées
- Module `reinitialiser-campagne.js` et `supprimerStockageProgression()` (source unique, réutilisé par le mode dev)

### Gameplay / UX (audits G6–G15)

- **G6** : courbes casual adoucies (fuochi, cosmos, vide, boss 4, finale)
- **G7** : boss Avant-Garde en entraînement + tutoriel Distorsion avant la finale
- **G8** : contraste appliqué avant chargement des écrans
- **G9** : typographie secondaire Rajdhani (Press Start 2P réservé au logo)
- **G11** : bandeau HUD Trame enrichi en run
- **G14** : deep-link constellation → carte histoire
- **G15** : filtre Architecte par défaut difficulté 1
- Constellation : clic seul par défaut, panneau `panneau-detail` unifié
- Mix audio par biome (profils + réglages Options)

### Technique

- **579** tests ; mock `localStorage` complet (`length` / `key`) ; E2E smoke 14/14 ; 0 cycle circulaire

---

## [2.5.15] — 2026-06-11

### Architecture CSS

- **`styles/main.css`** : agrégateur `@import` (~20 modules) au lieu d’un fichier monolithique ~5800 lignes
- Script `scripts/decouper-main-css.mjs` pour régénérer le découpage
- Suppression du doublon `objectifs-histoire.css` dans `index.html`

### Gameplay / UX (suite audits)

- **G11** : conditions Trame visibles dans le HUD pendant une run histoire
- **G14** : bouton « MODE HISTOIRE » sur biomes verrouillés (constellation)
- **G15** : tri Architecte par difficulté à l’ouverture
- **Constellation au clic** : option accessibilité (désactive l’ouverture au survol)
- Titres mobile : Rajdhani sous 480px (lisibilité vs Press Start 2P)

---

## [2.5.14] — 2026-06-11

### Remédiation audits (hors contenu média G1–G3)

- **Technique** : ESLint 0 warning, TTF retiré du build prod, test FIFO SW, doc `docs/optimisation-poids.md`, E2E contraste stabilisé
- **Préchargement** : musique `.ogg` + `.m4a` sur la carte histoire ; mode histoire actif sur la carte
- **UX** : tutoriel 6 slides, panneau Trame détaillé, guides mondes secrets, défi du jour local, légende Architecte
- **547** tests unitaires, precache prod ~1665 Ko

## [2.5.13] — 2026-06-11

### Optimisation poids & cache (OPT-1 / OPT-2 / OPT-3)

- **OPT-1** : script `audit:poids`, budgets CI, rapport JSON
- **OPT-2** : pipeline `media:musique` / `media:scenes` / `media:polices` (ffmpeg, sharp), polices woff2 auto-hébergées
- **OPT-3** : cache SW deux étages (`dl-shell` + `dl-medias`), precache généré, FIFO 12 pistes, préchargement carte histoire

## [2.5.12] — 2026-06-11

### Audit gameplay UX (dimensions 1–10)

- **Dims 1–3** : infobulles biome, tutoriels coop/oracle, rebinding, gamepad, DAS mobile, compteurs Trame/Miroir, continue gratuit Distorsion
- **Dims 4–5** : codex Chemins cachés, achievements early, biomes histoire en mode libre, avertissement Trame au game over
- **Dims 6–8** : RAF menu unifiée, pulse pièce daltonien, fallback audio histoire, stinger boss, Miroir cumulatif, continues campagne affichés
- **Dim 9** : tutoriel histoire 4 slides (étoiles, boss, mécaniques), option accents UI
- **Dim 10** : mode Sprint 40L sur l'écran sélection, tableau records locaux (profil), 10 puzzles Architecte procéduraux

## [2.5.11] — 2026-06-11

### Audit technique (12 dimensions)

- **Qualité** : découpage `logique-partie*.js`, factorisation portraits boss, boucle coop unifiée
- **Architecture** : `planificateur-raf.js`, doc mermaid, index modules (`docs/modules-index.md`)
- **Dépendances** : Dependabot groupé, `check:outdated` en CI
- **Tests** : couverture étendue (521 tests), E2E achievements, retry `charger-ecrans`
- **Documentation** : README dev avancé, JSDoc barrels, `docs/accessibilite-wcag.md`, `docs/versioning.md`
- **Erreurs** : retry fetch écrans, bouton « Copier rapport »
- **Performance** : cache gradients plateau, RAF secondaires unifiés
- **Sécurité** : `__NEO_TEST__` conditionnée (`neo-test-api.js`), police offline
- **Maintenance** : `npm run analyze` étendu, E2E memorial
- **Conformité** : tests Axe contraste meta + carte histoire
- **Versioning** : `verify:versions`, release automatisée SW

### Qualité

- **522** tests unitaires, smoke E2E dist, budget bundle 560 Ko
- Cache SW `derniere-ligne-2.5.11-r10`

---

## [2.5.10] — 2026-06-11

### Ajouts

- **Memorial** : refonte Hall of Fame en Memorial de la Trame
- **Profil** : rapport VERA, layout 2 colonnes, palette synthwave
- **Codex** : icônes pixel, couleurs chapitre, typographie agrandie
- **UI meta** : socle visuel commun Codex / Profil / Memorial

---

## [2.5.9] — 2026-06-10

### Cutscenes & narration

- Moteur d'expressions portraits (`humeur` optionnel, transitions 400 ms)
- Annotation éditoriale `humeur` sur les dialogues cutscene
- Scènes de fond image (`scenes-cutscene.js`) + fallback canvas offline
- Mode narrateur cinématique : letterbox, portraits masqués, texte centré Rajdhani
- Champ `scene` cutscene/ligne (démo `INTRO_HISTOIRE` → observatoire)

### Gameplay visuel

- Réactions mascotte ROBO : priorité, cooldown, pile 75 %, inactivité 20 s
- Portraits boss synchronisés aux dialogues combat (calme/agressif/vacillant)

### Qualité

- **490** tests unitaires, `check:circular` vert
- Cache SW `derniere-ligne-2.5.9-r5`, scan `assets/cutscenes/`

## [2.5.8] — 2026-06-10

### Accessibilité

- Mode daltonien : motifs I/O/T/S/Z/J/L sur cellules actives et previews (tous modes)
- Réduire les effets : classe `effets-reduits`, particules/FX atténués, Surtension allégée
- Volumes musique et SFX séparés (options), persistance `accessibilite` dans le stockage

### UX mobile (mode Histoire)

- Panneau objectifs, récap étoiles, overlay boss et dialogues : safe-area, scroll, cibles tactiles ≥48px
- Label attaque boss : deux lignes max + défilement si débordement
- E2E : panneau objectifs prologue 390×844 sans débordement horizontal

### Qualité

- `file-narrative.js`, scripts build/E2E (`run-e2e-dist`, `verifier-sync-textes`)
- Tests : `accessibilite`, `file-narrative`, `build-prod`, `maintainabilite` ; **477+** tests unitaires
- Cache SW synchronisé (193 fichiers)

## [2.5.7] — 2026-06-10

### Mode Histoire & narration

- Dialogues de combat boss extraits (`boss-dialogues.js`) : phases, réactions Tetris, quasi-vaincu
- Contenu narratif enrichi : interludes gardiens/veille, transmissions VERA, épilogues réécrits
- Cutscenes : mode narration distinct du dialogue, zone injectée si HTML obsolète, fin robuste
- Journaux multi-voix (`JOURNAUX_VERA_DIALOGUES`) pour le journal 6

### UX

- `sansAccentsE()` (`texte-jeu.js`) : libellés UI sans accents (carte, codex, tutoriel, achievements)
- Carte histoire : rendu et panneau latéral affinés, CSS cutscene narration/dialogue

### Qualité

- Cycle `ecrans-ui ↔ coop-logique` rompu (import direct `mascotte-robo.js`)
- Tests : `boss-dialogues`, `texte-jeu`, `distorsion-entree` ; **459** tests unitaires
- Cache SW synchronisé (187 fichiers)

## [2.5.6] — 2026-06-10

- Rouille mécanique, T-Spin solo/coop, fin de partie partagée (`partie-fin-commun.js`)
- Coop : combo, soft drop, chronomètre, pause temps
- Refactor : `score-partie.js`, découpage cutscenes/portraits, `mode-histoire.js`
- HUD Éclipse/Surtension, typecheck, CSP `worker-src`
- Documentation simplifiée

## [2.5.5] — 2026-06-10

### Mode Histoire

- Intro « Jour 2 554 » : point d'entrée unique `ouvrirModeHistoireDepuisMenu()`, écran cutscene activé avant la première ligne, logs `[intro]` (`?debug`), flag non écrit en cas d'échec
- Cutscenes : affichage synchrone de l'écran, navigation statique (plus de race async), accumulation de texte corrigée
- Outros post-épilogue : chaîne épilogue → outro → écran de fin confirmée et testée
- Panneau objectifs : overlays sur `document.body`, CSS toujours chargé, skip en rejouer
- `demarrerSuiviMonde` importé pour REJOUER après game over

### UX & rendu

- Ligne centrale parasite du canvas supprimée (grille + bordure bicolore Miroir)
- Panneau ROBO : libellé et couleurs fixes, indépendants du biome

### Mode développeur

- Activation : `?dev=1`, Ctrl+Shift+D, 5 clics logo ; poignée DEV visible
- Skip tutoriels ne marque plus l'intro histoire comme vue

### Qualité

- Dépendance circulaire `hud-jeu ↔ ui-panneau-objectifs` résolue
- ESLint / TypeScript / madge : OK
- Tests unitaires : 397 ; E2E : notifications boot silencieuses en tests (`__NEO_SILENT_NOTIFS__`)
- Icônes PWA déplacées dans `img/`

## [2.5.4] — 2026-06-09

- Carte histoire : layout vertical scrollable avec caméra zoomée (1.6×) et focus automatique
- Visibilité progressive restaurée (`mondesVisibles`, `mondesFantomes`, brouillard futur)
- Mondes secrets repositionnés (`monde_miroir`, `monde_trame`, `monde_paradoxe`)
- Découpage rendu : `histoire-map-fond.js`, `histoire-map-noeuds.js`, `histoire-map-camera.js`
- Indicateur de scroll vertical sur la carte
- Tests unitaires caméra + E2E scroll molette

## [2.5.3] — 2026-06-09

- ROBO : design pixel art d'origine restauré, palette fixe indépendante du biome en jeu
- Modes verrouillés à nouveau masqués sur l'écran titre (progression par déblocage)
- Carte histoire : refonte visuelle canvas (nébuleuse, chapitres, chemins bézier, terrain, visibilité progressive)
- Constellation : rendu extrait dans `constellation-rendu.js`
- Overlays : `role="status"` et `aria-live` sur notifications (achievement, codex, météo…)
- CI : workflow réutilisable `quality.yml`, artefact couverture, deploy sans double build
- Husky pre-push aligné (format, circular, build, budget bundle)
- Tests E2E a11y étendus (codex, options) ; snapshot visuel écran sélection
- README et versions alignées ; documentation `E2E_DIST` dans CONTRIBUTING

## [2.5.2] — 2026-06-08

- Cache PWA resynchronisé automatiquement (152 fichiers, nouveaux modules histoire/partie)
- Focus trap clavier sur les modales tutoriel
- Tests E2E : offline après precache, hold, game over
- Tests unitaires `boucle-jeu` ; export JSON données (`exporter-donnees-json.mjs`)
- Découpage partie (`partie-canvas.js`, `partie-fin.js`), session histoire (`histoire-session.js`, `histoire-mondes.js`)
- CI deploy/preview : `check:circular`, export données, smoke post-déploiement

## [2.5.1] — 2026-06-07

- Mascotte ROBO en canvas 2D (`rendu-robo.js`) avec 5 expressions animées
- Portraits cutscene extraits (`portraits-cutscene.js`) pour tous les personnages histoire
- Alignement versions package / HTML / SW ; cache PWA inclut `img/` dynamiquement
- CSP durcie : polices self-hosted uniquement (suppression Google Fonts)
- Logger renommé `[DerniereLigne]` ; try/catch sur boucles RAF canvas
- Helper `retournerAuMenuTitre()` ; hook Conventional Commits (commit-msg)
- Tests : `rendu-robo`, cohérence portraits histoire ; couverture Vitest étendue

## [2.5.0] — 2026-06-05

- **Mode Architecte** : 17 niveaux puzzles, boucle dédiée (`archi-jeu.js`, `archi-logique.js`, `archi-rendu.js`)
- **Mode Coop** : deux joueurs, plateau partagé (`coop-jeu.js`, `coop-logique.js`)
- Bundle production esbuild (`npm run build`, `npm run analyze`, budget taille CI)
- Découpage rendu canvas (`rendu-plateau.js`, `rendu-fx.js`, etc.)
- Tests `logique-partie` (rotation, hold), E2E architecte + Axe sur sélection/options
- Typecheck étendu à `archi-logique.js` ; tests unitaires rotation/hold
- Annonces a11y rotation/hold ; bannière utilisateur en cas d'erreur rendu
- CI : preview.yml corrigé (bundle prod), audit npm moderate, Playwright épinglé
- Docs README/architecture mises à jour ; semver 2.5.0 alignée (SW, HTML)

## [2.4.2] — 2026-06-05

- Documentation épurée (README, CONTRIBUTING, CHANGELOG avec tableau d'évolution)
- Tests `piece-jeu` (lock delay, collision) et progression localStorage
- E2E bannière erreur ; mode debug `?debug=1`
- `ECRANS` unifié dans `ecrans-config.js` ; suppression code mort `Registre`
- Versions alignées : SW `derniere-ligne-{semver}`, cache-bust HTML
- CI : lint, format:check, npm audit

## [2.4.1] — 2026-06-05

- Découpage `moteur.js` → modules dédiés (`piece-jeu`, `rendu-jeu`, `partie`, `logique-partie`, etc.)
- Orchestrateur centralisé dans `moteur.js` ; injection via `actions-jeu.js` et `bus-jeu.js`
- E2E pause/quitter et onglet contrôles ; mock localStorage Vitest
- Deploy avec gate tests + E2E

## [2.4.0] — 2026-06-05

- Extraction `meteo.js`, `reliques.js`, `logger.js` ; CSS → `styles/main.css`
- Vitest (170 tests), ESLint, Prettier, couverture logique/progression
- CSP stricte, bannière erreur, validation localStorage
- GitHub Pages (`deploy.yml`), script `npm run release`

## [2.3.0] — 2026-06-04

- `audio.js` (Web Audio par biome), `progression.js` (records, déblocage, étoiles)
- Thème mascotte par biome ; tests audio/progression ; E2E smoke

## [2.2.0] — 2026-06-04

- Entrée `main.js`, moteur `moteur.js` ; `logique-pure.js` (7-bag, SRS)
- CI GitHub Actions ; boucle RAF unique ; cache plateau offscreen

## [2.1.0] — 2026-06-04

- Mode Sprint, musique procédurale, police locale, contraste élevé
- PWA maskable, tests Vitest logique, boutons sans `onclick` inline

## [2.0.0] — 2026-06-04

- Hold, ghost, NEXT×3, DAS/ARR, lock delay
- 9 biomes, reliques, météo, FX canvas, options, PWA
