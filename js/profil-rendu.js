import { CONFIG } from './config.js';

const COULEUR_VIOLET = { r: 61, g: 34, b: 128 };
const COULEUR_CYAN = { r: 0, g: 221, b: 200 };
const COULEUR_MAGENTA = { r: 255, g: 45, b: 120 };

/**
 * @param {{ r: number, g: number, b: number }} a
 * @param {{ r: number, g: number, b: number }} b
 * @param {number} t
 */
function melangerCouleur(a, b, t) {
    const k = Math.max(0, Math.min(1, t));
    return {
        r: Math.round(a.r + (b.r - a.r) * k),
        g: Math.round(a.g + (b.g - a.g) * k),
        b: Math.round(a.b + (b.b - a.b) * k),
    };
}

/**
 * @param {number} ratio
 * @param {boolean} estMax
 */
function couleurBarreHeatmap(ratio, estMax) {
    if (estMax) {
        return { couleur: '#ff2d78', glow: 'rgba(255,45,120,0.55)' };
    }
    const c =
        ratio < 0.5
            ? melangerCouleur(COULEUR_VIOLET, COULEUR_CYAN, ratio * 2)
            : melangerCouleur(COULEUR_CYAN, COULEUR_MAGENTA, (ratio - 0.5) * 2);
    const couleur = `rgb(${c.r},${c.g},${c.b})`;
    return { couleur, glow: `rgba(${c.r},${c.g},${c.b},0.45)` };
}

function messageVide(ctx2d, w, h, texte) {
    ctx2d.fillStyle = 'rgba(8,8,26,0.55)';
    ctx2d.fillRect(0, 0, w, h);
    ctx2d.fillStyle = 'rgba(255,153,255,0.75)';
    ctx2d.font = 'italic 13px "Crimson Pro", Georgia, serif';
    ctx2d.textAlign = 'center';
    const mots = texte.split(' ');
    const lignes = [];
    let ligne = '';
    for (const mot of mots) {
        const test = ligne ? `${ligne} ${mot}` : mot;
        if (ctx2d.measureText(test).width > w - 24 && ligne) {
            lignes.push(ligne);
            ligne = mot;
        } else {
            ligne = test;
        }
    }
    if (ligne) lignes.push(ligne);
    const debutY = h / 2 - (lignes.length - 1) * 8;
    lignes.forEach((l, i) => {
        ctx2d.fillText(l, w / 2, debutY + i * 16);
    });
}

export function dessinerHeatmap(ctx2d, w, h, donnees) {
    if (donnees.timestampsVerrou.length === 0) {
        messageVide(ctx2d, w, h, 'Données insuffisantes. Joue, et la Trame apprendra qui tu es.');
        return;
    }

    const data = donnees.atterrissagesColonne;
    const maxVal = Math.max(...data, 1);
    const colW = w / CONFIG.colonnes;
    const indiceMax = data.indexOf(maxVal);

    ctx2d.fillStyle = 'rgba(8,8,26,0.45)';
    ctx2d.fillRect(0, 0, w, h);

    data.forEach((val, i) => {
        const ratio = val / maxVal;
        const hauteur = ratio * (h - 28);
        const x = i * colW;
        const y = h - hauteur - 16;
        const estMax = i === indiceMax && val > 0;
        const { couleur, glow } = couleurBarreHeatmap(ratio, estMax);

        ctx2d.fillStyle = couleur;
        ctx2d.shadowColor = glow;
        ctx2d.shadowBlur = estMax ? 14 : 6;
        ctx2d.fillRect(x + 3, y, colW - 6, hauteur);
        ctx2d.shadowBlur = 0;

        ctx2d.fillStyle = 'rgba(255,255,255,0.45)';
        ctx2d.font = '10px Rajdhani, sans-serif';
        ctx2d.textAlign = 'center';
        ctx2d.fillText(String(i + 1), x + colW / 2, h - 6);

        if (val > 0) {
            ctx2d.fillStyle = 'rgba(255,255,255,0.85)';
            ctx2d.font = '12px Orbitron, sans-serif';
            ctx2d.fillText(String(val), x + colW / 2, Math.max(14, y - 4));
        }
    });

    ctx2d.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx2d.lineWidth = 1;
    ctx2d.beginPath();
    ctx2d.moveTo(0, h - 18);
    ctx2d.lineTo(w, h - 18);
    ctx2d.stroke();
}

