import { obtenirEtatHistoire, mondePeutEtreJoue } from './histoire-mondes.js';
import { appliquerTransformCamera, mondeVersEcran } from './histoire-map-camera.js';
import { sansAccentsE } from './texte-jeu.js';
import { dessinerEtoilesFond, invaliderDonneesEtoilesHistoire } from './histoire-map-fond.js';
import { dessinerTousLesNoeuds } from './histoire-map-noeuds.js';

export { invaliderDonneesEtoilesHistoire };

export function dessinerCarteHistoire(etatCarte, timestamp) {
    const { canvasCarte: cvs, ctxCarte: ctx } = etatCarte;
    if (!cvs || !ctx) return;
    const w = cvs.width;
    const h = cvs.height;

    ctx.fillStyle = '#020210';
    ctx.fillRect(0, 0, w, h);
    dessinerEtoilesFond(etatCarte, timestamp);

    ctx.save();
    appliquerTransformCamera(etatCarte.camera, ctx, w, h);

    _dessinerChemins(etatCarte, timestamp);
    dessinerTousLesNoeuds(etatCarte, timestamp);

    ctx.restore();

    _dessinerBrouillardFutur(etatCarte, ctx, w, h);
    _dessinerEtiquettesChapitres(etatCarte, w, h);
    _dessinerVignette(ctx, w, h);
    _dessinerIndicateurScroll(etatCarte, ctx, w, h);
    _dessinerPanelMondeSelectionne(etatCarte, ctx, w, h);
}

function _chapitreEstRevele(ids, etatCarte) {
    const etatHist = obtenirEtatHistoire();
    return ids.some(
        (id) =>
            etatCarte.mondesVisibles.has(id) ||
            etatCarte.mondesFantomes?.has(id) ||
            etatHist.mondesCompletes?.includes(id)
    );
}

