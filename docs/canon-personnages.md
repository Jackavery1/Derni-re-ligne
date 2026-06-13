# CANON VISUEL DES PERSONNAGES — Dernière Ligne

## D'après les références Leonardo validées (12 juin 2026)

### À placer dans le dépôt : docs/canon-personnages.md

Ce document est la SOURCE DE VÉRITÉ pour le rendu Canvas des portraits.
Les images Leonardo sont des RÉFÉRENCES de design — les portraits du jeu
restent dessinés en Canvas (décision actée). Règle de conflit : quand un
trait existant en jeu est marqué « PRIORITAIRE », il l'emporte sur l'image.

Convention générale : fond du portrait transparent (le fond atmosphérique
par personnage existe déjà dans le système de cutscenes). Tous les hex sont
des constantes à coder en dur (leçon du premier renderer ROBO cassé).

---

## 1. ROBO — protagoniste (référence : image saut, anneaux spirale)

**Rôle visuel** : attachant, souriant, énergique. C'est le visage du jeu.

**Palette**

- Tête : rouge `#d62b2b`, bande inférieure plus sombre `#a81f1f`,
  rivets `#7a1515`
- Yeux : NOUVEAU CANON (décision Joris, 12 juin) — alignés sur l'image
  de référence : grands yeux ronds à sclère blanche `#eaf6ff`, pupilles
  larges bleu-canard sombre `#1a3c46`, point de brillance blanc en haut à
  gauche de chaque œil + micro-reflet secondaire, léger écart asymétrique
  des pupilles qui donne la vie, contour d'œil fin sombre `#5a1010`.
  **ANTI-REGARD-VIDE (défaut constaté sur le rendu actuel, 13 juin)** :
  pupilles GRANDES (≈ 45–55 % du diamètre de l'œil, pas des billes) et
  CENTRÉES vers le joueur en humeur neutre — jamais petites et fuyantes
  vers le côté. Les yeux occupent une part généreuse de la tête (chaque
  œil ≈ 30 % de la largeur du visage).
- Bouche : **GRILLE DE DENTS SUPPRIMÉE** (décision Joris, 13 juin — elle
  éteignait le visage). Nouveau système :
    - Repos / neutre : ARC NÉON cyan `#35e0e6`, trait épais (~6–8 % de la
      largeur de la tête) à bouts arrondis, coins nettement remontants —
      un sourire franc, lisible même à la taille mascotte.
    - Joie / excitation : SOURIRE OUVERT — demi-lune sombre `#0d2b2e`
      bordée de cyan `#35e0e6`, petite langue cyan en bas. Réservé aux
      humeurs joyeuses (Tetris, victoire, achievement).
    - Les autres humeurs déclinent l'arc : tristesse = arc inversé court,
      surprise = petit « o », alerte = trait court horizontal, etc. —
      adapter chaque humeur existante de rendu-robo.js à ce vocabulaire.
- Antenne : tige grise `#9aa3ad`, lumière verte `#4bff5a` avec halo de
  3–4 pixels satellites
- Torse : violet `#7a4fc0`, panneau central sombre `#2a1840` avec circuits
  magenta `#ff2d78` et nœuds cyan `#35e0e6`
- Bras/jambes : ressorts gris `#9aa3ad` (4–5 spires), pinces violettes
  `#5a3a8a`, bottes rouges `#d62b2b`

**Lecture de pose (référence)** : saut joyeux, bras levés, lignes de
mouvement sous les bottes, ombre portée elliptique. À transposer en
animation d'idle : oscillation verticale ±2 px sur les ressorts,
clignement des yeux toutes les 3–5 s (déterministe sur timestamp),
pulsation douce de la lumière d'antenne.

**Humeurs** : DÉLÉGUÉES à rendu-robo.js (vocabulaire existant — ne pas
dupliquer). Le portrait cutscene consomme le même renderer ou la même
table d'états.

---

## 2. VERA — créatrice (référence : buste DE FACE, casque arrondi, halo)

⚠️ Référence mise à jour (13 juin) : l'image « looking at us » remplace la
première (regard levé). VERA regarde le joueur — c'est la bonne pose pour
le dialogue.

**Silhouette — consignes ANTI-DALLE (le rendu actuel en jeu est une
plaque rectangulaire à corriger)** :

- Le buste N'EST PAS un rectangle : épaules tombantes distinctes, cou
  visible, tête détachée du tronc.
- Proportions à l'échelle du portrait : tête (casque compris) ≈ 40 % de
  la hauteur du buste ; largeur d'épaules ≈ 2,2× la largeur du cou.
- Le visage est STRUCTURÉ : sourcils, yeux, nez (2–3 px d'ombre), lèvres,
  menton/mâchoire. Pas de visage-bille.

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
- Variantes d'humeur ROBO si besoin de références supplémentaires
