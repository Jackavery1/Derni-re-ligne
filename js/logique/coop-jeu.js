import { BIOMES } from '../config/biomes.js';
import { AudioMoteur } from '../audio/audio.js';
import {
    etat,
    particules,
    obtenirBiomeActif,
    definirCouleurAmbRgb,
    ECRANS,
    flashVerrou,
    flashLignes,
    flashTopout,
} from '../etat/store-jeu.js';
import { hexVersRgb, lierCouleursTetrominos } from './piece-jeu.js';
import {
    changerHumeur,
    cacherEcrans,
    afficherEcran,
    retournerAuMenuTitre,
    mettreAJourAffichageRecord,
} from '../ui/ecrans-ui.js';
import { obtenirRecordCoopBiome, sauvegarderRecordCoopBiome } from '../io/progression.js';
import { planifierSoumissionLeaderboard } from '../io/leaderboard-cloud.js';
import { finaliserPartieCommune } from './partie-fin-commun.js';
import { planifierBoucle, suspendreBoucleSolo } from './boucle-jeu.js';
import { obtenirBouton } from './dom-utils.js';
import { mettreAJourParticules } from '../rendu/particules-jeu.js';
import { mettreAJourSecousse } from '../rendu/rendu-jeu.js';
import { initialiserAudioBiome } from '../audio/audio-partie.js';
import { basculerOracle, oracle } from './oracle-jeu.js';
import { afficherTutorielContextuel } from '../ui/tutoriel.js';
import { adapterNotifsJeu, adapterInterfaceCoop } from '../rendu/layout-jeu.js';
import {
    coop,
    reinitialiserEtatCoop,
    coop_mettreAJourGravite,
    coop_rafraichirStats,
    configurerCoopLogique,
    definirCoopPartieEnCours,
} from './coop-logique.js';
import { coop_dessinerPreview, coop_rendreFrame } from '../rendu/coop-rendu.js';
import { mettreAJourDasCoop } from './coop-das.js';
import { obtenirCarteDasCoop } from './coop-carte-das.js';

export { coop, modeCoopActif, basculerModeCoop, utiliserPasserelle } from './coop-logique.js';
export {
    coop_deplacerGauche,
    coop_deplacerDroite,
    coop_deplacerBas,
    coop_tourner,
    coop_chuteRapide,
    coop_utiliserReserve,
    coop_estPositionValide,
    DEMI_LARGEUR,
} from './coop-logique.js';

let idFrameCoop = null;
let dernierTimestampCoop = 0;
let coopGameOverDeclenche = false;

configurerCoopLogique({ terminerCooperatif: (j) => terminerCooperatif(j) });

function arreterBoucleCoop() {
    if (idFrameCoop) {
        cancelAnimationFrame(idFrameCoop);
        idFrameCoop = null;
    }
}

function deplacerZoneJeuVersCoop() {
    const zone = document.getElementById('zone-jeu');
    const zoneCoop = document.getElementById('zone-jeu-coop');
    if (!zone || !zoneCoop) return;
    zoneCoop.appendChild(zone);
}

function restaurerZoneJeu() {
    const zone = document.getElementById('zone-jeu');
    const iface = document.getElementById('interface-jeu');
    if (!zone || !iface) return;
    if (zone.parentElement?.id === 'zone-jeu-coop') {
        const panneaux = iface.querySelectorAll('aside');
        if (panneaux.length >= 2) iface.insertBefore(zone, panneaux[1]);
        else iface.appendChild(zone);
    }
}

function afficherInterfaceCoop(visible) {
    const solo = document.getElementById('conteneur-principal');
    const coopCont = document.getElementById('conteneur-principal-coop');
    const ctrlJ1 = document.getElementById('controles-coop-j1');
    const ctrlJ2 = document.getElementById('controles-coop-j2');
    if (visible) {
        solo?.classList.add('element-masque');
        coopCont?.classList.remove('element-masque');
        document.body.classList.add('coop-active');
        document.body.classList.add('partie-active');
        ctrlJ1?.classList.remove('element-masque');
        ctrlJ2?.classList.remove('element-masque');
    } else {
        solo?.classList.remove('element-masque');
        coopCont?.classList.add('element-masque');
        document.body.classList.remove('coop-active');
        ctrlJ1?.classList.add('element-masque');
        ctrlJ2?.classList.add('element-masque');
    }
}

export function initialiserChronometreCoop() {
    etat.tempsDebut = Date.now();
    etat.tempsPauseAccumule = 0;
    etat.tempsPauseDebut = null;
}

let demarrageCoopEnCours = false;

