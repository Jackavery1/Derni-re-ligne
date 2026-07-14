# Checklist iPhone — release PWA mobile

## Automatisé (CI / local)

```bash
npm run verify:iphone-checklist
```

Couvre les 8 points de simulation safe-area (`e2e/checklist-iphone.spec.mjs`) :

1. Pause solo paysage — Reprendre sous encoche ≥ 48 px
2. Pause coop paysage — Reprendre et HUD ≥ 48 px
3. Game over solo paysage — boutons visibles
4. Carte histoire — en-tête et retour safe-area
5. Journal histoire — scrollable, fermer ≥ 48 px
6. Cutscene portrait 319 px — Suivant/Passer visibles
7. Architecte portrait — contrôles utilisables
8. Architecte paysage — contrôles tactiles ≥ 48 px

Complète `audit-c-responsive` (profils iPhone 14 / 15 Pro / SE simulés).

## Manuel (device physique requis)

Avant tag release mobile, installer la PWA en **standalone** sur iPhone réel et valider :

| #   | Scénario                    | Critère                                    |
| --- | --------------------------- | ------------------------------------------ |
| M1  | Pause solo paysage          | Reprendre accessible sous encoche, ≥ 48 px |
| M2  | Pause coop paysage          | Idem + pause HUD mobile                    |
| M3  | Game over solo/coop paysage | Boutons sans scroll horizontal             |
| M4  | Carte histoire              | En-tête + retour dans safe-area            |
| M5  | Journal                     | Scroll fluide, fermer ≥ 48 px              |
| M6  | Cutscene 319 px             | Portraits + boutons visibles               |
| M7  | Architecte portrait/paysage | Contrôles au doigt, pas d’overlay bloquant |
| M8  | Narratif boss 480 px        | HUD boss + portrait sans débordement       |

Annoter les écarts dans une issue GitHub. Ne pas retirer la simulation CSS tant que le test physique n’est pas couvert.

## Commandes associées

```bash
npm run test:e2e:checklist-iphone   # alias identique
npm run test:e2e:responsive         # audit C complet + checklist
```
