# Ajouter un écran

## Checklist

1. **`html/ecran-<nom>.html`** — `<div id="ecran-<nom>" class="ecran">` (pas de style/script inline)
2. **`js/ui/ecrans-config.js`** — constante `ECRANS` + `LISTE_ECRANS_CHARGEMENT`
3. **`js/ui/navigation-ecrans.js`** — `afficherEcran(ECRANS.<NOM>)`
4. **`js/ui/ui-init.js`** ou `ui-boutons-*.js` — brancher les boutons
5. **`styles/main.css`** — styles (`.element-masque` pour masquer)

## Valider

```bash
npm test && npm run lint && npm run test:e2e
```
