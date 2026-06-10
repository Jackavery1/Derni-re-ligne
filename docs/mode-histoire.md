# Mode Histoire

Campagne « La Fragmentation » : 17 mondes visibles + 3 secrets, 4 boss, 9 journaux VERA, 3 fins.

## Fichiers clés

| Fichier                  | Rôle                           |
| ------------------------ | ------------------------------ |
| `histoire-donnees.js`    | Mondes, boss, seuils           |
| `histoire-manager.js`    | Carte, lancement, sauvegarde   |
| `histoire-map.js`        | Layout vertical, caméra        |
| `histoire-narratif.js`   | Cutscenes, journaux            |
| `boss-jeu.js`            | Combats boss                   |
| `mecaniques-histoire.js` | Rouille, éclipse, vide…        |
| `conditions-secrets.js`  | Mondes miroir, trame, paradoxe |

## Déroulement d'un monde

Carte → cutscene (si 1ère visite) → partie → boss éventuel → journal / transition → sauvegarde.

## Mondes secrets

| Monde    | Condition (résumé)                          |
| -------- | ------------------------------------------- |
| Miroir   | Boss Archiviste + 3 triples Cyber           |
| Trame    | Miroir + tous journaux + boss sans continue |
| Paradoxe | Fin secrète + tops volontaires prologue     |

## Persistance

`localStorage` via `progression.js` (clé `derniereLigne_histoire`). Runtime : `store.histoire`.

## Mode dev

`?dev=1`, `Ctrl+Shift+D`, ou 5 clics sur le titre. Panneau : lancer monde, skip, reset.

## Tests

`tests/histoire-*.test.mjs`, `tests/mecaniques-histoire.test.mjs`, `e2e/histoire.spec.mjs`
