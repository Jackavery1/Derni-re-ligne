# Optimisation poids (OPT-1 → OPT-3)

## Budgets CI

| Ressource                    | Plafond                     | Commande                   |
| ---------------------------- | --------------------------- | -------------------------- |
| App shell (precache SW prod) | 2048 Ko                     | `npm run audit:poids`      |
| JS minifie (dist)            | 900 Ko (CI : 605 Ko bundle) | `npm run build` puis audit |
| Polices woff2                | 300 Ko                      | audit                      |
| Scene cutscene PNG           | 200 Ko / image              | audit                      |
| Piste musique                | 3,5 Mo                      | audit                      |

Le precache **dev** (`npm run sync:sw`) liste les modules source non minifies : le poids affiche depasse souvent 2048 Ko sans bloquer la CI (avertissement desactive en dev).

## Pipeline medias

```bash
npm run media:polices   # woff2 depuis @fontsource/*
npm run media:musique   # sources-bruts/musique → assets/musique/
npm run media:scenes    # sources-bruts/scenes → assets/cutscenes/
```

Format audio cible : `FORMAT_CIBLE = 'opus'` dans `scripts/convertir-musique.mjs` (Ogg Opus + M4A AAC pour Safari). Alternative : `'mp3'` (MP3 VBR seul).

## Service Worker deux etages

- `VERSION_SHELL` : shell (HTML, CSS, JS hash, polices woff2)
- `VERSION_MEDIAS` : musique et cutscenes (cache-first, hors precache)
- FIFO musique : 12 pistes max (`MAX_PISTES_EN_CACHE` dans `sw.js`)

Regenerer le precache prod apres build : `npm run build` (inclut `generer-precache --prod`).

## Polices

Les polices legacy `fonts/*.ttf` ne sont plus deployees : uniquement `assets/polices/*.woff2` dans le precache.
