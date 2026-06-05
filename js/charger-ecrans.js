import { LISTE_ECRANS_CHARGEMENT } from './ecrans-config.js';

const parseur = new DOMParser();

export async function chargerEcrans() {
    const conteneur = document.getElementById('conteneur-ecrans');
    if (!conteneur) throw new Error('conteneur-ecrans introuvable');

    const fragments = await Promise.all(
        LISTE_ECRANS_CHARGEMENT.map(async (nom) => {
            const reponse = await fetch(`html/${nom}.html`);
            if (!reponse.ok)
                throw new Error(`Échec chargement html/${nom}.html (${reponse.status})`);
            return reponse.text();
        })
    );

    conteneur.replaceChildren();
    for (const html of fragments) {
        const doc = parseur.parseFromString(html, 'text/html');
        conteneur.append(...doc.body.childNodes);
    }
}
