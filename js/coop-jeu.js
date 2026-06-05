import { BIOMES } from './config.js';
import { arreterConstellation } from './constellation.js';
import { AudioMoteur } from './audio.js';
import {
    etat,
    particules,
    obtenirBiomeActif,
    definirIdFrame,
    obtenirIdFrame,
    definirBoucleActive,
    definirCouleurAmbRgb,
    ECRANS,
} from './contexte-jeu.js';
import { hexVersRgb, lierCouleursTetrominos } from './piece-jeu.js';
import {
    appliquerThemeBiome,
    appliquerTextesBiome,
    appliquerThemeMascotte,
    changerHumeur,
    cacherEcrans,
    afficherEcran,
    sauvegarderRecord,
    mettreAJourAffichageRecord,
} from './ecrans-ui.js';
import { obtenirRecordBiome } from './progression.js';
import { planifierBoucle } from './boucle-jeu.js';
import { arreterAnimationMenu } from './menu-fond.js';
import { mettreAJourParticules } from './particules-jeu.js';
import { basculerOracle, oracle } from './oracle-jeu.js';
import {
    coop,
    reinitialiserEtatCoop,
    coop_vitesseChute,
    coop_verrouillerPiece,
    coop_rafraichirStats,
    configurerCoopLogique,
    coop_estPositionValide,
} from './coop-logique.js';
import { coop_dessinerPreview, coop_rendreFrame } from './coop-rendu.js';

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

configurerCoopLogique({ terminerCooperatif: (j) => terminerCooperatif(j) });

function arreterBoucleSolo() {
    etat.estEnCours = false;
    const id = obtenirIdFrame();
    if (id) cancelAnimationFrame(id);
    definirIdFrame(null);
    definirBoucleActive(false);
}

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

export function demarrerCooperatif() {
    coop.actif = true;
    etat.estEnCours = false;
    arreterBoucleSolo();

    if (oracle.actif) basculerOracle();

    reinitialiserEtatCoop();
    particules.length = 0;

    arreterConstellation();
    appliquerThemeBiome(obtenirBiomeActif());
    appliquerTextesBiome(obtenirBiomeActif());
    appliquerThemeMascotte();
    lierCouleursTetrominos();
    AudioMoteur.init();
    if (AudioMoteur.ctx && AudioMoteur.actif) {
        AudioMoteur.demarrerMusique(obtenirBiomeActif());
    }
    arreterAnimationMenu();

    definirCouleurAmbRgb(hexVersRgb(BIOMES[obtenirBiomeActif()].lueurCoul));

    cacherEcrans();
    deplacerZoneJeuVersCoop();
    afficherInterfaceCoop(true);

    coop_dessinerPreview('j1');
    coop_dessinerPreview('j2');
    coop_rafraichirStats();

    for (const j of ['j1', 'j2']) {
        const btn = document.getElementById(`btn-passerelle-${j}`);
        if (btn) btn.disabled = !coop[j].passerelleDisponible;
    }

    changerHumeur('neutre');
    dernierTimestampCoop = 0;
    arreterBoucleCoop();
    idFrameCoop = requestAnimationFrame(boucleCooperatif);
}

function boucleCooperatif(timestamp) {
    if (!coop.actif) return;

    const dt = Math.min(dernierTimestampCoop ? timestamp - dernierTimestampCoop : 0, 50);
    dernierTimestampCoop = timestamp;

    if (coop.estEnCours && !coop.estEnPause) {
        const vitesse = coop_vitesseChute();

        coop.accJ1 += dt;
        if (coop.accJ1 >= vitesse && coop.j1.pieceActuelle) {
            coop.accJ1 = 0;
            if (coop_estPositionValide(coop.j1.pieceActuelle, 0, 1)) {
                coop.j1.pieceActuelle.y++;
            } else {
                coop_verrouillerPiece('j1');
                coop_dessinerPreview('j1');
            }
        }

        coop.accJ2 += dt;
        if (coop.accJ2 >= vitesse && coop.j2.pieceActuelle) {
            coop.accJ2 = 0;
            if (coop_estPositionValide(coop.j2.pieceActuelle, 0, 1)) {
                coop.j2.pieceActuelle.y++;
            } else {
                coop_verrouillerPiece('j2');
                coop_dessinerPreview('j2');
            }
        }

        if (coop.flashSynchro > 0) coop.flashSynchro -= dt;
        mettreAJourParticules(dt);
    }

    coop_rendreFrame();
    idFrameCoop = requestAnimationFrame(boucleCooperatif);
}

export function basculerPauseCoop() {
    if (!coop.estEnCours) return;
    coop.estEnPause = !coop.estEnPause;

    if (coop.estEnPause) {
        const elS = document.getElementById('coop-pause-score');
        const elN = document.getElementById('coop-pause-niveau');
        if (elS) elS.textContent = coop.score.toLocaleString('fr-FR');
        if (elN) elN.textContent = String(coop.niveau);
        afficherEcran(ECRANS.PAUSE_COOP);
    } else {
        cacherEcrans();
        dernierTimestampCoop = performance.now();
        const btn = document.getElementById('btn-pause-coop');
        if (btn) btn.textContent = '⏸ PAUSE';
    }
}

export function terminerCooperatif(joueurFautif) {
    coop.estEnCours = false;
    arreterBoucleCoop();
    changerHumeur('triste');
    AudioMoteur.arreterMusique();
    if (!AudioMoteur.muet) AudioMoteur.son('game_over');

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
            joueurFautif === 'j1' ? 'J1 a dépassé le sommet !' : 'J2 a dépassé le sommet !';
    }

    sauvegarderRecord(coop.score);
    mettreAJourAffichageRecord();
    if (elRecord) {
        elRecord.textContent = obtenirRecordBiome(obtenirBiomeActif()).toLocaleString('fr-FR');
    }

    setTimeout(() => afficherEcran(ECRANS.GAME_OVER_COOP), 400);
}

export function quitterModeCoop() {
    coop.actif = false;
    coop.estEnCours = false;
    arreterBoucleCoop();
    restaurerZoneJeu();
    afficherInterfaceCoop(false);
    etat.estEnCours = false;
    AudioMoteur.arreterMusique();
    changerHumeur('neutre');
    cacherEcrans();
    afficherEcran(ECRANS.TITRE);
    planifierBoucle();
}
