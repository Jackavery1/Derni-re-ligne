# Politique de sécurité

## Versions supportées

| Version | Supportée |
| ------- | --------- |
| 2.5.x   | Oui       |
| 2.4.x   | Oui       |
| < 2.4   | Non       |

## Signaler une vulnérabilité

Tetris Néo est une application **100 % client** (Vanilla JS, PWA). Il n'y a pas de backend ni de collecte de données personnelles côté serveur.

Si vous découvrez une faille de sécurité (XSS, contournement CSP, corruption localStorage, etc.) :

1. **Ne pas** ouvrir d'issue publique GitHub.
2. Décrire le problème par message privé au mainteneur du dépôt.
3. Inclure : étapes de reproduction, impact estimé, version concernée.

Délai de réponse visé : **7 jours ouvrés**.

## Modèle de menaces

| Menace                     | Mitigation en place                                                                                                 | Risque résiduel                          |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| **XSS**                    | CSP stricte (`script-src 'self'`), pas de `innerHTML` sur contenu dynamique, fragments HTML chargés via `DOMParser` | Faible — contenu statique contrôlé       |
| **Injection localStorage** | Whitelist de clés dans `progression.js`, validation regex                                                           | Faible — impact local uniquement         |
| **Cache poisoning SW**     | SW versionné (`tetris-neo-{semver}`), notification MAJ, purge anciens caches                                        | Moyen — utilisateur peut retarder la MAJ |
| **Supply chain npm**       | 0 dépendance runtime, `npm audit` + Dependabot + CodeQL en CI                                                       | Faible                                   |
| **CSRF / SQLi**            | Non applicable (pas de backend)                                                                                     | N/A                                      |

## Bonnes pratiques en place

- Content-Security-Policy stricte (`index.html`)
- Whitelist `localStorage` (`js/progression.js`)
- Aucune dépendance runtime npm
- Pas d'`innerHTML` sur des données utilisateur (DOM via `createElement` / `textContent`)
- `npm audit --audit-level=moderate` en CI
- Analyse CodeQL sur le dépôt
- Journal d'erreurs local (`sessionStorage`, mode debug via `?debug=1`)

## Données utilisateur

Scores, préférences et progression sont stockés **localement** (`localStorage`). Aucune transmission réseau hors chargement des assets statiques du jeu.

## Périmètre hors scope

- Triche locale (modification `localStorage` côté client)
- Problèmes liés au navigateur ou aux extensions tierces
