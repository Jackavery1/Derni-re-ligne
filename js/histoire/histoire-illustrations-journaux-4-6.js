import { fondJournal } from './histoire-illustrations-utils.js';

// ---- Journal 4 — Forêt (La vraie forme) ----
export function dessinerJournal4(ctx, w, h) {
    fondJournal(ctx, w, h, '#00cc44');
    // Silhouette d'arbre
    ctx.save();
    ctx.shadowColor = '#00cc44';
    ctx.shadowBlur = 10;
    ctx.fillStyle = 'rgba(0,180,50,0.2)';
    ctx.beginPath();
    ctx.moveTo(w * 0.5, h * 0.1);
    ctx.lineTo(w * 0.2, h * 0.65);
    ctx.lineTo(w * 0.8, h * 0.65);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#00cc44';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    // Tronc
    ctx.fillStyle = '#443322';
    ctx.fillRect(w * 0.46, h * 0.65, w * 0.08, h * 0.25);
    // Spores
    ctx.globalAlpha = 0.6;
    ctx.fillStyle = '#aaee44';
    for (let i = 0; i < 8; i++) {
        const sx = w * 0.2 + ((i * 37) % (w * 0.6));
        const sy = h * 0.1 + ((i * 23) % (h * 0.7));
        ctx.beginPath();
        ctx.arc(sx, sy, 1.5, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.restore();
}

// ---- Journal 5 — Arctique (theorie des lignes) ----
export function dessinerJournal5(ctx, w, h) {
    fondJournal(ctx, w, h, '#aaeeff');
    ctx.save();
    // Cristaux de glace en etoile
    ctx.strokeStyle = '#aaeeff';
    ctx.shadowColor = '#aaeeff';
    ctx.shadowBlur = 12;
    ctx.lineWidth = 1;
    const centres = [
        [w * 0.3, h * 0.45],
        [w * 0.65, h * 0.35],
        [w * 0.5, h * 0.65],
    ];
    for (const [cx2, cy2] of centres) {
        for (let a = 0; a < 6; a++) {
            const angle = (a / 6) * Math.PI * 2;
            ctx.beginPath();
            ctx.moveTo(cx2, cy2);
            ctx.lineTo(cx2 + Math.cos(angle) * 14, cy2 + Math.sin(angle) * 14);
            ctx.stroke();
            ctx.beginPath();
            const mid = 8;
            const bx = cx2 + Math.cos(angle) * mid;
            const by = cy2 + Math.sin(angle) * mid;
            ctx.moveTo(
                bx + Math.cos(angle + Math.PI / 2) * 4,
                by + Math.sin(angle + Math.PI / 2) * 4
            );
            ctx.lineTo(
                bx + Math.cos(angle - Math.PI / 2) * 4,
                by + Math.sin(angle - Math.PI / 2) * 4
            );
            ctx.stroke();
        }
    }
    // Ligne incomplete (symbole)
    ctx.strokeStyle = '#ffe600';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(w * 0.1, h * 0.82);
    ctx.lineTo(w * 0.7, h * 0.82);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
}

// ---- Journal 6 — Desert (fragment endommage) ----
export function dessinerJournal6(ctx, w, h) {
    fondJournal(ctx, w, h, '#ffbb44');
    ctx.save();
    // Texture sable
    ctx.globalAlpha = 0.08;
    for (let i = 0; i < 80; i++) {
        const gx = (i * 47) % w;
        const gy = (i * 37) % h;
        ctx.fillStyle = '#ffbb44';
        ctx.fillRect(gx, gy, 1, 1);
    }
    ctx.globalAlpha = 1;
    // Dune
    const gDune = ctx.createLinearGradient(0, h * 0.5, 0, h);
    gDune.addColorStop(0, 'rgba(180,120,20,0)');
    gDune.addColorStop(1, 'rgba(180,120,20,0.35)');
    ctx.fillStyle = gDune;
    ctx.beginPath();
    ctx.moveTo(0, h);
    ctx.bezierCurveTo(w * 0.25, h * 0.4, w * 0.75, h * 0.55, w, h * 0.35);
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fill();
    // Texte brouille
    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(255,180,50,0.4)';
    ctx.font = '5px monospace';
    ctx.fillText('...pas la detruire...', 6, h * 0.22);
    ctx.globalAlpha = 0.3;
    ctx.fillText('com—prendre ce qu—elle res—', 6, h * 0.32);
    ctx.restore();
}