function _dessinerEtiquettesChapitres(etatCarte, w, h) {
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
        if (!_chapitreEstRevele(ids, etatCarte)) continue;

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

function _dessinerChemins(etatCarte, timestamp) {
    const { ctxCarte: ctx, positionsNoeuds, mondesVisibles, mondesFantomes } = etatCarte;
    if (!ctx) return;
    const etatHist = obtenirEtatHistoire();
    const t = timestamp / 1000;

    const CONNEXIONS = [
        ['monde_prologue', 'monde_lave'],
        ['monde_lave', 'monde_rouille'],
        ['monde_rouille', 'monde_boss_1'],
        ['monde_boss_1', 'monde_ocean'],
        ['monde_ocean', 'monde_foret'],
        ['monde_foret', 'monde_glace'],
        ['monde_glace', 'monde_boss_2'],
        ['monde_boss_2', 'monde_desert'],
        ['monde_desert', 'monde_eclipse'],
        ['monde_eclipse', 'monde_cyber'],
        ['monde_cyber', 'monde_boss_3'],
        ['monde_boss_3', 'monde_fuochi'],
        ['monde_fuochi', 'monde_cosmos'],
        ['monde_cosmos', 'monde_vide'],
        ['monde_vide', 'monde_boss_4'],
        ['monde_boss_4', 'monde_finale'],
    ];

    const COULEURS = {
        'monde_prologue-monde_lave': '#ff6a00',
        'monde_lave-monde_rouille': '#ff4500',
        'monde_rouille-monde_boss_1': '#ff4500',
        'monde_boss_1-monde_ocean': '#00cfff',
        'monde_ocean-monde_foret': '#00cfff',
        'monde_foret-monde_glace': '#aaeeff',
        'monde_glace-monde_boss_2': '#aaeeff',
        'monde_boss_2-monde_desert': '#ffbb44',
        'monde_desert-monde_eclipse': '#ffbb44',
        'monde_eclipse-monde_cyber': '#ff00ff',
        'monde_cyber-monde_boss_3': '#ff00ff',
        'monde_boss_3-monde_fuochi': '#b400ff',
        'monde_fuochi-monde_cosmos': '#b400ff',
        'monde_cosmos-monde_vide': '#7700ff',
        'monde_vide-monde_boss_4': '#440088',
        'monde_boss_4-monde_finale': '#ff006e',
    };

    function _ptControleS(posA, posB) {
        const dx = posB.x - posA.x;
        const dy = posB.y - posA.y;
        const len = Math.sqrt(dx * dx + dy * dy) || 1;

        const px = -dy / len;
        const py = dx / len;

        const amp = Math.min(60, Math.max(18, len * 0.22));

        const cp1x = posA.x + dx * 0.35 + px * amp;
        const cp1y = posA.y + dy * 0.35 + py * amp;

        const cp2x = posB.x - dx * 0.35 - px * amp;
        const cp2y = posB.y - dy * 0.35 - py * amp;

        return { cp1x, cp1y, cp2x, cp2y };
    }

    function _tracerChemin(posA, posB) {
        const dx = posB.x - posA.x;
        const dy = posB.y - posA.y;
        const len = Math.sqrt(dx * dx + dy * dy) || 1;

        const startX = posA.x + (dx / len) * (posA.rayon + 4);
        const startY = posA.y + (dy / len) * (posA.rayon + 4);
        const endX = posB.x - (dx / len) * (posB.rayon + 4);
        const endY = posB.y - (dy / len) * (posB.rayon + 4);

        const { cp1x, cp1y, cp2x, cp2y } = _ptControleS(posA, posB);

        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, endX, endY);
    }

    for (const [idA, idB] of CONNEXIONS) {
        const posA = positionsNoeuds[idA];
        const posB = positionsNoeuds[idB];
        if (!posA || !posB) continue;

        const aVis = !mondesVisibles || mondesVisibles.has(idA) || mondesFantomes?.has(idA);
        const bVis = !mondesVisibles || mondesVisibles.has(idB) || mondesFantomes?.has(idB);
        if (!aVis && !bVis) continue;

        const aComplete = etatHist.mondesCompletes?.includes(idA);
        const bComplete = etatHist.mondesCompletes?.includes(idB);
        const bDispo = mondePeutEtreJoue(idB, etatHist);
        const cle = `${idA}-${idB}`;
        const couleur = COULEURS[cle] ?? '#00f5ff';

        ctx.save();
        ctx.lineCap = 'round';
        ctx.setLineDash([]);

        if (aComplete && bComplete) {
            _tracerChemin(posA, posB);
            ctx.strokeStyle = 'rgba(0,0,0,0.55)';
            ctx.lineWidth = 14;
            ctx.stroke();
            _tracerChemin(posA, posB);
            ctx.strokeStyle = couleur + '99';
            ctx.shadowColor = couleur;
            ctx.shadowBlur = 8;
            ctx.lineWidth = 8;
            ctx.stroke();
            ctx.shadowBlur = 0;
            _tracerChemin(posA, posB);
            ctx.strokeStyle = 'rgba(255,255,255,0.14)';
            ctx.lineWidth = 2;
            ctx.stroke();
            const { cp1x, cp1y, cp2x, cp2y } = _ptControleS(posA, posB);
            for (let p = 0; p < 3; p++) {
                const u = (t * 0.22 + p * 0.33) % 1.0;
                const q = 1 - u;
                const px =
                    q * q * q * posA.x +
                    3 * q * q * u * cp1x +
                    3 * q * u * u * cp2x +
                    u * u * u * posB.x;
                const py =
                    q * q * q * posA.y +
                    3 * q * q * u * cp1y +
                    3 * q * u * u * cp2y +
                    u * u * u * posB.y;
                ctx.globalAlpha = Math.sin(u * Math.PI) * 0.75;
                ctx.fillStyle = '#ffffff';
                ctx.shadowColor = couleur;
                ctx.shadowBlur = 5;
                ctx.beginPath();
                ctx.arc(px, py, 2.5, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;
            }
            ctx.globalAlpha = 1;
        } else if (aComplete && bDispo) {
            const alpha = 0.38 + 0.24 * Math.sin(t * 2.2);
            _tracerChemin(posA, posB);
            ctx.strokeStyle = 'rgba(0,0,0,0.40)';
            ctx.lineWidth = 12;
            ctx.stroke();
            _tracerChemin(posA, posB);
            ctx.strokeStyle = `rgba(0,245,255,${alpha})`;
            ctx.shadowColor = '#00f5ff';
            ctx.shadowBlur = 7;
            ctx.lineWidth = 7;
            ctx.stroke();
            ctx.shadowBlur = 0;
        } else {
            _tracerChemin(posA, posB);
            ctx.strokeStyle = 'rgba(40,35,65,0.55)';
            ctx.lineWidth = 5;
            ctx.setLineDash([5, 9]);
            ctx.stroke();
            ctx.setLineDash([]);
        }

        ctx.restore();
    }
}

function _dessinerBrouillardFutur(etatCarte, ctx, w, h) {
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

function _dessinerVignette(ctx, w, h) {
    const grad = ctx.createRadialGradient(w / 2, h / 2, h * 0.25, w / 2, h / 2, h * 0.78);
    grad.addColorStop(0, 'rgba(0,0,0,0)');
    grad.addColorStop(1, 'rgba(0,0,0,0.40)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
}

function _dessinerIndicateurScroll(etatCarte, ctx, w, h) {
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

function _dessinerPanelMondeSelectionne(etatCarte, ctx, w, h) {
    void ctx;
    void w;
    void h;

    const idSel = etatCarte.noeudSelectionne ?? null;
    const panneau = document.getElementById('histoire-monde-details');

    if (!idSel) {
        panneau?.classList.add('histoire-panneau-masque');
        return;
    }

    panneau?.classList.remove('histoire-panneau-masque');
}