function demarrerCooperatifInterne() {
    coopGameOverDeclenche = false;
    definirCoopPartieEnCours(true);
    etat.estEnCours = false;
    suspendreBoucleSolo();

    if (oracle.actif) basculerOracle();

    reinitialiserEtatCoop();
    initialiserChronometreCoop();
    particules.length = 0;

    void import('./constellation.js').then(({ arreterConstellation }) => arreterConstellation());
    initialiserAudioBiome(obtenirBiomeActif(), { delaiMusique: 50 });
    lierCouleursTetrominos();

    definirCouleurAmbRgb(hexVersRgb(BIOMES[obtenirBiomeActif()].lueurCoul));

    cacherEcrans();
    deplacerZoneJeuVersCoop();
    afficherInterfaceCoop(true);
    adapterInterfaceCoop();
    requestAnimationFrame(() => adapterNotifsJeu());

    coop_dessinerPreview('j1');
    coop_dessinerPreview('j2');
    coop_rafraichirStats();

    for (const j of ['j1', 'j2']) {
        const btn = obtenirBouton(`btn-passerelle-${j}`);
        if (btn) btn.disabled = !coop[j].passerelleDisponible;
    }

    changerHumeur('neutre');
    afficherTutorielContextuel('coop');
    dernierTimestampCoop = 0;
    arreterBoucleCoop();
    idFrameCoop = requestAnimationFrame(boucleCooperatif);
}

async function executerDemarrageCooperatif() {
    if (demarrageCoopEnCours) return;
    demarrageCoopEnCours = true;
    try {
        const { assurerFragmentsCoop } = await import('../ui/charger-ecrans.js');
        await assurerFragmentsCoop();
        demarrerCooperatifInterne();
    } finally {
        demarrageCoopEnCours = false;
    }
}

export function demarrerCooperatif() {
    void executerDemarrageCooperatif();
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

export function basculerPauseCoop() {
    if (!coop.estEnCours) return;
    coop.estEnPause = !coop.estEnPause;

    if (coop.estEnPause) {
        etat.tempsPauseDebut = Date.now();
        AudioMoteur.definirVolumePauseMusique(true);
        const elS = document.getElementById('coop-pause-score');
        const elN = document.getElementById('coop-pause-niveau');
        if (elS) elS.textContent = coop.score.toLocaleString('fr-FR');
        if (elN) elN.textContent = String(coop.niveau);
        afficherEcran(ECRANS.PAUSE_COOP);
    } else {
        AudioMoteur.definirVolumePauseMusique(false);
        if (etat.tempsPauseDebut) {
            etat.tempsPauseAccumule += Date.now() - etat.tempsPauseDebut;
            etat.tempsPauseDebut = null;
        }
        cacherEcrans();
        dernierTimestampCoop = performance.now();
        const libellePause = '⏸ PAUSE';
        for (const id of ['btn-pause-coop', 'btn-pause-coop-mobile']) {
            const btn = document.getElementById(id);
            if (btn) btn.textContent = libellePause;
        }
    }
}

export function terminerCooperatif(joueurFautif) {
    if (coopGameOverDeclenche) return;
    coopGameOverDeclenche = true;
    coop.estEnCours = false;
    arreterBoucleCoop();
    changerHumeur('triste');
    AudioMoteur.arreterMusique(200);
    if (!AudioMoteur.muet) setTimeout(() => AudioMoteur.son('game_over'), 250);

    const elScore = document.getElementById('coop-go-score');
    const elLignes = document.getElementById('coop-go-lignes');
    const elNiveau = document.getElementById('coop-go-niveau');
    const elFautif = document.getElementById('coop-go-fautif');
    const elRecord = document.getElementById('coop-go-record');

    if (elScore) elScore.textContent = coop.score.toLocaleString('fr-FR');
    if (elLignes) elLignes.textContent = String(coop.lignes);
    if (elNiveau) elNiveau.textContent = String(coop.niveau);
    if (elFautif) {
        elFautif.textContent =
            joueurFautif === 'j1' ? 'J1 a depasse le sommet !' : 'J2 a depasse le sommet !';
    }

    // Record coop separe : ne doit pas ecraser le record solo du biome.
    const nouveauRecordCoop = sauvegarderRecordCoopBiome(obtenirBiomeActif(), coop.score);
    if (nouveauRecordCoop) {
        planifierSoumissionLeaderboard({
            mode: 'coop',
            biome: obtenirBiomeActif(),
            score: coop.score,
            niveau: coop.niveau,
        });
    }
    mettreAJourAffichageRecord();
    if (elRecord) {
        elRecord.textContent = obtenirRecordCoopBiome(obtenirBiomeActif()).toLocaleString('fr-FR');
    }

    finaliserPartieCommune({
        score: coop.score,
        lignes: coop.lignes,
        biomeId: obtenirBiomeActif(),
        annonceDefaite: 'Mission coop echouee',
    });

    setTimeout(() => {
        afficherEcran(ECRANS.GAME_OVER_COOP);
        planifierBoucle();
    }, 400);
}

export function quitterModeCoop() {
    definirCoopPartieEnCours(false);
    coop.estEnCours = false;
    arreterBoucleCoop();
    restaurerZoneJeu();
    afficherInterfaceCoop(false);
    etat.estEnCours = false;
    AudioMoteur.arreterMusique();
    changerHumeur('neutre');
    retournerAuMenuTitre(() => planifierBoucle());
}
