# Contribuer

Ce dépôt est **privé et non open source**. Le code source n'est pas ouvert aux contributions externes pour le moment.

## Licence

Le Logiciel est protégé par copyright (voir [LICENSE](LICENSE)). Toute modification, fork public ou redistribution du code est **interdite** sans autorisation écrite du titulaire des droits.

Jouer à la version officielle mise à disposition reste autorisé à titre personnel.

## Développement interne

Réservé au titulaire des droits et aux collaborateurs explicitement autorisés.

```bash
npm install
npm start
npm test
npm run lint
npm run typecheck
npm run prepare:e2e
npm run test:e2e
```

Node 18+ (`.nvmrc`). Logs verbeux : `?debug=1`.

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
- [docs/mode-histoire.md](docs/mode-histoire.md)
- [docs/ajouter-un-biome.md](docs/ajouter-un-biome.md)
- [docs/ajouter-un-boss.md](docs/ajouter-un-boss.md)
