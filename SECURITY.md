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

| Menace                            | Mitigation en place                                                                                                 | Risque résiduel                            |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ |
| **XSS**                           | CSP stricte (`script-src 'self'`), pas de `innerHTML` sur contenu dynamique, fragments HTML chargés via `DOMParser` | Faible — contenu statique contrôlé         |
| **Intégrité JS prod**             | SRI `sha384` sur `bundle.js` (`npm run build` → `dist/index.html`)                                                  | Faible                                     |
| **Injection localStorage**        | Whitelist stricte de clés dans `progression.js`, validation regex (sans wildcard préfixe)                           | Faible — impact local uniquement           |
| **Clickjacking**                  | `frame-ancestors 'none'` via en-tête HTTP (GitHub Pages : commentaire + doc ; **inefficace en meta CSP**)           | Faible — iframe embedding                  |
| **Cache poisoning SW**            | SW versionné (`dl-shell-vN` / `dl-medias-vN`), notification MAJ, purge anciens caches                               | Moyen — utilisateur peut retarder la MAJ   |
| **Intégrité bundle prod**         | SRI `sha384` sur `js/bundle.js` dans `dist/index.html` (build CI)                                                   | Faible — dev local sans SRI volontairement |
| **Supply chain npm**              | 0 dépendance runtime, `npm audit` + Dependabot + CodeQL en CI                                                       | Faible                                     |
| **API test E2E (`__NEO_TEST__`)** | Exposée uniquement sur `localhost` / `127.0.0.1` ou avec `?neoTest=1` (`js/moteur/neo-test-api.js`)                 | Faible sur GitHub Pages sans paramètre     |
| **CSRF / SQLi**                   | Non applicable (pas de backend)                                                                                     | N/A                                        |

## Bonnes pratiques en place

- Content-Security-Policy stricte (`index.html`, `worker-src 'self'` ; `frame-ancestors` documenté en commentaire HTML — en-tête HTTP en prod si CDN)
- **SRI (Subresource Integrity)** sur le bundle prod (`dist/index.html` — `integrity="sha384-…"` + `crossorigin="anonymous"`, généré par `npm run build`)
- Whitelist `localStorage` (`js/progression.js`)
- Aucune dépendance runtime npm
- Pas d'`innerHTML` sur des données utilisateur (DOM via `createElement` / `textContent`)
- `npm audit --audit-level=moderate` en CI
- Analyse CodeQL sur le dépôt
- Journal d'erreurs local (`sessionStorage`, mode debug via `?debug=1`)
- API E2E `__NEO_TEST__` conditionnée (`js/moteur/neo-test-api.js`) — absente sur le déploiement public par défaut

## Données utilisateur

Scores, préférences et progression sont stockés **localement** (`localStorage`). Aucune transmission réseau hors chargement des assets statiques du jeu.

## Licence et intégrité

Le Logiciel est distribué sous licence propriétaire (voir [LICENSE](LICENSE)). Toute modification non autorisée du code ou des assets est interdite.

## Limites du déploiement GitHub Pages

GitHub Pages ne permet pas de configurer des en-têtes HTTP personnalisés (HSTS, `Referrer-Policy`, CSP via en-tête, etc.). Conséquences :

| Mesure     | Dev (`index.html`)                                   | Prod (`dist/index.html`)                          |
| ---------- | ---------------------------------------------------- | ------------------------------------------------- |
| CSP        | Balise `<meta http-equiv="Content-Security-Policy">` | Identique (copiée au build)                       |
| SRI bundle | Non (rechargement à chaque edit)                     | Oui — `sha384` recalculé à chaque `npm run build` |
| HSTS       | Non disponible                                       | Non disponible                                    |

Pour une défense en profondeur renforcée (CSP en en-tête HTTP, HSTS), un hébergeur avec en-têtes custom (Cloudflare Pages, Netlify) est recommandé.

## Périmètre hors scope

- Triche locale (modification `localStorage` ou du code client) — aucun anti-triche côté serveur ; les scores locaux ne sont pas certifiés pour un usage compétitif en ligne.
- Problèmes liés au navigateur ou aux extensions tierces
