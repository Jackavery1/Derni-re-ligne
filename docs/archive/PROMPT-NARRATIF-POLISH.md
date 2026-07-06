# Archivé — prompt one-shot (polish éditorial v2.5.x)

Les chemins ci-dessous sont obsolètes : les fichiers vivent sous `js/histoire-textes/`.
Les corrections listées ont été appliquées ou intégrées au dépôt.

---

# PROMPT-NARRATIF-POLISH — Polish éditorial du mode Histoire (10 corrections)

## Contexte

Tu travailles sur « Dernière Ligne », un Tetris narratif en Vanilla JS / Canvas 2D, PWA, CSP-strict, zéro dépendance runtime. Tout le code, les commentaires et les données sont en français.

Cette tâche est un **polish purement éditorial** : elle ne touche **que des données textuelles** (chaînes `texte` et valeurs `humeur`) dans les fichiers de contenu narratif. Aucune logique, aucun import, aucune structure d'objet ne doit changer.

Fichiers concernés (chemins actuels) :

- `js/histoire-textes/chapitres.js`
- `js/histoire-textes/cutscenes-entree-prologue.js`
- `js/histoire-textes/cutscenes-entree-ocean.js`
- `js/histoire-textes/cutscenes-entree-finale.js`
- `js/histoire-textes/cutscenes-post-monde.js`
- `js/histoire-textes/cutscenes-boss-victoire.js`
- `js/histoire-textes/dialogues-boss.js`
- `js/histoire-textes/intro-interludes.js`
- `js/histoire-textes/journaux.js`

## Phase 0 — Audit (OBLIGATOIRE avant toute modification)

1. Ouvre chaque fichier listé et vérifie que les chaînes citées ci-dessous existent **exactement** telles que citées.
2. **STOP** si une chaîne citée est introuvable ou apparaît plusieurs fois : signale-le et attends confirmation, ne devine pas.
3. **STOP** si un fichier contient de la logique (fonctions, conditions) là où tu t'apprêtes à éditer : ces fichiers sont censés être de la donnée pure.
4. Profite de l'audit pour **lister** (sans les corriger) toute autre incohérence texte↔humeur que tu repères, en fin de rapport. Ne corrige que les cas explicitement listés ci-dessous.

## Corrections à appliquer

(Voir historique git — contenu conservé pour référence archivistique.)
