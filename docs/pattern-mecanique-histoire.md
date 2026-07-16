# Pattern — ajouter une mécanique histoire

Guide court pour une nouvelle mécanique de campagne.

## Emplacement

```
js/histoire/
├── mecaniques-histoire.js              # barrel public
├── mecaniques-histoire-queries.js      # état + getters
└── mecaniques-histoire-{nom}.js        # logique métier

styles/mecaniques-histoire.css          # styles partagés
data/histoire-textes.json               # textes HUD / dialogues
```

## Étapes

1. **Module** — créer `js/histoire/mecaniques-histoire-{nom}.js` (état lazy sur le store, pas de dépendance UI).
2. **Barrel** — ré-exporter depuis `mecaniques-histoire.js` et brancher dans `mecaniques-histoire-queries.js` si besoin de getters.
3. **Textes** — ajouter les clés dans `data/histoire-textes.json` (puis `npm run sync:data` / export pipeline).
4. **Styles** — classes dans `styles/mecaniques-histoire.css` si HUD dédié.
5. **Tests** — unitaire sur la logique pure + E2E campagne si la méca change le flux joueur.

## À éviter

- Importer le rendu / la carte depuis le module mécanique
- Dupliquer des textes en dur dans le JS (passer par les JSON)
- Laisser un barrel orphelin à la racine `js/` (tout vit sous `js/histoire/`)

Voir aussi : `docs/ajouter-un-boss.md`, `docs/mode-histoire.md`.
