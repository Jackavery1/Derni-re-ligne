# CANON VISUEL DES PERSONNAGES — Dernière Ligne

## D'après les références Leonardo validées (12 juin 2026)

Ce document est la SOURCE DE VÉRITÉ pour le rendu Canvas des portraits.
Les images Leonardo sont des RÉFÉRENCES de design — les portraits du jeu
restent dessinés en Canvas (décision actée). Règle de conflit : quand un
trait existant en jeu est marqué « PRIORITAIRE », il l'emporte sur l'image.

Convention générale : fond du portrait transparent (le fond atmosphérique
par personnage existe déjà dans le système de cutscenes). Tous les hex sont
des constantes à coder en dur (leçon du premier renderer ROBO cassé).

**ROBO** : canon v3 « écran-visage » (implémenté dans `js/rendu-robo-donnees.js`).
L'ancien design rouge/violet est obsolète.

---

## 1. ROBO — protagoniste (canon v3 « L'écran-visage »)

**Rôle visuel** : attachant, minimaliste, cohérent avec l'univers navy/cyan.
C'est le visage du jeu.

**Principe** : capsule douce à écran-visage — une masse arrondie, un écran
sombre bombé sur la face avant, yeux en glyphes cyan. Expressivité via trois
canaux : glyphes des yeux, antenne, fenêtre-compartiment du torse.

**Silhouette**

- Corps unique : capsule verticale (ratio largeur/hauteur ≈ 0,72), pas de tête séparée
- Écran-visage : ~65–70 % de la moitié supérieure, rectangle très arrondi, léger bombé
- Fenêtre-compartiment : ~22 % de la largeur, mini-grille 3×2 — cinq cellules cyan,
  **une cellule éteinte** (ligne incomplète qu'il porte ; peut s'allumer en fin)
- Mains flottantes : deux mitaines arrondies détachées
- Pieds : deux demi-capsules courtes sous le corps
- Antenne : fine, bout sphérique cyan — amplificateur émotionnel n°1
- Lisible en 24×24 px (4 masses : capsule, deux mains, antenne)

**Palette**

| Élément                | Hex            | Note                        |
| ---------------------- | -------------- | --------------------------- |
| Coque                  | `#e6ecf7`      | Blanc lunaire bleuté        |
| Ombre de coque         | `#b8c4dd`      | Une teinte, pas de dégradés |
| Écran-visage           | `#070a1c`      | Navy distinct du fond       |
| Glyphes yeux + glow    | `#00f5ff`      | Cyan canonique ROBO         |
| Bout d'antenne         | `#00f5ff`      | Halo doux                   |
| Mini-grille torse      | `#00f5ff` 60 % | Cellule éteinte : `#1a2340` |
| Liseré écran / fenêtre | `#b8c4dd`      | Fin, discret                |

**Interdits** : rouge, violet (Distorsion), rose (VERA), jaune (SYSTÈME).
Aucun dégradé complexe, rivet ni texture métallique.

**Yeux-glyphes (humeurs narratives)**

| Humeur           | Glyphes       | Description                            |
| ---------------- | ------------- | -------------------------------------- |
| `neutre`         | `( ● ● )`     | Deux disques moyens, légèrement ovales |
| `content`        | `( ^ ^ )`     | Deux arcs convexes (sourire)           |
| `excite`         | `( ✦ ✦ )`     | Yeux ~130 %, antenne dressée           |
| `triste`         | `( ● ● )` bas | Disques ~80 %, coins tombants          |
| `alerte`         | `( ▮ ▮ )`     | Traits verticaux fins                  |
| _(bonus Tetris)_ | `( ▪ ▪ )`     | 600 ms post-Tetris : mini-carrés       |

Pas de bouche par défaut. En `content` fort ou fins : petit arc cyan sous les yeux autorisé.

**Antenne (second canal)**

