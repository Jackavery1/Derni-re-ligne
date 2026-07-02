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
npm run test:e2e
```

Node 18+ (`.nvmrc`). Logs verbeux : `?debug=1`. Formatage : `.prettierrc` (Prettier via `npm run format` / `format:check`).

### Tests E2E sur le bundle prod

La CI exécute **smoke** et **perf** sur le bundle prod (`test:e2e:smoke:dist`, `test:e2e:perf` via `E2E_DIST=1` — `run-e2e-dist.mjs` injecte alors `neo-test-init.js` dans `dist/index.html`). La suite E2E complète (`npm run test:e2e`) sert les **modules ES sources** (`index.html` charge `js/neo-test-init.js`). Le budget bundle prod (`verifier-bundle.mjs`) exclut l’entrée test et ses chunks dédiés (`budget-exclus.json`).

### Environnements de déploiement

| Environnement         | Déclencheur                | Usage                                    |
| --------------------- | -------------------------- | ---------------------------------------- |
| **Production**        | Push sur `main` / tag `v*` | GitHub Pages (`deploy.yml`)              |
| **Preview (staging)** | Pull request               | Artefact `dist/` 7 jours (`preview.yml`) |
| **Release**           | Tag `v*`                   | GitHub Release + notes (`release.yml`)   |

La preview PR sert de **staging** : même pipeline `quality.yml` que la prod, sans publier sur Pages.

### Hooks Git (Husky)

| Hook           | Contenu                                                                                |
| -------------- | -------------------------------------------------------------------------------------- |
| **pre-commit** | lint-staged (ESLint + Prettier sur fichiers stagés)                                    |
| **pre-push**   | lint, format, typecheck, cycles, tests unitaires, build, budget bundle, smoke E2E dist |
| **commit-msg** | Conventional Commits (script Node, compatible Windows/Cursor)                          |

Le pre-push est volontairement lourd pour éviter de pousser une régression. **`git push --no-verify`** ne doit être utilisé qu'en exception (urgence, CI en cours de réparation) : le pipeline GitHub exécutera quand même l'intégralité des checks. Ne jamais contourner les hooks pour merger du code non testé sur `main`.

### Git sous Windows / Cursor

- **Commit refusé** : le message doit respecter Conventional Commits (`feat:`, `fix:`, `feat(release): vX.Y.Z …`). L’UI Source Control de Cursor échoue silencieusement si le format est incorrect.
- **Push lent ou bloqué** : le hook pre-push exécute lint + tests + build + E2E (~plusieurs minutes). Préférer le terminal intégré plutôt que le bouton Sync.
- **Release complète** : `npm run release:publish` (bump, commit, tag, push). Push sans re-vérifier : `npm run release:push`.
- **Contournement temporaire pre-push** : `$env:SKIP_PREPUSH='1'; git push origin main --tags` (PowerShell) — la CI GitHub validera quand même.

### Analyse et maintenance

- `npm run analyze` — top 15 taille bundle + régénère `docs/modules-index.md` (hotspots uniquement)
- `npm run check:circular` — dépendances circulaires depuis `js/main.js`

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
