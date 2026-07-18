import { ecouter } from '../etat/bus-jeu.js';
import { flashVerrou, flashLignes, flashTopout, particules } from '../etat/store-jeu.js';
import { coop } from '../logique/coop-logique.js';
import { coop_mettreAJourGravite } from '../logique/coop-logique.js';
import { mettreAJourDasCoop } from '../logique/coop-das.js';
import { obtenirCarteDasCoop } from '../logique/coop-carte-das.js';
import { mettreAJourParticules } from './particules-jeu.js';
import { mettreAJourSecousse } from './rendu-jeu.js';
import { adapterNotifsJeu, adapterInterfaceCoop } from './layout-jeu.js';
import { coop_dessinerPreview, coop_rendreFrame } from './coop-rendu.js';

let idFrameCoop = null;
let dernierTimestampCoop = 0;

function arreterBoucleCoop() {
    if (idFrameCoop) {
        cancelAnimationFrame(idFrameCoop);
        idFrameCoop = null;
    }
}

function boucleCooperatif(timestamp) {
    if (!coop.actif) return;

    const dt = Math.min(dernierTimestampCoop ? timestamp - dernierTimestampCoop : 0, 50);
    dernierTimestampCoop = timestamp;

    if (coop.estEnCours && !coop.estEnPause) {
        mettreAJourDasCoop(dt, obtenirCarteDasCoop());
        coop_mettreAJourGravite('j1', dt);
        coop_mettreAJourGravite('j2', dt);
        coop_dessinerPreview('j1');
        coop_dessinerPreview('j2');

        if (coop.flashSynchro > 0) coop.flashSynchro -= dt;
    }

    if (flashVerrou.timer > 0) flashVerrou.timer -= dt;
    if (flashLignes.timer > 0) flashLignes.timer -= dt;
    if (flashTopout.timer > 0) flashTopout.timer -= dt;
    mettreAJourSecousse(dt);
    if (particules.length > 0) mettreAJourParticules(dt);

    coop_rendreFrame();
    idFrameCoop = requestAnimationFrame(boucleCooperatif);
}

let coopBoucleBusInitialise = false;

export function initialiserCoopBoucleBus() {
    if (coopBoucleBusInitialise) return;
    coopBoucleBusInitialise = true;

    ecouter('coop:rendu-init', () => {
        adapterInterfaceCoop();
        requestAnimationFrame(() => adapterNotifsJeu());
        coop_dessinerPreview('j1');
        coop_dessinerPreview('j2');
    });

    ecouter('coop:demarrer-boucle', () => {
        dernierTimestampCoop = 0;
        arreterBoucleCoop();
        idFrameCoop = requestAnimationFrame(boucleCooperatif);
    });

    ecouter('coop:arreter-boucle', () => {
        arreterBoucleCoop();
    });

    ecouter('coop:reprise-timestamp', () => {
        dernierTimestampCoop = performance.now();
    });
}
