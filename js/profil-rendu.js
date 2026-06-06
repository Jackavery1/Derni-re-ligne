import { CONFIG } from './config.js';

function messageVide(ctx2d, w, h, texte) {
    ctx2d.fillStyle = 'rgba(0,0,0,0.4)';
    ctx2d.fillRect(0, 0, w, h);
    ctx2d.fillStyle = 'rgba(255,255,255,0.35)';
    ctx2d.font = '8px monospace';
    ctx2d.textAlign = 'center';
    ctx2d.fillText(texte, w / 2, h / 2);
}

export function dessinerHeatmap(ctx2d, w, h, donnees) {
    if (donnees.timestampsVerrou.length === 0) {
        messageVide(ctx2d, w, h, 'JOUEZ UNE PREMIÈRE PARTIE !');
        return;
    }

    const data = donnees.atterrissagesColonne;
    const maxVal = Math.max(...data, 1);
    const colW = w / CONFIG.colonnes;

    ctx2d.fillStyle = 'rgba(0,0,0,0.4)';
    ctx2d.fillRect(0, 0, w, h);

    data.forEach((val, i) => {
        const ratio = val / maxVal;
        const hauteur = ratio * (h - 20);
        const x = i * colW;
        const y = h - hauteur;
        const hue = 240 - ratio * 240;
        const grad = ctx2d.createLinearGradient(x, y, x, h);
        grad.addColorStop(0, `hsla(${hue}, 100%, 65%, 0.9)`);
        grad.addColorStop(1, `hsla(${hue}, 100%, 40%, 0.6)`);
        ctx2d.fillStyle = grad;
        ctx2d.shadowColor = `hsl(${hue}, 100%, 60%)`;
        ctx2d.shadowBlur = 8;
        ctx2d.fillRect(x + 2, y, colW - 4, hauteur);

        ctx2d.shadowBlur = 0;
        ctx2d.fillStyle = 'rgba(255,255,255,0.4)';
        ctx2d.font = '7px monospace';
        ctx2d.textAlign = 'center';
        ctx2d.fillText(String(i + 1), x + colW / 2, h - 4);

        if (val > 0) {
            ctx2d.fillStyle = 'rgba(255,255,255,0.7)';
            ctx2d.fillText(String(val), x + colW / 2, y - 3);
        }
    });

    ctx2d.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx2d.lineWidth = 1;
    ctx2d.beginPath();
    ctx2d.moveTo(0, h - 14);
    ctx2d.lineTo(w, h - 14);
    ctx2d.stroke();
}

export function dessinerGrapheRythme(ctx2d, w, h, donnees) {
    const ts = donnees.timestampsVerrou;
    if (ts.length === 0) {
        messageVide(ctx2d, w, h, 'JOUEZ UNE PREMIÈRE PARTIE !');
        return;
    }
    if (ts.length < 2) {
        messageVide(ctx2d, w, h, 'DONNÉES INSUFFISANTES');
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

    ctx2d.fillStyle = 'rgba(0,0,0,0.4)';
    ctx2d.fillRect(0, 0, w, h);

    ctx2d.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx2d.lineWidth = 0.5;
    for (let i = 0; i < 4; i++) {
        const y = (i / 4) * (h - 20) + 10;
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
        const x = 4 + (i / (nb - 1)) * (w - 8);
        const y = 10 + (1 - (v - minI) / range) * (h - 30);
        if (i === 0) ctx2d.moveTo(x, y);
        else ctx2d.lineTo(x, y);
    });
    ctx2d.lineTo(w - 4, h - 10);
    ctx2d.lineTo(4, h - 10);
    ctx2d.closePath();
    const aireGrad = ctx2d.createLinearGradient(0, 0, 0, h);
    aireGrad.addColorStop(0, 'rgba(0,245,255,0.25)');
    aireGrad.addColorStop(1, 'rgba(0,245,255,0.02)');
    ctx2d.fillStyle = aireGrad;
    ctx2d.fill();

    ctx2d.beginPath();
    ctx2d.strokeStyle = '#00f5ff';
    ctx2d.lineWidth = 1.5;
    ctx2d.shadowColor = '#00f5ff';
    ctx2d.shadowBlur = 6;
    lisses.forEach((v, i) => {
        const x = 4 + (i / (nb - 1)) * (w - 8);
        const y = 10 + (1 - (v - minI) / range) * (h - 30);
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
        const x = 4 + (i / (nb - 1)) * (w - 8);
        const y = 10 + (1 - (v - minI) / range) * (h - 30);
        ctx2d.beginPath();
        ctx2d.arc(x, y, 3, 0, Math.PI * 2);
        ctx2d.fillStyle = estPic ? '#00ff88' : '#ff006e';
        ctx2d.fill();
    });

    ctx2d.fillStyle = 'rgba(255,255,255,0.35)';
    ctx2d.font = '6px monospace';
    ctx2d.textAlign = 'left';
    ctx2d.fillText('LENT', 2, 16);
    ctx2d.fillText('RAPIDE', 2, h - 14);
}

