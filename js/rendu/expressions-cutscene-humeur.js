import { logger } from '../logger.js';
import { idPortraitRendu } from '../histoire/histoire-cutscene-config.js';

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

function listeValide(personnageId) {
    const id = idPortraitRendu(personnageId);
    return HUMEURS_PERSONNAGES[id] ?? null;
}

export function humeurCompatDefaut(personnageId, parle) {
    if (personnageId.endsWith('_voix')) return 'vacillant';
    const id = idPortraitRendu(personnageId);
    if (id === 'robo') return parle ? 'content' : 'neutre';
    if (id === 'vera') return parle ? 'douce' : 'neutre';
    if (id === 'distorsion') return 'menacante';
    if (id === 'brasier' || id === 'sentinelle' || id === 'archiviste' || id === 'avantgarde') {
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
    const liste = listeValide(personnageId);
    if (!liste) return 'neutre';

    if (!humeurDemandee) {
        return humeurCompatDefaut(personnageId, parle);
    }

    if (liste.includes(humeurDemandee)) {
        return humeurDemandee;
    }

    logger.debug(
        `[expressions] humeur inconnue "${humeurDemandee}" pour ${personnageId} → ${humeurCompatDefaut(personnageId, parle)}`
    );
    return humeurCompatDefaut(personnageId, parle);
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
