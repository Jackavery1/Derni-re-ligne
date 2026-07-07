const ID_ECRAN = 'ecran-chargement';
const ID_BARRE = 'ecran-chargement-barre';
const ID_MESSAGE = 'ecran-chargement-message';
const DUREE_SORTIE_MS = 450;

/** @returns {HTMLElement | null} */
function obtenirEcran() {
    return document.getElementById(ID_ECRAN);
}

export function afficherEcranChargement(message) {
    const ecran = obtenirEcran();
    if (!ecran) return;
    ecran.classList.remove('sortie');
    ecran.classList.add('actif');
    ecran.setAttribute('aria-busy', 'true');
    if (message) definirMessageChargement(message);
}

export function definirMessageChargement(message) {
    const el = document.getElementById(ID_MESSAGE);
    if (el) el.textContent = message;
}

/**
 * @param {number} ratio 0–1
 */
export function definirProgressionChargement(ratio) {
    const barre = document.getElementById(ID_BARRE);
    if (!barre) return;
    const pct = Math.max(0, Math.min(1, ratio)) * 100;
    barre.style.width = `${pct}%`;
}

export function masquerEcranChargement() {
    const ecran = obtenirEcran();
    if (!ecran || !ecran.classList.contains('actif')) return;

    definirProgressionChargement(1);
    ecran.classList.add('sortie');
    ecran.setAttribute('aria-busy', 'false');

    window.setTimeout(() => {
        ecran.classList.remove('actif', 'sortie');
    }, DUREE_SORTIE_MS);
}
