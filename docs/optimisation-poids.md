# Optimisation poids (OPT-1 → OPT-3)

## Budgets CI

| Ressource                    | Plafond                                       | Commande                                                |
| ---------------------------- | --------------------------------------------- | ------------------------------------------------------- |
| App shell (precache SW prod) | 2048 Ko (alerte 1800 Ko)                      | `npm run audit:poids`                                   |
| JS minifie (dist)            | 595 Ko max (confort 570 Ko, entree ~15–35 Ko) | `npm run build` puis `node scripts/verifier-bundle.mjs` |

En prod, `scripts/esbuild-strip-logger.mjs` retire les appels `logger.debug` / `logger.info` (littéraux inclus) avant minify — `DEBUG` est déjà faux via `__NEO_PROD__`, mais les chaînes restaient sinon dans le budget CI.
| Polices woff2 | 300 Ko | audit |
| Scene cutscene PNG | 200 Ko / image | audit |
| Piste musique | 3,5 Mo | audit |

Le precache **dev** (`npm run sync:sw`) liste les modules source non minifies : le poids affiche depasse souvent 2048 Ko sans bloquer la CI (avertissement desactive en dev).

## Pipeline medias

```bash
npm run media:icones   # regénération manuelle img/icon-*.png (optionnel)
npm run media:polices   # woff2 depuis @fontsource/*
npm run media:musique   # sources-bruts/musique → assets/musique/
npm run media:scenes    # sources-bruts/scenes → assets/cutscenes/
```

`npm run build` exécute déjà `compresser-icones.mjs` et `compresser-images-ui.mjs` : pas besoin de `media:icones` avant un build prod.

Format audio cible : `FORMAT_CIBLE = 'opus'` dans `scripts/convertir-musique.mjs` (Ogg Opus + M4A AAC pour Safari). Alternative : `'mp3'` (MP3 VBR seul).

## Service Worker deux etages

- `VERSION_SHELL` : shell (HTML, CSS, JS hash, polices woff2)
- `VERSION_MEDIAS` : musique et cutscenes (cache-first, hors precache)
- FIFO musique : 12 pistes max (`MAX_PISTES_EN_CACHE` dans `sw.js`)

Regenerer le precache prod apres build : `npm run build` (inclut `generer-precache --prod`).

## Polices

Les polices legacy `fonts/*.ttf` / `assets/fonts/*.ttf` ont été retirées du dépôt :
uniquement `assets/fonts-dist/*.woff2` (precache). Le build prod exclut toujours
les `.ttf` et `.wav` éventuels. Les SFX boss sont en **OGG seul** dans
`assets/sfx/boss/` ; sans décodage Ogg → fallback procédural (`audio-effets.js`).
