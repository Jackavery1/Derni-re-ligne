/** Etat partage humeur ROBO en cutscene (module volontairement limite a ROBO). */

/** @type {'neutre'|'content'|'excite'|'triste'|'alerte'} */
let _humeurRoboCutscene = 'content';

export function definirHumeurRoboCutscene(humeur) {
    _humeurRoboCutscene = humeur;
}

export function obtenirHumeurRoboCutscene() {
    return _humeurRoboCutscene;
}
