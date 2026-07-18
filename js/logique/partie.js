import {
    etat,
    definirAccumulateur,
    definirDernierTimestamp,
    definirDerniereSecondeTemps,
} from '../etat/store-jeu.js';
import { planifierBoucle } from './boucle-controle.js';
import { afficherEcran, cacherEcrans } from '../ui/ecrans-ui.js';
import { ECRANS, store, demarrerTransition } from '../etat/store-jeu.js';
import { modeHistoireEnCours } from '../etat/mode-histoire.js';
import { logger } from '../io/logger.js';
import { SEQUENCE_HISTOIRE } from '../histoire/histoire-donnees-exports.js';
import { assurerRessourcesPartie } from '../io/prefetch-ressources-partie.js';
import { demarrerBoss, arreterBoss } from './boss-jeu.js';
import { obtenirIdBiomeFond } from '../etat/biome-fond.js';
import { emettre } from '../etat/bus-jeu.js';
import { AudioMoteur } from '../audio/audio.js';
import { annulerTimersVivant } from './vivant.js';
import { initialiserEtatPartie } from './partie-etat.js';
import { quitterVersMenu, quitterVersCarteHistoire } from './partie-arret.js';
import {
    initialiserFeaturesPartie,
    initialiserAudioPartie,
    initialiserUIPartie,
} from './partie-init.js';

export { initialiserCanvas, assurerCanvasPartie } from './partie-canvas.js';
export { quitterVersMenu, quitterVersCarteHistoire };

export async function confirmerRecommencer() {
    demarrerJeu();
}

export function demarrerJeu() {
    void _demarrerJeuApresPrep();
}

async function _demarrerJeuApresPrep() {
    try {
        await assurerRessourcesPartie();
    } catch (err) {
        logger.error('Échec préparation partie :', err);
        return;
    }
    const { assurerCanvasPartie } = await import('./partie-canvas.js');
    if (!assurerCanvasPartie()) return;
    demarrerTransition();
    initialiserFeaturesPartie();
    initialiserAudioPartie();
    initialiserEtatPartie();

    if (modeHistoireEnCours() && store.histoire.mondeActuel) {
        const monde = SEQUENCE_HISTOIRE.find((m) => m.id === store.histoire.mondeActuel);
        if (monde?.estBoss && monde?.bossId) {
            demarrerBoss(monde.bossId);
        } else {
            arreterBoss();
        }
    } else {
        arreterBoss();
    }

    initialiserUIPartie();
    emettre('fond-biome:demarrer', { biomeId: obtenirIdBiomeFond() });
    planifierBoucle();
}

export function basculerPause() {
    if (!etat.estEnCours) return;

    etat.estEnPause = !etat.estEnPause;

    if (etat.estEnPause) {
        annulerTimersVivant();
        etat.tempsPauseDebut = Date.now();
        AudioMoteur.definirVolumePauseMusique(true);
        afficherEcran(ECRANS.PAUSE);
    } else {
        if (etat.tempsPauseDebut) {
            etat.tempsPauseAccumule += Date.now() - etat.tempsPauseDebut;
            etat.tempsPauseDebut = null;
        }
        AudioMoteur.definirVolumePauseMusique(false);
        cacherEcrans();
        definirAccumulateur(0);
        definirDernierTimestamp(performance.now());
        definirDerniereSecondeTemps(-1);
    }

    document.getElementById('btn-pause').textContent = etat.estEnPause ? '▶ REPRENDRE' : '⏸ PAUSE';
}
