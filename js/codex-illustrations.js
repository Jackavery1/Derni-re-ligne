export function dessinerIllustCircuits(ctx2d, w, h) {
    ctx2d.fillStyle = '#08081a';
    ctx2d.fillRect(0, 0, w, h);
    ctx2d.strokeStyle = '#00f5ff44';
    ctx2d.lineWidth = 1;
    for (let i = 0; i < 6; i++) {
        const x = (i / 5) * w;
        const y = (i / 5) * h;
        ctx2d.beginPath();
        ctx2d.moveTo(x, 0);
        ctx2d.lineTo(x, h);
        ctx2d.stroke();
        ctx2d.beginPath();
        ctx2d.moveTo(0, y);
        ctx2d.lineTo(w, y);
        ctx2d.stroke();
    }
    ctx2d.fillStyle = '#00f5ff';
    for (let i = 1; i < 5; i++) {
        for (let j = 1; j < 4; j++) {
            if ((i + j) % 2 === 0) {
                ctx2d.beginPath();
                ctx2d.arc((i / 5) * w, (j / 3) * h, 3, 0, Math.PI * 2);
                ctx2d.fill();
            }
        }
    }
}

export function dessinerIllustLave(ctx2d, w, h) {
    const grad = ctx2d.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#1a0400');
    grad.addColorStop(1, '#cc2200');
    ctx2d.fillStyle = grad;
    ctx2d.fillRect(0, 0, w, h);
    ctx2d.strokeStyle = '#ff4500';
    ctx2d.lineWidth = 2;
    ctx2d.shadowColor = '#ff4500';
    ctx2d.shadowBlur = 8;
    for (let k = 0; k < 3; k++) {
        ctx2d.beginPath();
        for (let x = 0; x <= w; x += 4) {
            const y = h * 0.5 + k * 15 + Math.sin((x / w) * Math.PI * 4 + k) * 12;
            if (x === 0) ctx2d.moveTo(x, y);
            else ctx2d.lineTo(x, y);
        }
        ctx2d.stroke();
    }
    ctx2d.shadowBlur = 0;
}

export function dessinerIllustOcean(ctx2d, w, h) {
    const grad = ctx2d.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#000d1a');
    grad.addColorStop(1, '#003366');
    ctx2d.fillStyle = grad;
    ctx2d.fillRect(0, 0, w, h);
    ctx2d.strokeStyle = '#00cfff66';
    ctx2d.lineWidth = 1;
    for (let i = 0; i < 12; i++) {
        const bx = (i * 73) % w;
        const by = h * 0.2 + ((i * 37) % (h * 0.7));
        const br = 3 + (i % 5);
        ctx2d.beginPath();
        ctx2d.arc(bx, by, br, 0, Math.PI * 2);
        ctx2d.stroke();
    }
    const rayGrad = ctx2d.createLinearGradient(0, 0, w * 0.6, h);
    rayGrad.addColorStop(0, 'rgba(0,180,255,0.12)');
    rayGrad.addColorStop(1, 'transparent');
    ctx2d.fillStyle = rayGrad;
    ctx2d.fillRect(0, 0, w, h);
}

export function dessinerIllustForet(ctx2d, w, h) {
    ctx2d.fillStyle = '#020f02';
    ctx2d.fillRect(0, 0, w, h);
    const troncs = [w * 0.2, w * 0.5, w * 0.8];
    troncs.forEach((tx) => {
        ctx2d.fillStyle = '#00aa22cc';
        ctx2d.shadowColor = '#00cc44';
        ctx2d.shadowBlur = 10;
        ctx2d.beginPath();
        ctx2d.arc(tx, h * 0.4, h * 0.22, 0, Math.PI * 2);
        ctx2d.fill();
        ctx2d.shadowBlur = 0;
        ctx2d.fillStyle = '#443322';
        ctx2d.fillRect(tx - 4, h * 0.55, 8, h * 0.45);
    });
}

export function dessinerIllustGlace(ctx2d, w, h) {
    const grad = ctx2d.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#030d14');
    grad.addColorStop(1, '#0a2030');
    ctx2d.fillStyle = grad;
    ctx2d.fillRect(0, 0, w, h);
    ctx2d.strokeStyle = '#aaeeffaa';
    ctx2d.lineWidth = 0.8;
    [
        [w * 0.3, h * 0.5],
        [w * 0.7, h * 0.3],
        [w * 0.5, h * 0.7],
    ].forEach(([cx, cy]) => {
        for (let a = 0; a < 6; a++) {
            const angle = (a / 6) * Math.PI * 2;
            const r = 20 + (a % 2) * 10;
            ctx2d.beginPath();
            ctx2d.moveTo(cx, cy);
            ctx2d.lineTo(cx + Math.cos(angle) * r, cy + Math.sin(angle) * r);
            ctx2d.stroke();
        }
    });
}

