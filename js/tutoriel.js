import { lireStockage, ecrireStockage } from './progression.js';
import { afficherEcran } from './ecrans-ui.js';
import { ECRANS } from './ecrans-config.js';

const CLE_TUTORIEL_VU = 'derniereLigne_tutorielVu';

function fermerTutoriel() {
    ecrireStockage(CLE_TUTORIEL_VU, '1');
    document.getElementById('overlay-tutoriel')?.classList.add('element-masque');
}

export function initialiserTutoriel() {
    if (lireStockage(CLE_TUTORIEL_VU, '0') === '1') return;

    const overlay = document.getElementById('overlay-tutoriel');
    if (!overlay) return;

    overlay.classList.remove('element-masque');

    document.getElementById('btn-tutoriel-fermer')?.addEventListener('click', fermerTutoriel);
    document.getElementById('btn-tutoriel-options')?.addEventListener('click', () => {
        fermerTutoriel();
        afficherEcran(ECRANS.OPTIONS);
        document.getElementById('tab-controles')?.click();
    });
}
