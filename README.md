# Dernière Ligne ✦

Tetris narratif en Vanilla JS + Canvas 2D. PWA hors-ligne.

**Version : 2.5.10** — détails dans [CHANGELOG.md](CHANGELOG.md).

## Contenu

- Solo, **Coop** (2 joueurs), **Architecte** (puzzles), **Histoire** (campagne)
- Guideline : hold, ghost, 7-bag, SRS, DAS/ARR, lock delay, T-Spin
- 9 biomes arcade, achievements, profil, codex

| Touche    | Action       |
| --------- | ------------ |
| ← →       | Déplacer     |
| ↑ / Z / X | Tourner      |
| ↓         | Chute lente  |
| Espace    | Chute rapide |
| C / Maj   | Hold         |
| P / Échap | Pause        |

Contrôles complets : **Options → Contrôles**.

## Démarrage

```bash
npm install
npm start          # http://127.0.0.1:3000
npm test
npm run build      # → dist/
```

Utile : `npm run lint` · `npm run typecheck` · `npm run test:e2e` · `npm run sync:sw`

**Dev :** préférer `127.0.0.1` à `localhost` (HSTS). Après MAJ du SW : Ctrl+Shift+R. Debug : `?debug=1`.

Node 18+ (`.nvmrc`).

## Développement avancé

| Commande                      | Rôle                                                |
| ----------------------------- | --------------------------------------------------- |
| `npm run test:coverage`       | Couverture Vitest (seuils dans `vitest.config.mjs`) |
| `npm run check:circular`      | Détection de dépendances circulaires (madge)        |
| `npm run check:outdated`      | Versions npm obsolètes                              |
| `npm run test:e2e:smoke:dist` | Smoke E2E sur bundle prod (hooks pre-push)          |
| `npm run analyze`             | Analyse taille bundle après `npm run build`         |
| `npm run sync:sw`             | Régénère la liste de cache du service worker        |

Hooks **husky pre-push** : lint, format, typecheck, `check:circular`, tests unitaires + smoke E2E dist.

E2E bundle prod : voir [CONTRIBUTING.md](CONTRIBUTING.md) (`E2E_DIST=1`). Release : `npm run release` puis tag `vX.Y.Z`.

## Docs

| Sujet         | Fichier                                              |
| ------------- | ---------------------------------------------------- |
| Architecture  | [docs/architecture.md](docs/architecture.md)         |
| Mode Histoire | [docs/mode-histoire.md](docs/mode-histoire.md)       |
| Nouveau biome | [docs/ajouter-un-biome.md](docs/ajouter-un-biome.md) |
| Nouveau boss  | [docs/ajouter-un-boss.md](docs/ajouter-un-boss.md)   |
| Nouvel écran  | [docs/ajouter-un-ecran.md](docs/ajouter-un-ecran.md) |

Entrée code : `index.html` → `js/main.js` → `js/moteur.js`.

## Déploiement

GitHub Pages (`deploy.yml`). Release : `npm run release`.

## Licence

Tous droits réservés — [LICENSE](LICENSE). Sécurité : [SECURITY.md](SECURITY.md).
