# Exclusions d’audit

Entrées **intentionnelles** : ne pas les lister comme points faibles, dette résiduelle ou recommandations dans les audits A–E.

| Exclusion                                   | Raison                                                             |
| ------------------------------------------- | ------------------------------------------------------------------ |
| Thème dark-only (pas de light theme)        | Direction artistique cyberpunk assumée                             |
| Plateau / portraits Canvas sans grille DOM  | Architecture de rendu ; miroir info via `aria-live` et écrans HTML |
| Campagne D9 complète (~60 min) hors PR      | Volontairement nightly (`test:e2e:d9`, `@slow`)                    |
| Pics difficulté Cyber / Éclipse / Glace     | `MONDES_VAGUES_INTENTIONNELLES` — design de campagne               |
| Hotspots JS 300–328 L (sous seuil CI 450 L) | Signal soft ; découpage non bloquant                               |
| Screenshot PWA `form_factor: narrow` absent | Pas d’asset fourni ; seul `wide` dans `manifest.json`              |
| Offline 1ʳᵉ visite scènes cutscene lazy     | Compromis eager/lazy documenté dans `CONTRIBUTING.md`              |
| Flaky E2E local si port 3000 déjà pris      | Environnement (`reuseExistingServer`) ; voir `CONTRIBUTING.md`     |

Voir aussi : `docs/architecture.md`, `docs/optimisation-poids.md`, `docs/accessibilite-wcag.md`.
