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

La CI exécute **smoke** sur le bundle prod (`test:e2e:smoke:dist`), puis **responsive multi-viewport** (`test:e2e:responsive:dist` sur `dist/`, `test:e2e:responsive` sur les sources), **perf** (`test:e2e:perf` via `E2E_DIST=1` — `run-e2e-dist.mjs` injecte `neo-test-init.js` dans `dist/index.html`), **Lighthouse** desktop + mobile (`lighthouserc.cjs`, `lighthouserc-mobile.cjs`, warn non bloquant). La suite E2E complète (`npm run test:e2e`) sert les **modules ES sources** avec la matrice Playwright : `desktop`, `mobile-portrait`, `mobile-landscape`, `iphone-14` (+ projets visuels mobile). Audits gameplay/narratif : `npm run test:e2e:audit`. Local : `npm run audit:lighthouse` / `audit:lighthouse:mobile` après build.

### Campagne complète D9 (narratif, ~10 min)

Parcours fin secrète **avec narratif post-victoire** (sans `sansNarratif`) :

```bash
npm run test:e2e:d9
```

Timeout spec : 600 s. Helpers : `e2e/helpers-campagne-narratif.mjs`. **CI :** workflow `e2e-d9-nightly.yml` (dimanche 03:00 UTC, `workflow_dispatch` manuel).

### Helpers E2E (`e2e/`)

| Fichier                         | Rôle                                                         |
| ------------------------------- | ------------------------------------------------------------ |
| `helpers.mjs`                   | Barrel — réexporte tout (importer depuis ici dans les specs) |
| `helpers-page.mjs`              | Prep page, attente `data-neo-test-ready`                     |
| `helpers-partie.mjs`            | Solo : pause, démarrage, fin de partie                       |
| `helpers-coop.mjs`              | Coop 2 joueurs                                               |
| `helpers-histoire.mjs`          | Carte histoire, cutscenes, recap                             |
| `helpers-campagne-narratif.mjs` | Parcours campagne avec narratif (D9, D9b)                    |
| `helpers-narratif*.mjs`         | Flux cutscene, fragments VERA, overlays                      |

### Piège Live Server / file://

Le jeu charge des modules ES (`import` depuis `js/`). **Live Server** et l’ouverture directe de `index.html` ne servent pas correctement les modules → écran « Chargement… » infini. Utiliser **`npm start`** (`serve` sur `127.0.0.1:3000`). Pour le bundle prod : `npm run build` puis `npx serve dist`. Voir le watchdog dans `js/chargement-watchdog.js`.

### Checklist manuelle iPhone (encoches réelles)

Les specs `audit-c-responsive` simulent `--safe-top: 47px` (Dynamic Island). Avant une release mobile, valider sur **iPhone physique** en PWA standalone :

1. Pause solo paysage — bouton Reprendre sous l’encoche, zone tactile ≥ 48 px
2. Pause coop paysage — bouton Reprendre sous l’encoche, pause HUD mobile ≥ 48 px
3. Game over solo et coop paysage — boutons visibles sans scroll horizontal
4. Carte histoire — en-tête et retour accessibles (safe-area)
5. Journal histoire — scrollable, fermer ≥ 48 px
6. Cutscene portrait 319 px de large — portraits et boutons Suivant/Passer visibles
7. Architecte paysage — contrôles latéraux utilisables au doigt (portrait = overlay orientation)

Annoter les écarts dans une issue ; ne pas supprimer la simulation CSS tant que le test physique n’est pas couvert.

### Environnements de déploiement

| Environnement         | Déclencheur                | Usage                                    |
| --------------------- | -------------------------- | ---------------------------------------- |
| **Production**        | Push sur `main` / tag `v*` | GitHub Pages (`deploy.yml`)              |
| **Preview (staging)** | Pull request               | Artefact `dist/` 7 jours (`preview.yml`) |
| **Release**           | Tag `v*`                   | GitHub Release + notes (`release.yml`)   |

La preview PR sert de **staging** : même pipeline `quality.yml` que la prod, sans publier sur Pages.

### Hooks Git (Husky)

| Hook           | Contenu                                                                  |
| -------------- | ------------------------------------------------------------------------ |
| **pre-commit** | lint-staged (ESLint + Prettier sur fichiers stagés)                      |
| **pre-push**   | lint, format, typecheck, cycles, verify:data, tests unitaires (~1–2 min) |
| **commit-msg** | Conventional Commits (script Node, compatible Windows/Cursor)            |

Le pre-push local est **rapide** (~1–2 min) : build, budget bundle, smoke E2E dist et audits complets tournent sur **GitHub Actions** (`quality.yml`). Options locales : `$env:PRE_PUSH_BUILD='1'; git push` (build + smoke dist, ~2–3 min) ; `$env:PRE_PUSH_FULL='1'; git push` (suite E2E complète, ~20–30 min). Rejouer les mêmes étapes sans push : `npm run verify:pre-push`. Contournement d'urgence : `$env:SKIP_PREPUSH='1'; git push` — la CI validera quand même.

### Git sous Windows / Cursor

- **Commit refusé** : le message doit respecter Conventional Commits (`feat:`, `fix:`, `feat(release): vX.Y.Z …`). L’UI Source Control de Cursor échoue silencieusement si le format est incorrect.
- **Push lent** : pre-push rapide ~1–2 min. Build/smoke en CI ; local : `$env:PRE_PUSH_BUILD='1'; git push`. E2E complets : `$env:PRE_PUSH_FULL='1'; git push`.
- **Release complète** : `npm run release:publish` (bump, commit, tag, push). Push sans re-vérifier : `npm run release:push`.
- **Contournement d'urgence** : `$env:SKIP_PREPUSH='1'; git push origin main --tags` (PowerShell) — la CI GitHub validera quand même.

### Analyse et maintenance

- `npm run analyze` — top 15 taille bundle + régénère `docs/modules-index.md` (hotspots uniquement)
- `npm run check:circular` — dépendances circulaires depuis `js/main.js`

### Textes narratifs (`js/histoire-textes/`)

Les cutscenes et dialogues sont découpés par domaine (`cutscenes-post-monde-*.js`, `cutscenes-entree-*.js`, etc.). Le barrel `js/histoire-textes.js` réexporte l’API publique ; la prod charge `data/histoire-textes.json` (généré par `npm run sync:data`). Après modification des sources JS : `npm run sync:data` puis `npm run verify:data`. Les PNG de cutscene **eager** sont precachés par le SW (`sw.js` → `SCENES_CUTSCENE_PRECACHE`) ; les scènes `lazy: true` (ex. `vide_errance`) restent en chargement runtime. Scripts one-shot archivés : `scripts/archive/decouper-histoire-textes.mjs`, `scripts/archive/split-textes-narratifs.mjs`, `scripts/archive/split-modules-audit.mjs`.

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

- [docs/architecture.md](docs/architecture.md)
- [docs/accessibilite-wcag.md](docs/accessibilite-wcag.md)
- [docs/versioning.md](docs/versioning.md)
- [docs/mode-histoire.md](docs/mode-histoire.md)
- [docs/ajouter-un-biome.md](docs/ajouter-un-biome.md)
- [docs/ajouter-un-boss.md](docs/ajouter-un-boss.md)