| Humeur    | Position                                 |
| --------- | ---------------------------------------- |
| `neutre`  | Verticale, oscillation lente (timestamp) |
| `content` | Légèrement inclinée, rebond doux         |
| `excite`  | Dressée + bout qui pulse                 |
| `triste`  | Tombante, bout à 40 %                    |
| `alerte`  | Rigide, bout clignotant                  |

**Cohérence inter-écrans**

- Cutscenes : capsule + mains + pieds + antenne
- Panneau in-game : buste (capsule + antenne), humeurs liées aux événements
- Portraits dialogue : cadrage écran-visage + antenne
- Même palette et glyphes partout

**Humeurs** : implémentées dans `js/rendu-robo.js` et `js/rendu-robo-donnees.js`.
Le portrait cutscene consomme le même vocabulaire.

---

## 2. VERA — créatrice (référence : buste DE FACE, casque arrondi, halo)

⚠️ Référence mise à jour (13 juin) : l'image « looking at us » remplace la
première (regard levé). VERA regarde le joueur — c'est la bonne pose pour
le dialogue.

**Silhouette — rendu en jeu (v2.5.34)** :

- **Primaire** : sprite `img/vera.png` (buste de face, regard joueur) via
  `js/portrait-vera-assets.js` / `js/portrait-vera-rendu.js`.
- **Fallback** : canvas procédural (expressions `glitch`, scanlines) si le
  sprite n'est pas encore chargé.
- Le buste N'EST PAS un rectangle : épaules tombantes distinctes, cou
  visible, tête détachée du tronc (le sprite respecte cette lecture).
- Proportions à l'échelle du portrait : tête (casque compris) ≈ 40 % de
  la hauteur du buste ; largeur d'épaules ≈ 2,2× la largeur du cou.
- Le visage est STRUCTURÉ : sourcils, yeux, nez, lèvres, menton/mâchoire.

**Palette**

- Casque : coque arrondie bleu clair `#9ecde8`, reflets `#d4ecf8`,
  écouteurs latéraux `#7ab4d8`
- Visière : translucide — reflet diagonal clair `#c8ecf8`, teinte
  `#7fd4f0`, ombre `#3a7a96` ; les DEUX yeux restent lisibles à travers
- Yeux : bleus `#4a90c8`, stylisés (iris 2–3 px + point de brillance
  blanc), sourcils fins `#6a4a3a`
- Peau : `#e8b9a8`, ombres `#c89484`, lèvres `#c8786a`
- Cheveux : mèches auburn `#8a4a3a` qui dépassent du casque de part et
  d'autre du cou, reflets `#a8604a`
- Combinaison : blanc cassé `#e8edf5`, ombres de plis `#b8c4d6`, col haut
  zippé (fermeture `#8a98ac` centrale), liserés bleus `#3da8e0` suivant
  les coutures d'épaules
- Halo : anneau orbital magenta `#ff2d78` derrière la tête, passant
  devant ET derrière (deux arcs, comme l'anneau de l'Archiviste),
  particules magenta dispersées

**Pose canonique** : buste de face, regard vers le joueur, expression
calme et attentive.

**Humeurs (vocabulaire PROMPT A)** :

- `neutre` : pose canonique, halo en rotation lente
- `douce` : paupières mi-closes, micro-sourire, halo plus chaud (vers
  `#ff5a98`), particules ralenties
- `inquiete` : sourcils obliques, bouche fine, halo qui se fragmente
  (arc réduit ~220°), particules erratiques
- `determinee` : sourcils droits abaissés, bouche serrée, halo plein 360°
  plus fin et plus vif
- `glitch` (transmission dégradée) : décalage horizontal de bandes de
  scanlines (offset déterministe sur timestamp), désaturation partielle,
  halo clignotant, 1–2 colonnes de pixels déplacées

---

## 3. LE BRASIER — boss Ch. I (référence : étoile de feu cerclée)

