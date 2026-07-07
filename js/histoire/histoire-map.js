import { obtenirCanvas } from '../logique/dom-utils.js';
import { dessinerCarteHistoire, invaliderDonneesEtoilesHistoire } from './histoire-map-rendu.js';
import {
    attacherEvenementsCarteHistoire,
    lancerMondeDepuisCarte,
    mettreAJourEnteteHistoire,
    mettreAJourSelectMondesClavier,
    mettreAJourAriaCarteHistoire,
    traiterSelectionNoeud,
    initialiserModalTrameCarte,
} from './histoire-map-ui.js';
import { configurerActionsHistoire } from './histoire-actions.js';
import { rafraichirEtatHistoire } from './histoire-mondes.js';
import {
    annulerPrechargementMedias,
    demarrerPrechargementCarte,
} from '../io/prechargement-medias.js';
import { calculerPositionsNoeuds } from './histoire-map-layout.js';
import { mettreAJourVisibiliteCarte } from './histoire-map-visibilite.js';
import { attacherScrollCarte } from './histoire-map-scroll.js';
import { mettreAJourCameraCarte } from './histoire-map-focus.js';
import { coordsCanvas, noeudSousCurseur } from './histoire-map-pick.js';

const etatCarte = {
    canvasCarte: null,
    ctxCarte: null,
    idFrameCarte: null,
    carteActive: false,
    noeudSurvole: null,
    noeudSelectionne: null,
    dernierTapNoeud: null,
    dernierTapTemps: 0,
    positionsNoeuds: {},
    mondesVisibles: new Set(),
    mondesFantomes: new Set(),
    mondeActuel: null,
    evenementsCarteAttaches: false,
    selectMondesOk: false,
    camera: {
        y: 0,
        zoom: 1.6,
        cibleY: 0,
        cibleZoom: 1.6,
        vitesseLerp: 0.07,
        scrollMin: -60,
        scrollMax: 2500,
        initialise: false,
    },
    scrollOk: false,
};

function traiterSelectionCarte(noeud, doubleTap) {
    traiterSelectionNoeud(etatCarte, noeud, doubleTap, lancerMondeDepuisCarte);
}

export function initialiserCarteMonde() {
    etatCarte.canvasCarte = obtenirCanvas('canvas-histoire-map');
    if (!etatCarte.canvasCarte) return false;
    etatCarte.camera.initialise = false;
    etatCarte.ctxCarte = etatCarte.canvasCarte.getContext('2d');
    redimensionnerCanvas();
    calculerPositionsNoeuds(etatCarte);
    if (!etatCarte.evenementsCarteAttaches) {
        attacherEvenementsCarteHistoire(
            etatCarte,
            (clientX, clientY) => coordsCanvas(etatCarte, clientX, clientY),
            (cx, cy) => noeudSousCurseur(etatCarte, cx, cy),
            traiterSelectionCarte
        );
        etatCarte.evenementsCarteAttaches = true;
    }
    mettreAJourEnteteHistoire();
    initialiserModalTrameCarte();
    mettreAJourSelectMondesClavier(etatCarte, traiterSelectionCarte);

    if (!etatCarte.scrollOk) {
        etatCarte.scrollOk = true;
        attacherScrollCarte(etatCarte, etatCarte.canvasCarte);
    }

    return true;
}

function redimensionnerCanvas() {
    if (!etatCarte.canvasCarte) return;
    etatCarte.canvasCarte.width = window.innerWidth;
    etatCarte.canvasCarte.height = window.innerHeight;
}

export async function demarrerCarteHistoire() {
    arreterCarteHistoire();
    rafraichirEtatHistoire();
    mettreAJourEnteteHistoire();
    const moduleTextes = await import('../io/charger-histoire-textes.js');
    let overlayChargement = false;
    try {
        moduleTextes.obtenirHistoireTextesSync();
    } catch {
        const { afficherEcranChargement, definirMessageChargement } =
            await import('../ui/ecran-chargement.js');
        definirMessageChargement('Chargement de la campagne…');
        afficherEcranChargement();
        overlayChargement = true;
    }
    await moduleTextes.chargerHistoireTextes();
    if (overlayChargement) {
        const { masquerEcranChargement } = await import('../ui/ecran-chargement.js');
        masquerEcranChargement();
    }
    if (!initialiserCarteMonde()) return;
    etatCarte.carteActive = true;
    mettreAJourAriaCarteHistoire(etatCarte);
    etatCarte.idFrameCarte = requestAnimationFrame(boucleCarte);
    demarrerPrechargementCarte();
}

export function arreterCarteHistoire() {
    annulerPrechargementMedias();
    etatCarte.carteActive = false;
    if (etatCarte.idFrameCarte) {
        cancelAnimationFrame(etatCarte.idFrameCarte);
        etatCarte.idFrameCarte = null;
    }
}

function boucleCarte(timestamp) {
    if (!etatCarte.carteActive || !etatCarte.ctxCarte || !etatCarte.canvasCarte) return;
    etatCarte.idFrameCarte = requestAnimationFrame(boucleCarte);
    if (document.hidden) return;
    mettreAJourVisibiliteCarte(etatCarte);
    mettreAJourCameraCarte(etatCarte, traiterSelectionCarte);
    dessinerCarteHistoire(etatCarte, timestamp);
}

export function redimensionnerCarteHistoire() {
    if (!etatCarte.canvasCarte || !etatCarte.carteActive) return;
    redimensionnerCanvas();
    calculerPositionsNoeuds(etatCarte);
    etatCarte.camera.initialise = false;
    etatCarte.scrollOk = false;
    invaliderDonneesEtoilesHistoire();
}

configurerActionsHistoire({ arreterCarte: arreterCarteHistoire });

window.addEventListener('dl-dev-refresh', () => {
    if (!etatCarte.carteActive) return;
    calculerPositionsNoeuds(etatCarte);
    etatCarte.camera.initialise = false;
    mettreAJourSelectMondesClavier(etatCarte, traiterSelectionCarte);
});
