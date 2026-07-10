# Design tokens — Dernière Ligne

Référence unique des variables CSS (`styles/variables.css`) et de leur usage. Toute nouvelle couleur UI doit passer par un token existant ou être ajoutée ici avant usage dans les feuilles de style.

## Couleurs de base

| Token             | Valeur                   | Usage                                            |
| ----------------- | ------------------------ | ------------------------------------------------ |
| `--fond`          | `#08081a`                | Arrière-plan global                              |
| `--fond-panneau`  | `rgba(0,245,255,0.04)`   | Panneaux HUD, cartes                             |
| `--bordure`       | `rgba(0,245,255,0.2)`    | Contours néon discrets                           |
| `--texte`         | `#e0e0ff`                | Texte principal (contraste ≥ 4.5:1 sur `--fond`) |
| `--texte-dim`     | `rgba(224,224,255,0.75)` | Labels secondaires                               |
| `--texte-discret` | `rgba(224,224,255,0.52)` | Mentions tertiaires                              |

## Boutons discrets

| Token                            | Valeur    | Usage                              |
| -------------------------------- | --------- | ---------------------------------- |
| `--ui-bordure-discret`           | `#9a9ac8` | Contour `.bouton.discret`, options |
| `--ui-texte-discret-bouton`      | `#b8b8e0` | Texte boutons secondaires          |
| `--ui-fond-discret-bouton-hover` | `#b8b8e0` | Fond au survol boutons discrets    |

## Palette accent

| Token            | Valeur    | Usage                              |
| ---------------- | --------- | ---------------------------------- |
| `--cyan`         | `#00f5ff` | Primaire néon, focus, liens actifs |
| `--rose`         | `#ff006e` | Alerte, danger narratif            |
| `--rose-ui`      | `#ff2d78` | Boutons accent, CTA secondaires    |
| `--or-ui`        | `#ffbb44` | Dégradés chauds (profil, titres)   |
| `--vert`         | `#00ff88` | Succès, validation                 |
| `--jaune`        | `#ffe600` | Score, records                     |
| `--violet`       | `#b400ff` | Boss, mystère                      |
| `--orange`       | `#ff8800` | Avertissements gameplay            |
| `--bleu`         | `#4488ff` | Infos, liens froids                |
| `--accent-carte` | `#6644cc` | Carte histoire, chemins            |

## Boutons menu titre (modes libre / collection)

Tokens `--menu-*` dans `variables.css`, consommés par `menu-narratif-cutscene.css` (variantes `.btn-jouer`, `.btn-architecte`, etc.) et `menu-narratif-base.css` (campagne, options titre, dialogues).

| Token                   | Usage                                  |
| ----------------------- | -------------------------------------- |
| `--menu-jouer-*`        | Mode libre — constellation             |
| `--menu-architecte-*`   | Mode architecte                        |
| `--menu-codex-*`        | Codex                                  |
| `--menu-profil-*`       | Profil joueur                          |
| `--menu-achievements-*` | Succès (texte : `--or-ui`)             |
| `--menu-separateur*`    | Séparateurs « LIBRE » / « COLLECTION » |
| `--menu-base-*`         | Style `.btn-menu` par défaut           |
| `--menu-continuer-*`    | Bouton Continuer (campagne)            |
| `--menu-nouvelle-*`     | Bouton Nouvelle partie                 |
| `--menu-options-*`      | Bouton Options sur l'écran titre       |
| `--menu-dialog-*`       | Dialog confirmation nouvelle partie    |
| `--menu-danger-texte`   | Bouton danger dans les dialogues       |

## Thème dynamique (biomes)

| Token              | Défaut                | Usage                     |
| ------------------ | --------------------- | ------------------------- |
| `--theme-primaire` | `var(--cyan)`         | Surchargé par biome actif |
| `--theme-score`    | `var(--jaune)`        | Chiffres score / combo    |
| `--theme-accent`   | `var(--cyan)`         | Highlights contextuels    |
| `--theme-fond`     | `var(--fond-panneau)` | Fond panneau thématisé    |
| `--theme-bordure`  | `var(--bordure)`      | Bordure panneau           |
| `--theme-canvas`   | `var(--cyan)`         | Grille plateau            |

## Typographie

| Token             | Police         | Usage                  |
| ----------------- | -------------- | ---------------------- |
| `--font-titre`    | Press Start 2P | Titres écran, logo     |
| `--font-stats`    | Orbitron       | Chiffres HUD, timers   |
| `--font-ui`       | Rajdhani       | Boutons, menus, labels |
| `--font-narratif` | Crimson Pro    | Dialogues, cutscenes   |

Échelles : `--taille-titre-xl` … `--typo-narratif` (voir `variables.css`). HUD micro : `--typo-hud-micro`.

## Espacement

`--space-1` (4px) à `--space-6` (32px). Labels stats : `--espacement-label-stats`.

## Safe area (mobile / PWA)

`--safe-top`, `--safe-right`, `--safe-bottom`, `--safe-left` — alimentés par `env(safe-area-inset-*)`.

## Breakpoints responsive

Référence des seuils CSS récurrents (`styles/responsive.css` et feuilles par écran) :

| Seuil               | Usage typique                                                                                      |
| ------------------- | -------------------------------------------------------------------------------------------------- |
| `max-width: 520px`  | Menu titre compact (`ecran-titre-menu.css`)                                                        |
| `max-width: 768px`  | HUD, pause, codex, histoire, letterbox mobile                                                      |
| `max-height: 600px` | HUD réduit, objectifs histoire                                                                     |
| `max-width: 480px`  | Typo micro, portraits boss                                                                         |
| `max-width: 360px`  | Mécaniques histoire très étroites                                                                  |
| Paysage étroit      | `max-height: 768px` + `max-width: 900px` — pas d'overlay orientation bloquant (letterbox + scroll) |

Résolution interne jeu : 1024×576, scale via `--iface-scale` (`js/rendu/layout-jeu.js`).

## Intentions UX

- **Contraste** : texte principal et boutons `.bouton` visent WCAG AA (4.5:1) ; tests Axe dans `e2e/a11y.spec.mjs` et `e2e/audit-e-ui-ux.spec.mjs`.
- **Cibles tactiles** : `.bouton` et `.btn-menu` min 48×48px (`styles/ecrans-base.css`, `styles/menu-narratif-base.css`).
- **Motion** : `prefers-reduced-motion` réduit les animations longues (test E3a).
- **Letterbox** : `--iface-scale` applique un scale uniforme sans déformation du canvas (`js/rendu/layout-jeu.js`).

## Hors tokens

Les couleurs de tetrominos et biomes vivent dans `js/config/biomes.js` (données gameplay, pas UI chrome). Éviter les hex littéraux dans le CSS hors `variables.css` ; en JS préférer `getComputedStyle(document.documentElement).getPropertyValue('--cyan')` si besoin runtime.
