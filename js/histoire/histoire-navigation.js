/** @type {string | null} */
let mondeCibleCarte = null;

/** @param {string | null} mondeId */
export function definirMondeCibleCarte(mondeId) {
    mondeCibleCarte = mondeId;
}

export function consommerMondeCibleCarte() {
    const id = mondeCibleCarte;
    mondeCibleCarte = null;
    return id;
}

export function obtenirMondeCibleCarte() {
    return mondeCibleCarte;
}
