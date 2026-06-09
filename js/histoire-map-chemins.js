import { obtenirEtatHistoire, mondePeutEtreJoue } from './histoire-mondes.js';

export function dessinerCheminsEpais(etatCarte, timestamp, connexions) {
    const { ctxCarte, positionsNoeuds, mondesVisibles, mondesFantomes } = etatCarte;
    if (!ctxCarte) return;
    const etatHist = obtenirEtatHistoire();
    const t = timestamp / 1000;

    function bezierPt(posA, posB, courbure, u) {
        const mx = (posA.x + posB.x) / 2;
        const my = (posA.y + posB.y) / 2;
        const dx = posB.x - posA.x;
        const dy = posB.y - posA.y;
        const cp1x = mx - dy * courbure;
        const cp1y = my + dx * courbure;
        const cp2x = mx + dy * courbure * 0.5;
        const cp2y = my - dx * courbure * 0.5;
        const b = 1 - u;
        return {
            x:
                b * b * b * posA.x +
                3 * b * b * u * cp1x +
                3 * b * u * u * cp2x +
                u * u * u * posB.x,
            y:
                b * b * b * posA.y +
                3 * b * b * u * cp1y +
                3 * b * u * u * cp2y +
                u * u * u * posB.y,
            cp1x,
            cp1y,
            cp2x,
            cp2y,
        };
    }

    const COURBURES = {
        'monde_prologue-monde_lave': 0.22,
        'monde_lave-monde_rouille': -0.18,
        'monde_rouille-monde_boss_1': -0.15,
        'monde_boss_1-monde_ocean': 0.28,
        'monde_ocean-monde_foret': -0.18,
        'monde_foret-monde_glace': -0.14,
        'monde_glace-monde_boss_2': -0.12,
        'monde_boss_2-monde_desert': 0.26,
        'monde_desert-monde_eclipse': -0.16,
        'monde_eclipse-monde_cyber': -0.12,
        'monde_cyber-monde_boss_3': -0.1,
        'monde_boss_3-monde_fuochi': 0.24,
        'monde_fuochi-monde_cosmos': -0.16,
        'monde_cosmos-monde_vide': -0.12,
        'monde_vide-monde_boss_4': -0.1,
        'monde_boss_4-monde_finale': 0.22,
    };

    const COULEURS_CHEMIN = {
        'monde_prologue-monde_lave': '#00f5ff',
        'monde_lave-monde_rouille': '#ff4500',
        'monde_rouille-monde_boss_1': '#ff4500',
        'monde_boss_1-monde_ocean': '#ff4500',
        'monde_ocean-monde_foret': '#00cfff',
        'monde_foret-monde_glace': '#00cc44',
        'monde_glace-monde_boss_2': '#aaeeff',
        'monde_boss_2-monde_desert': '#aaeeff',
        'monde_desert-monde_eclipse': '#ffbb44',
        'monde_eclipse-monde_cyber': '#ffd700',
        'monde_cyber-monde_boss_3': '#ff00ff',
        'monde_boss_3-monde_fuochi': '#ff00ff',
        'monde_fuochi-monde_cosmos': '#b400ff',
        'monde_cosmos-monde_vide': '#7700ff',
        'monde_vide-monde_boss_4': '#0a0a0a',
        'monde_boss_4-monde_finale': '#ff006e',
    };

    function dessinerCheminEpais(posA, posB, cle, etat) {
        const courbure = COURBURES[cle] ?? 0.15;
        const { cp1x, cp1y, cp2x, cp2y } = bezierPt(posA, posB, courbure, 0.5);
        const couleur = COULEURS_CHEMIN[cle] ?? '#00f5ff';

        ctxCarte.beginPath();
        ctxCarte.moveTo(posA.x, posA.y);
        ctxCarte.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, posB.x, posB.y);
        ctxCarte.strokeStyle = 'rgba(0,0,0,0.6)';
        ctxCarte.lineWidth = 22;
        ctxCarte.lineCap = 'round';
        ctxCarte.setLineDash([]);
        ctxCarte.stroke();

        ctxCarte.beginPath();
        ctxCarte.moveTo(posA.x, posA.y);
        ctxCarte.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, posB.x, posB.y);
        if (etat === 'complete') {
            ctxCarte.strokeStyle = couleur + 'cc';
            ctxCarte.shadowColor = couleur;
            ctxCarte.shadowBlur = 12;
        } else if (etat === 'disponible') {
            const alpha = 0.45 + 0.2 * Math.sin(t * 2);
            ctxCarte.strokeStyle = `rgba(0,245,255,${alpha})`;
            ctxCarte.shadowColor = '#00f5ff';
            ctxCarte.shadowBlur = 8;
        } else {
            ctxCarte.strokeStyle = 'rgba(30,30,50,0.6)';
            ctxCarte.shadowBlur = 0;
        }
        ctxCarte.lineWidth = 14;
        ctxCarte.stroke();
        ctxCarte.shadowBlur = 0;

        if (etat === 'complete' || etat === 'disponible') {
            ctxCarte.beginPath();
            ctxCarte.moveTo(posA.x, posA.y);
            ctxCarte.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, posB.x, posB.y);
            ctxCarte.strokeStyle =
                etat === 'complete' ? 'rgba(255,255,255,0.30)' : 'rgba(0,245,255,0.20)';
            ctxCarte.lineWidth = 3;
            ctxCarte.stroke();
        }

        if (etat === 'complete') {
            for (let p = 0; p < 4; p++) {
                const u = (t * 0.22 + p * 0.25) % 1.0;
                const b = 1 - u;
                const px =
                    b * b * b * posA.x +
                    3 * b * b * u * cp1x +
                    3 * b * u * u * cp2x +
                    u * u * u * posB.x;
                const py =
                    b * b * b * posA.y +
                    3 * b * b * u * cp1y +
                    3 * b * u * u * cp2y +
                    u * u * u * posB.y;
                ctxCarte.fillStyle = '#ffffff';
                ctxCarte.globalAlpha = Math.sin(u * Math.PI) * 0.7;
                ctxCarte.shadowColor = couleur;
                ctxCarte.shadowBlur = 6;
                ctxCarte.beginPath();
                ctxCarte.arc(px, py, 3, 0, Math.PI * 2);
                ctxCarte.fill();
                ctxCarte.shadowBlur = 0;
            }
            ctxCarte.globalAlpha = 1;
        }

        if (etat === 'disponible') {
            ctxCarte.beginPath();
            ctxCarte.moveTo(posA.x, posA.y);
            ctxCarte.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, posB.x, posB.y);
            ctxCarte.strokeStyle = 'rgba(255,255,255,0.15)';
            ctxCarte.lineWidth = 14;
            ctxCarte.setLineDash([12, 14]);
            ctxCarte.lineDashOffset = -(t * 25) % 26;
            ctxCarte.stroke();
            ctxCarte.setLineDash([]);
        }
    }

    for (const [idA, idB] of connexions) {
        const posA = positionsNoeuds[idA];
        const posB = positionsNoeuds[idB];
        if (!posA || !posB) continue;

        const aVis = mondesVisibles.has(idA) || mondesFantomes.has(idA);
        const bVis = mondesVisibles.has(idB) || mondesFantomes.has(idB);
        if (!aVis && !bVis) continue;

        const aComplete = etatHist.mondesCompletes.includes(idA);
        const bComplete = etatHist.mondesCompletes.includes(idB);
        const bDispo = mondePeutEtreJoue(idB, etatHist);
        const cle = `${idA}-${idB}`;

        ctxCarte.save();
        if (aComplete && bComplete) dessinerCheminEpais(posA, posB, cle, 'complete');
        else if (aComplete && bDispo) dessinerCheminEpais(posA, posB, cle, 'disponible');
        else dessinerCheminEpais(posA, posB, cle, 'verrouille');
        ctxCarte.restore();
    }
}
