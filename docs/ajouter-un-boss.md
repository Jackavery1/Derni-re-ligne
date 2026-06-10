# Ajouter un boss

## Checklist

1. **`js/histoire-donnees.js`** — entrée `BOSS` + `bossId` sur le monde
2. **`js/boss-jeu.js`** — attaques, dégâts (`endommagerBoss`)
3. **`js/boss-rendu.js`** — portrait canvas (si besoin)
4. **`html/interface-jeu.html`** — section `#section-boss`
5. **`js/histoire-textes.js`** — cutscene victoire
6. **`tests/boss-jeu.test.mjs`** — démarrage, dégâts, victoire

## Valider

```bash
npm test && npm run lint
```
