import { fondJournal } from './histoire-illustrations-utils.js';

// ---- Journal 1 — Inferno (source de la corruption) ----
export function dessinerJournal1(ctx, w, h) {
    fondJournal(ctx, w, h, '#ff4500');
    // Fracture incandescente
    ctx.save();
    ctx.shadowColor = '#ff4500';
    ctx.shadowBlur = 14;
    ctx.strokeStyle = '#cc2200';
    ctx.lineWidth = 2;
    const pts = [
        [w * 0.1, h * 0.9],
        [w * 0.3, h * 0.5],
        [w * 0.25, h * 0.3],
        [w * 0.5, h * 0.1],
        [w * 0.6, h * 0.4],
        [w * 0.8, h * 0.2],
        [w * 0.9, h * 0.8],
    ];
    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (const [px, py] of pts.slice(1)) ctx.lineTo(px, py);
    ctx.stroke();
    // Lueur en bas
    const gFeu = ctx.createLinearGradient(0, h * 0.7, 0, h);
    gFeu.addColorStop(0, 'rgba(255,69,0,0)');
    gFeu.addColorStop(1, 'rgba(255,69,0,0.3)');
    ctx.fillStyle = gFeu;
    ctx.fillRect(0, h * 0.7, w, h * 0.3);
    ctx.restore();
    // Signal VERA
    ctx.save();
    ctx.fillStyle = 'rgba(255,100,50,0.5)';
    ctx.font = '7px monospace';
    ctx.fillText('VERA::SIGNAL_01', 4, 10);
    ctx.restore();
}

// ---- Journal 2 — La Rouille (machines abandonnees) ----
export function dessinerJournal2(ctx, w, h) {
    fondJournal(ctx, w, h, '#cd6839');
    // Engrenage simplifie
    ctx.save();
    ctx.shadowColor = '#8b4513';
    ctx.shadowBlur = 8;
    ctx.strokeStyle = '#cd6839';
    ctx.lineWidth = 1.5;
    const cx = w * 0.5,
        cy = h * 0.48,
        r = 22;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.45, 0, Math.PI * 2);
    ctx.stroke();
    // Dents
    for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        const x1 = cx + Math.cos(a) * r;
        const y1 = cy + Math.sin(a) * r;
        const x2 = cx + Math.cos(a) * (r + 7);
        const y2 = cy + Math.sin(a) * (r + 7);
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
    }
    // Taches de rouille
    ctx.globalAlpha = 0.35;
    ctx.fillStyle = '#5c2a00';
    [
        [cx - 5, cy - 8, 6, 4],
        [cx + 8, cy + 6, 5, 5],
        [cx - 12, cy + 4, 4, 6],
    ].forEach(([x, y, rw, rh]) => {
        ctx.fillRect(x, y, rw, rh);
    });
    ctx.restore();
}

// ---- Journal 3 — Abysses (La Distorsion repond) ----
export function dessinerJournal3(ctx, w, h) {
    fondJournal(ctx, w, h, '#00cfff');
    // Bulles montantes
    ctx.save();
    for (let i = 0; i < 10; i++) {
        const bx = w * 0.15 + ((i * w * 0.07) % (w * 0.75));
        const by = h * 0.8 - ((i * 13) % (h * 0.6));
        const br = 2 + (i % 4);
        ctx.strokeStyle = `rgba(0,180,255,${0.15 + 0.15 * (i % 3)})`;
        ctx.lineWidth = 0.8;
        ctx.shadowColor = '#00cfff';
        ctx.shadowBlur = 4;
        ctx.beginPath();
        ctx.arc(bx, by, br, 0, Math.PI * 2);
        ctx.stroke();
    }
    // Onde de signal (La Distorsion repondant)
    ctx.strokeStyle = '#00cfff44';
    ctx.lineWidth = 1;
    for (let ring = 1; ring <= 4; ring++) {
        const alpha = 0.08 + ring * 0.06;
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.arc(w * 0.5, h * 0.52, ring * 12, 0, Math.PI * 2);
        ctx.stroke();
    }
    ctx.restore();
}
