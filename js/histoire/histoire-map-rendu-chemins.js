import { obtenirEtatHistoire, mondePeutEtreJoue } from './histoire-mondes.js';

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

const COULEURS_CHEMINS = {
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

/** @param {{ x: number, y: number, rayon: number }} posA @param {{ x: number, y: number, rayon: number }} posB */
function ptControleS(posA, posB) {
    const dx = posB.x - posA.x;
    const dy = posB.y - posA.y;
    const len = Math.sqrt(dx * dx + dy * dy) || 1;
    const px = -dy / len;
    const py = dx / len;
    const amp = Math.min(60, Math.max(18, len * 0.22));
    return {
        cp1x: posA.x + dx * 0.35 + px * amp,
        cp1y: posA.y + dy * 0.35 + py * amp,
        cp2x: posB.x - dx * 0.35 - px * amp,
        cp2y: posB.y - dy * 0.35 - py * amp,
    };
}

/** @param {CanvasRenderingContext2D} ctx @param {{ x: number, y: number, rayon: number }} posA @param {{ x: number, y: number, rayon: number }} posB */
function tracerChemin(ctx, posA, posB) {
    const dx = posB.x - posA.x;
    const dy = posB.y - posA.y;
    const len = Math.sqrt(dx * dx + dy * dy) || 1;
    const startX = posA.x + (dx / len) * (posA.rayon + 4);
    const startY = posA.y + (dy / len) * (posA.rayon + 4);
    const endX = posB.x - (dx / len) * (posB.rayon + 4);
    const endY = posB.y - (dy / len) * (posB.rayon + 4);
    const { cp1x, cp1y, cp2x, cp2y } = ptControleS(posA, posB);
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, endX, endY);
}

/** @param {object} etatCarte @param {number} timestamp */
export function dessinerCheminsCarte(etatCarte, timestamp) {
    const { ctxCarte: ctx, positionsNoeuds, mondesVisibles, mondesFantomes } = etatCarte;
    if (!ctx) return;
    const etatHist = obtenirEtatHistoire();
    const t = timestamp / 1000;

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
        const couleur = COULEURS_CHEMINS[cle] ?? '#00f5ff';

        ctx.save();
        ctx.lineCap = 'round';
        ctx.setLineDash([]);

        if (aComplete && bComplete) {
            tracerChemin(ctx, posA, posB);
            ctx.strokeStyle = 'rgba(0,0,0,0.55)';
            ctx.lineWidth = 14;
            ctx.stroke();
            tracerChemin(ctx, posA, posB);
            ctx.strokeStyle = couleur + '99';
            ctx.shadowColor = couleur;
            ctx.shadowBlur = 8;
            ctx.lineWidth = 8;
            ctx.stroke();
            ctx.shadowBlur = 0;
            tracerChemin(ctx, posA, posB);
            ctx.strokeStyle = 'rgba(255,255,255,0.14)';
            ctx.lineWidth = 2;
            ctx.stroke();
            const { cp1x, cp1y, cp2x, cp2y } = ptControleS(posA, posB);
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
            tracerChemin(ctx, posA, posB);
            ctx.strokeStyle = 'rgba(0,0,0,0.40)';
            ctx.lineWidth = 12;
            ctx.stroke();
            tracerChemin(ctx, posA, posB);
            ctx.strokeStyle = `rgba(0,245,255,${alpha})`;
            ctx.shadowColor = '#00f5ff';
            ctx.shadowBlur = 7;
            ctx.lineWidth = 7;
            ctx.stroke();
            ctx.shadowBlur = 0;
        } else {
            tracerChemin(ctx, posA, posB);
            ctx.strokeStyle = 'rgba(40,35,65,0.55)';
            ctx.lineWidth = 5;
            ctx.setLineDash([5, 9]);
            ctx.stroke();
            ctx.setLineDash([]);
        }

        ctx.restore();
    }
}