**Lecture** : une étoile à pointes acérées qui DÉBORDE de son cercle de
contention — c'est son lore (« on ne lui a jamais appris à s'arrêter »).

**Palette** : strates du bord vers le cœur : rouge sombre `#8a1a1a` →
rouge `#d63a1a` → orange `#ff7a1a` → liseré jaune `#ffd23a` → cœur en
croix blanc-jaune `#fff6c0`. Cercle de contention fin `#c33a2a`. Braises
`#ff9a3a`. Fond prune (atmosphérique existant).

**Géométrie** : étoile à 8–10 pointes irrégulières (contour bruité
déterministe), inscrite dans un cercle fin dont 4–6 pointes DÉPASSENT
toujours. Cœur = croix à 4 branches, c'est son « regard ».

**États (calme / agressif / vacillant)** :

- `calme` : pulsation lente des strates (période ~2,4 s), braises qui
  montent doucement, cœur stable
- `agressif` : flammes du liseré qui crépitent (haute fréquence), pointes
  qui s'allongent au-delà du cercle, flash du cœur, braises x2 plus
  rapides
- `vacillant` : étoile qui rétrécit par à-coups, BRÈCHES sombres dans les
  strates, braises qui TOMBENT au lieu de monter, cœur qui faiblit
  (alterne `#fff6c0` / `#d6a83a`)

---

## 4. LA SENTINELLE — boss Ch. II (référence : hexagones concentriques)

**Lecture** : la perfection gelée, l'ordre immobile.

**Palette** : hexagones du bord vers le cœur : `#bfe6ff` → `#7ac4f0` →
`#4aa8e8`. Nœuds circulaires aux sommets `#d8f0ff`. Cœur en étoile blanche
`#f0faff` avec halo `#a8d8f8`. Cristaux dispersés `#6ab4e0`.