export function dessinerGrapheRythme(ctx2d, w, h, donnees) {
    const ts = donnees.timestampsVerrou;
    if (ts.length === 0) {
        messageVide(ctx2d, w, h, 'Données insuffisantes. Joue, et la Trame apprendra qui tu es.');
        return;
    }
    if (ts.length < 2) {
        messageVide(ctx2d, w, h, 'Données insuffisantes pour tracer le rythme.');
        return;
    }

    const intervalles = [];
    for (let i = 1; i < ts.length; i++) {
        intervalles.push(ts[i] - ts[i - 1]);
    }

    const maxI = Math.max(...intervalles);
    const minI = Math.min(...intervalles);
    const range = maxI - minI || 1;
    const nb = intervalles.length;
    const margeH = 22;
    const margeB = 18;

    ctx2d.fillStyle = 'rgba(8,8,26,0.45)';
    ctx2d.fillRect(0, 0, w, h);

    ctx2d.setLineDash([4, 6]);
    ctx2d.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx2d.lineWidth = 1;
    const yBase = h - margeB;
    ctx2d.beginPath();
    ctx2d.moveTo(0, yBase);
    ctx2d.lineTo(w, yBase);
    ctx2d.stroke();
    ctx2d.setLineDash([]);

    ctx2d.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx2d.lineWidth = 0.5;
    for (let i = 0; i < 4; i++) {
        const y = margeH + (i / 4) * (h - margeH - margeB);
        ctx2d.beginPath();
        ctx2d.moveTo(0, y);
        ctx2d.lineTo(w, y);
        ctx2d.stroke();
    }

    const lisses = intervalles.map((v, i) => {
        const voisins = intervalles.slice(Math.max(0, i - 1), i + 2);
        return voisins.reduce((a, b) => a + b, 0) / voisins.length;
    });

    ctx2d.beginPath();
    lisses.forEach((v, i) => {
        const x = 6 + (i / (nb - 1)) * (w - 12);
        const y = margeH + (1 - (v - minI) / range) * (h - margeH - margeB);
        if (i === 0) ctx2d.moveTo(x, y);
        else ctx2d.lineTo(x, y);
    });
    ctx2d.lineTo(w - 6, yBase);
    ctx2d.lineTo(6, yBase);
    ctx2d.closePath();
    const aireGrad = ctx2d.createLinearGradient(0, 0, 0, h);
    aireGrad.addColorStop(0, 'rgba(0,221,200,0.22)');
    aireGrad.addColorStop(1, 'rgba(0,221,200,0.02)');
    ctx2d.fillStyle = aireGrad;
    ctx2d.fill();

    ctx2d.beginPath();
    ctx2d.strokeStyle = '#00ddc8';
    ctx2d.lineWidth = 2;
    ctx2d.shadowColor = 'rgba(0,221,200,0.5)';
    ctx2d.shadowBlur = 8;
    lisses.forEach((v, i) => {
        const x = 6 + (i / (nb - 1)) * (w - 12);
        const y = margeH + (1 - (v - minI) / range) * (h - margeH - margeB);
        if (i === 0) ctx2d.moveTo(x, y);
        else ctx2d.lineTo(x, y);
    });
    ctx2d.stroke();

    ctx2d.shadowBlur = 0;
    lisses.forEach((v, i) => {
        if (i === 0 || i === nb - 1) return;
        const estPic = v < lisses[i - 1] && v < lisses[i + 1];
        const estCreux = v > lisses[i - 1] && v > lisses[i + 1];
        if (!estPic && !estCreux) return;
        const x = 6 + (i / (nb - 1)) * (w - 12);
        const y = margeH + (1 - (v - minI) / range) * (h - margeH - margeB);
        const couleur = estPic ? '#44ff88' : '#ff2d78';
        ctx2d.beginPath();
        ctx2d.arc(x, y, 4, 0, Math.PI * 2);
        ctx2d.fillStyle = couleur;
        ctx2d.shadowColor = couleur;
        ctx2d.shadowBlur = 10;
        ctx2d.fill();
    });

    ctx2d.shadowBlur = 0;
    ctx2d.fillStyle = 'rgba(255,255,255,0.85)';
    ctx2d.font = '11px Rajdhani, sans-serif';
    ctx2d.textAlign = 'left';
    ctx2d.fillText('LENT', 6, margeH - 4);
    ctx2d.fillText('RAPIDE', 6, h - 6);
}

