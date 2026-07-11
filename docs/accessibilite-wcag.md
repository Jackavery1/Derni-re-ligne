# Accessibilité et WCAG

## Objectif

Dernière Ligne vise **WCAG 2.1 niveau AA** sur les écrans HTML (menus, options, codex, profil, memorial, histoire). Le plateau de jeu reste principalement **Canvas** : l’information critique (score, pause, game over) est aussi portée par le DOM (`aria-live`, écrans dédiés).

Ce document n’est **pas une certification WCAG formelle** ; il décrit le périmètre testé et les choix assumés.

## Mesures en place

| Mesure             | Implémentation                                                            |
| ------------------ | ------------------------------------------------------------------------- |
| Navigation clavier | Focus visible, raccourcis documentés (Options → Contrôles)                |
| Lecteurs d’écran   | `#annonce-jeu` (`aria-live`), bannière erreur (`role="alert"`), skip link |
| Daltonien          | Motifs sur cellules actives et previews (`accessibilite.js`)              |
| Mouvement réduit   | `prefers-reduced-motion`, classe `effets-reduits`                         |
| Contraste          | Tests Axe `color-contrast` sur écrans principaux (`e2e/a11y.spec.mjs`)    |
| Tutoriel           | Focus trap documenté et testé                                             |

## Tests automatisés

- **`e2e/a11y.spec.mjs`** — violations Axe critiques/sérieuses (hors contraste optionnel) sur titre, sélection, pause, game over, codex, profil, achievements, options.
- **`e2e/histoire.spec.mjs`** — carte histoire (violations critiques).
- **`e2e/smoke-core.spec.mjs`** — contraste écran titre et options.

Commande : `npm run test:e2e -- e2e/a11y.spec.mjs`

## Limites connues

- **Canvas Tetris** : pas de grille DOM cellule par cellule ; le ghost et le hold sont visuels uniquement.
- **Effets visuels** : particules et portraits peuvent être réduits via Options → Accessibilité.
- **GitHub Pages** : pas de personnalisation d’en-têtes HTTP (voir [SECURITY.md](../SECURITY.md)).

## Ajouter un écran

1. HTML sémantique dans `html/*.html` (boutons, labels, `aria-*` si besoin).
2. Test Axe dans `e2e/a11y.spec.mjs` (critiques + contraste si texte dense).
3. Vérifier navigation clavier manuelle sur viewport 390×844.
