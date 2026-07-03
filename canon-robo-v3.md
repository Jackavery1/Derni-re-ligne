# CANON ROBO V3 — « L'écran-visage »

Remplace intégralement le design ROBO du canon-personnages.md. Les autres personnages ne changent pas.

## 1. Diagnostic du design actuel (pourquoi on repart de zéro)

- **Palette étrangère** : rouge pompier + violet + gris sur un univers navy/cyan/magenta. ROBO jure avec chaque décor du jeu, y compris son propre panneau in-game.
- **Style incohérent** : rendu clipart brillant (dégradés lisses, rivets décoratifs) face à des fonds pixel-art tamisés.
- **Silhouette encombrée** : tête rectangulaire + torse rectangulaire + bras segmentés + jambes grêles + pieds. Cinq masses visuelles pour un mascot, c'est trois de trop.
- **Regard vide** : yeux blancs à petites pupilles décentrées → expression absente, pas attachante.

## 2. Principe directeur

ROBO est une **capsule douce à écran-visage** : une seule masse arrondie, un écran sombre légèrement bombé qui occupe la face avant, sur lequel les yeux sont des **glyphes de lumière cyan**. Toute l'expressivité passe par trois canaux : les glyphes des yeux, l'antenne, et la fenêtre-compartiment du torse. C'est le langage d'EVE, BMO et Astro Bot, adapté à la Trame.

Justification narrative : ROBO est né dans la Trame, fait pour elle. Son visage est un écran parce qu'il est littéralement une petite fenêtre sur la Trame — et son compartiment (« que je ne savais pas avoir ») est visible sur son torse.

## 3. Silhouette et proportions

- **Corps unique** : capsule verticale arrondie (ratio largeur/hauteur ≈ 0.72). Pas de tête séparée — la capsule EST la tête et le corps.
- **Écran-visage** : occupe ~65–70 % de la moitié supérieure de la face avant. Forme : rectangle très arrondi (coins ≈ 30 % du rayon), légèrement bombé (un reflet courbe discret en haut à gauche suffit à le suggérer).
- **Fenêtre-compartiment** : sur le bas de la capsule, petite fenêtre arrondie (~22 % de la largeur) laissant voir une mini-grille 3×2 de cellules. Cinq cellules allumées en cyan doux, **une cellule éteinte** — la ligne incomplète qu'il porte en lui. (Dans les fins, cette cellule peut s'allumer : détail réservé aux épilogues.)
- **Mains flottantes** : deux mitaines arrondies, détachées du corps (pas de bras). Elles flottent à mi-hauteur, légèrement écartées.
- **Pieds** : deux demi-capsules courtes directement sous le corps (pas de jambes). ROBO « marche dans ses traces » — il garde des pieds, mais trapus et simples.
- **Antenne** : une seule, fine, avec un bout sphérique lumineux cyan. C'est l'amplificateur émotionnel n°1.

Silhouette totale = 4 masses : capsule, deux mains, antenne (+ pieds fusionnés à la base). Lisible en 24×24 px.

## 4. Palette (hex canoniques)

