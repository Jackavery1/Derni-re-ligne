import { fondJournal } from './histoire-illustrations-utils.js';

// ---- Journal 7 — CYBER, message direct ----
export function dessinerJournal7(ctx, w, h) {
    fondJournal(ctx, w, h, '#ff00ff');
    ctx.save();
    // Pluie de code
    ctx.font = '6px monospace';
    ctx.fillStyle = 'rgba(255,0,255,0.2)';
    for (let c2 = 0; c2 < 8; c2++) {
        const chars = '01アウヲ@#';
        for (let r2 = 0; r2 < 6; r2++) {
            ctx.fillText(chars[(c2 + r2) % chars.length], c2 * 14 + 4, r2 * 16 + 14);
        }
    }
    // Portrait VERA (simplifie)
    ctx.shadowColor = '#ff006e';
    ctx.shadowBlur = 14;
    ctx.strokeStyle = '#ff006e';
    ctx.lineWidth = 1.5;
    // Cercle tête
    ctx.beginPath();
    ctx.arc(w * 0.5, h * 0.42, 18, 0, Math.PI * 2);
    ctx.stroke();
    // Yeux
    ctx.fillStyle = '#ff006e';
    ctx.beginPath();
    ctx.arc(w * 0.42, h * 0.38, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(w * 0.58, h * 0.38, 3, 0, Math.PI * 2);
    ctx.fill();
    // Sourire
    ctx.beginPath();
    ctx.arc(w * 0.5, h * 0.44, 8, 0.2 * Math.PI, 0.8 * Math.PI);
    ctx.stroke();
    // Texte "ROBO"
    ctx.fillStyle = '#ff006e';
    ctx.font = '6px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('ROBO.', w / 2, h * 0.78);
    ctx.restore();
}

// ---- Journal 8 — Cosmos (la ligne de VERA) ----
export function dessinerJournal8(ctx, w, h) {
    fondJournal(ctx, w, h, '#7700ff');
    ctx.save();
    // Étoiles
    for (let i = 0; i < 30; i++) {
        ctx.fillStyle = `rgba(255,255,255,${0.1 + 0.2 * (i % 4)})`;
        ctx.fillRect((i * 41) % w, (i * 29) % h, 1 + (i % 2), 1 + (i % 2));
    }
    // Nebuleuse
    const gNeb = ctx.createRadialGradient(w * 0.4, h * 0.4, 0, w * 0.4, h * 0.4, 50);
    gNeb.addColorStop(0, 'rgba(119,0,255,0.3)');
    gNeb.addColorStop(1, 'transparent');
    ctx.fillStyle = gNeb;
    ctx.fillRect(0, 0, w, h);
    // La ligne incomplete
    ctx.shadowColor = '#ffe600';
    ctx.shadowBlur = 10;
    ctx.strokeStyle = '#ffe600';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(w * 0.1, h * 0.75);
    ctx.lineTo(w * 0.85, h * 0.75);
    ctx.stroke();
    ctx.setLineDash([]);
    // Porte (rectangle tirete)
    ctx.strokeStyle = 'rgba(255,230,0,0.4)';
    ctx.lineWidth = 1;
    ctx.strokeRect(w * 0.3, h * 0.6, w * 0.4, h * 0.28);
    ctx.restore();
}

// ---- Journal 9 — Le Vide (dernier signal) ----
export function dessinerJournal9(ctx, w, h) {
    fondJournal(ctx, w, h, '#ffffff');
    ctx.save();
    // Quasi-vide avec quelques points
    ctx.globalAlpha = 0.25;
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 15; i++) {
        ctx.fillRect((i * 53) % w, ((i * 37) % (h * 0.8)) + h * 0.1, 1, 1);
    }
    ctx.globalAlpha = 1;
    // Une seule ligne dans le vide
    ctx.shadowColor = '#ffffff';
    ctx.shadowBlur = 6;
    ctx.strokeStyle = 'rgba(255,255,255,0.35)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(w * 0.2, h / 2);
    ctx.lineTo(w * 0.8, h / 2);
    ctx.stroke();
    // Un seul mot
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.font = '5px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('INACHEVÉ', w / 2, h * 0.7);
    ctx.restore();
}