**Géométrie** : 3 hexagones concentriques à bords épais (3–4 px à
l'échelle du portrait), un nœud à chaque sommet, cœur étoilé = regard.

**États** :

- `calme` : rotation TRÈS lente des hexagones en sens alternés
  (extérieur horaire, milieu anti-horaire), scintillement doux des nœuds
- `agressif` : les hexagones se CONTRACTENT vers le centre par paliers
  secs (pas de fluidité — elle fige), nœuds qui flashent en séquence,
  cœur qui blanchit
- `vacillant` : un hexagone se DÉSYNCHRONISE (rotation saccadée,
  sommets décalés de quelques pixels), 2–3 nœuds éteints, cœur qui
  faiblit, fissures fines sur l'hexagone extérieur

---

## 5. L'ARCHIVISTE — boss Ch. III (référence : monolithe — CANONISÉ)

✅ CANONISÉ (décision Joris, 12 juin 2026) : le monolithe-livre à œil
scannant est le design officiel de l'Archiviste. Le portrait complet pour
`archiviste_voix` est donc débloqué — il remplace tout repli « sans
portrait » éventuellement appliqué via PROMPT-NARRATIF-QW.

**Palette** : faces du monolithe violet `#8d7bc0` (claire) / `#6a5a9a`
(médiane) / `#4a3d70` (ombre). Face supérieure : losanges concentriques
`#cfc4ee` → `#9a86d8` → cœur blanc `#f2eeff` (l'ŒIL). Cordes de données
`#cfc4ee` et `#9a86d8`. Anneau orbital sombre `#2e2450`. Fragments
flottants `#7a68a8`. Fente de lecture blanche `#f2eeff` sur le flanc.
Chevrons gravés `#564a82`.

**Géométrie** : monolithe isométrique vertical, œil-losange au sommet,
cordes verticales qui TOMBENT sous la base (comme des lignes de texte qui
se déversent), anneau orbital incliné qui passe devant ET derrière (deux
arcs), fragments en lévitation lente.

**États** :

- `calme` : cordes qui défilent lentement vers le bas, œil qui balaie
  (le point blanc du cœur se déplace lentement dans le losange),
  fragments en dérive douce
- `agressif` : cordes qui ACCÉLÈRENT et se densifient, anneau qui
  s'incline davantage, œil contracté et plus brillant, fragments aspirés
  vers le monolithe
- `vacillant` : cordes INTERROMPUES (segments manquants), œil qui
  clignote irrégulièrement, fragments qui s'éloignent, chevrons qui
  s'éteignent un à un

---

## 6. L'AVANT-GARDE — boss Ch. IV (référence : triangles entrelacés)

**Lecture** : des pièces qui s'emboîtent parfaitement — l'élève modèle de
la Distorsion, le miroir du gameplay lui-même.

**Palette** : triangle gauche magenta `#e02ad6` avec dégradé violet
`#9a4ae0` ; triangle droit cyan `#2ab8e8` avec dégradé bleu `#4a7ae8` ;
zone d'entrelacement : mélange violet clair `#b87ae8` + touches orange
`#ff8a4a` ; centre : trapèze OR `#ffc63a` (le regard) ; rayons or fins
`#ffd86a` ; étincelles multicolores (magenta/cyan/or/blanc).

**Géométrie** : deux triangles à contours épais néon entrelacés (chaque
contour passe alternativement devant/derrière l'autre — l'entrelacement
est ESSENTIEL), trapèze doré au centre exact, rayons sur les axes.

**États** :

- `calme` : respiration synchronisée des deux triangles (échelle ±2 %,
  même phase — ils sont accordés), rotation imperceptible des rayons
- `agressif` : les triangles se SÉPARENT puis se REVERROUILLENT d'un coup
  sec (cycle ~1,2 s), flash or des rayons à chaque verrouillage,
  étincelles projetées
- `vacillant` : DÉSACCORD — les deux respirations se décalent en phase,
  le triangle magenta perd de l'opacité par vagues, le trapèze central
  vacille, étincelles qui tombent

---

## 7. LE NARRATEUR / LA TRAME — identité visuelle (PAS un portrait)

Décision actée et CONFIRMÉE (12 juin) : le narrateur n'a ni portrait ni
humeur. Mode narrateur = letterbox + texte centré. Ce qui suit lui donne
une PRÉSENCE sans visage : un motif de la Trame utilisable en (a) texture
subtile des bandes letterbox, (b) scène d'intro/key art, (c) fond du
Mémorial.

**Concept** : un tissage horizontal de lignes lumineuses — toutes les
lignes jamais complétées, déposées en strates. Des fils convergent depuis
le haut (les parties en cours) et se fondent dans le tissage (les parties
achevées). Aucune figure, aucun œil, aucune silhouette.

**Palette** : fond `#08081a`, strates du tissage : or pâle `#d8b86a`,
cyan éteint `#4a8a96`, violet `#6a5a9a`, magenta rare `#a8336a` (les
lignes douloureuses), lueur de fusion blanche très discrète.

**Prompt Leonardo (EN)** :

```
16-bit pixel art, abstract cosmic weave seen from the front, hundreds of
thin horizontal luminous threads layered like sediment strata, pale gold
and muted cyan and deep violet threads with rare magenta ones, a few
vertical threads descending from above and merging into the weave with a
soft white fusion glow, dark navy void background #08081a, no characters,
no faces, no figures, no eyes, calm and ancient atmosphere, clean pixel
clusters, game cutscene background
Negative: humanoid, figure, silhouette of a person, face, eye, creature,
text, watermark, letterbox bars
```

(Ajouter le suffixe de style commun + Style Reference ~0.35 sur l'ancre
observatoire, comme pour les 18 scènes.)

---

## Manquants (références à générer plus tard, prompts déjà dans prompts-images-personnages.md)

- La Distorsion (mélancolie imposée — humeurs menacante/souffrante/curieuse/apaisee)
- Le Système (neutre/alerte)
