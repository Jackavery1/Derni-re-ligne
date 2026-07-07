import { sansAccentsE } from '../texte-jeu.js';
import { modeHistoireEnCours } from '../etat/mode-histoire.js';

/** @param {string} id */
export function elObjectif(id) {
    return document.getElementById(id);
}

/** @param {string} id */
export function masquerObjectif(id) {
    elObjectif(id)?.classList.add('element-masque');
}

/** @param {string} id */
export function afficherObjectif(id) {
    elObjectif(id)?.classList.remove('element-masque');
}

/** @param {string} id @param {string} txt */
export function texteObjectif(id, txt) {
    const node = elObjectif(id);
    if (node) node.textContent = sansAccentsE(txt);
}

export function partieHistoireEnCours() {
    return document.body.classList.contains('partie-active') && modeHistoireEnCours();
}
