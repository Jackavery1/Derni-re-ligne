# Ajouter un boss

Checklist pour intégrer un nouveau combat de boss en mode Histoire.

## 1. Données (`js/histoire-donnees.js`)

Ajouter une entrée dans `BOSS` :

```js
mon_boss: {
    id: 'mon_boss',
    nom: 'NOM AFFICHÉ',
    pvMax: 10,
    attaqueIntervalleMs: 15000,
    couleur: '#ff6600',
    texteApparition: '…',
    texteDefaite: '…',
},
```

Lier le monde correspondant via `bossId` dans `SEQUENCE_HISTOIRE`.

## 2. Mécaniques (`js/boss-jeu.js`)

- Attaques périodiques : `_exectuterAttaque()` et effets dans `store.histoire.boss.effets`.
- Dégâts au boss : `endommagerBoss(nbLignes)` (1 PV par ligne effacée par défaut).
- Portrait : `boss-rendu.js` si visuel spécifique requis.

## 3. UI

- Section `#section-boss` dans `html/interface-jeu.html` (barre HP, portrait canvas).
- Textes boss : `#boss-nom-affiche`, `#boss-hp-label`.

## 4. Narratif

- Cutscene victoire dans `CUTSCENES_VICTOIRE_BOSS` (`histoire-textes.js`).
- Transition post-boss via `histoire-narratif.js` / `histoire-manager.js`.

## 5. Tests

- Unit : `tests/boss-jeu.test.mjs` — démarrage, dégâts, victoire.
- E2E : lancement depuis la carte histoire, HUD boss visible (`e2e/histoire.spec.mjs`).

## 6. Achievements (optionnel)

Hooks dans `achievements-histoire.js` (timers boss, conditions sans continue).