| Élément                | Hex                        | Note                                                              |
| ---------------------- | -------------------------- | ----------------------------------------------------------------- |
| Coque                  | `#e6ecf7`                  | Blanc lunaire légèrement bleuté — contraste maximal sur `#08081a` |
| Ombre de coque         | `#b8c4dd`                  | Une seule teinte d'ombre, pas de dégradés                         |
| Écran-visage           | `#070a1c`                  | Presque le navy du fond, mais distinct                            |
| Glyphes yeux + glow    | `#00f5ff`                  | Cyan canonique ROBO (inchangé, c'est déjà sa couleur UI)          |
| Bout d'antenne         | `#00f5ff`                  | Même cyan, halo doux                                              |
| Mini-grille torse      | `#00f5ff` à 60 % d'opacité | Cellule éteinte : `#1a2340`                                       |
| Liseré écran / fenêtre | `#b8c4dd`                  | Fin, discret                                                      |

**Interdits** : rouge, violet (couleur de La Distorsion), rose (VERA), jaune (SYSTÈME). ROBO possède le cyan + blanc. Aucun dégradé complexe, aucun rivet, aucune texture métallique.

## 5. Les yeux-glyphes — table des humeurs

Les yeux sont dessinés sur l'écran, jamais de sclère blanche. Deux glyphes symétriques + variations. Correspondance directe avec les valeurs `humeur` des fichiers narratifs :

| Humeur           | Glyphes                                     | Description                                                                                  |
| ---------------- | ------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `neutre`         | `( ● ● )`                                   | Deux disques arrondis moyens, très légèrement ovales verticaux                               |
| `content`        | `( ^ ^ )`                                   | Deux arcs convexes (yeux plissés de sourire)                                                 |
| `excite`         | `( ✦ ✦ )` ou grands disques + double reflet | Yeux agrandis ~130 %, l'antenne se dresse                                                    |
| `triste`         | `( ● ● )` inclinés + plus bas               | Disques réduits ~80 %, coins externes tombants, positionnés plus bas sur l'écran             |
| `alerte`         | `( ▮ ▮ )`                                   | Deux traits verticaux fins, écran légèrement plus lumineux                                   |
| _(bonus Tetris)_ | `( ▪ ▪ )`                                   | Pendant 600 ms après un Tetris : les yeux deviennent deux mini-carrés — ROBO est fait du jeu |

Pas de bouche par défaut : l'écran-visage n'en a pas besoin (EVE n'en a pas). En `content` fort ou dans les fins, un petit arc cyan sous les yeux est autorisé — c'est l'héritier direct de l'« arc néon » déjà validé.

## 6. L'antenne — second canal émotionnel

| Humeur    | Position                                                     |
| --------- | ------------------------------------------------------------ |
| `neutre`  | Verticale, oscillation lente (déterministe, basée timestamp) |
| `content` | Légèrement inclinée, rebond doux                             |
| `excite`  | Dressée + bout qui pulse                                     |
| `triste`  | Tombante vers l'avant, bout atténué à 40 %                   |
| `alerte`  | Rigide, bout clignotant lent                                 |

## 7. Cohérence inter-écrans

- **Cutscenes** : version complète (capsule + mains + pieds + antenne).
- **Panneau in-game** : buste (capsule + antenne), les humeurs suivent les événements de jeu (Tetris → bonus, danger de hauteur → `alerte`, game over → `triste`).
- **Portraits de dialogue** : cadrage écran-visage + antenne.
- Même palette et mêmes glyphes partout — c'est la règle qui rendra ROBO « présent partout » sans jamais jurer.

## 8. Prompts Leonardo.ai

Générer d'abord **une seule image de référence maîtresse** (pose neutre, face), la valider, puis décliner. Format 1024×1024, fond uni pour détourage.

**Prompt maître (référence neutre) :**

```
Cute minimalist robot mascot character, single soft rounded capsule body in pale
bluish-white (#e6ecf7), large slightly curved dark navy screen face (#070a1c)
covering most of the front, two glowing cyan round eyes (#00f5ff) drawn as simple
light glyphs on the screen, no mouth, one thin antenna with a small glowing cyan
tip, two small floating rounded mitten hands detached from the body, two short
stubby rounded feet, small rounded window on the lower body showing a tiny 3x2
grid of soft cyan cells with one cell dark, flat vector style with minimal
shading, clean silhouette, front view, centered, plain dark navy background
(#08081a), synthwave ambient glow, no text
```

**Négatif :** `red, purple, pink, yellow, metallic texture, rivets, segmented arms, human features, white eyeballs, gradients, complex machinery, weapon`

**Déclinaisons** (changer uniquement la fin du prompt maître) :

- `content` : `...eyes as two upward curved arcs like a warm smile, antenna slightly tilted...`
- `triste` : `...smaller dimmed eyes placed lower on the screen with drooping outer corners, antenna drooping forward, tip dim...`
- `excite` : `...oversized sparkling eyes with double highlights, antenna fully upright with bright pulsing tip...`
- `alerte` : `...eyes as two thin vertical light bars, screen slightly brighter, antenna rigid...`

**Règle de tri** : rejeter toute génération avec sclère blanche, bouche à dents, plus d'une antenne, membres segmentés, ou toute couleur hors palette. Régénérer plutôt qu'accepter un compromis.

## 9. Plan d'intégration (à ne PAS lancer avant validation des images)

1. **Génération Leonardo + validation visuelle par Joris** (référence maîtresse d'abord, seule).
2. **PROMPT-ROBO-V3-A** : remplacement des assets portraits (cutscenes + dialogues). Aucune logique.
3. **PROMPT-ROBO-V3-B** : panneau in-game (buste + mapping humeurs↔événements de jeu). NO-OP si `store.modeHistoireActif === false` pour tout ce qui est narratif ; le panneau Arcade garde un ROBO neutre.
4. **PROMPT-ROBO-V3-C** (optionnel, plus tard) : yeux-glyphes procéduraux en Canvas pour l'in-game (interpolation déterministe entre états, zéro Math.random dans la boucle de rendu) — permet des transitions douces au lieu de swaps d'images.

Chaque étape = un prompt, un commit, test entre les deux, bump SW à chaque livraison. ROBO reste le dernier gros chantier visuel avant les régressions possibles : ne pas paralléliser avec les prompts narratifs.
