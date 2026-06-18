import { logger } from './logger.js';
import { idPortraitRendu } from './histoire-cutscene-config.js';
import { obtenirEffetsAccessibiliteReduits } from './accessibilite.js';
import { store } from './store-core.js';

/** @typedef {Record<string, number | boolean>} ParamsExpression */

export const HUMEURS_PERSONNAGES = {
    robo: ['neutre', 'content', 'excite', 'triste', 'alerte'],
    vera: ['neutre', 'douce', 'inquiete', 'determinee', 'glitch'],
    distorsion: ['menacante', 'souffrante', 'curieuse', 'apaisee'],
    systeme: ['neutre', 'alerte'],
    brasier: ['calme', 'agressif', 'vacillant'],
    brasier_voix: ['calme', 'agressif', 'vacillant'],
    sentinelle: ['calme', 'agressif', 'vacillant'],
    sentinelle_voix: ['calme', 'agressif', 'vacillant'],
    archiviste: ['calme', 'agressif', 'vacillant'],
    archiviste_voix: ['calme', 'agressif', 'vacillant'],
    avantgarde: ['calme', 'agressif', 'vacillant'],
    avantgarde_voix: ['calme', 'agressif', 'vacillant'],
};

const DUREE_TRANSITION_MS = 400;

const PRESETS_VERA = {
    neutre: {
        fragmentVitesse: 0.6,
        fragmentRayon: 1,
        lueurRose: 1,
        inclinaison: 0,
        sourcils: false,
        scanline: 1,
        glitchAleatoire: true,
        glitchBandes: false,
    },
    douce: {
        fragmentVitesse: 0.35,
        fragmentRayon: 0.9,
        lueurRose: 1.2,
        inclinaison: 0.06,
        sourcils: false,
        scanline: 0.7,
        glitchAleatoire: false,
        glitchBandes: false,
    },
    inquiete: {
        fragmentVitesse: 1.1,
        fragmentRayon: 0.75,
        lueurRose: 1,
        inclinaison: 0,
        sourcils: true,
        scanline: 1.4,
        glitchAleatoire: false,
        glitchBandes: false,
    },
    determinee: {
        fragmentVitesse: 0.5,
        fragmentRayon: 1.05,
        lueurRose: 1.1,
        inclinaison: -0.04,
        sourcils: false,
        scanline: 0.85,
        glitchAleatoire: false,
        glitchBandes: false,
        visiereLumineuse: true,
    },
    glitch: {
        fragmentVitesse: 0.8,
        fragmentRayon: 1.3,
        lueurRose: 1,
        inclinaison: 0,
        sourcils: false,
        scanline: 1.6,
        glitchAleatoire: false,
        glitchBandes: true,
    },
};

const PRESETS_DISTORSION = {
    menacante: {
        vortexVitesse: 1.3,
        aberrationChrom: 1,
        yeuxRouge: true,
        yeuxViolet: false,
        vortexIrregulier: 0,
    },
    souffrante: {
        vortexVitesse: 0.45,
        aberrationChrom: 0.4,
        yeuxRouge: true,
        yeuxViolet: false,
        vortexIrregulier: 0.7,
        paupiere: true,
    },
    curieuse: {
        vortexVitesse: 0.15,
        aberrationChrom: 0.2,
        yeuxRouge: true,
        yeuxViolet: false,
        vortexIrregulier: 0,
        unOeil: true,
    },
    apaisee: {
        vortexVitesse: 0.25,
        aberrationChrom: 0,
        yeuxRouge: false,
        yeuxViolet: true,
        vortexIrregulier: 0,
        fragmentsStables: true,
    },
};

const PRESETS_BOSS = {
    calme: { vitesseAnim: 0.7, glow: 0.75, echelle: 1, vacillant: false },
    agressif: { vitesseAnim: 1.35, glow: 1.35, echelle: 1.05, vacillant: false },
    vacillant: { vitesseAnim: 1.1, glow: 0.9, echelle: 1, vacillant: true },
};

const PRESETS_SYSTEME = {
    neutre: { alerte: false, clignotement: 1 },
    alerte: { alerte: true, clignotement: 2.8 },
};

/** @type {Map<string, string>} */
const _derniereHumeurParlee = new Map();

let _indexLigneCourant = -1;
let _debutTransition = 0;
/** @type {ParamsExpression | null} */
let _paramsDepart = null;
/** @type {ParamsExpression | null} */
let _paramsCible = null;
let _personnageInterpole = null;
/** @type {number[]} */
let _decalagesGlitchVera = [0, 0, 0];

