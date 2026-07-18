/** Façade logique → contrôle RAF solo (implémentation dans rendu/boucle-jeu.js). */

/** @type {() => void} */
let _planifierBoucle = () => {};
/** @type {() => void} */
let _suspendreBoucleSolo = () => {};

/**
 * @param {{ planifierBoucle: () => void, suspendreBoucleSolo: () => void }} api
 */
export function enregistrerControleBoucle(api) {
    _planifierBoucle = api.planifierBoucle;
    _suspendreBoucleSolo = api.suspendreBoucleSolo;
}

export function planifierBoucle() {
    _planifierBoucle();
}

export function suspendreBoucleSolo() {
    _suspendreBoucleSolo();
}