export function dessinerIllustDesert(ctx2d, w, h) {
    const grad = ctx2d.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#140800');
    grad.addColorStop(1, '#3d1a00');
    ctx2d.fillStyle = grad;
    ctx2d.fillRect(0, 0, w, h);
    ctx2d.fillStyle = '#c87320aa';
    ctx2d.beginPath();
    ctx2d.moveTo(0, h);
    ctx2d.bezierCurveTo(w * 0.25, h * 0.5, w * 0.5, h * 0.7, w * 0.75, h * 0.45);
    ctx2d.bezierCurveTo(w * 0.88, h * 0.3, w, h * 0.55, w, h);
    ctx2d.closePath();
    ctx2d.fill();
    ctx2d.fillStyle = '#ffbb4466';
    ctx2d.shadowColor = '#ffbb44';
    ctx2d.shadowBlur = 20;
    ctx2d.beginPath();
    ctx2d.arc(w * 0.8, h * 0.2, 18, 0, Math.PI * 2);
    ctx2d.fill();
    ctx2d.shadowBlur = 0;
}

export function dessinerIllustCyber(ctx2d, w, h) {
    ctx2d.fillStyle = '#0a000f';
    ctx2d.fillRect(0, 0, w, h);
    ctx2d.shadowBlur = 4;
    for (let c = 0; c < 16; c++) {
        const x = (c / 15) * w;
        const len = 10 + ((c * 17) % 40);
        const y = (c * 31) % (h - len);
        const hue = 280 + c * 10;
        ctx2d.fillStyle = `hsla(${hue},100%,65%,0.6)`;
        ctx2d.shadowColor = `hsl(${hue},100%,60%)`;
        ctx2d.fillRect(x - 1, y, 2, len);
    }
    ctx2d.shadowBlur = 0;
}

export function dessinerIllustFuochi(ctx2d, w, h) {
    ctx2d.fillStyle = '#02020a';
    ctx2d.fillRect(0, 0, w, h);
    [
        [w * 0.25, h * 0.35],
        [w * 0.75, h * 0.25],
        [w * 0.5, h * 0.55],
    ].forEach(([cx, cy], k) => {
        const couleurs = ['#ff2244', '#ffe600', '#00aaff'];
        ctx2d.strokeStyle = couleurs[k];
        ctx2d.shadowColor = couleurs[k];
        ctx2d.shadowBlur = 8;
        ctx2d.lineWidth = 1;
        for (let r = 0; r < 12; r++) {
            const a = (r / 12) * Math.PI * 2;
            const len = 15 + (r % 3) * 8;
            ctx2d.beginPath();
            ctx2d.moveTo(cx, cy);
            ctx2d.lineTo(cx + Math.cos(a) * len, cy + Math.sin(a) * len);
            ctx2d.stroke();
        }
    });
    ctx2d.shadowBlur = 0;
}

export function dessinerIllustCosmos(ctx2d, w, h) {
    ctx2d.fillStyle = '#000008';
    ctx2d.fillRect(0, 0, w, h);
    for (let i = 0; i < 40; i++) {
        const sx = (i * 73) % w;
        const sy = (i * 37) % h;
        const sr = 0.5 + (i % 3) * 0.5;
        ctx2d.fillStyle = `rgba(255,255,255,${0.3 + (i % 4) * 0.15})`;
        ctx2d.beginPath();
        ctx2d.arc(sx, sy, sr, 0, Math.PI * 2);
        ctx2d.fill();
    }
    const nebGrad = ctx2d.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, 50);
    nebGrad.addColorStop(0, 'rgba(100,0,255,0.25)');
    nebGrad.addColorStop(0.5, 'rgba(0,100,255,0.1)');
    nebGrad.addColorStop(1, 'transparent');
    ctx2d.fillStyle = nebGrad;
    ctx2d.fillRect(0, 0, w, h);
}

export function dessinerIllustReliqueCarre(ctx2d, w, h) {
    ctx2d.fillStyle = '#08081a';
    ctx2d.fillRect(0, 0, w, h);
    const s = 28;
    const cx = w / 2;
    const cy = h / 2;
    [
        [cx - s, cy - s],
        [cx, cy - s],
        [cx - s, cy],
        [cx, cy],
    ].forEach(([bx, by]) => {
        ctx2d.fillStyle = '#ffffff22';
        ctx2d.strokeStyle = '#ffffff';
        ctx2d.lineWidth = 1.5;
        ctx2d.shadowColor = '#ffffff';
        ctx2d.shadowBlur = 10;
        ctx2d.fillRect(bx + 2, by + 2, s - 4, s - 4);
        ctx2d.strokeRect(bx + 2, by + 2, s - 4, s - 4);
    });
    ctx2d.shadowBlur = 0;
}

