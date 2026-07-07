# Pattern pour Ajouter une Mécaniq Histoire

**Document:** Guide standardisé pour implémenter une nouvelle mécanique histoire.

---

## Structure générale

Chaque mécanique histoire suit ce pattern:

```
js/
├── mecaniques-histoire.js          (barrel public)
├── mecaniques-histoire-queries.js  (état + getters)
└── mecaniques-histoire-{nom}.js    (logique spécifique)

styles/
└── mecaniques-histoire.css         (styles partagés)

data/
└── histoire-textes.json            (descriptions HUD + dialogues)
```

---

## 1. Créer le module logique

**Fichier:** `js/mecaniques-histoire-{nom}.js`

```javascript
import { etat } from './etat/store-jeu.js';
import { logger } from './logger.js';

/**
 * @param {number} biomeId
 * @returns {TypMecaniqueData}
 */
function _obtenirEtat(biomeId) {
    if (!etat.histoire.biomes[biomeId]._mecanique_nom) {
        etat.histoire.biomes[biomeId]._mecanique_nom = {
            actif: false,
            propriete1: 0,
            propriete2: null,
        };
    }
    return etat.histoire.biomes[biomeId]._mecanique_nom;
}

export function initialiserMecaniqueNom(biomeId) {
    const mec = _obtenirEtat(biomeId);
    mec.actif = true;
    // Init logique
    logger.debug('[mecanique-nom] init biome', biomeId);
}

export function appliquerMecaniqueNom(result, biomeId) {
    if (!estMecaniqueActive(biomeId)) return result;
    const mec = _obtenirEtat(biomeId);
    // Appliquer transformation
    return result;
}

export function nettoyerMecaniqueNom(biomeId) {
    if (etat.histoire.biomes[biomeId]?._mecanique_nom) {
        delete etat.histoire.biomes[biomeId]._mecanique_nom;
    }
}

export function estMecaniqueActive(biomeId) {
    return _obtenirEtat(biomeId).actif;
}
```

---

## 2. Enregistrer dans le barrel

**Fichier:** `js/mecaniques-histoire.js`

```javascript
import {
    initialiserMecaniqueNom,
    appliquerMecaniqueNom,
    nettoyerMecaniqueNom,
    estMecaniqueActive,
} from './mecaniques-histoire-nom.js';

export function initialiserMecaniquesHistoire(biomeId) {
    // ... autres
    initialiserMecaniqueNom(biomeId);
}

export function appliquerMecaniquesHistoire(result, biomeId) {
    // ... autres
    result = appliquerMecaniqueNom(result, biomeId);
    return result;
}

export function nettoyerMecaniquesHistoire(biomeId) {
    // ... autres
    nettoyerMecaniqueNom(biomeId);
}
```

---

## 3. Ajouter queries si nécessaire

**Fichier:** `js/mecaniques-histoire-queries.js`

```javascript
export function mecaniquNomActive(biomeId) {
    return estMecaniqueActive(biomeId);
}

export function obtenirPropriete(biomeId) {
    // Getter publique pour HUD/UI
}
```

---

## 4. Styles (optionnel)

**Fichier:** `styles/mecaniques-histoire.css`

```css
.plateau-mecanique-nom {
    /* styles spécifiques */
}

.plateau-mecanique-nom .cellule {
    /* transformation visuelle */
}
```

---

## 5. Textes HUD + dialogues

**Fichier:** `data/histoire-textes.json`

```json
{
    "DESCRIPTIONS_MECANIQUES": {
        "mecanique_nom": {
            "nom": "NOM MECANIQUE",
            "description": "Explication courte pour HUD"
        }
    },
    "DIALOGUES_COMBAT_BOSS": {
        "boss_id": {
            "avantMecanique": "Dialogue avant activation",
            "pendantMecanique": "Dialogue pendant",
            "apreMecanique": "Dialogue après effet"
        }
    }
}
```

---

## 6. Points d'intégration clés

### `verrouillerPiece()` → effets-partie.js

```javascript
const result = appliquerMecaniquesHistoire(result, biomeId);
```

### Lifecycle

```
initialiserMecaniquesHistoire()
    ↓
appliquerMecaniquesHistoire() (à chaque verrouillage)
    ↓
nettoyerMecaniquesHistoire()  (fin monde)
```

### Store structure

```javascript
etat.histoire.biomes[biomeId] = {
    _mecanique_nom: {
        actif: boolean,
        // propriétés custom
    },
};
```

---

## Checklist implémentation

- [ ] Fichier logique `mecaniques-histoire-{nom}.js` créé
- [ ] Enregistré dans barrel `mecaniques-histoire.js`
- [ ] Queries publiques si nécessaire dans `queries.js`
- [ ] Styles CSS ajoutés si changements visuels
- [ ] Textes HUD + dialogues dans JSON
- [ ] Lifecycle init/apply/cleanup implémenté
- [ ] Tests unitaires pour logique
- [ ] E2E test pour intégration gameplay

---

## Exemples

- **Rouille** (`mecaniques-histoire-rouille.js`) — décomposition cellules
- **Éclipse** (`mecaniques-histoire-eclipse.js`) — ligne spéciale + vitesse
- **Vide** (`mecaniques-histoire-vide.js`) — pièce invisible
- **Miroir** (`mecaniques-histoire-miroir.js`) — plateau inversé
- **Trame** (`mecaniques-histoire-trame.js`) — morphage graduel
