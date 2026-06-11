import { SEQUENCE_HISTOIRE } from './histoire-donnees.js';
import { obtenirCanvas } from './dom-utils.js';
import { obtenirEtatHistoirePersiste } from './histoire-etat.js';
import { dessinerCarteHistoire, invaliderDonneesEtoilesHistoire } from './histoire-map-rendu.js';
import { ecranVersMonde } from './histoire-map-camera.js';
import {
    attacherEvenementsCarteHistoire,
    lancerMondeDepuisCarte,
    mettreAJourEnteteHistoire,
    mettreAJourSelectMondesClavier,
    mettreAJourAriaCarteHistoire,
    traiterSelectionNoeud,
} from './histoire-map-ui.js';
import { configurerActionsHistoire } from './histoire-actions.js';
import { obtenirEtatHistoire, mondePeutEtreJoue } from './histoire-mondes.js';
import { logger } from './logger.js';
import { consommerMondeCibleCarte } from './histoire-navigation.js';
import { annulerPrechargementMedias, demarrerPrechargementCarte } from './prechargement-medias.js';

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
    mettreAJourEnteteHistoire();
    mettreAJourSelectMondesClavier(etatCarte, (noeud, doubleTap) =>
        traiterSelectionNoeud(etatCarte, noeud, doubleTap, lancerMondeDepuisCarte)
    );

    if (!etatCarte.scrollOk) {
        etatCarte.scrollOk = true;
        const cvs = etatCarte.canvasCarte;

        const ZOOM_MIN = 1;
        const ZOOM_MAX = 2.4;

        cvs.addEventListener(
            'wheel',
            (e) => {
                e.preventDefault();
                const cam = etatCarte.camera;
                if (e.ctrlKey) {
                    cam.cibleZoom = Math.max(
                        ZOOM_MIN,
                        Math.min(ZOOM_MAX, cam.cibleZoom - e.deltaY * 0.002)
                    );
                    return;
                }
                cam.cibleY = Math.max(
                    cam.scrollMin,
                    Math.min(cam.scrollMax, cam.cibleY + e.deltaY * 0.45)
                );
            },
            { passive: false }
        );

        let touchY0 = 0;
        let camY0 = 0;
        let pinchDist0 = 0;
        let pinchZoom0 = 1.6;
        cvs.addEventListener(
            'touchstart',
            (e) => {
                if (e.touches.length === 2) {
                    const dx = e.touches[0].clientX - e.touches[1].clientX;
                    const dy = e.touches[0].clientY - e.touches[1].clientY;
                    pinchDist0 = Math.hypot(dx, dy) || 1;
                    pinchZoom0 = etatCarte.camera.cibleZoom;
                    return;
                }
                touchY0 = e.touches[0].clientY;
                camY0 = etatCarte.camera.cibleY;
            },
            { passive: true }
        );
        cvs.addEventListener(
            'touchmove',
            (e) => {
                e.preventDefault();
                const cam = etatCarte.camera;
                if (e.touches.length === 2) {
                    const dx = e.touches[0].clientX - e.touches[1].clientX;
                    const dy = e.touches[0].clientY - e.touches[1].clientY;
                    const dist = Math.hypot(dx, dy) || 1;
                    cam.cibleZoom = Math.max(
                        ZOOM_MIN,
                        Math.min(ZOOM_MAX, pinchZoom0 * (dist / pinchDist0))
                    );
                    return;
                }
                cam.cibleY = Math.max(
                    cam.scrollMin,
                    Math.min(cam.scrollMax, camY0 + (touchY0 - e.touches[0].clientY) * 1.1)
                );
            },
            { passive: false }
        );
    }

    return true;
}

function redimensionnerCanvas() {
    if (!etatCarte.canvasCarte) return;
    etatCarte.canvasCarte.width = window.innerWidth;
    etatCarte.canvasCarte.height = window.innerHeight;
}

function calculerPositionsNoeuds() {
    const canvas = etatCarte.canvasCarte;
    if (!canvas) return;
    const w = canvas.width;

    const PAS_Y = 140;
    const MARGE_Y = 100;
    const R = 20;
    const R_BOSS = 28;

    /** @type {[string, number, number][]} */
    const LAYOUT = [
        ['monde_prologue', 0.5, R],
        ['monde_lave', 0.32, R],
        ['monde_rouille', 0.68, R],
        ['monde_boss_1', 0.5, R_BOSS],
        ['monde_ocean', 0.3, R],
        ['monde_foret', 0.65, R],
        ['monde_glace', 0.38, R],
        ['monde_boss_2', 0.5, R_BOSS],
        ['monde_desert', 0.64, R],
        ['monde_eclipse', 0.32, R],
        ['monde_cyber', 0.62, R],
        ['monde_boss_3', 0.5, R_BOSS],
        ['monde_fuochi', 0.28, R],
        ['monde_cosmos', 0.68, R],
        ['monde_vide', 0.38, R],
        ['monde_boss_4', 0.5, R_BOSS],
        ['monde_finale', 0.5, R_BOSS + 4],
    ];

    etatCarte.positionsNoeuds = {};
    LAYOUT.forEach(([id, xFrac, rayon], index) => {
        placerNoeud(id, Math.round(w * xFrac), Math.round(MARGE_Y + index * PAS_Y), rayon);
    });

    const etatHist = obtenirEtatHistoirePersiste();

    if (mondePeutEtreJoue('monde_miroir', etatHist)) {
        placerNoeud(
            'monde_miroir',
            Math.round(0.06 * w),
            etatCarte.positionsNoeuds['monde_eclipse']?.y ?? MARGE_Y + 9 * PAS_Y,
            Math.round(R * 0.85)
        );
    }

    if (mondePeutEtreJoue('monde_trame', etatHist)) {
        placerNoeud(
            'monde_trame',
            Math.round(0.94 * w),
            etatCarte.positionsNoeuds['monde_foret']?.y ?? MARGE_Y + 5 * PAS_Y,
            Math.round(R * 0.85)
        );
    }

    if (mondePeutEtreJoue('monde_paradoxe', etatHist)) {
        const yPrologue = etatCarte.positionsNoeuds['monde_prologue']?.y ?? MARGE_Y;
        placerNoeud('monde_paradoxe', Math.round(0.12 * w), yPrologue - 55, Math.round(R * 0.45));
    }
}

