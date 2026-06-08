import { SEQUENCE_HISTOIRE } from './histoire-donnees.js';
import { obtenirCanvas } from './dom-utils.js';
import { obtenirEtatHistoirePersiste } from './histoire-etat.js';
import { paradoxeEstDebloque } from './monde-paradoxe-etat.js';
import { dessinerCarteHistoire } from './histoire-map-rendu.js';
import {
    attacherEvenementsCarteHistoire,
    lancerMondeDepuisCarte,
    mettreAJourEnteteHistoire,
    mettreAJourSelectMondesClavier,
    traiterSelectionNoeud,
} from './histoire-map-ui.js';
import { configurerActionsHistoire } from './histoire-actions.js';

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
    evenementsCarteAttaches: false,
    selectMondesOk: false,
};

export function initialiserCarteMonde() {
    etatCarte.canvasCarte = obtenirCanvas('canvas-histoire-map');
    if (!etatCarte.canvasCarte) return false;
    etatCarte.ctxCarte = etatCarte.canvasCarte.getContext('2d');
    redimensionnerCanvas();
    calculerPositionsNoeuds();
    if (!etatCarte.evenementsCarteAttaches) {
        attacherEvenementsCarteHistoire(
            etatCarte,
            coordsCanvas,
            noeudSousCurseur,
            (noeud, doubleTap) =>
                traiterSelectionNoeud(etatCarte, noeud, doubleTap, lancerMondeDepuisCarte)
        );
        etatCarte.evenementsCarteAttaches = true;
    }
    mettreAJourEnteteHistoire();
    mettreAJourSelectMondesClavier(etatCarte, (noeud, doubleTap) =>
        traiterSelectionNoeud(etatCarte, noeud, doubleTap, lancerMondeDepuisCarte)
    );
    return true;
}

function redimensionnerCanvas() {
    if (!etatCarte.canvasCarte) return;
    etatCarte.canvasCarte.width = window.innerWidth;
    etatCarte.canvasCarte.height = window.innerHeight;
}

function calculerPositionsNoeuds() {
    etatCarte.positionsNoeuds = {};
    if (!etatCarte.canvasCarte) return;

    const w = etatCarte.canvasCarte.width;
    const h = etatCarte.canvasCarte.height;
    const pX = w * 0.1;
    const pY = h * 0.09;
    const zoneH = h - pY * 2;
    const zoneW = w - pX * 2;
    const nbRangees = 6;
    const pasY = zoneH / (nbRangees - 1);

    placerNoeud('monde_prologue', w / 2, pY, 22);

    const y1 = pY + pasY;
    placerNoeud('monde_lave', pX + zoneW * 0.15, y1, 22);
    placerNoeud('monde_rouille', pX + zoneW * 0.5, y1, 22);
    placerNoeud('monde_boss_1', pX + zoneW * 0.85, y1, 28);

    const y2 = pY + pasY * 2;
    placerNoeud('monde_ocean', pX + zoneW * 0.08, y2, 22);
    placerNoeud('monde_foret', pX + zoneW * 0.33, y2, 22);
    placerNoeud('monde_glace', pX + zoneW * 0.6, y2, 22);
    placerNoeud('monde_boss_2', pX + zoneW * 0.88, y2, 28);

    const y3 = pY + pasY * 3;
    placerNoeud('monde_desert', pX + zoneW * 0.08, y3, 22);
    placerNoeud('monde_eclipse', pX + zoneW * 0.33, y3, 22);
    placerNoeud('monde_cyber', pX + zoneW * 0.6, y3, 22);
    placerNoeud('monde_boss_3', pX + zoneW * 0.88, y3, 28);

    const y4 = pY + pasY * 4;
    placerNoeud('monde_fuochi', pX + zoneW * 0.08, y4, 22);
    placerNoeud('monde_cosmos', pX + zoneW * 0.33, y4, 22);
    placerNoeud('monde_vide', pX + zoneW * 0.6, y4, 22);
    placerNoeud('monde_boss_4', pX + zoneW * 0.88, y4, 28);

    placerNoeud('monde_finale', w / 2, pY + pasY * 5, 32);

    const etatHist = obtenirEtatHistoirePersiste();

    if (
        etatHist.conditionsMiroir.bossArchivisteVaincu &&
        etatHist.conditionsMiroir.tetrisTriplesCyber >= 3
    ) {
        placerNoeud(
            'monde_miroir',
            pX * 0.35,
            etatCarte.positionsNoeuds['monde_eclipse']?.y ?? h / 2,
            20
        );
    }

    if (etatHist.conditionsTrame.miroirComplete) {
        placerNoeud(
            'monde_trame',
            w - pX * 0.35,
            etatCarte.positionsNoeuds['monde_foret']?.y ?? h * 0.4,
            20
        );
    }

    if (paradoxeEstDebloque()) {
        placerNoeud('monde_paradoxe', pX * 0.12, h - pY * 0.6, 8);
    }
}

function placerNoeud(id, x, y, rayon) {
    etatCarte.positionsNoeuds[id] = { x, y, rayon };
}

export async function demarrerCarteHistoire() {
    arreterCarteHistoire();
    const { chargerHistoireTextes } = await import('./charger-histoire-textes.js');
    await chargerHistoireTextes();
    if (!initialiserCarteMonde()) return;
    etatCarte.carteActive = true;
    etatCarte.idFrameCarte = requestAnimationFrame(boucleCarte);
}

export function arreterCarteHistoire() {
    etatCarte.carteActive = false;
    if (etatCarte.idFrameCarte) {
        cancelAnimationFrame(etatCarte.idFrameCarte);
        etatCarte.idFrameCarte = null;
    }
}

function boucleCarte(timestamp) {
    if (!etatCarte.carteActive || !etatCarte.ctxCarte || !etatCarte.canvasCarte) return;
    dessinerCarteHistoire(etatCarte, timestamp);
    etatCarte.idFrameCarte = requestAnimationFrame(boucleCarte);
}

function coordsCanvas(clientX, clientY) {
    if (!etatCarte.canvasCarte) return { cx: clientX, cy: clientY };
    const rect = etatCarte.canvasCarte.getBoundingClientRect();
    const scaleX = etatCarte.canvasCarte.width / rect.width;
    const scaleY = etatCarte.canvasCarte.height / rect.height;
    return {
        cx: (clientX - rect.left) * scaleX,
        cy: (clientY - rect.top) * scaleY,
    };
}

function noeudSousCurseur(cx, cy) {
    for (const [id, pos] of Object.entries(etatCarte.positionsNoeuds)) {
        const dx = cx - pos.x;
        const dy = cy - pos.y;
        const hitRadius = pos.rayon + 10;
        if (dx * dx + dy * dy <= hitRadius * hitRadius) {
            const monde = SEQUENCE_HISTOIRE.find((m) => m.id === id);
            if (!monde) continue;
            return { id, monde, pos };
        }
    }
    return null;
}

export function redimensionnerCarteHistoire() {
    if (!etatCarte.canvasCarte || !etatCarte.carteActive) return;
    redimensionnerCanvas();
    calculerPositionsNoeuds();
}

configurerActionsHistoire({ arreterCarte: arreterCarteHistoire });
