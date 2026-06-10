/** Etat partage portraits cutscene (evite cycle import). */

/** @type {'neutre'|'content'|'excite'|'triste'|'alerte'} */
let _humeurRoboCutscene = 'content';

export function definirHumeurRoboCutscene(humeur) {
    _humeurRoboCutscene = humeur;
}

export function obtenirHumeurRoboCutscene() {
    return _humeurRoboCutscene;
}
