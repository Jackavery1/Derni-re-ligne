# Mode Histoire

Campagne « La Fragmentation » : 17 mondes visibles + 3 secrets, 5 boss (Brasier, Sentinelle, Archiviste, Avant-Garde, La Distorsion), 9 journaux VERA, 3 fins.

## Fichiers clés

| Fichier                  | Rôle                                           |
| ------------------------ | ---------------------------------------------- |
| `histoire-donnees.js`    | Mondes, boss, seuils                           |
| `histoire-manager.js`    | Carte, lancement, sauvegarde                   |
| `histoire-map.js`        | Layout vertical, caméra                        |
| `histoire-narratif.js`   | Cutscenes, journaux                            |
| `histoire-textes/`       | Contenu narratif (barrel `histoire-textes.js`) |
| `boss-jeu.js`            | Combats boss                                   |
| `boss-dialogues.js`      | Répliques combat (phases, tetris, game over)   |
| `texte-jeu.js`           | Normalisation UI (`sansAccentsE`)              |
| `mecaniques-histoire.js` | Rouille, éclipse, vide…                        |
| `conditions-secrets.js`  | Mondes miroir, trame, paradoxe                 |

## Textes UI vs narration

Deux conventions coexistent volontairement :

| Contexte                                                       | Accents           | Module                                                 | Exemple                             |
| -------------------------------------------------------------- | ----------------- | ------------------------------------------------------ | ----------------------------------- |
| **Narration** (cutscenes, dialogues boss, journaux, épilogues) | Conservés         | `histoire-textes/`                                     | « La Distorsion ne disparaît pas. » |
| **UI gameplay** (HUD, carte, codex, tutoriel, achievements)    | Supprimés (`é→e`) | `texte-jeu.js` → `sansAccentsE()` / `definirTexteUi()` | « SYSTEME », « complete »           |

Les bulles de dialogue cutscene et les overlays boss **gardent les accents** — seuls les libellés d'interface statiques passent par `sansAccentsE()`. Pour l'accessibilité, `definirTexteUi()` conserve les accents dans `aria-label`.

## Synchronisation narratif JS ↔ JSON

Le runtime charge `data/histoire-textes.json` en prod. La source de vérité reste `js/histoire-textes/` (barrel).

| Commande              | Rôle                                                  |
| --------------------- | ----------------------------------------------------- |
| `npm run sync:data`   | Régénère `data/histoire-textes.json` depuis le module |
| `npm run verify:data` | Échoue si le JSON sur disque diverge (CI)             |

Après toute modification de contenu narratif, exécuter `npm run sync:data` avant commit.

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

Lecture/écriture du flag actif : `modeHistoireEnCours()`, `activerModeHistoire()`, `desactiverModeHistoire()` (`mode-histoire.js`).

## Mode dev

`?dev=1`, `Ctrl+Shift+D`, ou 5 clics sur le titre. Panneau : lancer monde, skip, reset.

## Tests

| Type      | Fichiers                                                                                                                         |
| --------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Unitaires | `tests/histoire-*.test.mjs`, `tests/boss-dialogues.test.mjs`, `tests/cutscene-ui.test.mjs`, `tests/mecaniques-histoire.test.mjs` |
| E2E       | `e2e/histoire.spec.mjs` (carte, boss, cutscene narration)                                                                        |

Voir aussi [Ajouter un boss](ajouter-un-boss.md) pour les dialogues de combat.