function placerNoeud(id, x, y, rayon) {
    etatCarte.positionsNoeuds[id] = { x, y, rayon };
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
        if (mondePeutEtreJoue(m.id, etatHist) && etatCarte.positionsNoeuds[m.id]) {
            etatCarte.mondesVisibles.add(m.id);
        }
    }

    if (!etatCarte.mondeActuel && dernierCompletIdx >= 0) {
        etatCarte.mondeActuel = sequenceP[dernierCompletIdx].id;
    }
}

function _lerpCamera() {
    const cam = etatCarte.camera;
    cam.y += (cam.cibleY - cam.y) * cam.vitesseLerp;
    cam.zoom += (cam.cibleZoom - cam.zoom) * cam.vitesseLerp;

    if (cam.initialise) return;

    const canvas = etatCarte.canvasCarte;
    if (!canvas) return;
    const h = canvas.height;

    const etatHist = obtenirEtatHistoire();
    const SEQUENCE = [
        'monde_prologue',
        'monde_lave',
        'monde_rouille',
        'monde_boss_1',
        'monde_ocean',
        'monde_foret',
        'monde_glace',
        'monde_boss_2',
        'monde_desert',
        'monde_eclipse',
        'monde_cyber',
        'monde_boss_3',
        'monde_fuochi',
        'monde_cosmos',
        'monde_vide',
        'monde_boss_4',
        'monde_finale',
    ];
    const navCible = consommerMondeCibleCarte();
    let idCible = navCible ?? 'monde_prologue';
    if (!navCible) {
        for (const id of SEQUENCE) {
            if (mondePeutEtreJoue(id, etatHist)) {
                idCible = id;
                break;
            }
        }
    }

    const pos = etatCarte.positionsNoeuds[idCible];
    if (!pos) return;

    const ZOOM = 1.6;
    const RATIO_FOCUS_Y = 0.33;

    const cibleY = pos.y - h / 2 + ((0.5 - RATIO_FOCUS_Y) * h) / ZOOM;

    const posFinale = etatCarte.positionsNoeuds['monde_finale'];
    const yMax = posFinale ? posFinale.y - h / (ZOOM * 1.8) : cibleY + 800;

    cam.scrollMin = -60;
    cam.scrollMax = Math.max(cibleY + 40, yMax);
    cam.y = cibleY;
    cam.cibleY = cibleY;
    cam.zoom = ZOOM;
    cam.cibleZoom = ZOOM;
    cam.initialise = true;

    logger.debug(`[carte] focus : ${idCible} y=${Math.round(cibleY)} zoom=${ZOOM}`);

    if (navCible) {
        const monde = SEQUENCE_HISTOIRE.find((m) => m.id === navCible);
        if (monde) {
            etatCarte.noeudSelectionne = navCible;
            traiterSelectionNoeud(
                etatCarte,
                { id: navCible, monde },
                false,
                lancerMondeDepuisCarte
            );
        }
    }
}

export async function demarrerCarteHistoire() {
    arreterCarteHistoire();
    const { chargerHistoireTextes } = await import('./charger-histoire-textes.js');
    await chargerHistoireTextes();
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
    _mettreAJourVisibiliteCarte();
    _lerpCamera();
    dessinerCarteHistoire(etatCarte, timestamp);
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
    const cvs = etatCarte.canvasCarte;
    const w = cvs?.width ?? 0;
    const h = cvs?.height ?? 0;
    const { mx, my } = ecranVersMonde(etatCarte.camera, cx, cy, w, h);
    for (const [id, pos] of Object.entries(etatCarte.positionsNoeuds)) {
        if (!etatCarte.mondesVisibles.has(id)) continue;
        const dx = mx - pos.x;
        const dy = my - pos.y;
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
    etatCarte.scrollOk = false;
    invaliderDonneesEtoilesHistoire();
}

configurerActionsHistoire({ arreterCarte: arreterCarteHistoire });

window.addEventListener('dl-dev-refresh', () => {
    if (!etatCarte.carteActive) return;
    calculerPositionsNoeuds();
    etatCarte.camera.initialise = false;
    mettreAJourSelectMondesClavier(etatCarte, (noeud, doubleTap) =>
        traiterSelectionNoeud(etatCarte, noeud, doubleTap, lancerMondeDepuisCarte)
    );
});
