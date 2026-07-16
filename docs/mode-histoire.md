# Mode Histoire

Campagne « La Fragmentation » : 17 mondes visibles + 3 secrets, 5 boss (Brasier, Sentinelle, Archiviste, Avant-Garde, La Distorsion), 9 journaux VERA, 3 fins.

## Fichiers clés

| Fichier                    | Rôle                                             |
| -------------------------- | ------------------------------------------------ |
| `histoire-donnees.js`      | Mondes, boss, seuils                             |
| `histoire-manager.js`      | Carte, lancement, sauvegarde                     |
| `histoire-map.js`          | Barrel carte (layout, scroll, focus, visibilité) |
| `histoire-narratif.js`     | Cutscenes, journaux                              |
| `histoire-textes/`         | Contenu narratif (barrel `histoire-textes.js`)   |
| `rendu/scenes-cutscene.js` | Registre `SCENES_CUTSCENE` (fonds, flags `lazy`) |
| `boss-jeu.js`              | Combats boss                                     |
| `boss-dialogues.js`        | Répliques combat (phases, tetris, game over)     |
| `texte-jeu.js`             | Normalisation UI (`sansAccentsE`)                |
| `mecaniques-histoire.js`   | Rouille, éclipse, vide…                          |
| `conditions-secrets.js`    | Mondes miroir, trame, paradoxe                   |

Les fonds cutscene sont déclarés dans `js/rendu/scenes-cutscene.js` (`SCENES_CUTSCENE`) : scènes critiques en precache install, scènes rares avec `lazy: true` (chargement idle / à la demande).

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

Les conditions Trame sont visibles dans le HUD pendant une run (`mecaniques-histoire.js`). Les fragments signal VERA après chaque biome narratif préparent la rampe vers Miroir et Trame.

## Rampe narrative

| Étape            | Indice in-game                                       |
| ---------------- | ---------------------------------------------------- |
| Prologue → Ch. I | Fragments VERA après prologue, lave, rouille         |
| Ch. II–III       | Journaux + fragments par biome                       |
| Ch. IV           | Entraînement Avant-Garde avant la finale             |
| Post-finale      | Mondes secrets débloqués par `conditions-secrets.js` |

## Ellipse éditoriale — Monde Paradoxe

Le **Monde Paradoxe** clôt la campagne avec une ellipse volontaire : le texte post-victoire contient « ligne incomplète. Volontairement. », et VERA adopte l'humeur portrait `douce`. Ce n'est pas un trou narratif accidentel — c'est la contrepartie éditoriale de la fin secrète et du déblocage post-campagne.

| Élément             | Rôle narratif                                 |
| ------------------- | --------------------------------------------- |
| Marqueur post-monde | Invite à « lire entre les blocs »             |
| Humeur VERA `douce` | Ton de clôture ouverte, non punitive          |
| Mode zen en run     | Gameplay sans punition top-out (récupération) |

Tests : `e2e/histoire-post-monde.spec.mjs`, `tests/corrections-audit.test.mjs`.

## Persistance

`localStorage` via `progression.js` (clé `derniereLigne_histoire`). Runtime : `store.histoire`.

Lecture/écriture du flag actif : `modeHistoireEnCours()`, `activerModeHistoire()`, `desactiverModeHistoire()` (`mode-histoire.js`).

## Mode dev

`?dev=1`, `Ctrl+Shift+D`, ou 5 clics sur le titre. Panneau : lancer monde, skip, reset.

## Tests

| Type      | Fichiers                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Unitaires | `tests/histoire-*.test.mjs`, `tests/boss-dialogues.test.mjs`, `tests/cutscene-ui.test.mjs`, `tests/mecaniques-histoire.test.mjs`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| E2E       | `e2e/audit-d-narratif.spec.mjs`, `e2e/histoire.spec.mjs`, `e2e/histoire-entrees.spec.mjs`, `e2e/histoire-fragments-vera.spec.mjs`, `e2e/histoire-journaux-vera.spec.mjs`, `e2e/histoire-mondes.spec.mjs`, `e2e/histoire-carte-mobile.spec.mjs`, `e2e/histoire-narratif.spec.mjs`, `e2e/histoire-narratif-fins.spec.mjs`, `e2e/histoire-post-monde.spec.mjs`, `e2e/histoire-responsive.spec.mjs`, `e2e/histoire-responsive-d8.spec.mjs`, `e2e/histoire-responsive-encoche.spec.mjs`, `e2e/histoire-campagne-{enchainement,d9,d9b,d15,pr}.spec.mjs`, `e2e/prologue-trame-modal.spec.mjs`, `e2e/gameplay-boss-humeurs.spec.mjs` |

`npm run test:e2e:audit` exécute les specs audit gameplay, responsive, narratif (`audit-d-narratif`, `histoire-post-monde`, extraits campagne).

Voir aussi [Ajouter un boss](ajouter-un-boss.md) pour les dialogues de combat.
