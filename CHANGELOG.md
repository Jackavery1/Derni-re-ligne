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

## [2.5.27] — 2026-06-17

### UX partie

- **Notifications** (achievements, niveau, codex, oracle, météo, vivant, infobulles reliques) ancrées hors du canvas : au-dessus en portrait, sur le côté en paysage/desktop ; textes agrandis en partie
- Nouveau positionnement notifications dans `layout-jeu.js` et feuille `notifs-jeu.css`

### Sélection & modes

- Affichage **Sans fin** / **Sprint** (IDs internes inchangés)
- Barre modes mobile pleine largeur ; rafraîchissement déblocages Oracle/Coop
- **Constellation mobile** : liste déroulante mondes, pan tactile, parallax renforcé
- Infobulles première fois pour Sans fin, Sprint, Oracle, Coop, Défi du jour

### Technique

- SW `dl-shell-v52` ; plafond bundle releve a 560 Ko (558 Ko mesure)

---

## [2.5.25] — 2026-06-17

### Mobile & accueil

- **Nouvelle partie** : attente du wiring async des boutons (`attendreBoutonsPretes`), `pointerup` tactile, `touch-action: manipulation`
- **Liseré vert** : `#notif-niveau` masqué hors `.visible` ; fond opaque écran titre ; canvas menu calé sur `#ecran-titre`
- E2E smoke mobile/tablette « nouvelle partie »

### Technique

- **Precache** : `data/histoire-textes.json` inclus dans le shell SW (offline narration)
- **Cutscene** : extraction `histoire-cutscene-moteur.js` (entrée, DOM, lignes) ; orchestrateur 324 lignes
- **Boot** : cutscenes retirées du barrel `histoire-manager.js` ; `demarrerBoucleRobo` uniquement au démarrage partie
- Suppression `menu-robo-titre.js` (ROBO menu en image depuis v2.5.24)
- Bundle prod **554 Ko** (−1 Ko vs 2.5.24) ; SW `dl-shell-v51`

---

## [2.5.24] — 2026-06-17

### Données externalisées (JSON)

- **Biomes, contenu jeu, difficulté mondes, histoire, achievements** : chargement asynchrone via `data/*.json` au démarrage
- Suppression des gros modules JS inline (`biomes-histoire.js`, `difficulte-mondes.js`, fragments `histoire-donnees/*`)
- Pipeline export : `scripts/sources-*-export.mjs` + `exporter-donnees-json.mjs`

### Portraits & UI

- **VERA** : split `portrait-vera-donnees`, `portrait-vera-buste`, `portrait-vera-effets`, `portrait-distorsion-rendu`
- **Boss combat** : module `portraits-boss-combat.js`
- **Menu titre** : ROBO en image (`robo-accueil.png`) au lieu du canvas

### Technique

- Écran de chargement avec progression multi-étapes (`main.js`)
- SW `dl-shell-v50` ; precache JSON + modules portraits ; tests et E2E campagne/narratif étendus

---

## [2.5.23] — 2026-06-16

### Correctifs boutons (lazy-load v2.5.22)

- **`ui-lier-bouton.js`** : wiring idempotent `data-neo-btn-lie` — handlers re-attaches apres injection de fragments
- **`ui-boutons-assurer.js`** : ecouteur `neo:fragments-injectes` (codex, profil, achievements, coop, archi, histoire)
- Retours meta, pause/coop/archi, campagne game over (`btn-histoire-carte`, `btn-continue-boss`) fonctionnels
- Fix filtre difficulte architecte si fragment pas encore charge
- E2E `boutons-meta.spec.mjs` (codex, profil, architecte)

### Remédiations audit (hors audio)

- Haptique navigation meta (`vibrerUi`)
- Export / import records depuis l'ecran profil
- Tutoriel Distorsion des `monde_boss_4` (Avant-Garde)
- CSS paysage : game over empile, cutscenes safe-area &lt;360px, panneau archi scrollable

### Technique

- SW `dl-shell-v49` ; navigation boutons via `navigation-lazy` (0 cycle)

---

## [2.5.22] — 2026-06-16

### Audits A / B / C / D — remédiations

- **A** : lazy-load coop/archi/codex/navigation ; entrée bundle **27 Ko** (−40 %) ; precache **1024 Ko** (−47 %) ; icônes PWA compressées ; JSON archi/codex externalisés ; scripts legacy archivés
- **B** : filtres leaderboard mode/biome ; préférence enchaînement campagne ; bouton **CARTE** game over ; indicateur transition post-victoire
- **C** : E2E `histoire-responsive` (encoche, paysage) ; safe-area overlays étendue
- **D** : suppression `vera-base.png` (1 Mo) ; portrait VERA canvas ; E2E campagne prologue → lave ; textes codex externalisés

### Technique

- Split `profil-jeu` → `profil-donnees` + `profil-affichage` ; `ui-objectifs-dom/hud` ; `decorations-trainees`
- SW `dl-shell-v48` ; **682** tests unitaires ; **119** scénarios E2E

---

## [2.5.21] — 2026-06-16

### Audits A / B / C / D — remédiations

