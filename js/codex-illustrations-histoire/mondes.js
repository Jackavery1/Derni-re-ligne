function fondNoir(ctx, w, h) {
    ctx.fillStyle = '#04020a';
    ctx.fillRect(0, 0, w, h);
}

export function dessinerIllustRouille(ctx, w, h) {
    fondNoir(ctx, w, h);
    // Fond rouille degrade
    const g = ctx.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, '#1a0a04');
    g.addColorStop(1, '#2d1005');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    // Motif de grille metal
    ctx.strokeStyle = '#4a2010aa';
    ctx.lineWidth = 0.5;
    for (let x = 0; x < w; x += 14) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
    }
    for (let y = 0; y < h; y += 14) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
    }
    // Engrenage central rouille
    ctx.save();
    ctx.shadowColor = '#8b4513';
    ctx.shadowBlur = 8;
    ctx.strokeStyle = '#cd6839';
    ctx.lineWidth = 2;
    ctx.translate(w / 2, h * 0.5);
    ctx.beginPath();
    ctx.arc(0, 0, 20, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 0, 8, 0, Math.PI * 2);
    ctx.stroke();
    for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(Math.cos(a) * 20, Math.sin(a) * 20);
        ctx.lineTo(Math.cos(a) * 26, Math.sin(a) * 26);
        ctx.stroke();
    }
    ctx.restore();
    // Taches rouille
    ctx.globalAlpha = 0.3;
    ctx.fillStyle = '#5c1a00';
    [
        [w * 0.2, h * 0.3, 8, 5],
        [w * 0.7, h * 0.65, 6, 4],
        [w * 0.45, h * 0.75, 7, 6],
    ].forEach(([x, y, rw, rh]) => ctx.fillRect(x, y, rw, rh));
    ctx.globalAlpha = 1;
}

export function dessinerIllustEclipse(ctx, w, h) {
    fondNoir(ctx, w, h);
    const midY = h * 0.52;
    // Moitie haute — dore
    const gHaut = ctx.createLinearGradient(0, 0, 0, midY);
    gHaut.addColorStop(0, '#201500');
    gHaut.addColorStop(1, '#3a2800');
    ctx.fillStyle = gHaut;
    ctx.fillRect(0, 0, w, midY);
    // Moitie basse — indigo
    const gBas = ctx.createLinearGradient(0, midY, 0, h);
    gBas.addColorStop(0, '#080820');
    gBas.addColorStop(1, '#030310');
    ctx.fillStyle = gBas;
    ctx.fillRect(0, midY, w, h - midY);
    // Ligne de separation
    ctx.save();
    ctx.strokeStyle = 'rgba(255,200,50,0.5)';
    ctx.lineWidth = 1;
    ctx.setLineDash([6, 5]);
    ctx.beginPath();
    ctx.moveTo(0, midY);
    ctx.lineTo(w, midY);
    ctx.stroke();
    ctx.setLineDash([]);
    // Soleil partiellement cache
    ctx.shadowColor = '#ffd700';
    ctx.shadowBlur = 18;
    ctx.fillStyle = 'rgba(255,200,0,0.6)';
    ctx.beginPath();
    ctx.arc(w * 0.5, midY, 18, Math.PI, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#030310';
    ctx.beginPath();
    ctx.arc(w * 0.5, midY, 18, 0, Math.PI);
    ctx.fill();
    ctx.restore();
}

export function dessinerIllustVide(ctx, w, h) {
    // Quasi-vide
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, w, h);
    // Quelques pixels à peine visibles
    ctx.fillStyle = 'rgba(255,255,255,0.04)';
    for (let i = 0; i < 20; i++) {
        ctx.fillRect((i * 47) % w, (i * 31) % h, 1, 1);
    }
    // Contour quasi invisible du canvas
    ctx.strokeStyle = 'rgba(255,255,255,0.04)';
    ctx.lineWidth = 1;
    ctx.strokeRect(2, 2, w - 4, h - 4);
    // Un seul point lumineux au centre
    ctx.save();
    ctx.shadowColor = 'rgba(255,255,255,0.3)';
    ctx.shadowBlur = 8;
    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    ctx.beginPath();
    ctx.arc(w / 2, h / 2, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
}

export function dessinerIllustMiroir(ctx, w, h) {
    fondNoir(ctx, w, h);
    // Fond clair (miroir inverse)
    ctx.fillStyle = '#f0ead8';
    ctx.fillRect(0, 0, w, h);
    // Reflexion de grille
    ctx.strokeStyle = 'rgba(200,160,0,0.2)';
    ctx.lineWidth = 0.5;
    for (let x = 0; x < w; x += 20) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
    }
    for (let y = 0; y < h; y += 20) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
    }
    // Ligne de miroir centrale
    ctx.save();
    ctx.shadowColor = '#ff8800';
    ctx.shadowBlur = 8;
    ctx.strokeStyle = '#ff880066';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, h / 2);
    ctx.lineTo(w, h / 2);
    ctx.stroke();
    // Fleche inversee
    const cx = w / 2;
    ctx.strokeStyle = '#ff8800';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(cx, h * 0.35);
    ctx.lineTo(cx, h * 0.65);
    ctx.moveTo(cx - 6, h * 0.4);
    ctx.lineTo(cx, h * 0.35);
    ctx.lineTo(cx + 6, h * 0.4);
    ctx.moveTo(cx - 6, h * 0.6);
    ctx.lineTo(cx, h * 0.65);
    ctx.lineTo(cx + 6, h * 0.6);
    ctx.stroke();
    ctx.restore();
}

export function dessinerIllustTrame(ctx, w, h) {
    ctx.fillStyle = '#000008';
    ctx.fillRect(0, 0, w, h);
    // Grille de fils multicolores
    const couleurs = ['#7700ff', '#ff006e', '#00f5ff', '#ffe600'];
    for (let i = 0; i < 16; i++) {
        const t = i / 15;
        const coul = couleurs[i % couleurs.length];
        const alpha = 0.06 + 0.04 * Math.sin(i * 0.9);
        ctx.strokeStyle = coul;
        ctx.globalAlpha = alpha;
        ctx.lineWidth = 0.8;
        // Fil horizontal ondule
        ctx.beginPath();
        ctx.moveTo(0, t * h);
        for (let x = 0; x <= w; x += 6) {
            ctx.lineTo(x, t * h + Math.sin((x / w) * Math.PI * 3 + i) * 4);
        }
        ctx.stroke();
        // Fil vertical
        ctx.beginPath();
        ctx.moveTo(t * w, 0);
        for (let y = 0; y <= h; y += 6) {
            ctx.lineTo(t * w + Math.sin((y / h) * Math.PI * 3 + i) * 3, y);
        }
        ctx.stroke();
    }
    ctx.globalAlpha = 1;
    // Point central lumineux
    ctx.save();
    const gTrame = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, 30);
    gTrame.addColorStop(0, 'rgba(119,0,255,0.4)');
    gTrame.addColorStop(1, 'transparent');
    ctx.fillStyle = gTrame;
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
}
