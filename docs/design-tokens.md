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

## Palette accent

| Token            | Valeur    | Usage                              |
| ---------------- | --------- | ---------------------------------- |
| `--cyan`         | `#00f5ff` | Primaire néon, focus, liens actifs |
| `--rose`         | `#ff006e` | Alerte, danger narratif            |
| `--rose-ui`      | `#ff2d78` | Boutons accent, CTA secondaires    |
| `--vert`         | `#00ff88` | Succès, validation                 |
| `--jaune`        | `#ffe600` | Score, records                     |
| `--violet`       | `#b400ff` | Boss, mystère                      |
| `--orange`       | `#ff8800` | Avertissements gameplay            |
| `--bleu`         | `#4488ff` | Infos, liens froids                |
| `--accent-carte` | `#6644cc` | Carte histoire, chemins            |

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

## Intentions UX

- **Contraste** : texte principal et boutons `.bouton` visent WCAG AA (4.5:1) ; tests Axe dans `e2e/a11y.spec.mjs` et `e2e/audit-e-ui-ux.spec.mjs`.
- **Cibles tactiles** : `.bouton` min 48×48px (`styles/ecrans-base.css`).
- **Motion** : `prefers-reduced-motion` réduit les animations longues (test E3a).
- **Letterbox** : `--iface-scale` applique un scale uniforme sans déformation du canvas (`js/rendu/layout-jeu.js`).

## Hors tokens

Les couleurs de tetrominos et biomes vivent dans `js/config/biomes.js` (données gameplay, pas UI chrome). Éviter les hex littéraux dans le CSS hors `variables.css` ; en JS préférer `getComputedStyle(document.documentElement).getPropertyValue('--cyan')` si besoin runtime.
