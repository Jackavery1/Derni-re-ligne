# Contribuer

Ce dépôt est **privé et non open source**. Le code source n'est pas ouvert aux contributions externes pour le moment.

## Licence

Le Logiciel est protégé par copyright (voir [LICENSE](LICENSE)). **Projet privé, non open source** : pas de contribution externe, pas de redistribution du code sans autorisation écrite. Jouer à la version officielle reste autorisé à titre personnel.

## Développement interne

Réservé au titulaire des droits et aux collaborateurs explicitement autorisés.

```bash
npm install
npm start
npm test
npm run lint
npm run format:check
npm run typecheck
npm run verify:versions
npm run prepare:e2e
npm run test:e2e:audit
npm run test:e2e:responsive
npm run test:e2e
```

Node 18+ (`.nvmrc`). Logs verbeux : `?debug=1`. Formatage : `.prettierrc` (Prettier via `npm run format` / `format:check`).

### Tests E2E sur le bundle prod

La CI exécute **smoke** sur le bundle prod (`test:e2e:smoke:dist`), puis **responsive multi-viewport** (`test:e2e:responsive:dist` sur `dist/` inclut `audit-c-responsive` + `histoire-responsive`, `test:e2e:responsive` sur les sources), **perf** (`test:e2e:perf` via `E2E_DIST=1` — `run-e2e-dist.mjs` injecte `neo-test-init.js` dans `dist/index.html`), **Lighthouse** desktop + mobile (`lighthouserc.cjs`, `lighthouserc-mobile.cjs`, **bloquant** en CI). La suite E2E complète (`npm run test:e2e`) sert les **modules ES sources** avec la matrice Playwright : `desktop`, `mobile-portrait`, `mobile-landscape`, `iphone-14`, `tablet-landscape` (1024×768) (+ projets visuels mobile). Audits gameplay/narratif : `npm run test:e2e:audit`. Local : `npm run audit:lighthouse` / `audit:lighthouse:mobile` après build.

### Campagne complète D9 (narratif, ~60 min)

Parcours fin secrète **avec narratif post-victoire** (sans `sansNarratif`) :

```bash
npm run test:e2e:d9
```

Timeout spec D9 : **3 tests sérialisés** (300 s + 300 s + 360 s max) — mondes 1–8, 9–16, secrets/fin. D9b : variante complète avec narratif, taguée `@slow` → **exclue** de `test:e2e:audit` (`--grep-invert @slow`) ; tourne en nightly / `npm run test:e2e:d9b`. Helpers : `e2e/helpers-campagne-narratif.mjs`, `e2e/helpers-narratif-mobile.mjs`. **CI nightly :** workflow `e2e-d9-nightly.yml` (dimanche 03:00 UTC, `workflow_dispatch` manuel).

**Commit manuel :** `npm run commit -- "type(scope): sujet"` (Conventional Commits obligatoire via hook `commit-msg`). **Push :** le hook `pre-push` exécute lint, format, typecheck, cycles, données et tests unitaires (~1–2 min).

### Helpers E2E (`e2e/`)

| Fichier                            | Rôle                                                              |
| ---------------------------------- | ----------------------------------------------------------------- |
| `helpers.mjs`                      | Barrel — réexporte tout (importer depuis ici dans les specs)      |
| `helpers-page.mjs`                 | Prep page, attente `data-neo-test-ready`                          |
| `helpers-partie.mjs`               | Solo : pause, démarrage, fin de partie                            |
| `helpers-coop.mjs`                 | Coop 2 joueurs                                                    |
| `helpers-histoire.mjs`             | Carte histoire, cutscenes, recap                                  |
| `helpers-campagne-narratif.mjs`    | Parcours campagne avec narratif (D9, D9b)                         |
| `helpers-narratif-mobile.mjs`      | Métriques boss HUD / mobile narratif (audit D8)                   |
| `helpers-campagne-flux.mjs`        | Flux campagne réutilisable (enchaînement, D15)                    |
| `helpers-responsive-metriques.mjs` | Assertions débordement, encoches simulées, boutons tactiles ≥48px |
| `helpers-archi.mjs`                | Mode architecte (ouverture premier niveau)                        |
| `helpers-audit-b.mjs`              | Infobulles modes, sélection constellation, vibrations audit B     |
| `helpers-iphone-safe-area.mjs`     | Profils encoche iPhone simulés (audit C14)                        |
| `helpers-narratif*.mjs`            | Flux cutscene, fragments VERA, overlays                           |

### Piège Live Server / file://

Le jeu charge des modules ES (`import` depuis `js/`). **Live Server** et l’ouverture directe de `index.html` ne servent pas correctement les modules → écran « Chargement… » infini. Utiliser **`npm start`** (`serve` sur `127.0.0.1:3000`). Pour le bundle prod : `npm run build` puis `npx serve dist`. Voir le watchdog dans `js/ui/chargement-watchdog.js`. En dev, le SW est désactivé sur localhost sauf **`?pwa=1`** (`js/io/sw-dev.js`).