function _listeValide(personnageId) {
    const id = idPortraitRendu(personnageId);
    return HUMEURS_PERSONNAGES[id] ?? null;
}

function _humeurCompatDefaut(personnageId, parle) {
    const id = idPortraitRendu(personnageId);
    if (id === 'robo') return parle ? 'content' : 'neutre';
    if (id === 'brasier_voix' || id === 'sentinelle_voix') return 'vacillant';
    if (PRESETS_VERA.neutre && id === 'vera') return parle ? 'douce' : 'neutre';
    if (PRESETS_DISTORSION.menacante && id === 'distorsion') return 'menacante';
    if (
        PRESETS_BOSS.calme &&
        (id === 'brasier' || id === 'sentinelle' || id === 'archiviste' || id === 'avantgarde')
    ) {
        return 'calme';
    }
    if (id === 'systeme') return 'neutre';
    return 'neutre';
}

/** @param {string} texte */
export function infererHumeurVeraDepuisTexte(texte) {
    if (!texte) return 'neutre';
    const t = texte.toLowerCase();
    if (/\.{2,}|signal perdu|— signal|glitch|coupe|static|\.{3}/.test(t)) return 'glitch';
    if (/pardon|fière|merci|recommenc|espère|bienvenue|mon amie|suffisant|douce/.test(t)) {
        return 'douce';
    }
    if (/danger|vite|attention|non|arrêt|erreur|peur|inquiet|perdu|aide/.test(t)) return 'inquiete';
    if (/continue|trouve|doit|mission|prends|écoute|rob[oô]|determin|vas-y|maintenant/.test(t)) {
        return 'determinee';
    }
    if (/\?$/.test(t.trim())) return 'inquiete';
    if (/!/.test(t)) return 'determinee';
    return 'neutre';
}

/**
 * @param {string} personnageId
 * @param {string | undefined} humeurDemandee
 * @param {{ parle?: boolean }} [options]
 */
export function resoudreHumeurPortrait(personnageId, humeurDemandee, options = {}) {
    const parle = options.parle !== false;
    const liste = _listeValide(personnageId);
    if (!liste) return 'neutre';

    if (!humeurDemandee) {
        return _humeurCompatDefaut(personnageId, parle);
    }

    if (liste.includes(humeurDemandee)) {
        return humeurDemandee;
    }

    logger.debug(
        `[expressions] humeur inconnue "${humeurDemandee}" pour ${personnageId} → ${_humeurCompatDefaut(personnageId, parle)}`
    );
    return _humeurCompatDefaut(personnageId, parle);
}

/**
 * @param {string} personnageId
 * @param {string | undefined} humeurDemandee
 * @param {string | undefined} texteLigne
 * @param {{ parle?: boolean }} [options]
 */
export function resoudreHumeurPortraitAvecTexte(
    personnageId,
    humeurDemandee,
    texteLigne,
    options = {}
) {
    if (humeurDemandee) return resoudreHumeurPortrait(personnageId, humeurDemandee, options);
    if (idPortraitRendu(personnageId) === 'vera' && texteLigne) {
        return infererHumeurVeraDepuisTexte(texteLigne);
    }
    return resoudreHumeurPortrait(personnageId, humeurDemandee, options);
}

function _presetBrut(personnageId, humeur) {
    const id = idPortraitRendu(personnageId);
    switch (id) {
        case 'vera':
            return { ...(PRESETS_VERA[humeur] ?? PRESETS_VERA.neutre) };
        case 'distorsion':
            return { ...(PRESETS_DISTORSION[humeur] ?? PRESETS_DISTORSION.menacante) };
        case 'systeme':
            return { ...(PRESETS_SYSTEME[humeur] ?? PRESETS_SYSTEME.neutre) };
        case 'brasier':
        case 'brasier_voix':
        case 'sentinelle':
        case 'sentinelle_voix':
        case 'archiviste':
        case 'archiviste_voix':
        case 'avantgarde':
        case 'avantgarde_voix':
            return { ...(PRESETS_BOSS[humeur] ?? PRESETS_BOSS.calme) };
        default:
            return {};
    }
}

