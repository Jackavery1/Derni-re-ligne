# Scripts archivés (one-shot)

Scripts de migration et d'extraction déjà appliqués au dépôt. **Ne pas exécuter en CI** — conservés comme référence historique pour les splits `js/`.

Inclus : `migrer-js-domaines.mjs`, `corriger-imports-js.mjs` (migration physique `js/<domaine>/`), `migrer-imports-config.mjs` (barrel `config.js` → imports directs).

Pour régénérer la doc modules : `npm run analyze`.
