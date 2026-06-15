function fondNoir(ctx, w, h) {
    ctx.fillStyle = '#04020a';
    ctx.fillRect(0, 0, w, h);
}

export function dessinerIllustVera(ctx, w, h) {
    fondNoir(ctx, w, h);
    ctx.fillStyle = '#0a000a';
    ctx.fillRect(0, 0, w, h);
    // Portrait stylise de VERA
    ctx.save();
    ctx.shadowColor = '#ff006e';
    ctx.shadowBlur = 14;
    ctx.strokeStyle = '#ff006e';
    ctx.lineWidth = 1.5;
    // Tête
    ctx.beginPath();
    ctx.arc(w / 2, h * 0.4, 22, 0, Math.PI * 2);
    ctx.stroke();
    // Silhouette corps (epaules)
    ctx.beginPath();
    ctx.moveTo(w * 0.18, h * 0.92);
    ctx.quadraticCurveTo(w * 0.3, h * 0.62, w / 2 - 22, h * 0.62);
    ctx.moveTo(w * 0.82, h * 0.92);
    ctx.quadraticCurveTo(w * 0.7, h * 0.62, w / 2 + 22, h * 0.62);
    ctx.stroke();
    // Yeux
    ctx.fillStyle = '#ff006e';
    ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.arc(w * 0.41, h * 0.37, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(w * 0.59, h * 0.37, 3, 0, Math.PI * 2);
    ctx.fill();
    // Sourire
    ctx.beginPath();
    ctx.arc(w / 2, h * 0.43, 9, 0.15 * Math.PI, 0.85 * Math.PI);
    ctx.stroke();
    ctx.restore();
    // Aura de donnees
    ctx.save();
    ctx.font = '5px monospace';
    ctx.fillStyle = 'rgba(255,0,110,0.2)';
    const dataChars = '01TRAME';
    for (let i = 0; i < 8; i++) {
        ctx.fillText(
            dataChars[i % dataChars.length],
            w * 0.05 + ((i * 29) % (w * 0.9)),
            h * 0.08 + ((i * 13) % (h * 0.15))
        );
    }
    ctx.restore();
}

export function dessinerIllustDistorsion(ctx, w, h) {
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, w, h);
    // Vortex
    ctx.save();
    ctx.shadowColor = '#ff006e';
    ctx.shadowBlur = 16;
    for (let r = 4; r < 36; r += 4) {
        const a = 0.04 + 0.04 * Math.sin(r * 0.5);
        ctx.strokeStyle = `rgba(255,0,110,${a})`;
        ctx.lineWidth = 0.6;
        ctx.beginPath();
        ctx.arc(w / 2, h * 0.48, r, 0, Math.PI * 2);
        ctx.stroke();
    }
    // Symbole infini
    ctx.fillStyle = 'rgba(255,0,110,0.35)';
    ctx.font = 'bold 26px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('∞', w / 2, h * 0.48);
    ctx.restore();
    // Fragments de lignes incompletes
    ctx.save();
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    for (let i = 0; i < 4; i++) {
        const y = h * (0.15 + i * 0.18);
        ctx.beginPath();
        ctx.moveTo(w * 0.1, y);
        ctx.lineTo(w * 0.6 + i * 5, y);
        ctx.stroke();
    }
    ctx.restore();
}

export function dessinerIllustBrasier(ctx, w, h) {
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, '#0a0200');
    g.addColorStop(1, '#1a0500');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    ctx.save();
    ctx.shadowColor = '#ff4500';
    ctx.shadowBlur = 14;
    // Trois flammes
    [
        [w * 0.3, h * 0.7, h * 0.5],
        [w * 0.5, h * 0.65, h * 0.6],
        [w * 0.7, h * 0.7, h * 0.45],
    ].forEach(([x, by, ht]) => {
        ctx.fillStyle = '#cc2200';
        ctx.beginPath();
        ctx.moveTo(x - 8, by);
        ctx.quadraticCurveTo(x - 4, by - ht * 0.4, x, by - ht);
        ctx.quadraticCurveTo(x + 4, by - ht * 0.4, x + 8, by);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#ff6a00';
        ctx.beginPath();
        ctx.moveTo(x - 4, by);
        ctx.quadraticCurveTo(x, by - ht * 0.5, x + 4, by);
        ctx.closePath();
        ctx.fill();
    });
    ctx.restore();
}

