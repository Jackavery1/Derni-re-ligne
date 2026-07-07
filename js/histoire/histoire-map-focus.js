import { SEQUENCE_HISTOIRE } from '../histoire-donnees.js';
import { obtenirEtatHistoire, mondePeutEtreJoue } from './histoire-mondes.js';
import { consommerMondeCibleCarte } from './histoire-navigation.js';
import { logger } from '../logger.js';

const SEQUENCE_FOCUS = [
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

/**
 * @param {{
 *   camera: { y: number, zoom: number, cibleY: number, cibleZoom: number, vitesseLerp: number, scrollMin: number, scrollMax: number, initialise: boolean },
 *   canvasCarte: HTMLCanvasElement | null,
 *   positionsNoeuds: Record<string, { x: number, y: number, rayon: number }>,
 *   noeudSelectionne: string | null,
 * }} etatCarte
 * @param {(noeud: { id: string, monde: object }, doubleTap: boolean) => void} traiterSelection
 */
export function mettreAJourCameraCarte(etatCarte, traiterSelection) {
    const cam = etatCarte.camera;
    cam.y += (cam.cibleY - cam.y) * cam.vitesseLerp;
    cam.zoom += (cam.cibleZoom - cam.zoom) * cam.vitesseLerp;

    if (cam.initialise) return;

    const canvas = etatCarte.canvasCarte;
    if (!canvas) return;
    const h = canvas.height;

    const etatHist = obtenirEtatHistoire();
    const navCible = consommerMondeCibleCarte();
    let idCible = navCible ?? 'monde_prologue';
    if (!navCible) {
        for (const id of SEQUENCE_FOCUS) {
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
            traiterSelection({ id: navCible, monde }, false);
        }
    }
}
