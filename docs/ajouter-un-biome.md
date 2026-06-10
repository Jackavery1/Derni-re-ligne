# Ajouter un biome

## Checklist

1. **`js/biomes.js`** — entrée biome (couleurs, id)
2. **`js/constellation.js`** — position sur la carte
3. **`js/themes-biome.js`** — thème mascotte
4. **`js/contenu-jeu.js` + `js/reliques.js`** — relique (si applicable)
5. **`js/audio.js`** — intervalle mélodique
6. **`js/vivant.js`** — comportement plateau (optionnel)
7. **`js/codex-donnees.js`** — entrée codex
8. **`js/progression.js`** — id couvert par `derniereLigne_record_[a-z]+`

## Valider

```bash
npm test && npm run lint && npm run typecheck && npm run sync:sw
```
