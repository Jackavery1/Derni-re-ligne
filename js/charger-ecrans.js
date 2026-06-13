import { LISTE_ECRANS_CHARGEMENT } from './ecrans-config.js';
import { chargerIconesPixel } from './icones-pixel.js';
import { logger } from './logger.js';

/** URL absolue d'un fragment HTML, robuste au base href et aux sous-chemins PWA. */
export function urlFragmentEcran(nom) {
    return new URL(`html/${nom}.html`, document.baseURI).href;
}

let _parseur = null;
function obtenirParseur() {
    if (!_parseur) _parseur = new DOMParser();
    return _parseur;
}

const MAX_TENTATIVES = 3;
const DELAI_BASE_MS = 300;

/**
 * @param {string} url
 * @returns {Promise<Response>}
 */
async function fetchAvecRetry(url) {
    /** @type {Error | undefined} */
    let derniereErreur;
    for (let tentative = 0; tentative < MAX_TENTATIVES; tentative++) {
        try {
            const reponse = await fetch(url);
            if (reponse.ok) return reponse;
            derniereErreur = new Error(`Échec chargement ${url} (${reponse.status})`);
        } catch (err) {
            derniereErreur = err instanceof Error ? err : new Error(String(err));
        }
        if (tentative < MAX_TENTATIVES - 1) {
            const delai = DELAI_BASE_MS * 2 ** tentative;
            logger.warn(
                `Retry chargement ${url} (${tentative + 2}/${MAX_TENTATIVES}) dans ${delai}ms`
            );
            await new Promise((resolve) => setTimeout(resolve, delai));
        }
    }
    throw derniereErreur ?? new Error(`Échec chargement ${url}`);
}

export async function chargerEcrans() {
    const conteneur = document.getElementById('conteneur-ecrans');
    if (!conteneur) throw new Error('conteneur-ecrans introuvable');

    const fragments = await Promise.all(
        LISTE_ECRANS_CHARGEMENT.map(async (nom) => {
            const reponse = await fetchAvecRetry(urlFragmentEcran(nom));
            return reponse.text();
        })
    );

    conteneur.replaceChildren();
    for (const html of fragments) {
        const doc = obtenirParseur().parseFromString(html, 'text/html');
        conteneur.append(...doc.body.childNodes);
    }

    await chargerIconesPixel();
}
