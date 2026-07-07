/** Etat partage humeurs portraits cutscene (ROBO, VERA, boss). */

/** @typedef {'neutre'|'content'|'excite'|'triste'|'alerte'} HumeurRoboCutscene */
/** @typedef {'douce'|'inquiete'|'determinee'|'glitch'} HumeurVeraCutscene */
/** @typedef {'calme'|'agressif'|'vacillant'|'menacante'|'souffrante'|'curieuse'|'apaisee'} HumeurBossCutscene */

/** @type {HumeurRoboCutscene} */
let _humeurRoboCutscene = 'content';

/** @type {HumeurVeraCutscene} */
let _humeurVeraCutscene = 'douce';

/** @type {Record<string, HumeurBossCutscene>} */
const _humeursBossCutscene = {
    brasier: 'calme',
    sentinelle: 'calme',
    archiviste: 'calme',
    avantgarde: 'calme',
    distorsion: 'menacante',
};

export function definirHumeurRoboCutscene(humeur) {
    _humeurRoboCutscene = humeur;
}

export function obtenirHumeurRoboCutscene() {
    return _humeurRoboCutscene;
}

export function definirHumeurVeraCutscene(humeur) {
    _humeurVeraCutscene = humeur;
}

export function obtenirHumeurVeraCutscene() {
    return _humeurVeraCutscene;
}

/** @param {'brasier'|'sentinelle'|'archiviste'|'avantgarde'|'distorsion'} bossId @param {HumeurBossCutscene} humeur */
export function definirHumeurBossCutscene(bossId, humeur) {
    if (bossId in _humeursBossCutscene) _humeursBossCutscene[bossId] = humeur;
}

/** @param {'brasier'|'sentinelle'|'archiviste'|'avantgarde'|'distorsion'} bossId */
export function obtenirHumeurBossCutscene(bossId) {
    return _humeursBossCutscene[bossId] ?? null;
}

/** @param {string} personnageId */
export function obtenirHumeurPortraitCutsceneEtat(personnageId) {
    if (personnageId === 'vera') return _humeurVeraCutscene;
    if (personnageId === 'robo') return _humeurRoboCutscene;
    if (personnageId in _humeursBossCutscene) return _humeursBossCutscene[personnageId];
    return null;
}
