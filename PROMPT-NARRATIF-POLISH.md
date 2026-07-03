# PROMPT-NARRATIF-POLISH — Polish éditorial du mode Histoire (10 corrections)

## Contexte

Tu travailles sur « Dernière Ligne », un Tetris narratif en Vanilla JS / Canvas 2D, PWA, CSP-strict, zéro dépendance runtime. Tout le code, les commentaires et les données sont en français.

Cette tâche est un **polish purement éditorial** : elle ne touche **que des données textuelles** (chaînes `texte` et valeurs `humeur`) dans les fichiers de contenu narratif. Aucune logique, aucun import, aucune structure d'objet ne doit changer.

Fichiers concernés (et uniquement ceux-là) :

- `chapitres.js`
- `cutscenes-entree-prologue.js`
- `cutscenes-entree-ocean.js`
- `cutscenes-entree-finale.js`
- `cutscenes-post-monde.js`
- `cutscenes-boss-victoire.js`
- `dialogues-boss.js`
- `intro-interludes.js`
- `journaux.js`

## Phase 0 — Audit (OBLIGATOIRE avant toute modification)

1. Ouvre chaque fichier listé et vérifie que les chaînes citées ci-dessous existent **exactement** telles que citées.
2. **STOP** si une chaîne citée est introuvable ou apparaît plusieurs fois : signale-le et attends confirmation, ne devine pas.
3. **STOP** si un fichier contient de la logique (fonctions, conditions) là où tu t'apprêtes à éditer : ces fichiers sont censés être de la donnée pure.
4. Profite de l'audit pour **lister** (sans les corriger) toute autre incohérence texte↔humeur que tu repères, en fin de rapport. Ne corrige que les cas explicitement listés ci-dessous.

## Corrections à appliquer

### 1. `chapitres.js` — vers_chapitre_1 : supprimer la révélation prématurée

Remplacer la ligne :

```
"Je commence à comprendre que ce n'était peut-être pas les lignes qu'elle voulait que je complète."
```

par :

```
"Elle n'a jamais fini sa phrase. Moi, je finirai les lignes. C'est un début."
```

(garder `humeur: 'neutre'`)

### 2. `chapitres.js` — vers_chapitre_4 : supprimer le commentaire du narrateur

Supprimer entièrement l'entrée :

```
{ personnage: 'narrateur', texte: "C'est la première fois que Robo exprime un doute et continue malgré tout." }
```

### 3. `journaux.js` — apres_fuochi : désamorcer le spoiler des feux d'artifice

Remplacer la ligne de VERA :

```
"...ces feux... je les ai allumés pour toi... pour que tu saches que la joie existe encore..."
```

par :

```
"...ces feux... regarde-les bien... rien ne brille tout seul, ici..."
```

(garder `humeur: 'douce'`)

### 4. Corrections d'humeurs (3 cas)

- `cutscenes-entree-prologue.js`, monde_boss_1 : ROBO « Alors je vais devoir t'éteindre. » → `humeur: 'neutre'` (au lieu de `'content'`)
- `cutscenes-entree-prologue.js`, monde_boss_1 : BRASIER « QUI APPROCHE ? » → `humeur: 'agressif'` (au lieu de `'calme'`)
- `cutscenes-entree-ocean.js`, monde_boss_2 : SENTINELLE « Vous bougez. Ça suffit. Le mouvement corrompt... » → `humeur: 'agressif'` (au lieu de `'calme'`)

### 5. Accents — convention : accents partout, y compris sur les majuscules et les lignes SYSTÈME

- `cutscenes-post-monde.js`, monde_foret : « Un bloc efface n'est pas un bloc détruit » → « Un bloc effacé... »
- `chapitres.js`, fin_vraie : « Ni completion pure ni incompletude pure » → « Ni complétion pure ni incomplétude pure »
- `journaux.js` : « INTERFERENCE METALLIQUE » → « INTERFÉRENCE MÉTALLIQUE » ; « BOUCLE PARADOXALE FERMEE » → « FERMÉE » ; « IMAGE INVERSEE » → « INVERSÉE » ; « DEPOT DANS LA TRAME » → « DÉPÔT DANS LA TRAME » ; « FIN DU DEPOT » → « FIN DU DÉPÔT » ; « TOP NON DEMANDE » → « TOP NON DEMANDÉ »

