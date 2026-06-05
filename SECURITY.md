# Politique de sécurité

## Versions supportées

| Version | Supportée |
| ------- | --------- |
| 2.5.x   | Oui       |
| 2.4.x   | Oui       |
| < 2.4   | Non       |

## Signaler une vulnérabilité

Tetris Néo est une application **100 % client** (Vanilla JS, PWA). Il n'y a pas de backend ni de collecte de données personnelles.

Si vous découvrez une faille de sécurité (XSS, contournement CSP, corruption localStorage, etc.) :

1. **Ne pas** ouvrir d'issue publique GitHub.
2. Décrire le problème par message privé au mainteneur du dépôt.
3. Inclure : étapes de reproduction, impact estimé, version concernée.

Délai de réponse visé : **7 jours ouvrés**.

## Bonnes pratiques en place

- Content-Security-Policy stricte (`index.html`)
- Whitelist `localStorage` (`js/progression.js`)
- Aucune dépendance runtime npm
- Pas d'`innerHTML` sur des données utilisateur (DOM via `createElement` / `textContent`)
- `npm audit --audit-level=high` en CI (deploy)
- Analyse CodeQL sur le dépôt

## Périmètre hors scope

- Triche locale (modification `localStorage` côté client)
- Problèmes liés au navigateur ou aux extensions tierces
