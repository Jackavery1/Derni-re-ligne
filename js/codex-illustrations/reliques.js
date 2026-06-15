import {
    dessinerIllustGlace,
    dessinerIllustDesert,
    dessinerIllustCyber,
    dessinerIllustFuochi,
    dessinerIllustCosmos,
} from './biomes.js';

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