Les E2E Playwright démarrent aussi un `serve` sur le port **3000** (`reuseExistingServer` hors CI). Si un autre processus occupe déjà ce port (autre `serve`, preview staging, etc.), les tests échouent sur `data-neo-test-ready` absent : libérer le port avant de relancer (`Get-NetTCPConnection -LocalPort 3000` puis tuer le PID, ou `npx kill-port 3000`).

### Couverture Vitest (modules ciblés)

`npm run test:coverage` mesure une **liste blanche logique domaine** (`COVERAGE_LOGIC` dans `vitest.config.mjs`, ~30 modules) — pas l’intégralité des ~350 fichiers JS. Rendu canvas, navigation écrans, bus d’événements lourd et préchargement médias sont exclus (couverts par tests dédiés + E2E) ; voir `tests/coverage-perimetre.test.mjs`. Seuils CI : **80 %** sur lines, functions, statements et branches. Les modules **export-only** (`js/codex-histoire.js`) sont exclus du precache SW dev mais restent versionnés pour `npm run sync:data`.

### Viewport, zoom et tactile en partie

Le comportement zoom/scroll est documenté dans [docs/design-tokens.md](docs/design-tokens.md) (section **Zoom et gestures tactiles**) : pas de `user-scalable=no` (accessibilité), `touch-action: manipulation` sur `html/body`, `touch-action: none` limité au plateau (`#zone-jeu`, `#canvas-plateau`) en partie. Hauteurs viewport : préférer `100dvh` (test `tests/css-viewport.test.mjs`). E2E : `audit C15` dans `e2e/audit-c-responsive.spec.mjs`.

En `partie-active`, le paysage étroit (`max-height: 768px` + `max-width: 900px`) active `#controles-paysage` — **aucun overlay d’orientation bloquant** (choix assumé, testé e2e C2/C11).

### Checklist manuelle iPhone (encoches réelles)

**Automatisé :** `npm run verify:iphone-checklist` (8 points simulés — voir [docs/checklist-iphone-release.md](docs/checklist-iphone-release.md)).

Les specs `audit-c-responsive` et `e2e/checklist-iphone.spec.mjs` simulent les encoches iPhone via `e2e/helpers-iphone-safe-area.mjs` (profils 14, 15 Pro, SE, paysage — audit C14). Avant une release mobile, valider sur **iPhone physique** en PWA standalone :

1. Pause solo paysage — bouton Reprendre sous l’encoche, zone tactile ≥ 48 px
2. Pause coop paysage — bouton Reprendre sous l’encoche, pause HUD mobile ≥ 48 px
3. Game over solo et coop paysage — boutons visibles sans scroll horizontal
4. Carte histoire — en-tête et retour accessibles (safe-area)
5. Journal histoire — scrollable, fermer ≥ 48 px
6. Cutscene portrait 319 px de large — portraits et boutons Suivant/Passer visibles
7. Architecte portrait et paysage — contrôles utilisables au doigt (pas d’overlay bloquant)

Annoter les écarts dans une issue ; ne pas supprimer la simulation CSS tant que le test physique n’est pas couvert.

### Environnements de déploiement

| Environnement         | Déclencheur                | Usage                                       |
| --------------------- | -------------------------- | ------------------------------------------- |
| **Production**        | Push sur `main` / tag `v*` | GitHub Pages (artefact `dist/` via Actions) |
| **Preview (staging)** | Pull request               | Artefact `dist/` 7 jours (`preview.yml`)    |
| **Release**           | Tag `v*`                   | GitHub Release + notes (`release.yml`)      |

La preview PR sert de **staging** : même pipeline `quality.yml` que la prod, sans publier sur Pages.

### GitHub Pages — bundle prod (production)

La prod sert le **bundle esbuild** (`dist/js/bundle.js` + SRI). Chaque push sur `main` déclenche `deploy.yml` : `quality.yml` puis publication de `dist/` sur Pages.

**Réglage requis (une fois) :** **Settings → Pages → Build and deployment → Source** = **GitHub Actions** (pas « Deploy from a branch »).

Le workflow vérifie ensuite l’URL publique (`bundle.js` 200, SRI `sha384`, SW `dl-shell-v`).

Vérification rapide :

```bash
curl -s https://jackavery1.github.io/Derni-re-ligne/index.html | grep -o 'src="js/[^"]*\.js[^"]*"'
curl -sI https://jackavery1.github.io/Derni-re-ligne/js/bundle.js | head -1
```

Attendu : `src="js/bundle.js"`, `HTTP/1.1 200` sur `bundle.js`.

### Hooks Git (Husky)

| Hook           | Contenu                                                                  |
| -------------- | ------------------------------------------------------------------------ |
| **pre-commit** | lint-staged (ESLint + Prettier sur fichiers stagés)                      |
| **pre-push**   | lint, format, typecheck, cycles, verify:data, tests unitaires (~1–2 min) |
| **commit-msg** | Conventional Commits (script Node, compatible Windows/Cursor)            |

