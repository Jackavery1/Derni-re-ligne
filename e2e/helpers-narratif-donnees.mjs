import { CUTSCENES_POST_MONDE } from '../js/histoire-textes/cutscenes-post-monde.js';
import { SCENE_DEFAUT_POST_MONDE } from '../js/histoire-narratif.js';

/** @param {string} mondeId */
export function obtenirScenePostMonde(mondeId) {
    const entree = CUTSCENES_POST_MONDE[mondeId];
    if (!entree) return SCENE_DEFAUT_POST_MONDE[mondeId] ?? null;
    return entree.scene ?? SCENE_DEFAUT_POST_MONDE[mondeId] ?? null;
}

/** Marqueurs texte post-victoire par monde (audit D — 15 mondes). */
export const MARQUEURS_NARRATIFS_POST_MONDE = {
    monde_prologue: [/blocs répondent|satisfaction/i],
    monde_lave: [/lave obéit|VERA aussi obéissait/i],
    monde_rouille: [/machines ne savent pas|Continuer sans savoir/i],
    monde_ocean: [/Sous l'eau|Je pense que c'était elle/i],
    monde_foret: [/espace libéré|Forêt Primordiale|INTERFÉRENCE DÉTECTÉE/i],
    monde_glace: [/retenait son souffle|patrouille au loin/i],
    monde_desert: [/fragment de carnet|Continue\. — V/i],
    monde_eclipse: [/lumière ou dans l'ombre|joue comme si/i],
    monde_cyber: [/son laboratoire|ROBO — si tu lis ceci/i],
    monde_fuochi: [/feux d'artifice|inutiles sont les plus importantes/i],
    monde_cosmos: [/Je l'ai entendue|VERA \? Ou elle/i],
    monde_vide: [/Le Vide ne parle pas|joué à l'aveugle/i],
    monde_miroir: [/joué à l'envers|ses règles fonctionnent aussi/i],
    monde_trame: [/Trame Primordiale|Jour 2 191/i],
    monde_paradoxe: [/ligne incomplète\. Volontairement|lire entre les blocs/i],
};

/** Marqueurs narratifs attendus dans le flux post-victoire (audit D15). */
export const MARQUEURS_NARRATIFS_CAMPAGNE = {
    monde_prologue: [/CHAPITRE I|FEU DES ORIGINES|Sa phrase s'est coupée/i],
    monde_lave: [/lave obéit|VERA aussi obéissait|Inferno respire/i],
    monde_boss_1: [
        /Brasier ne s'éteint pas|effondre|Inferno respire/i,
        /Tu\.\.\. tu n'as pas compris/i,
    ],
    monde_rouille: [/machines ne savent pas|Continuer sans savoir/i],
    monde_ocean: [/Sous l'eau|Je pense que c'était elle|SIGNAL PARASITE/i],
    monde_foret: [/espace libéré|Forêt Primordiale|INTERFÉRENCE DÉTECTÉE/i],
    monde_boss_2: [
        /Sentinelle commence à se fragmenter|Je n'avais pas modélisé cette variable/i,
        /CHAPITRE III|MÉMOIRE PERDUE|transmission 05/i,
    ],
    monde_glace: [/retenait son souffle|patrouille au loin/i],
    monde_desert: [/fragment de carnet|Continue\. — V/i],
    monde_eclipse: [/lumière ou dans l'ombre|joue comme si/i],
    monde_cyber: [/son laboratoire|ROBO — si tu lis ceci/i],
    monde_boss_3: [/CHAPITRE IV|FRACTURE|paradoxe acceptable|Archiviste/i],
    monde_fuochi: [/feux d'artifice|inutiles sont les plus importantes/i],
    monde_cosmos: [/Je l'ai entendue|VERA \? Ou elle/i],
    monde_vide: [/Le Vide ne parle pas|joué à l'aveugle/i],
    monde_boss_4: [/Quatre chapitres|objectif|FINALE|RÉSOLUTION|Distorsion attend/i],
    monde_miroir: [/joué à l'envers|fragmentation|Distorsion/i],
    monde_trame: [/Trame Primordiale|TRAME PRIMORDIALE|Jour 2 191/i],
    monde_finale: [/Distorsion|Enfin|LIGNE PARFAITE/i],
    monde_paradoxe: [/ligne incomplète\. Volontairement|lire entre les blocs/i],
};

export const SCENES_VICTOIRE_BOSS = {
    brasier: { debut: 'seuil_brasier', fin: 'labo', pivot: /Inferno respire/i },
    sentinelle: {
        debut: 'seuil_sentinelle',
        fin: 'labo',
        pivot: /dernière chose/i,
        sceneIntermediaire: 'fragmentation',
    },
    archiviste: { debut: 'labo', fin: 'labo', pivot: /paradoxe acceptable/i },
    avantgarde: { debut: 'seuil_avantgarde', fin: 'seuil_avantgarde', pivot: /Elle dit bonjour/i },
    distorsion: { debut: 'fragmentation', fin: 'fragmentation', pivot: /Alors que veux-tu/i },
};
