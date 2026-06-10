# Politique de sécurité

## Versions supportées

| Version | Supportée |
| ------- | --------- |
| 2.5.x   | Oui       |
| 2.4.x   | Oui       |
| < 2.4   | Non       |

## Signaler une vulnérabilité

Dernière Ligne est une application **100 % client** (Vanilla JS, PWA). Il n'y a pas de backend ni de collecte de données personnelles côté serveur. **RGPD** : aucune donnée personnelle n'est transmise à un serveur ; seul le `localStorage`/`sessionStorage` local stocke la progression de jeu (scores, déblocages).

Si vous découvrez une faille de sécurité (XSS, contournement CSP, corruption localStorage, etc.) :

1. **Ne pas** ouvrir d'issue publique GitHub.
2. Utiliser [GitHub Security Advisories](https://github.com/security/advisories) (onglet _Security_ → _Report a vulnerability_) ou ouvrir une issue privée si le dépôt le permet.
3. Inclure : étapes de reproduction, impact estimé, version concernée.

Délai de réponse visé : **7 jours ouvrés**.

## Modèle de menaces

| Menace                     | Mitigation en place                                                                                                 | Risque résiduel                          |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| **XSS**                    | CSP stricte (`script-src 'self'`), pas de `innerHTML` sur contenu dynamique, fragments HTML chargés via `DOMParser` | Faible — contenu statique contrôlé       |
| **Injection localStorage** | Whitelist stricte de clés dans `progression.js`, validation regex (sans wildcard préfixe)                           | Faible — impact local uniquement         |
| **Clickjacking**           | CSP `frame-ancestors 'none'` dans `index.html`                                                                      | Faible                                   |
| **Cache poisoning SW**     | SW versionné (`derniere-ligne-{semver}`), notification MAJ, purge anciens caches                                    | Moyen — utilisateur peut retarder la MAJ |
| **Supply chain npm**       | 0 dépendance runtime, `npm audit` + Dependabot + CodeQL en CI                                                       | Faible                                   |
| **CSRF / SQLi**            | Non applicable (pas de backend)                                                                                     | N/A                                      |

## Bonnes pratiques en place

- Content-Security-Policy stricte (`index.html`, incluant `frame-ancestors 'none'`)
- Whitelist `localStorage` (`js/progression.js`)
- Aucune dépendance runtime npm
- Pas d'`innerHTML` sur des données utilisateur (DOM via `createElement` / `textContent`)
- `npm audit --audit-level=moderate` en CI
- Analyse CodeQL sur le dépôt
- Journal d'erreurs local (`sessionStorage`, mode debug via `?debug=1`)

## Données utilisateur

Scores, préférences et progression sont stockés **localement** (`localStorage`). Aucune transmission réseau hors chargement des assets statiques du jeu.

## Licence et intégrité

Le Logiciel est distribué sous licence propriétaire (voir [LICENSE](LICENSE)). Toute modification non autorisée du code ou des assets est interdite.

## Limites du déploiement GitHub Pages

GitHub Pages ne permet pas de configurer des en-têtes HTTP personnalisés (HSTS, `Referrer-Policy`, etc.). La CSP est donc déclarée via balise `<meta>`. Pour une défense en profondeur renforcée, un proxy (Cloudflare Pages, Netlify) peut ajouter ces en-têtes.

## Périmètre hors scope

- Triche locale (modification `localStorage` ou du code client) — aucun anti-triche côté serveur ; les scores locaux ne sont pas certifiés pour un usage compétitif en ligne.
- Problèmes liés au navigateur ou aux extensions tierces
