/**
 * FIFO d'eviction des pistes musique (cache SW dl-medias).
 * Garder en sync avec evincerPistesMusique() dans sw.js.
 *
 * @param {string[]} ordre
 * @param {string} urlAbsolue
 * @param {number} maxPistes
 * @returns {{ ordre: string[], evincees: string[] }}
 */
export function mettreAJourOrdrePistes(ordre, urlAbsolue, maxPistes) {
    const suivant = ordre.filter((u) => u !== urlAbsolue);
    suivant.push(urlAbsolue);

    /** @type {string[]} */
    const evincees = [];
    while (suivant.length > maxPistes) {
        const ancienne = suivant.shift();
        if (ancienne) evincees.push(ancienne);
    }

    return { ordre: suivant, evincees };
}