/** @param {ParamsExpression} a @param {ParamsExpression} b @param {number} t */
function _lerpParams(a, b, t) {
    const cles = new Set([...Object.keys(a), ...Object.keys(b)]);
    /** @type {ParamsExpression} */
    const out = {};
    for (const cle of cles) {
        const va = a[cle];
        const vb = b[cle];
        if (typeof va === 'boolean' || typeof vb === 'boolean') {
            out[cle] = t >= 1 ? vb : va;
        } else if (typeof va === 'number' && typeof vb === 'number') {
            out[cle] = va + (vb - va) * t;
        } else {
            out[cle] = vb ?? va;
        }
    }
    return out;
}

function _easing(t) {
    const p = Math.min(1, Math.max(0, t));
    return p * (2 - p);
}

function _genererDecalagesGlitchVera(semence) {
    return [0, 1, 2].map((i) => 2 + ((semence * 997 + i * 131) % 3));
}

/**
 * @param {number} indexLigne
 * @param {{ personnage?: string, humeur?: string, texte?: string }} ligne
 * @param {number} timestamp
 */
export function notifierChangementLigneCutscene(indexLigne, ligne, timestamp) {
    if (!store.histoire.cutscene.enCours) return;
    if (indexLigne === _indexLigneCourant) return;
    _indexLigneCourant = indexLigne;

    const personnage = ligne.personnage ?? 'narrateur';
    const idInterpole = idPortraitRendu(personnage);
    const humeur = resoudreHumeurPortraitAvecTexte(personnage, ligne.humeur, ligne.texte, {
        parle: true,
    });
    _derniereHumeurParlee.set(personnage, humeur);
    _derniereHumeurParlee.set(idInterpole, humeur);

    if (idInterpole === 'vera' && humeur === 'glitch') {
        _decalagesGlitchVera = _genererDecalagesGlitchVera(indexLigne + 1);
    }

    const presetCible = _presetBrut(personnage, humeur);
    if (_personnageInterpole === idInterpole && _paramsCible) {
        _paramsDepart = { ..._paramsCible };
    } else {
        _paramsDepart = { ...presetCible };
    }
    _paramsCible = presetCible;
    _personnageInterpole = idInterpole;
    _debutTransition = timestamp;
}

/**
 * @param {string} personnageId
 * @param {{ humeur?: string, texte?: string } | null | undefined} ligne
 * @param {boolean} parle
 */
export function obtenirHumeurEffectivePortrait(personnageId, ligne, parle) {
    if (!store.histoire.cutscene.enCours) {
        return _humeurCompatDefaut(personnageId, parle);
    }

    if (parle) {
        return resoudreHumeurPortraitAvecTexte(personnageId, ligne?.humeur, ligne?.texte, {
            parle: true,
        });
    }

    return (
        _derniereHumeurParlee.get(personnageId) ??
        _derniereHumeurParlee.get(idPortraitRendu(personnageId)) ??
        _humeurCompatDefaut(personnageId, false)
    );
}

/**
 * @param {string} personnageId
 * @param {string} humeur
 * @param {number} timestamp
 */
export function obtenirParamsExpressionPortrait(personnageId, humeur, timestamp) {
    const effetsReduits = obtenirEffetsAccessibiliteReduits();
    const id = idPortraitRendu(personnageId);
    const cible = _presetBrut(personnageId, humeur);

    if (effetsReduits || !store.histoire.cutscene.enCours) {
        return { ...cible, effetsReduits: true, decalagesGlitch: _decalagesGlitchVera };
    }

    if (_personnageInterpole !== id || !_paramsDepart || !_paramsCible) {
        return { ...cible, effetsReduits: false, decalagesGlitch: _decalagesGlitchVera };
    }

    const elapsed = timestamp - _debutTransition;
    const t = _easing(elapsed / DUREE_TRANSITION_MS);
    const interpole = _lerpParams(_paramsDepart, _paramsCible, t);
    return { ...interpole, effetsReduits: false, decalagesGlitch: _decalagesGlitchVera };
}

/** @param {string} personnageId @param {string} humeur */
export function obtenirHumeurRoboCutsceneDepuisLigne(personnageId, humeur, parle) {
    if (idPortraitRendu(personnageId) !== 'robo') return 'neutre';
    return resoudreHumeurPortrait(personnageId, humeur, { parle });
}

export function reinitExpressionsCutscene() {
    _derniereHumeurParlee.clear();
    _indexLigneCourant = -1;
    _debutTransition = 0;
    _paramsDepart = null;
    _paramsCible = null;
    _personnageInterpole = null;
    _decalagesGlitchVera = [0, 0, 0];
}

export function expressionsCutsceneActives() {
    return store.histoire.cutscene.enCours === true;
}