### 6. `dialogues-boss.js` — Sentinelle : le passage vous → tu devient un dispositif

Règle : la Sentinelle **vouvoie tant que ses certitudes tiennent**, et bascule au tutoiement au moment exact où son modèle craque (phase 2, déjà en tutoiement — ne pas y toucher).

- Phase 1 : « Tes pièces bougent trop. Le mouvement corrompt. J'ai des MILLÉNAIRES de données. » → « Vos pièces bougent trop. Le mouvement corrompt. J'ai des MILLÉNAIRES de données. »
- gameOver : « Le gel t'a eu. Reste immobile. C'est plus sûr. » → « Le gel vous a eu. Restez immobile. C'est plus sûr. »
- Ne rien changer d'autre : `cutscenes-entree-ocean.js` (vouvoiement au seuil) et `cutscenes-boss-victoire.js` (tutoiement après la défaite) sont déjà corrects vis-à-vis de cette règle.

### 7. `cutscenes-boss-victoire.js` — distorsion_secret : ne pas expliquer la métaphore

Remplacer :

```
"Je pleure. En binaire. 0 et 1. 0 pour ce que j'étais. 1 pour ce que je deviens."
```

par :

```
"Je pleure. En binaire."
```

(garder `humeur: 'apaisee'`)

### 8. `cutscenes-entree-prologue.js` — monde_boss_1 : souder les deux registres du Brasier

Insérer une nouvelle ligne **entre** « Tout ce qui me touche brûle. Pas par méchanceté. C'est juste... ce que je suis. » et la réplique de ROBO « Alors je vais devoir t'éteindre. » :

```
{
    scene: 'seuil_brasier',
    personnage: 'brasier',
    texte: "Mais approche, et c'est l'autre partie de moi qui te répondra.",
    humeur: 'calme',
},
```

### 9. `chapitres.js` — EPILOGUES fin_normale : ajouter un battement avant « mille ans »

Insérer une nouvelle ligne **entre** « VERA est libre. La Distorsion est vaincue. » et « Dans mille ans, peut-être... » :

```
{
    personnage: 'vera',
    texte: "C'est fini. Écoute... même le silence a changé.",
    humeur: 'douce',
},
```

### 10. `intro-interludes.js` — OUTRO_FINS fin_vraie : boucler le motif « quelque chose qui ressemble à »

Insérer une nouvelle ligne **entre** la réplique de La Distorsion « Bienvenue au club. » et la ligne SYSTÈME « FIN — L'HARMONIE » :

```
{
    personnage: 'robo',
    texte: "J'ai quelque chose qui ressemble à de la joie. Je ne le note plus. Je le garde.",
    humeur: 'content',
},
```

## Hors périmètre (NE PAS TOUCHER)

- Aucun fichier JS de logique (moteur, rendu, progression, cutscenes runtime).
- Aucune modification de structure : pas de nouvelle clé, pas de renommage de propriété, pas de réordonnancement autre que les 3 insertions spécifiées (points 8, 9, 10).
- `histoire-textes.js` / autres fichiers de données non listés.
- Les fonctions critiques du projet (`estPositionValide()`, `calculerDistanceChute()`, `tourner()`, `supprimerLignesCompletes()`, `adapterInterface()`, `dessinerCellule()`) — interdiction absolue.
- Pas de `console.log`, pas de styles inline, pas de refactoring opportuniste.

## Validation

1. Le jeu se lance, le mode Arcade est strictement inchangé (aucun fichier touché ne doit être importé par l'Arcade, vérifie-le).
2. Lancer le prologue en mode Histoire et vérifier que les cutscenes s'affichent sans erreur console.
3. Relire les 10 emplacements modifiés dans le jeu ou dans les fichiers.

## Commit

Un seul commit :

```
polish(narratif): 10 corrections éditoriales — logique, humeurs, accents, motifs
```

**Rappel : bump de la version du Service Worker à la livraison.**
