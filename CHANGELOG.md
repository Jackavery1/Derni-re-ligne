# Changelog

Historique des versions de Tetris Néo. Format [semver](https://semver.org/) : `MAJEUR.MINEUR.PATCH`.

## Résumé par version

| Version   | Date       | En bref                                                                           |
| --------- | ---------- | --------------------------------------------------------------------------------- |
| **2.4.2** | 2026-06-05 | Docs minimalistes + tableau d'évolution, tests, debug `?debug=1`, versions SW alignées |
| **2.4.1** | 2026-06-05 | `moteur.js` découpé en 14 modules, E2E pause/options, ESLint propre               |
| **2.4.0** | 2026-06-05 | CSS externalisé, CSP, Vitest/ESLint/Prettier, CI deploy, modules météo/reliques   |
| **2.3.0** | 2026-06-04 | Audio, progression, étoiles par biome, E2E Playwright                             |
| **2.2.0** | 2026-06-04 | `main.js` + `moteur.js`, logique pure, CI, perf particules                        |
| **2.1.0** | 2026-06-04 | Sprint, musique, PWA offline, tests logique, accessibilité                        |
| **2.0.0** | 2026-06-04 | Jeu complet : 7-bag, SRS, hold, FX, Web Audio                                     |

---

## [2.4.2] — 2026-06-05

- Documentation épurée (README, CONTRIBUTING, CHANGELOG avec tableau d'évolution)
- Tests `piece-jeu` (lock delay, collision) et progression localStorage
- E2E bannière erreur ; mode debug `?debug=1`
- `ECRANS` unifié dans `contexte-jeu.js` ; suppression code mort `Registre`
- Versions alignées : SW `tetris-neo-{semver}`, cache-bust HTML
- CI : lint, format:check, npm audit

## [2.4.1] — 2026-06-05

- Découpage `moteur.js` → 14 modules (`contexte-jeu`, `piece-jeu`, `rendu-jeu`, `partie`, etc.)
- Orchestrateur ~90 lignes ; `registre-jeu.js` pour les deps circulaires
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
