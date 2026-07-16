# Ajouter un boss

## Checklist

1. **`data/histoire-donnees.json`** — entrée `BOSS` + `bossId` sur le monde (chargé via `js/histoire/histoire-donnees-chargement.js`)
2. **`js/logique/boss-jeu.js`** + **`js/logique/boss-combat.js`** / **`js/logique/boss-attaques.js`** — attaques, dégâts
3. **`js/histoire/boss-dialogues.js`** — déclenchement runtime (pas de texte ici)
4. **`js/histoire-textes/dialogues-boss.js`** — répliques combat (`DIALOGUES_COMBAT_BOSS`)
5. **`js/rendu/boss-rendu.js`** — portrait canvas (si besoin)
6. **`html/interface-jeu.html`** — section `#section-boss`
7. **`js/histoire-textes/cutscenes-boss.js`** (+ `cutscenes-boss-victoire*.js`) — cutscene victoire
8. **`js/histoire/histoire-map-briefings-boss.js`** — briefing carte + infobulles attaques
9. **`tests/boss-jeu.test.mjs`** + **`tests/boss-dialogues.test.mjs`**

## Dialogues de combat

Ajouter une entrée dans `DIALOGUES_COMBAT_BOSS` :

```javascript
mon_boss: {
    epithete: 'Courte phrase d’accroche (overlay présentation).',
    debut: 'Réplique au début du combat.',
    phases: ['Réplique ~50 % PV', 'Réplique ~25 % PV'],
    reactionTetris: 'Quand le joueur efface 4 lignes.',
    quasiVaincu: 'Sous 15 % PV restants.',
    gameOver: 'Affichée sur l’écran game over histoire.',
},
```

### Déclenchement (`js/histoire/boss-dialogues.js`)

| Événement                 | Fonction                                                                |
| ------------------------- | ----------------------------------------------------------------------- |
| Entrée combat             | `demarrerPresentationBoss` → overlay → `debut`                          |
| 50 % / 25 % PV            | `notifierSeuilsPvBoss` (boss sans phases gameplay)                      |
| Transition phase gameplay | `notifierTransitionPhaseBoss` + seuils complémentaires si `boss.phases` |
| Tetris (4 lignes)         | `notifierTetrisBoss`                                                    |
| < 15 % PV                 | `notifierQuasiVaincuBoss`                                               |
| Game over                 | `obtenirRepliqueGameOverBoss`                                           |

Boss **avec** `phases` gameplay (ex. Archiviste) : la transition phase joue `phases[phaseApres - 1]` ; les répliques restantes passent par les seuils 50 % / 25 %.

Exporter les textes : `npm run sync:data` (régénère `data/histoire-textes.json`).

## Valider

```bash
npm test && npm run lint
npm run test:e2e -- e2e/histoire.spec.mjs e2e/gameplay-boss-humeurs.spec.mjs
```