export function dessinerRadar(ctx2d, w, h, profil) {
    if (!profil) {
        messageVide(ctx2d, w, h, 'JOUEZ UNE PREMIÈRE PARTIE !');
        return;
    }

    const cx = w / 2;
    const cy = h / 2;
    const rayon = Math.min(w, h) * 0.38;
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

    ctx2d.fillStyle = 'rgba(0,0,0,0.4)';
    ctx2d.fillRect(0, 0, w, h);

    [0.25, 0.5, 0.75, 1].forEach((niveau, ni) => {
        ctx2d.beginPath();
        for (let i = 0; i < nb; i++) {
            const a = angle0 + (i / nb) * Math.PI * 2;
            const x = cx + Math.cos(a) * rayon * niveau;
            const y = cy + Math.sin(a) * rayon * niveau;
            if (i === 0) ctx2d.moveTo(x, y);
            else ctx2d.lineTo(x, y);
        }
        ctx2d.closePath();
        ctx2d.strokeStyle = ni === 3 ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.07)';
        ctx2d.lineWidth = ni === 3 ? 1 : 0.5;
        ctx2d.stroke();
    });

    ctx2d.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx2d.lineWidth = 0.5;
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
    const radarGrad = ctx2d.createRadialGradient(cx, cy, 0, cx, cy, rayon);
    radarGrad.addColorStop(0, 'rgba(0,245,255,0.5)');
    radarGrad.addColorStop(1, 'rgba(0,245,255,0.1)');
    ctx2d.fillStyle = radarGrad;
    ctx2d.fill();
    ctx2d.strokeStyle = '#00f5ff';
    ctx2d.lineWidth = 1.5;
    ctx2d.shadowColor = '#00f5ff';
    ctx2d.shadowBlur = 8;
    ctx2d.stroke();

    axes.forEach((axe, i) => {
        const a = angle0 + (i / nb) * Math.PI * 2;
        const r = rayon * (axe.val / 100);
        const x = cx + Math.cos(a) * r;
        const y = cy + Math.sin(a) * r;
        ctx2d.beginPath();
        ctx2d.arc(x, y, 3, 0, Math.PI * 2);
        ctx2d.fillStyle = '#ffffff';
        ctx2d.shadowBlur = 6;
        ctx2d.fill();
    });

    ctx2d.shadowBlur = 0;
    ctx2d.fillStyle = 'rgba(255,255,255,0.65)';
    ctx2d.font = '6px monospace';
    ctx2d.textAlign = 'center';
    axes.forEach((axe, i) => {
        const a = angle0 + (i / nb) * Math.PI * 2;
        const marge = rayon + 16;
        const lx = cx + Math.cos(a) * marge;
        const ly = cy + Math.sin(a) * marge + 3;
        ctx2d.fillStyle = 'rgba(255,255,255,0.65)';
        ctx2d.fillText(axe.label, lx, ly);
        ctx2d.fillStyle = '#00f5ff';
        ctx2d.fillText(`${axe.val}%`, lx, ly + 8);
    });
}
