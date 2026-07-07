import { obtenirEtatHistoire } from './histoire-mondes.js';
import { mondeVersEcran } from './histoire-map-camera.js';
import { sansAccentsE } from '../texte-jeu.js';

/** @param {string[]} ids @param {object} etatCarte */
function chapitreEstRevele(ids, etatCarte) {
    const etatHist = obtenirEtatHistoire();
    return ids.some(
        (id) =>
            etatCarte.mondesVisibles.has(id) ||
            etatCarte.mondesFantomes?.has(id) ||
            etatHist.mondesCompletes?.includes(id)
    );
}

/** @param {object} etatCarte @param {number} w @param {number} h */
export function dessinerEtiquettesChapitres(etatCarte, w, h) {
    const { ctxCarte: ctx, positionsNoeuds, camera } = etatCarte;
    if (!ctx || !camera) return;

    const chapitresCouleurs = {
        prologue: '#00f5ff',
        chapitre_1: '#ff4500',
        chapitre_2: '#00cfff',
        chapitre_3: '#ffbb44',
        chapitre_4: '#b400ff',
        finale: '#ff006e',
    };
    const chapitresLabels = {
        prologue: 'PROLOGUE',
        chapitre_1: '— CHAPITRE I — LE FEU',
        chapitre_2: '— CHAPITRE II — LES PROFONDEURS',
        chapitre_3: '— CHAPITRE III — LA MEMOIRE',
        chapitre_4: '— CHAPITRE IV — LA FRACTURE',
        finale: '— FINALE —',
    };

    const rangees = [
        { chapId: 'prologue', ids: ['monde_prologue', 'monde_lave'] },
        { chapId: 'chapitre_1', ids: ['monde_lave', 'monde_boss_1'] },
        { chapId: 'chapitre_2', ids: ['monde_boss_1', 'monde_boss_2'] },
        { chapId: 'chapitre_3', ids: ['monde_boss_2', 'monde_boss_3'] },
        { chapId: 'chapitre_4', ids: ['monde_boss_3', 'monde_boss_4'] },
        { chapId: 'finale', ids: ['monde_finale'] },
    ];

    const margeHaut = 76;
    const margeBas = 56;
    const margeGauche = 22;

    for (const { chapId, ids } of rangees) {
        if (!chapitreEstRevele(ids, etatCarte)) continue;

        const ys = ids.map((id) => positionsNoeuds[id]?.y).filter((y) => y != null);
        if (!ys.length) continue;

        const yMoy = chapId === 'finale' ? ys[0] : ys.reduce((a, b) => a + b, 0) / ys.length;
        const { sy } = mondeVersEcran(camera, w * 0.5, yMoy, w, h);
        if (sy < margeHaut || sy > h - margeBas) continue;

        const couleur = chapitresCouleurs[chapId] ?? '#ffffff';
        const label = chapitresLabels[chapId] ?? '';

        ctx.save();
        ctx.font = '8px "Press Start 2P", monospace';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = couleur + 'cc';
        ctx.shadowColor = couleur;
        ctx.shadowBlur = 8;
        ctx.fillText(sansAccentsE(label), margeGauche, sy - 10);
        ctx.shadowBlur = 0;
        ctx.strokeStyle = couleur + '35';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(margeGauche, sy + 6);
        ctx.lineTo(Math.min(w - 24, margeGauche + 380), sy + 6);
        ctx.stroke();
        ctx.restore();
    }
}

/** @param {object} etatCarte @param {CanvasRenderingContext2D} ctx @param {number} w @param {number} h */
export function dessinerBrouillardFutur(etatCarte, ctx, w, h) {
    const { positionsNoeuds, mondesVisibles, camera } = etatCarte;
    if (!camera) return;

    let yFrontiereMonde = -1;
    for (const [id, pos] of Object.entries(positionsNoeuds)) {
        if (!mondesVisibles.has(id)) continue;
        if (pos.y > yFrontiereMonde) yFrontiereMonde = pos.y;
    }

    if (yFrontiereMonde < 0) return;

    const { sy: yDebut } = mondeVersEcran(camera, w * 0.5, yFrontiereMonde + 50, w, h);
    if (yDebut >= h) return;

    const yGradHaut = Math.max(0, yDebut - 80);
    const grad1 = ctx.createLinearGradient(0, yGradHaut, 0, yDebut + 40);
    grad1.addColorStop(0, 'transparent');
    grad1.addColorStop(1, 'rgba(2,2,14,0.78)');
    ctx.save();
    ctx.fillStyle = grad1;
    ctx.fillRect(0, yGradHaut, w, yDebut + 40 - yGradHaut);
    ctx.restore();

    if (yDebut + 40 < h) {
        ctx.save();
        ctx.fillStyle = 'rgba(2,2,14,0.82)';
        ctx.fillRect(0, yDebut + 40, w, h - yDebut - 40);
        ctx.restore();
    }
}

/** @param {CanvasRenderingContext2D} ctx @param {number} w @param {number} h */
export function dessinerVignetteCarte(ctx, w, h) {
    const grad = ctx.createRadialGradient(w / 2, h / 2, h * 0.25, w / 2, h / 2, h * 0.78);
    grad.addColorStop(0, 'rgba(0,0,0,0)');
    grad.addColorStop(1, 'rgba(0,0,0,0.40)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
}

/** @param {object} etatCarte @param {CanvasRenderingContext2D} ctx @param {number} w @param {number} h */
export function dessinerIndicateurScroll(etatCarte, ctx, w, h) {
    const cam = etatCarte.camera;
    if (!cam) return;

    const range = cam.scrollMax - cam.scrollMin;
    if (range <= 4) return;

    const ratio = Math.max(0, Math.min(1, (cam.cibleY - cam.scrollMin) / range));
    const trackX = w - 8;
    const trackTop = h * 0.22;
    const trackH = h * 0.56;
    const thumbH = Math.max(28, trackH * 0.12);
    const thumbY = trackTop + ratio * (trackH - thumbH);

    ctx.save();
    ctx.globalAlpha = 0.35;
    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    ctx.fillRect(trackX - 2, trackTop, 3, trackH);
    ctx.globalAlpha = 0.7;
    ctx.fillStyle = '#00f5ff';
    ctx.shadowColor = '#00f5ff';
    ctx.shadowBlur = 6;
    ctx.fillRect(trackX - 2, thumbY, 3, thumbH);
    ctx.shadowBlur = 0;
    ctx.restore();
}

/** @param {object} etatCarte */
export function synchroniserPanneauMondeSelectionne(etatCarte) {
    const idSel = etatCarte.noeudSelectionne ?? null;
    const panneau = document.getElementById('histoire-monde-details');

    if (!idSel) {
        panneau?.classList.add('histoire-panneau-masque');
        return;
    }

    panneau?.classList.remove('histoire-panneau-masque');
}
