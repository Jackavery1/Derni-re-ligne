import { SEQUENCE_HISTOIRE } from './histoire-donnees.js';
import { obtenirCanvas } from './dom-utils.js';
import { obtenirEtatHistoirePersiste } from './histoire-etat.js';
import { paradoxeEstDebloque } from './monde-paradoxe-etat.js';
import { dessinerCarteHistoire, invaliderCoucheEtoilesCarte } from './histoire-map-rendu.js';
import {
    attacherEvenementsCarteHistoire,
    lancerMondeDepuisCarte,
    mettreAJourEnteteHistoire,
    mettreAJourSelectMondesClavier,
    traiterSelectionNoeud,
} from './histoire-map-ui.js';
import { configurerActionsHistoire } from './histoire-actions.js';
import { mondePeutEtreJoue } from './histoire-mondes.js';

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
    scrollOk: false,
    camera: {
        y: 0,
        zoom: 1.4,
        cibleY: 0,
        cibleZoom: 1.4,
        vitesseLerp: 0.07,
        scrollMin: -200,
        scrollMax: 400,
        initialise: false,
    },
};

export function initialiserCarteMonde() {
    etatCarte.canvasCarte = obtenirCanvas('canvas-histoire-map');
    if (!etatCarte.canvasCarte) return false;
    etatCarte.camera.initialise = false;
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

    if (!etatCarte.scrollOk) {
        etatCarte.scrollOk = true;

        etatCarte.canvasCarte.addEventListener(
            'wheel',
            (e) => {
                e.preventDefault();
                const cam = etatCarte.camera;
                cam.cibleY = Math.max(
                    cam.scrollMin,
                    Math.min(cam.scrollMax, cam.cibleY + e.deltaY * 0.55)
                );
            },
            { passive: false }
        );

        let touchDebutY = 0;
        let cameraYAuDebut = 0;

        etatCarte.canvasCarte.addEventListener(
            'touchstart',
            (e) => {
                touchDebutY = e.touches[0].clientY;
                cameraYAuDebut = etatCarte.camera.cibleY;
            },
            { passive: true }
        );

        etatCarte.canvasCarte.addEventListener(
            'touchmove',
            (e) => {
                e.preventDefault();
                const dy = touchDebutY - e.touches[0].clientY;
                const cam = etatCarte.camera;
                cam.cibleY = Math.max(
                    cam.scrollMin,
                    Math.min(cam.scrollMax, cameraYAuDebut + dy * 1.1)
                );
            },
            { passive: false }
        );
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
    const E = Math.min(w / 1200, h / 800, 1.5);
    const R = 22 * E;

    /** @type {Array<[string, number, number, number]>} */
    const defPositions = [
        ['monde_prologue', 0.5, 0.05, R * 1.1],
        ['monde_lave', 0.22, 0.16, R],
        ['monde_rouille', 0.5, 0.19, R],
        ['monde_boss_1', 0.8, 0.13, R * 1.3],
        ['monde_ocean', 0.13, 0.3, R],
        ['monde_foret', 0.38, 0.33, R],
        ['monde_glace', 0.61, 0.28, R],
        ['monde_boss_2', 0.84, 0.24, R * 1.3],
        ['monde_desert', 0.18, 0.46, R],
        ['monde_eclipse', 0.41, 0.5, R],
        ['monde_cyber', 0.63, 0.46, R],
        ['monde_boss_3', 0.83, 0.41, R * 1.3],
        ['monde_fuochi', 0.21, 0.62, R],
        ['monde_cosmos', 0.43, 0.66, R],
        ['monde_vide', 0.65, 0.62, R],
        ['monde_boss_4', 0.82, 0.57, R * 1.3],
        ['monde_finale', 0.5, 0.82, R * 1.6],
    ];

    for (const [id, fx, fy, rayon] of defPositions) {
        placerNoeud(id, fx * w, fy * h, Math.round(rayon));
    }

    const etatHist = obtenirEtatHistoirePersiste();

    if (
        etatHist.conditionsMiroir.bossArchivisteVaincu &&
        etatHist.conditionsMiroir.tetrisTriplesCyber >= 3
    ) {
        placerNoeud(
            'monde_miroir',
            0.06 * w,
            etatCarte.positionsNoeuds['monde_eclipse']?.y ?? h * 0.51,
            Math.round(R * 0.85)
        );
    }

    if (etatHist.conditionsTrame.miroirComplete) {
        placerNoeud(
            'monde_trame',
            0.94 * w,
            etatCarte.positionsNoeuds['monde_foret']?.y ?? h * 0.38,
            Math.round(R * 0.85)
        );
    }

    if (paradoxeEstDebloque()) {
        placerNoeud('monde_paradoxe', 0.12 * w, 0.09 * h, Math.round(R * 0.45));
    }
}

function _mettreAJourVisibiliteCarte() {
    const etatHist = obtenirEtatHistoirePersiste();
    const sequenceP = SEQUENCE_HISTOIRE.filter((m) => !m.estCache);

    etatCarte.mondesVisibles.clear();
    etatCarte.mondesFantomes.clear();
    etatCarte.mondeActuel = null;

    let dernierCompletIdx = -1;
    let premierDispoIdx = -1;

    for (let i = 0; i < sequenceP.length; i++) {
        const m = sequenceP[i];
        if (etatHist.mondesCompletes.includes(m.id)) {
            etatCarte.mondesVisibles.add(m.id);
            dernierCompletIdx = i;
        } else if (mondePeutEtreJoue(m.id, etatHist) && premierDispoIdx === -1) {
            etatCarte.mondesVisibles.add(m.id);
            premierDispoIdx = i;
            etatCarte.mondeActuel = m.id;
        }
    }

    if (premierDispoIdx === -1 && sequenceP.length > 0) {
        etatCarte.mondesVisibles.add(sequenceP[0].id);
        etatCarte.mondeActuel = sequenceP[0].id;
        premierDispoIdx = 0;
    }

    for (let j = premierDispoIdx + 1; j <= premierDispoIdx + 2 && j < sequenceP.length; j++) {
        if (!etatCarte.mondesVisibles.has(sequenceP[j].id)) {
            etatCarte.mondesFantomes.add(sequenceP[j].id);
        }
    }

    for (const m of SEQUENCE_HISTOIRE.filter((mc) => mc.estCache)) {
        if (mondePeutEtreJoue(m.id, etatHist)) {
            etatCarte.mondesVisibles.add(m.id);
        }
    }

    if (!etatCarte.mondeActuel && dernierCompletIdx >= 0) {
        etatCarte.mondeActuel = sequenceP[dernierCompletIdx].id;
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

function _lerpCamera() {
    const cam = etatCarte.camera;
    const v = cam.vitesseLerp;

    cam.y += (cam.cibleY - cam.y) * v;
    cam.zoom += (cam.cibleZoom - cam.zoom) * v;

    if (!cam.initialise && etatCarte.mondeActuel) {
        const pos = etatCarte.positionsNoeuds[etatCarte.mondeActuel];
        if (pos && etatCarte.canvasCarte) {
            const h = etatCarte.canvasCarte.height;
            cam.cibleY = pos.y - h / 2;
            cam.y = cam.cibleY;
            cam.cibleZoom = 1.5;
            cam.zoom = 1.5;
            cam.scrollMin = cam.cibleY - h * 0.15;
            cam.scrollMax = cam.cibleY + h * 0.65;
            cam.initialise = true;
        }
    }
}

function boucleCarte(timestamp) {
    if (!etatCarte.carteActive || !etatCarte.ctxCarte || !etatCarte.canvasCarte) return;
    _mettreAJourVisibiliteCarte();
    _lerpCamera();
    dessinerCarteHistoire(etatCarte, timestamp);
    etatCarte.idFrameCarte = requestAnimationFrame(boucleCarte);
}

function coordsCanvas(clientX, clientY) {
    if (!etatCarte.canvasCarte) return { cx: clientX, cy: clientY };
    const rect = etatCarte.canvasCarte.getBoundingClientRect();
    const scaleX = etatCarte.canvasCarte.width / rect.width;
    const scaleY = etatCarte.canvasCarte.height / rect.height;
    const sx = (clientX - rect.left) * scaleX;
    const sy = (clientY - rect.top) * scaleY;
    const w = etatCarte.canvasCarte.width;
    const h = etatCarte.canvasCarte.height;
    const cam = etatCarte.camera;
    return {
        cx: (sx - w / 2) / cam.zoom + w / 2,
        cy: (sy - h / 2) / cam.zoom + h / 2 + cam.y,
    };
}

function noeudSousCurseur(cx, cy) {
    for (const [id, pos] of Object.entries(etatCarte.positionsNoeuds)) {
        if (!etatCarte.mondesVisibles.has(id)) continue;
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
    etatCarte.camera.initialise = false;
    invaliderCoucheEtoilesCarte();
}

configurerActionsHistoire({ arreterCarte: arreterCarteHistoire });
