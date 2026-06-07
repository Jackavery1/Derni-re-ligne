import { store } from './store-core.js';
import { afficherEcran } from './ecrans-ui.js';
import { ECRANS } from './store-jeu.js';
import {
    retournerACarte,
    avancerCutscene,
    passerCutscene,
    fermerJournalHistoire,
} from './histoire-manager.js';
import { reinitialiserHistoirePourReplay } from './fins-histoire.js';
import { arreterFondFin } from './fin-bg-rendu.js';

export function initialiserBoutonsHistoire() {
    document
        .getElementById('btn-histoire-retour')
        ?.addEventListener('click', () => afficherEcran(ECRANS.TITRE));
    document.getElementById('btn-histoire-carte')?.addEventListener('click', retournerACarte);
    document.getElementById('btn-cutscene-suivant')?.addEventListener('click', avancerCutscene);
    document.getElementById('btn-cutscene-passer')?.addEventListener('click', passerCutscene);

    document.getElementById('ecran-histoire-cutscene')?.addEventListener('click', (e) => {
        if (e.target instanceof HTMLElement && !e.target.closest('.cutscene-controles')) {
            avancerCutscene();
        }
    });
    document.addEventListener('keydown', (e) => {
        const ecranCutscene = document.getElementById('ecran-histoire-cutscene');
        if (!ecranCutscene?.classList.contains('actif')) return;
        if (e.code === 'Space' || e.code === 'Enter') {
            e.preventDefault();
            avancerCutscene();
        }
        if (e.code === 'Escape') passerCutscene();
    });
    document.getElementById('btn-journal-fermer')?.addEventListener('click', fermerJournalHistoire);
    document.getElementById('btn-fin-menu')?.addEventListener('click', () => {
        arreterFondFin();
        store.histoire.actif = false;
        document.body.classList.remove('histoire-active');
        afficherEcran(ECRANS.TITRE);
    });
    document.getElementById('btn-fin-rejouer')?.addEventListener('click', () => {
        arreterFondFin();
        reinitialiserHistoirePourReplay();
        store.histoire.actif = false;
        document.body.classList.remove('histoire-active');
        afficherEcran(ECRANS.HISTOIRE_MAP);
    });
}
