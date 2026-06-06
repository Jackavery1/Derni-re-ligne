// js/histoire-illustrations.js
// Illustrations canvas pour les journaux de VERA.
// Fonctions pures — aucune dépendance vers le store ou la logique.

/**
 * Dessine un fond commun pour tous les journaux.
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} w
 * @param {number} h
 * @param {string} couleurAccent
 */
function fondJournal(ctx, w, h, couleurAccent) {
    ctx.fillStyle = '#04020a';
    ctx.fillRect(0, 0, w, h);
    // Vignette
    const grad = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, Math.max(w, h) * 0.7);
    grad.addColorStop(0, 'transparent');
    grad.addColorStop(1, 'rgba(0,0,0,0.5)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
    // Ligne de signal
    ctx.strokeStyle = couleurAccent + '22';
    ctx.lineWidth = 0.5;
    for (let y = 0; y < h; y += 8) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
    }
}

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

// ---- Journal 2 — La Rouille (machines abandonnées) ----
export function dessinerJournal2(ctx, w, h) {
    fondJournal(ctx, w, h, '#cd6839');
    // Engrenage simplifié
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

// ---- Journal 3 — Abysses (La Distorsion répond) ----
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
    // Onde de signal (La Distorsion répondant)
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

// ---- Journal 5 — Arctique (théorie des lignes) ----
export function dessinerJournal5(ctx, w, h) {
    fondJournal(ctx, w, h, '#aaeeff');
    ctx.save();
    // Cristaux de glace en étoile
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
    // Ligne incomplète (symbole)
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

// ---- Journal 6 — Désert (fragment endommagé) ----
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
    // Texte brouillé
    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(255,180,50,0.4)';
    ctx.font = '5px monospace';
    ctx.fillText('...pas la détruire...', 6, h * 0.22);
    ctx.globalAlpha = 0.3;
    ctx.fillText('com—prendre ce qu—elle res—', 6, h * 0.32);
    ctx.restore();
}

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
    // Portrait VERA (simplifié)
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
    // Nébuleuse
    const gNeb = ctx.createRadialGradient(w * 0.4, h * 0.4, 0, w * 0.4, h * 0.4, 50);
    gNeb.addColorStop(0, 'rgba(119,0,255,0.3)');
    gNeb.addColorStop(1, 'transparent');
    ctx.fillStyle = gNeb;
    ctx.fillRect(0, 0, w, h);
    // La ligne incomplète
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
    // Porte (rectangle tireté)
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

// ============================================================
// MAP ID → FONCTION
// ============================================================
export const ILLUSTRATIONS_JOURNAUX = {
    journal_1: dessinerJournal1,
    journal_2: dessinerJournal2,
    journal_3: dessinerJournal3,
    journal_4: dessinerJournal4,
    journal_5: dessinerJournal5,
    journal_6: dessinerJournal6,
    journal_7: dessinerJournal7,
    journal_8: dessinerJournal8,
    journal_9: dessinerJournal9,
};
