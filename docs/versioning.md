# Gestion de version

## Semver

Format **MAJEUR.MINEUR.PATCH** ([semver](https://semver.org/)). Historique : [CHANGELOG.md](../CHANGELOG.md).

| Fichier        | Rôle                                        |
| -------------- | ------------------------------------------- |
| `package.json` | Source de vérité (`version`)                |
| `index.html`   | Query cache dev `js/main.js?v=X.Y.Z`        |
| `sw.js`        | `VERSION_CACHE = 'derniere-ligne-X.Y.Z-rN'` |
| `README.md`    | Affichage version                           |
| `CHANGELOG.md` | Notes de release                            |

Vérification : `npm run verify:versions`

## Release

```bash
# 1. Rédiger la section [X.Y.Z] dans CHANGELOG.md
npm run release          # bump patch + sync SW + README + index
npm run verify:versions
npm test && npm run build
git add -A && git commit -m "feat(release): vX.Y.Z …"
git tag vX.Y.Z
git push origin main --tags
```

Le workflow `release.yml` crée une GitHub Release sur chaque tag `v*`. Le déploiement Pages suit le push sur `main` (`deploy.yml`).

## Tags Git

Tags semver publiés : `v2.5.0` … `v2.5.10` (sauf lacunes ci-dessous).

**Versions sans tag** (commits sur `main`, CHANGELOG présent) :

| Version   | Raison                                       |
| --------- | -------------------------------------------- |
| **2.5.3** | Release intermédiaire non taguée (juin 2026) |
| **2.5.4** | Idem                                         |

Ne pas créer de tags rétroactifs sans identifier le commit exact ; l’historique reste traçable via CHANGELOG et `git log`.

## Commits

[Conventional Commits](https://www.conventionalcommits.org/) imposés par Husky (`commit-msg`). Scopes recommandés : `feat(codex)`, `fix(e2e)`, `docs(readme)`, `chore(deps)`.

## Branches

- **`main`** — stable, déployée sur GitHub Pages
- **`feat/*` / `fix/*`** — développement
- **Preview PR** — artefact `dist/` (`preview.yml`), équivalent staging

Politique merge : merge commit ou squash selon préférence équipe ; historique linéaire optionnel via squash sur PR GitHub.

## Cache service worker

Suffixe **`rN`** (`generate-sw-cache.mjs`, constante `REVISION_CACHE`) : incrémenter si le semver ne change pas mais le contenu du cache doit être invalidé.
