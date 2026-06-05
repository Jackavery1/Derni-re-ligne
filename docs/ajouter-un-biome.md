# Ajouter un biome

Checklist pour étendre Tetris Néo avec un nouveau monde jouable.

## 1. Données et textes

| Fichier                 | Action                                       |
| ----------------------- | -------------------------------------------- |
| `js/biomes.js`          | Ajouter l’entrée biome (couleurs, lueur, id) |
| `js/contenu-jeu.js`     | Relique associée si applicable               |
| `js/reliques.js`        | Effet de la relique du biome                 |
| `tests/textes.test.mjs` | Vérifier les clés i18n requises              |

## 2. Sélection et UI

| Fichier                     | Action                                      |
| --------------------------- | ------------------------------------------- |
| `js/constellation.js`       | Position étoile / lien navigation           |
| `js/themes-biome.js`        | Thème mascotte et humeurs                   |
| `html/ecran-selection.html` | Aucun changement si constellation dynamique |

## 3. Mécanique « Vivant » (optionnel)

Si le biome a un comportement de plateau vivant :

| Fichier                   | Action                                                     |
| ------------------------- | ---------------------------------------------------------- |
| `js/vivant.js`            | Entrée dans `COMPORTEMENTS_VIVANT`                         |
| `js/vivant-strategies.js` | `REGISTRE_CALCUL_VIVANT` + `REGISTRE_DECLENCHEMENT_VIVANT` |
| `js/rendu-vivant.js`      | Signes visuels dans `dessinerSignesVie` si besoin          |
| `tests/vivant.test.mjs`   | Tests unitaires du comportement                            |

## 4. Audio et météo

| Fichier       | Action                                   |
| ------------- | ---------------------------------------- |
| `js/audio.js` | Intervalle mélodique du biome            |
| `js/meteo.js` | Événements météo spécifiques (optionnel) |

## 5. Progression

| Fichier               | Action                                               |
| --------------------- | ---------------------------------------------------- |
| `js/progression.js`   | Regex `tetrisNeo_record_[a-z]+` couvre les ids biome |
| `js/codex-donnees.js` | Entrée encyclopédie                                  |

## 6. Validation

```bash
npm test
npm run lint
npm run typecheck
npm run test:e2e
npm run sync:sw    # régénère le cache PWA dev
```

## Exemple minimal (biome sans Vivant)

1. Ajouter `monBiome` dans `js/biomes.js` avec `COMPORTEMENTS_VIVANT.monBiome = null`
2. Textes + relique + constellation
3. Lancer les tests ci-dessus