export function dessinerRadar(ctx2d, w, h, profil) {
    if (!profil) {
        messageVide(ctx2d, w, h, 'Données insuffisantes. Joue, et la Trame apprendra qui tu es.');
        return;
    }

    const cx = w / 2;
    const cy = h / 2;
    const rayon = Math.min(w, h) * 0.36;
    const axes = [
        { label: 'VITESSE', val: profil.vitesse },
        { label: 'PRÉCISION', val: profil.precision },
        { label: 'AGRESSIVITÉ', val: profil.agressivite },
        { label: 'ENDURANCE', val: profil.endurance },
        { label: 'CRÉATIVITÉ', val: profil.creativite },
        { label: 'ÉQUILIBRE', val: profil.equilibre },
    ];
    const nb = axes.length;
    const angle0 = -Math.PI / 2;

    ctx2d.fillStyle = 'rgba(8,8,26,0.45)';
    ctx2d.fillRect(0, 0, w, h);

    [0.25, 0.5, 0.75, 1].forEach((niveau) => {
        ctx2d.beginPath();
        for (let i = 0; i < nb; i++) {
            const a = angle0 + (i / nb) * Math.PI * 2;
            const x = cx + Math.cos(a) * rayon * niveau;
            const y = cy + Math.sin(a) * rayon * niveau;
            if (i === 0) ctx2d.moveTo(x, y);
            else ctx2d.lineTo(x, y);
        }
        ctx2d.closePath();
        ctx2d.strokeStyle = 'rgba(255,255,255,0.08)';
        ctx2d.lineWidth = 1;
        ctx2d.stroke();
    });

    ctx2d.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx2d.lineWidth = 1;
    for (let i = 0; i < nb; i++) {
        const a = angle0 + (i / nb) * Math.PI * 2;
        ctx2d.beginPath();
        ctx2d.moveTo(cx, cy);
        ctx2d.lineTo(cx + Math.cos(a) * rayon, cy + Math.sin(a) * rayon);
        ctx2d.stroke();
    }

    ctx2d.beginPath();
    axes.forEach((axe, i) => {
        const a = angle0 + (i / nb) * Math.PI * 2;
        const r = rayon * (axe.val / 100);
        const x = cx + Math.cos(a) * r;
        const y = cy + Math.sin(a) * r;
        if (i === 0) ctx2d.moveTo(x, y);
        else ctx2d.lineTo(x, y);
    });
    ctx2d.closePath();
    ctx2d.fillStyle = 'rgba(0,221,200,0.15)';
    ctx2d.fill();
    ctx2d.strokeStyle = '#00ddc8';
    ctx2d.lineWidth = 2.5;
    ctx2d.shadowColor = 'rgba(0,221,200,0.45)';
    ctx2d.shadowBlur = 10;
    ctx2d.stroke();

    axes.forEach((axe, i) => {
        const a = angle0 + (i / nb) * Math.PI * 2;
        const r = rayon * (axe.val / 100);
        const x = cx + Math.cos(a) * r;
        const y = cy + Math.sin(a) * r;
        ctx2d.beginPath();
        ctx2d.arc(x, y, 3.5, 0, Math.PI * 2);
        ctx2d.fillStyle = '#ffffff';
        ctx2d.shadowBlur = 6;
        ctx2d.fill();
    });

    ctx2d.shadowBlur = 0;
    ctx2d.textAlign = 'center';
    axes.forEach((axe, i) => {
        const a = angle0 + (i / nb) * Math.PI * 2;
        const marge = rayon + 22;
        const lx = cx + Math.cos(a) * marge;
        const ly = cy + Math.sin(a) * marge + 3;
        ctx2d.fillStyle = 'rgba(255,255,255,0.9)';
        ctx2d.font = '11px Rajdhani, sans-serif';
        ctx2d.fillText(axe.label, lx, ly);
        ctx2d.fillStyle = '#00ddc8';
        ctx2d.font = '12px Orbitron, sans-serif';
        ctx2d.fillText(`${axe.val}%`, lx, ly + 14);
    });
}