Le pre-push local est **rapide** (~1–2 min) : build, budget bundle, smoke E2E dist et audits complets tournent sur **GitHub Actions** (`quality.yml`). Options locales : `$env:PRE_PUSH_BUILD='1'; git push` (build + smoke dist, ~2–3 min) ; `$env:PRE_PUSH_FULL='1'; git push` (suite E2E complète, ~20–30 min). Rejouer les mêmes étapes sans push : `npm run verify:pre-push`. Contournement d'urgence : `$env:SKIP_PREPUSH='1'; git push` — la CI validera quand même.

### Git sous Windows / Cursor

| Problème                       | Cause                                                  | Solution                                                                                                                              |
| ------------------------------ | ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------- |
| **Commit refusé / silencieux** | Message hors Conventional Commits (`feat:`, `fix:`, …) | `npm run commit -- "feat(scope): sujet"` ou `git commit -m "feat(scope): sujet" -m "Corps"` — **pas de HEREDOC bash** sous PowerShell |
| **Push refusé (format)**       | CRLF Windows ou fichiers hors Prettier                 | `npm run format` puis commit ; le dépôt force LF via `.gitattributes`                                                                 |
| **Push refusé (typecheck)**    | Erreur JSDoc / `tsc` sur un fichier du repo            | `npm run typecheck` et corriger les unions `@param`                                                                                   |
| **Push lent**                  | Hook pre-push ~1–2 min                                 | Normal ; build/smoke en CI                                                                                                            |
| **Diagnostic rapide**          | —                                                      | `npm run doctor:git`                                                                                                                  |
| **Rejouer le hook sans push**  | —                                                      | `npm run verify:pre-push`                                                                                                             |
| **Release complète**           | —                                                      | `npm run release:publish`                                                                                                             |
| **Contournement d'urgence**    | —                                                      | `$env:SKIP_PREPUSH='1'; git push` (PowerShell) — la CI valide quand même                                                              |

Exemples PowerShell :

```powershell
git add -A
npm run commit -- "refactor(vivant): extraire comportements" "Decoupe sans changement de comportement."
npm run verify:pre-push
git push
```

### Analyse et maintenance

- `npm run analyze` — top 15 taille bundle + régénère `docs/modules-index.md` (hotspots uniquement)
- `npm run measure` (alias `audit:poids`) — budgets JS/CSS/polices + rapport `rapport-poids.json`
- `npm run check:circular` — dépendances circulaires depuis `js/main.js`
- **Budget bundle** : plafond **588 Ko** JS minifié precache (`scripts/verifier-bundle.mjs`, CI `quality.yml`). Cible confort **560 Ko**. Vérifier après chaque ajout JS : `npm run build && node scripts/verifier-bundle.mjs`. Les `import()` dynamiques **déplacent** du code en chunks async mais **n'allègent pas** le total precache sous esbuild — privilégier la suppression de code ou l'évitement de dépendances lourdes. Marge typique ~3 Ko : éviter les splits async sans gain net mesuré. Voir `docs/optimisation-poids.md`.

### Textes narratifs (`js/histoire-textes/`)

Les cutscenes et dialogues sont découpés par domaine (`cutscenes-post-monde-*.js`, `cutscenes-entree-*.js`, etc.). Le barrel `js/histoire-textes.js` réexporte l’API publique ; la prod charge `data/histoire-textes.json` (généré par `npm run sync:data`). Après modification des sources JS : `npm run sync:data` puis `npm run verify:data`.

**Scènes cutscene — eager vs lazy (offline)**

| Type                              | Comportement SW                                             | Hors-ligne 1re visite                                           |
| --------------------------------- | ----------------------------------------------------------- | --------------------------------------------------------------- |
| **Eager** (4 PNG prologue)        | Install SW (`sw.js`)                                        | Affichage immédiat                                              |
| **Lazy** (14 PNG fins/interludes) | Precache idle post-install (`PRECACHE_SCENES_ARRIERE_PLAN`) | Fond canvas + fetch runtime ; peut être vide si jamais precaché |

Compromis assumé : boot léger (install minimal) vs couverture offline totale des fins rares. Les scènes `lazy: true` dans `js/rendu/scenes-cutscene.js` restent jouables en ligne ; offline complet après une session ou le precache idle. Ne pas repasser toutes les scènes en eager sans mesurer le budget SW.

Scripts one-shot de migration : déjà appliqués ; l’historique reste dans Git (anciens chemins `scripts/archive/`). Pour la doc modules : `npm run analyze`.

## Commits (usage interne)

Format [Conventional Commits](https://www.conventionalcommits.org/) :

- `feat(codex): …`
- `fix(audio): …`
- `test(progression): …`
- `docs(readme): …`
- `refactor(config): …`

Release : `npm run release` puis tag `vX.Y.Z`.

Rollback déploiement : revert du commit sur `main`, push, le workflow `deploy.yml` republie la version précédente.

Politique branches : `main` (stable, déployée), branches `feat/*` / `fix/*` pour le développement.

## Dépendances

**Zéro dépendance runtime** — ne pas ajouter de package npm en production sans justification écrite.

Index documentation détaillée : voir [README.md](README.md#docs).