export function dessinerIllustReliqueExplosion(ctx2d, w, h) {
    ctx2d.fillStyle = '#1a0400';
    ctx2d.fillRect(0, 0, w, h);
    ctx2d.strokeStyle = '#ff4500';
    ctx2d.shadowColor = '#ff4500';
    ctx2d.shadowBlur = 15;
    ctx2d.lineWidth = 2;
    const cx = w / 2;
    const cy = h / 2;
    for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        ctx2d.beginPath();
        ctx2d.moveTo(cx, cy);
        ctx2d.lineTo(cx + Math.cos(a) * 40, cy + Math.sin(a) * 40);
        ctx2d.stroke();
    }
    ctx2d.fillStyle = '#ff8800';
    ctx2d.beginPath();
    ctx2d.arc(cx, cy, 8, 0, Math.PI * 2);
    ctx2d.fill();
    ctx2d.shadowBlur = 0;
}

export function dessinerIllustReliqueBulle(ctx2d, w, h) {
    const grad = ctx2d.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#000d1a');
    grad.addColorStop(1, '#003366');
    ctx2d.fillStyle = grad;
    ctx2d.fillRect(0, 0, w, h);
    [
        [w * 0.3, h * 0.6, 20],
        [w * 0.6, h * 0.4, 14],
        [w * 0.5, h * 0.75, 10],
    ].forEach(([bx, by, br]) => {
        ctx2d.strokeStyle = '#00cfff88';
        ctx2d.lineWidth = 1.5;
        ctx2d.shadowColor = '#00cfff';
        ctx2d.shadowBlur = 8;
        ctx2d.beginPath();
        ctx2d.arc(bx, by, br, 0, Math.PI * 2);
        ctx2d.stroke();
    });
    ctx2d.shadowBlur = 0;
}

export function dessinerIllustReliqueSpore(ctx2d, w, h) {
    ctx2d.fillStyle = '#020f02';
    ctx2d.fillRect(0, 0, w, h);
    const cx = w / 2;
    const cy = h / 2;
    [
        [0, -35],
        [30, 10],
        [-30, 10],
        [0, 20],
        [-20, -15],
        [20, -15],
    ].forEach(([dx, dy]) => {
        ctx2d.fillStyle = '#00cc4488';
        ctx2d.shadowColor = '#00ff88';
        ctx2d.shadowBlur = 6;
        ctx2d.beginPath();
        ctx2d.arc(cx + dx, cy + dy, 6, 0, Math.PI * 2);
        ctx2d.fill();
    });
    ctx2d.shadowBlur = 0;
}

export function dessinerIllustReliqueGlace(ctx2d, w, h) {
    dessinerIllustGlace(ctx2d, w, h);
}

export function dessinerIllustReliqueSable(ctx2d, w, h) {
    dessinerIllustDesert(ctx2d, w, h);
}

export function dessinerIllustReliqueCircuit(ctx2d, w, h) {
    dessinerIllustCyber(ctx2d, w, h);
}

export function dessinerIllustReliqueFusee(ctx2d, w, h) {
    dessinerIllustFuochi(ctx2d, w, h);
}

export function dessinerIllustReliqueNexus(ctx2d, w, h) {
    dessinerIllustCosmos(ctx2d, w, h);
}

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

export const ILLUSTRATIONS_CODEX = {
    dessinerIllustCircuits,
    dessinerIllustLave,
    dessinerIllustOcean,
    dessinerIllustForet,
    dessinerIllustGlace,
    dessinerIllustDesert,
    dessinerIllustCyber,
    dessinerIllustFuochi,
    dessinerIllustCosmos,
    dessinerIllustReliqueCarre,
    dessinerIllustReliqueExplosion,
    dessinerIllustReliqueBulle,
    dessinerIllustReliqueSpore,
    dessinerIllustReliqueGlace,
    dessinerIllustReliqueSable,
    dessinerIllustReliqueCircuit,
    dessinerIllustReliqueFusee,
    dessinerIllustReliqueNexus,
    dessinerIllustChronique4Lignes,
    dessinerIllustChroniqueInferno,
    dessinerIllustChroniqueTempete,
    dessinerIllustChroniqueDouble,
    dessinerIllustChroniqueMelodie,
    dessinerIllustChroniqueMille,
    dessinerIllustChroniqueVoyage,
    dessinerIllustChroniqueGrandMaitre,
    dessinerIllustOracle,
    dessinerIllustArchi,
    dessinerIllustVivant,
};
