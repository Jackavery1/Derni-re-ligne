# Mode Histoire — La Fragmentation

Guide interne pour comprendre, tester et étendre la campagne narrative.

## Vue d'ensemble

- **20 mondes** dans `SEQUENCE_HISTOIRE` (`js/histoire-donnees.js`) : 17 visibles + 3 secrets.
- **4 boss** principaux + boss finale.
- **9 journaux VERA**, cutscenes, transitions de chapitre.
- **3 fins** : normale, vraie, secrète (`js/fins-histoire.js`).

## Modules clés

| Module                   | Rôle                                             |
| ------------------------ | ------------------------------------------------ |
| `histoire-manager.js`    | Navigation carte, lancement mondes, sauvegarde   |
| `histoire-map.js`        | État carte, layout vertical, caméra, scroll      |
| `histoire-map-rendu.js`  | Orchestration rendu canvas (chemins, brouillard) |
| `histoire-map-fond.js`   | Fond étoilé, nébuleuses, planètes                |
| `histoire-map-noeuds.js` | Nœuds, fantômes, mondes secrets                  |
| `histoire-map-camera.js` | Transform caméra, hit-test écran → monde         |
| `histoire-narratif.js`   | Cutscenes, journaux, transitions                 |
| `boss-jeu.js`            | Combats boss, mécaniques spéciales               |
| `mecaniques-histoire.js` | Biomes spéciaux (rouille, éclipse, vide…)        |
| `conditions-secrets.js`  | Déblocage mondes miroir, trame, paradoxe         |
| `histoire-etat.js`       | Accès centralisé à l'état persisté               |

## Progression d'un monde

1. Carte histoire → sélection monde (souris, touch ou `#histoire-monde-clavier`).
2. Cutscene d'entrée si première visite.
3. Partie Tetris avec biome et mécanique associés.
4. Boss éventuel → victoire → mise à jour `mondesCompletes`.
5. Journal VERA ou transition de chapitre selon le monde.

## Mondes secrets

| Monde            | Conditions (résumé)                                                      |
| ---------------- | ------------------------------------------------------------------------ |
| `monde_miroir`   | Boss Archiviste vaincu + 3 Tetris triples en Cyber                       |
| `monde_trame`    | Miroir complété + tous journaux + boss sans continue + action distorsion |
| `monde_paradoxe` | Fin secrète + 3 tops volontaires au prologue                             |

Logique détaillée : `js/conditions-secrets.js`, `js/monde-paradoxe.js`.

## Persistance

Clé `derniereLigne_histoire` dans `localStorage`, gérée par `progression.js`. État runtime dans `store.histoire` (`store-histoire.js`).

## Carte histoire (v2.5.4)

- **Layout vertical** : 17 mondes principaux empilés (`PAS_Y = 140`), défilement molette/touch.
- **Caméra** : zoom 1.6×, focus auto sur le premier monde jouable, `ecranVersMonde()` pour le hit-test.
- **Visibilité** : mondes complétés + monde actuel visibles ; 2 suivants en fantômes ; brouillard au-delà.
- **Secrets** : absents de la carte tant que `mondePeutEtreJoue()` est faux ; apparition uniquement quand toutes les conditions du monde sont remplies (miroir, trame, paradoxe).

## Mode développeur (discret)

Activation (session uniquement, non persistée) :

- URL `?dev=1`
- Raccourci `Ctrl+Shift+D`
- 5 clics rapides sur le titre « Dernière Ligne » (écran titre)

Indicateur : point cyan discret en bas à droite. Panneau : lancer/rejouer un monde, **valider + suivant** (complète le monde sélectionné avec la logique jeu — boss, journaux, secrets — puis sélectionne le monde suivant), reset histoire, tout compléter, conditions secrets, niveau global 99, skip tutoriels. Les mondes secrets restent masqués sur la carte même en mode dev — accès via le panneau ou le sélecteur clavier.

## Tests

- Unitaires : `tests/histoire-manager.test.mjs`, `tests/histoire-map-camera.test.mjs`, `tests/mecaniques-histoire.test.mjs`, `tests/conditions-secrets.test.mjs`, `tests/boss-jeu.test.mjs`
- E2E : `e2e/histoire.spec.mjs` (scroll molette, sélection clavier, mobile)

## Ajouter un monde

1. Entrée dans `SEQUENCE_HISTOIRE` et biome dans `biomes-histoire.js` si mécanique spéciale.
2. Seuil de lignes dans `SEUILS_COMPLETION` (`histoire-manager.js`).
3. Cutscenes / textes dans `histoire-textes.js`.
4. Tests unitaires + scénario E2E si parcours critique.