- **A** : 0 hotspot >450 L (splits boss, coop, rendu-blocs, codex, particules, options) ; script `split-audit-hotspots.mjs`
- **B** : leaderboard global Supabase opt-in, haptique tactile touchstart, exclusion `robo-accueil.png`, E2E timer marathon
- **C** : safe-area iPhone (`--safe-*`, `safe-area.js`, layout-jeu), E2E encoche simulée, doublons padding supprimés
- **D** : cutscenes post-monde `{ scene, lignes }`, fragments VERA secrets, fix interludes, E2E histoire (6 scénarios)

### Gameplay & UI

- Modale TRAME non bloquante sur la carte ; fermeture overlays avant lancement partie
- HUD objectifs + bandeau Trame masqués pendant la partie histoire
- Favicon / icônes PWA depuis `assets/splash-chargement.png`

### Technique

- SW `dl-shell-v47` ; **676** tests unitaires ; E2E histoire-narratif + prologue-trame-modal

---

## [2.5.20] — 2026-06-15

### Gameplay & campagne

- **Enchaînement narratif** : après victoire, la campagne continue automatiquement vers le monde suivant (plus de retour carte via « CONTINUER »)
- **Timer niveau marathon** : décompte HUD par niveau (alerte 30 s), lignes/niveau 15, courbes vitesse adoucies
- **Équilibrage mondes** : objectifs lignes et paliers vitesse augmentés (`difficulte-mondes.js`)

### UI jeu

- **ROBO** : fond opaque isolé du biome ; previews HOLD/NEXT redimensionnées
- **Contrôles tactiles** : HOLD à gauche, ▶ à droite ; option désactivable (off par défaut desktop)
- **Overlays** : infobulles reliques/événements en toast bas-gauche, auto-fermeture 12 s

### Technique

- Nouveaux modules `timer-niveau.js`, `controles-tactiles.js` ; tests unitaires et E2E étendus
- Scènes cutscene recompressées ; SW `dl-shell-v46`

---

## [2.5.19] — 2026-06-15

### Audits A / B / C / D — remédiations

- **A** : bundle 571 Ko, CSS lazy cutscenes, splits modules, typecheck/ESLint OK
- **B** : sync cloud Supabase opt-in + E2E, export/import records, haptique, ROBO canvas titre
- **C** : `100dvh`, swipe mobile + E2E, `visualViewport`, codex mobile 2 colonnes
- **D** : scènes cutscene entrée, audio `narratif_cutscene`, cohérence textes, fragments VERA

---

## [2.5.18] — 2026-06-13

### Audits B & D — remédiations

- **B1** : teaser nom + description sur biomes verrouillés (constellation, `afficherTeaserVerrouille`)
- **B3/B4** : ROBO visible uniquement en partie ; boucles menu/constellation stoppées à la navigation
- **B5** : `terminerPartie({ immediat: true })` pour game over E2E stable
- **D** : fragments journaux prologue/rouille, mapping post-monde, rampe narrative documentée
- Infobulles Oracle/Coop silencieuses en tests (`__NEO_SILENT_NOTIFS__`)

### E2E dist — coop, architecte, histoire

- Coop : fermeture infobulle + clic forcé sur `#toggle-coop`
- Architecte : masquage `#controles-mobile` / `#controles-paysage` solo en `archi-active`
- Histoire : attente du select clavier après chargement async de la carte
- Nouveaux scénarios : gameplay, smoke mobile, perf sprint, a11y cutscene, visual tablette

### Refactor & responsive

- `rendu-robo.js` découpé (corps, visage, géométrie, mini) ; cutscenes histoire modulaires
- Cibles tactiles 48 px (sélection, objectifs, pause/GO) ; panneau mobile scrollable
- Profil : `role="cell"` sur lignes records (Axe)

### Technique

- SW `dl-shell-v37` ; tests unitaires étendus ; E2E dist 33/33 (coop 6, archi 10, histoire 17)

---

## [2.5.17] — 2026-06-13

### ROBO — canon bouche arc neon

- Grille de dents supprimée ; bouche en arc neon (neutre), sourire ouvert (content/excite), arc inversé (triste), trait horizontal (alerte)
- Pupilles recentrées (~48 % sclère) pour éviter le regard vide
- Canon mis à jour dans `docs/canon-personnages.md` ; tests `rendu-robo.test.mjs`

### Narration / histoire (audit D)

- Pont metadata scènes : cutscenes passent les lignes brutes avec `scene:` / `humeur:` jusqu'au moteur
- Annotations SCENES-1 complétées (intro fragmentation, trame monde, avantgarde_voix)
- Fragments VERA par monde ; accent « être raconté » cutscene entrée
- Tests `histoire-narratif-cutscene.test.mjs`, `scenes-cutscene.test.mjs`

### Responsive (audit C)

- Mode Architecte tactile (`#controles-archi`), seuils paysage 768 px, safe-area viewport-fit
- Breakpoints harmonisés (constellation, sélection, panneaux)
- Cibles tactiles coop / panneau / `.bouton-mode`

### Technique (audit A)

- CSP `frame-ancestors 'none'` ; SW `dl-shell-v33` + precache scènes `dl-medias-v2`
- Plafond bundle CI 605 Ko ; docs architecture / optimisation alignées

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