export function dessinerIllustSentinelle(ctx, w, h) {
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, '#020810');
    g.addColorStop(1, '#050f1a');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    ctx.save();
    ctx.strokeStyle = '#aaeeff';
    ctx.shadowColor = '#aaeeff';
    ctx.shadowBlur = 10;
    ctx.lineWidth = 1.2;
    // Corps hexagonal
    const cx = w / 2,
        cy = h * 0.46;
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2 - Math.PI / 6;
        const method = i === 0 ? 'moveTo' : 'lineTo';
        ctx[method](cx + Math.cos(a) * 24, cy + Math.sin(a) * 24);
    }
    ctx.closePath();
    ctx.fillStyle = 'rgba(150,230,255,0.08)';
    ctx.fill();
    ctx.stroke();
    // Yeux carres
    ctx.fillStyle = '#aaeeff';
    ctx.fillRect(cx - 10, cy - 4, 7, 7);
    ctx.fillRect(cx + 3, cy - 4, 7, 7);
    ctx.restore();
}

export function dessinerIllustArchiviste(ctx, w, h) {
    ctx.fillStyle = '#0a000f';
    ctx.fillRect(0, 0, w, h);
    // Pluie de code
    ctx.save();
    ctx.font = '7px monospace';
    for (let i = 0; i < 12; i++) {
        const a = 0.05 + 0.05 * (i % 3);
        ctx.fillStyle = `rgba(255,0,255,${a})`;
        ctx.fillText('01@#', (i * 19) % (w - 20), ((i * 13) % (h - 8)) + 8);
    }
    ctx.restore();
    // Rectangle glitche
    ctx.save();
    ctx.strokeStyle = '#aa00ff';
    ctx.shadowColor = '#ff00ff';
    ctx.shadowBlur = 12;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(w * 0.2, h * 0.2, w * 0.6, h * 0.62);
    // Œil glitche
    ctx.fillStyle = '#ff00ff';
    ctx.beginPath();
    ctx.arc(w / 2, h * 0.46, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#0a000f';
    ctx.fillRect(w / 2 - 3, h * 0.43, 6, 6);
    ctx.restore();
}

export function dessinerIllustAvantgarde(ctx, w, h) {
    ctx.fillStyle = '#000008';
    ctx.fillRect(0, 0, w, h);
    ctx.save();
    // Cercle tournant multicolore
    const couleurs = ['#ff4500', '#aaeeff', '#aa00ff', '#7700ff'];
    for (let i = 0; i < 20; i++) {
        const a = (i / 20) * Math.PI * 2;
        const r = 24;
        const col = couleurs[i % couleurs.length];
        ctx.fillStyle = col;
        ctx.globalAlpha = 0.4;
        ctx.shadowColor = col;
        ctx.shadowBlur = 4;
        ctx.fillRect(w / 2 + Math.cos(a) * r - 2, h * 0.47 + Math.sin(a) * r * 0.7 - 2, 4, 4);
    }
    ctx.globalAlpha = 1;
    ctx.restore();
    // Étoile centrale
    ctx.save();
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = '#7700ff';
    ctx.shadowBlur = 10;
    ctx.font = '20px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('★', w / 2, h * 0.47);
    ctx.restore();
}

export function dessinerIllustTroisFins(ctx, w, h) {
    ctx.fillStyle = '#040408';
    ctx.fillRect(0, 0, w, h);
    // Trois chemins
    const chemins = [
        { couleur: '#00f5ff', label: '◻', y: h * 0.28 },
        { couleur: '#00ff88', label: '∞', y: h * 0.5 },
        { couleur: '#ffe600', label: '✦', y: h * 0.72 },
    ];
    chemins.forEach(({ couleur, label, y }) => {
        ctx.save();
        // Ligne
        ctx.strokeStyle = couleur + '55';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(w * 0.05, y);
        ctx.lineTo(w * 0.75, y);
        ctx.stroke();
        // Embleme
        ctx.fillStyle = couleur;
        ctx.shadowColor = couleur;
        ctx.shadowBlur = 8;
        ctx.font = '10px serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(label, w * 0.86, y);
        ctx.restore();
    });
}
