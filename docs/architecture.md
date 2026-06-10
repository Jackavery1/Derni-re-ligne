# Architecture

Vanilla ES modules en dev, bundle esbuild en prod.

**Entrée :** `index.html` → `js/main.js` → `js/moteur.js`

## Couches

| Couche      | Fichiers                                                                                |
| ----------- | --------------------------------------------------------------------------------------- |
| Données     | `config-jeu.js`, `biomes.js`, `contenu-jeu.js`, `histoire-textes/`                      |
| Logique     | `logique-pure.js`, `moteur-piece.js`, `score-partie.js`                                 |
| État        | `store-core.js`, `store-jeu.js`, `store-histoire.js`                                    |
| Solo        | `partie.js`, `logique-partie.js`, `boucle-jeu.js`, `piece-jeu.js`                       |
| Coop        | `coop-jeu.js`, `coop-logique.js`                                                        |
| Histoire    | `histoire-manager.js`, `histoire-cutscene*.js`, `boss-jeu.js`, `mecaniques-histoire.js` |
| Rendu / UI  | `rendu-jeu.js`, `navigation-ecrans.js`, `hud-jeu.js`                                    |
| Persistance | `progression.js`                                                                        |

## Organisation des fichiers

- **Sous-dossiers ciblés** — autorisés pour le **contenu** volumineux (`js/histoire-textes/`). Barrel parent (`histoire-textes.js`) + export JSON inchangés.
- **Pas de migration globale** — ne pas déplacer tout `js/histoire/` ou `js/rendu/` d'un coup (diff large, risque de cycles). Découper module par module à la demande.
- **Cutscenes** — responsabilités séparées :
    - `histoire-cutscene.js` — orchestration (séquence, callbacks)
    - `histoire-cutscene-ui.js` — DOM, zones texte, progress
    - `histoire-cutscene-portraits.js` — canvas portraits, boucle RAF
    - `histoire-cutscene-typewriter.js` — effet machine à écrire
    - `histoire-cutscene-nav.js` / `-config.js` / `-fonds.js` — navigation, constantes, arrière-plans

## Règles utiles

1. **Scoring partagé** — `score-partie.js` (`appliquerScoreLignes`) pour solo, coop et archi.
2. **Mode histoire** — `modeHistoireEnCours()` pour toute lecture ; `activerModeHistoire()` / `desactiverModeHistoire()` pour les écritures (source unique dans `mode-histoire.js`).
3. **Événements** — `bus-jeu.js` pour découpler logique et effets (`effets-partie.js`).
4. **HTML** — fragments `html/*.html` chargés par `charger-ecrans.js` (pas d'`innerHTML`).
5. **PWA** — cache listé dans `sw.js`, régénéré par `npm run sync:sw`.

## Partie solo (résumé)

`demarrerJeu()` → boucle RAF → gravité / DAS / lock → `verrouillerPiece()` → `score-partie.js` → rendu.

## Guides

- [Mode Histoire](mode-histoire.md)
- [Ajouter un biome](ajouter-un-biome.md)
- [Ajouter un boss](ajouter-un-boss.md)
- [Ajouter un écran](ajouter-un-ecran.md)
