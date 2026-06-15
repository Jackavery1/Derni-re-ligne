import { dessinerIllustLave } from './biomes.js';

export function dessinerIllustChronique4Lignes(ctx2d, w, h) {
    ctx2d.fillStyle = '#08081a';
    ctx2d.fillRect(0, 0, w, h);
    ctx2d.shadowColor = '#ffe600';
    ctx2d.shadowBlur = 12;
    for (let i = 0; i < 4; i++) {
        const y = h * 0.25 + i * h * 0.16;
        ctx2d.fillStyle = `hsla(${50 - i * 10},100%,${55 + i * 5}%,0.8)`;
        ctx2d.fillRect(10, y, w - 20, 8);
    }
    ctx2d.shadowBlur = 0;
}

export function dessinerIllustChroniqueInferno(ctx2d, w, h) {
    dessinerIllustLave(ctx2d, w, h);
    ctx2d.fillStyle = '#000000aa';
    ctx2d.fillRect(w * 0.4, h * 0.3, w * 0.2, h * 0.5);
    ctx2d.fillRect(w * 0.35, h * 0.3, w * 0.3, h * 0.3);
}

export function dessinerIllustChroniqueTempete(ctx2d, w, h) {
    ctx2d.fillStyle = '#030814';
    ctx2d.fillRect(0, 0, w, h);
    ctx2d.strokeStyle = '#aaeeff44';
    ctx2d.lineWidth = 0.8;
    for (let i = 0; i < 20; i++) {
        ctx2d.beginPath();
        ctx2d.moveTo(i * 15, 0);
        ctx2d.lineTo(i * 15 - 20, h);
        ctx2d.stroke();
    }
    ctx2d.strokeStyle = '#ffe600';
    ctx2d.lineWidth = 2;
    ctx2d.shadowColor = '#ffe600';
    ctx2d.shadowBlur = 8;
    ctx2d.beginPath();
    ctx2d.moveTo(w * 0.4, h * 0.1);
    ctx2d.lineTo(w * 0.55, h * 0.45);
    ctx2d.lineTo(w * 0.45, h * 0.45);
    ctx2d.lineTo(w * 0.6, h * 0.9);
    ctx2d.stroke();
    ctx2d.shadowBlur = 0;
}

export function dessinerIllustChroniqueDouble(ctx2d, w, h) {
    ctx2d.fillStyle = '#080812';
    ctx2d.fillRect(0, 0, w, h);
    ctx2d.strokeStyle = '#7700ff';
    ctx2d.lineWidth = 1.5;
    ctx2d.shadowColor = '#ff00ff';
    ctx2d.shadowBlur = 8;
    ctx2d.beginPath();
    for (let a = 0; a < Math.PI * 6; a += 0.1) {
        const r = a * 6;
        const cx = w / 2;
        const cy = h / 2;
        const x = cx + Math.cos(a) * r;
        const y = cy + Math.sin(a) * r;
        if (a < 0.1) ctx2d.moveTo(x, y);
        else ctx2d.lineTo(x, y);
    }
    ctx2d.stroke();
    ctx2d.shadowBlur = 0;
}

export function dessinerIllustChroniqueMelodie(ctx2d, w, h) {
    ctx2d.fillStyle = '#080818';
    ctx2d.fillRect(0, 0, w, h);
    const notes = ['♩', '♪', '♫', '♬'];
    for (let i = 0; i < 8; i++) {
        const hue = (i / 8) * 360;
        ctx2d.fillStyle = `hsla(${hue},100%,65%,0.7)`;
        ctx2d.font = `${14 + (i % 3) * 4}px serif`;
        ctx2d.fillText(notes[i % 4], 10 + i * 30, h * 0.3 + Math.sin(i * 0.8) * h * 0.3);
    }
}

export function dessinerIllustChroniqueMille(ctx2d, w, h) {
    ctx2d.fillStyle = '#08081a';
    ctx2d.fillRect(0, 0, w, h);
    ctx2d.fillStyle = '#ffe600';
    ctx2d.shadowColor = '#ffe600';
    ctx2d.shadowBlur = 15;
    ctx2d.font = 'bold 32px monospace';
    ctx2d.textAlign = 'center';
    ctx2d.textBaseline = 'middle';
    ctx2d.fillText('1000', w / 2, h / 2);
    ctx2d.font = '8px monospace';
    ctx2d.fillStyle = '#ffe60066';
    ctx2d.fillText('LIGNES', w / 2, h * 0.75);
    ctx2d.shadowBlur = 0;
}

export function dessinerIllustChroniqueVoyage(ctx2d, w, h) {
    ctx2d.fillStyle = '#04020a';
    ctx2d.fillRect(0, 0, w, h);
    const biomesCouleurs = [
        '#00f5ff',
        '#ff4500',
        '#00cfff',
        '#00cc44',
        '#aaeeff',
        '#ffbb44',
        '#ff00ff',
        '#ffe600',
        '#7700ff',
    ];
    biomesCouleurs.forEach((coul, i) => {
        const a = (i / 9) * Math.PI * 2 - Math.PI / 2;
        const r = Math.min(w, h) * 0.35;
        const cx = w / 2 + Math.cos(a) * r;
        const cy = h / 2 + Math.sin(a) * r;
        ctx2d.fillStyle = coul;
        ctx2d.shadowColor = coul;
        ctx2d.shadowBlur = 8;
        ctx2d.beginPath();
        ctx2d.arc(cx, cy, 5, 0, Math.PI * 2);
        ctx2d.fill();
    });
    ctx2d.shadowBlur = 0;
    ctx2d.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx2d.lineWidth = 0.5;
    biomesCouleurs.forEach((_, i) => {
        const a1 = (i / 9) * Math.PI * 2 - Math.PI / 2;
        const a2 = ((i + 1) / 9) * Math.PI * 2 - Math.PI / 2;
        const r = Math.min(w, h) * 0.35;
        ctx2d.beginPath();
        ctx2d.moveTo(w / 2 + Math.cos(a1) * r, h / 2 + Math.sin(a1) * r);
        ctx2d.lineTo(w / 2 + Math.cos(a2) * r, h / 2 + Math.sin(a2) * r);
        ctx2d.stroke();
    });
}

