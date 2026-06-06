// js/codex-illustrations-histoire.js
// Illustrations pour les entrées Codex du Mode Histoire.

function fondNoir(ctx, w, h) {
    ctx.fillStyle = '#04020a';
    ctx.fillRect(0, 0, w, h);
}

export function dessinerIllustRouille(ctx, w, h) {
    fondNoir(ctx, w, h);
    // Fond rouille dégradé
    const g = ctx.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, '#1a0a04');
    g.addColorStop(1, '#2d1005');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    // Motif de grille métal
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
    // Engrenage central rouillé
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
    // Moitié haute — doré
    const gHaut = ctx.createLinearGradient(0, 0, 0, midY);
    gHaut.addColorStop(0, '#201500');
    gHaut.addColorStop(1, '#3a2800');
    ctx.fillStyle = gHaut;
    ctx.fillRect(0, 0, w, midY);
    // Moitié basse — indigo
    const gBas = ctx.createLinearGradient(0, midY, 0, h);
    gBas.addColorStop(0, '#080820');
    gBas.addColorStop(1, '#030310');
    ctx.fillStyle = gBas;
    ctx.fillRect(0, midY, w, h - midY);
    // Ligne de séparation
    ctx.save();
    ctx.strokeStyle = 'rgba(255,200,50,0.5)';
    ctx.lineWidth = 1;
    ctx.setLineDash([6, 5]);
    ctx.beginPath();
    ctx.moveTo(0, midY);
    ctx.lineTo(w, midY);
    ctx.stroke();
    ctx.setLineDash([]);
    // Soleil partiellement caché
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
    // Fond clair (miroir inversé)
    ctx.fillStyle = '#f0ead8';
    ctx.fillRect(0, 0, w, h);
    // Réflexion de grille
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
    // Flèche inversée
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
        // Fil horizontal ondulé
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

export function dessinerIllustVera(ctx, w, h) {
    fondNoir(ctx, w, h);
    ctx.fillStyle = '#0a000a';
    ctx.fillRect(0, 0, w, h);
    // Portrait stylisé de VERA
    ctx.save();
    ctx.shadowColor = '#ff006e';
    ctx.shadowBlur = 14;
    ctx.strokeStyle = '#ff006e';
    ctx.lineWidth = 1.5;
    // Tête
    ctx.beginPath();
    ctx.arc(w / 2, h * 0.4, 22, 0, Math.PI * 2);
    ctx.stroke();
    // Silhouette corps (épaules)
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
    // Aura de données
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
    // Fragments de lignes incomplètes
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
    // Yeux carrés
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
    // Rectangle glitché
    ctx.save();
    ctx.strokeStyle = '#aa00ff';
    ctx.shadowColor = '#ff00ff';
    ctx.shadowBlur = 12;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(w * 0.2, h * 0.2, w * 0.6, h * 0.62);
    // Œil glitché
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
        // Emblème
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

// ============================================================
// EXPORT MAP
// ============================================================
export const ILLUSTRATIONS_CODEX_HISTOIRE = {
    dessinerIllustRouille,
    dessinerIllustEclipse,
    dessinerIllustVide,
    dessinerIllustMiroir,
    dessinerIllustTrame,
    dessinerIllustVera,
    dessinerIllustDistorsion,
    dessinerIllustBrasier,
    dessinerIllustSentinelle,
    dessinerIllustArchiviste,
    dessinerIllustAvantgarde,
    dessinerIllustTroisFins,
};
