import { BIOMES } from '../config/biomes.js';
import { AudioMoteur } from '../audio/audio.js';
import {
    etat,
    particules,
    obtenirBiomeActif,
    definirCouleurAmbRgb,
    ECRANS,
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
import { planifierBoucle, suspendreBoucleSolo } from './boucle-controle.js';
import { obtenirBouton } from './dom-utils.js';
import { initialiserAudioBiome } from '../audio/audio-partie.js';
import { basculerOracle, oracle } from './oracle-jeu.js';
import { afficherTutorielContextuel } from '../ui/tutoriel.js';
import {
    coop,
    reinitialiserEtatCoop,
    coop_rafraichirStats,
    configurerCoopLogique,
    definirCoopPartieEnCours,
} from './coop-logique.js';
import { emettre } from '../etat/bus-jeu.js';

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

let coopGameOverDeclenche = false;

configurerCoopLogique({ terminerCooperatif: (j) => terminerCooperatif(j) });

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
    emettre('coop:rendu-init');
    coop_rafraichirStats();

    for (const j of ['j1', 'j2']) {
        const btn = obtenirBouton(`btn-passerelle-${j}`);
        if (btn) btn.disabled = !coop[j].passerelleDisponible;
    }

    changerHumeur('neutre');
    afficherTutorielContextuel('coop');
    emettre('coop:demarrer-boucle');
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
        emettre('coop:reprise-timestamp');
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
    emettre('coop:arreter-boucle');
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
    emettre('coop:arreter-boucle');
    restaurerZoneJeu();
    afficherInterfaceCoop(false);
    etat.estEnCours = false;
    AudioMoteur.arreterMusique();
    changerHumeur('neutre');
    retournerAuMenuTitre(() => planifierBoucle());
}