export function dessinerIllustChroniqueGrandMaitre(ctx2d, w, h) {
    ctx2d.fillStyle = '#060608';
    ctx2d.fillRect(0, 0, w, h);
    ctx2d.font = '48px serif';
    ctx2d.textAlign = 'center';
    ctx2d.textBaseline = 'middle';
    ctx2d.shadowColor = 'gold';
    ctx2d.shadowBlur = 20;
    ctx2d.fillText('🎖', w / 2, h / 2);
    ctx2d.shadowBlur = 0;
}

export function dessinerIllustOracle(ctx2d, w, h) {
    ctx2d.fillStyle = '#08081a';
    ctx2d.fillRect(0, 0, w, h);
    ctx2d.strokeStyle = '#aa44ff';
    ctx2d.shadowColor = '#cc66ff';
    ctx2d.shadowBlur = 12;
    ctx2d.lineWidth = 2;
    ctx2d.beginPath();
    ctx2d.ellipse(w / 2, h / 2, w * 0.38, h * 0.32, 0, 0, Math.PI * 2);
    ctx2d.stroke();
    ctx2d.fillStyle = '#cc66ff44';
    ctx2d.beginPath();
    ctx2d.arc(w / 2, h / 2, h * 0.2, 0, Math.PI * 2);
    ctx2d.fill();
    ctx2d.strokeStyle = '#cc66ff';
    ctx2d.stroke();
    ctx2d.fillStyle = '#ffffff';
    ctx2d.shadowBlur = 8;
    ctx2d.beginPath();
    ctx2d.arc(w / 2, h / 2, h * 0.07, 0, Math.PI * 2);
    ctx2d.fill();
    ctx2d.fillStyle = 'rgba(255,255,255,0.8)';
    ctx2d.shadowBlur = 0;
    ctx2d.beginPath();
    ctx2d.arc(w / 2 + 4, h / 2 - 4, 2, 0, Math.PI * 2);
    ctx2d.fill();
}

export function dessinerIllustArchi(ctx2d, w, h) {
    ctx2d.fillStyle = '#08081a';
    ctx2d.fillRect(0, 0, w, h);
    const coeur = [
        [2, 1],
        [3, 1],
        [6, 1],
        [7, 1],
        [1, 2],
        [2, 2],
        [3, 2],
        [4, 2],
        [5, 2],
        [6, 2],
        [7, 2],
        [8, 2],
        [1, 3],
        [2, 3],
        [3, 3],
        [4, 3],
        [5, 3],
        [6, 3],
        [7, 3],
        [8, 3],
        [2, 4],
        [3, 4],
        [4, 4],
        [5, 4],
        [6, 4],
        [7, 4],
        [3, 5],
        [4, 5],
        [5, 5],
        [6, 5],
        [4, 6],
        [5, 6],
    ];
    const s = 10;
    ctx2d.fillStyle = '#00f5ff22';
    ctx2d.strokeStyle = '#00f5ff55';
    ctx2d.lineWidth = 0.5;
    coeur.forEach(([c, l]) => {
        ctx2d.fillRect(c * s + 10, l * s + 5, s - 1, s - 1);
        ctx2d.strokeRect(c * s + 10, l * s + 5, s - 1, s - 1);
    });
    ctx2d.fillStyle = '#ffe60099';
    ctx2d.shadowColor = '#ffe600';
    ctx2d.shadowBlur = 6;
    [
        [2, 1],
        [3, 1],
        [2, 2],
        [3, 2],
    ].forEach(([c, l]) => {
        ctx2d.fillRect(c * s + 10, l * s + 5, s - 1, s - 1);
    });
}

export function dessinerIllustVivant(ctx2d, w, h) {
    ctx2d.fillStyle = '#020f02';
    ctx2d.fillRect(0, 0, w, h);
    /** @type {[number, number, string][]} */
    const positions = [
        [2, 3, '#00cc44'],
        [3, 3, '#00aa22'],
        [4, 3, '#00ee55'],
        [2, 4, '#008833'],
        [3, 4, '#00cc44'],
        [5, 4, '#00ff88'],
        [3, 5, '#00aa22'],
        [4, 5, '#00cc44'],
        [5, 5, '#006622'],
    ];
    const s = 16;
    positions.forEach(([c, l, coul]) => {
        ctx2d.fillStyle = coul + '88';
        ctx2d.shadowColor = coul;
        ctx2d.shadowBlur = 6;
        ctx2d.fillRect(c * s + 20, l * s + 10, s - 2, s - 2);
    });
    ctx2d.fillStyle = '#00ff88aa';
    ctx2d.shadowColor = '#00ff88';
    ctx2d.shadowBlur = 15;
    ctx2d.fillRect(6 * s + 20, 3 * s + 10, s - 2, s - 2);
    ctx2d.strokeStyle = '#00ff8855';
    ctx2d.lineWidth = 1;
    ctx2d.beginPath();
    ctx2d.moveTo(5 * s + 20 + s / 2, 3 * s + 10 + s / 2);
    ctx2d.lineTo(6 * s + 20, 3 * s + 10 + s / 2);
    ctx2d.stroke();
}
