/** @typedef {import('../histoire/histoire-donnees-exports.js').SEQUENCE_HISTOIRE[number]} MondeHistoire */
import { modeHistoireEnCours } from '../etat/mode-histoire.js';
import { obtenirEtatHistoire } from '../histoire/histoire-mondes.js';
import { ecouter } from '../etat/bus-jeu.js';
import { DIFFICULTE_MONDES } from '../io/difficulte-mondes-chargement.js';
import { afficherNotificationNiveau } from './ui-notifications.js';
import { demarrerSuiviMonde } from '../logique/gestionnaire-difficulte.js';
import { elObjectif as _el } from './ui-objectifs-dom.js';
import {
    rafraichirHudObjectifsHistoire,
    flashVagueObjectifs as _flashVague,
} from './ui-objectifs-hud.js';
import {
    afficherPanneauObjectifs,
    afficherRecapAvantNarratif as _afficherRecapAvantNarratif,
    ancrerOverlaysObjectifsAuBody,
    attacherEcouteursRecapOverlay,
    cacherEcransPourObjectifs,
    commencerDepuisPanneauObjectifs,
    fermerOverlayObjectifsPre,
    fermerOverlayRecapMonde,
} from './ui-objectifs-overlays.js';

let _listenersAttaches = false;

/** Ferme les overlays narratifs qui peuvent masquer ou bloquer la zone de jeu. */
export function fermerOverlaysFluxPartie() {
    fermerOverlayObjectifsPre();
    fermerOverlayRecapMonde();
    document.getElementById('overlay-tutoriel')?.classList.add('element-masque');
    const trame = document.getElementById('overlay-trame-conditions');
    if (trame) {
        trame.classList.remove('objectif-overlay-visible');
        trame.classList.add('element-masque');
    }
}

/**
 * @param {MondeHistoire} monde
 * @param {[boolean, boolean, boolean]} etoiles
 * @param {() => void} onFin
 */
export function afficherRecapAvantNarratif(monde, etoiles, onFin) {
    _afficherRecapAvantNarratif(monde, etoiles, onFin, initialiserUiObjectifs);
}

export function initialiserUiObjectifs() {
    ancrerOverlaysObjectifsAuBody();
    const btn = _el('btn-objectifs-commencer');
    const recap = _el('overlay-recap-monde');
    const btnRecap = _el('btn-recap-continuer');
    if (!btn && !recap && !btnRecap) return;

    if (!_listenersAttaches) {
        _listenersAttaches = true;

        btn?.addEventListener('click', () => commencerDepuisPanneauObjectifs());

        btn?.addEventListener('keydown', (ev) => {
            if (ev.key === 'Enter' || ev.key === ' ') {
                ev.preventDefault();
                commencerDepuisPanneauObjectifs();
            }
        });

        ecouter('difficulte:vague', ({ montee, palierApres }) => {
            _flashVague(montee);
            if (montee && palierApres != null) {
                afficherNotificationNiveau(`PALIER P${palierApres}`);
            }
            rafraichirHudObjectifsHistoire();
        });

        ecouter('boss:phase', () => rafraichirHudObjectifsHistoire());

        ecouter('partie:stats', () => {
            if (modeHistoireEnCours()) rafraichirHudObjectifsHistoire();
        });

        ecouter('lignes:effacees', () => {
            if (modeHistoireEnCours()) rafraichirHudObjectifsHistoire();
        });
    }

    attacherEcouteursRecapOverlay();
}

/** @param {MondeHistoire} monde @param {() => void} onCommencer */
export function proposerPanneauObjectifsAvantPartie(monde, onCommencer) {
    if (!DIFFICULTE_MONDES[monde.id]) {
        demarrerSuiviMonde(monde.id);
        onCommencer();
        return;
    }

    const etatHist = obtenirEtatHistoire();
    if (etatHist.mondesCompletes.includes(monde.id)) {
        demarrerSuiviMonde(monde.id);
        cacherEcransPourObjectifs();
        fermerOverlaysFluxPartie();
        onCommencer();
        return;
    }

    afficherPanneauObjectifs(monde, onCommencer, initialiserUiObjectifs);
}
