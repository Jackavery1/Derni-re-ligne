// Motifs statiques des fonds de biome (couche generee une fois par biome).
// Chaque motif est une petite fonction pure (ctx, w, h).

function motifCircuits(pas) {
    return (c, w, h) => {
        c.lineWidth = 1;
        for (let x = pas; x < w; x += pas) {
            for (let y = pas; y < h; y += pas) {
                const s = (x * 17 + y * 31) % 100;
                if (s < 35) {
                    c.beginPath();
                    c.moveTo(x, y);
                    c.lineTo(x + pas, y);
                    c.stroke();
                }
                if (s < 20) {
                    c.beginPath();
                    c.moveTo(x, y);
                    c.lineTo(x, y + pas);
                    c.stroke();
                }
                if (s < 10) {
                    c.beginPath();
                    c.arc(x, y, 3, 0, Math.PI * 2);
                    c.stroke();
                }
            }
        }
    };
}

function motifCracks(nb) {
    return (c, w, h) => {
        c.lineWidth = 2;
        for (let i = 0; i < nb; i++) {
            let x = (i * 127) % w,
                y = (i * 83) % h;
            c.beginPath();
            c.moveTo(x, y);
            for (let j = 0; j < 5; j++) {
                const a = (((i * 17 + j * 53) % 360) / 360) * Math.PI * 2;
                x = Math.max(0, Math.min(w, x + Math.cos(a) * 42));
                y = Math.max(0, Math.min(h, y + Math.sin(a) * 32));
                c.lineTo(x, y);
            }
            c.stroke();
        }
    };
}

function motifMetalPlaques(c, w, h) {
    const t = 80;
    c.lineWidth = 1;
    for (let x = 0; x < w; x += t) {
        c.beginPath();
        c.moveTo(x, 0);
        c.lineTo(x, h);
        c.stroke();
    }
    for (let y = 0; y < h; y += t) {
        c.beginPath();
        c.moveTo(0, y);
        c.lineTo(w, y);
        c.stroke();
    }
    for (let x = t * 0.5; x < w; x += t) {
        for (let y = t * 0.5; y < h; y += t) {
            c.beginPath();
            c.arc(x, y, 3, 0, Math.PI * 2);
            c.fill();
        }
    }
}

function motifBraisesFond(c, w, h) {
    for (let i = 0; i < 8; i++) {
        const yb = h * (0.3 + i * 0.09);
        c.beginPath();
        c.moveTo(0, yb);
        for (let x = 0; x <= w; x += 10) c.lineTo(x, yb + Math.sin(x * 0.04 + i) * 14);
        c.stroke();
    }
}

function motifFondMarin(c, w, h) {
    for (let i = 0; i < 10; i++) {
        const x = (i * 157) % w,
            larg = 50 + ((i * 37) % 80),
            haut = 40 + ((i * 23) % 70);
        c.beginPath();
        c.ellipse(x, h, larg / 2, haut, 0, 0, Math.PI);
        c.fill();
    }
    c.lineWidth = 0.8;
    for (let y = 80; y < h; y += 70) {
        c.beginPath();
        c.moveTo(0, y);
        for (let x = 0; x <= w; x += 20) c.lineTo(x, y + Math.sin(x * 0.03) * 10);
        c.stroke();
    }
}

function motifTroncs(c, w, h) {
    for (let i = 0; i < 14; i++) {
        const x = (i * 137) % w,
            hT = 100 + ((i * 53) % 120),
            lT = 10 + ((i * 17) % 14);
        const rF = 55 + ((i * 41) % 50);
        c.fillRect(x - lT / 2, h - hT, lT, hT);
        c.beginPath();
        c.arc(x, h - hT, rF, 0, Math.PI * 2);
        c.fill();
    }
}

function motifCristaux(c, w, h) {
    c.lineWidth = 1;
    for (let i = 0; i < 18; i++) {
        const x0 = (i * 107) % w,
            y0 = (i * 89) % h,
            nb = 2 + (i % 3);
        for (let b = 0; b < nb; b++) {
            const a = (b / nb) * Math.PI * 2 + i * 0.4;
            const lon = 35 + ((b * 23 + i * 17) % 55);
            c.beginPath();
            c.moveTo(x0, y0);
            c.lineTo(x0 + Math.cos(a) * lon, y0 + Math.sin(a) * lon);
            c.stroke();
        }
    }
}

function motifBlizzardFond(c, w, h) {
    c.lineWidth = 0.5;
    for (let i = 0; i < 30; i++) {
        const y = (i * 89) % h,
            x0 = (i * 57) % w,
            lon = 40 + ((i * 37) % 80);
        c.beginPath();
        c.moveTo(x0, y);
        c.lineTo(x0 + lon, y + (i % 2 ? 2 : -2));
        c.stroke();
    }
}

function motifDunes(c, w, h) {
    for (let i = 0; i < 6; i++) {
        const yb = h * (0.35 + i * 0.1),
            a = 0.04 + i * 0.015;
        c.fillStyle = `rgba(180,130,40,${a})`;
        c.beginPath();
        c.moveTo(0, h);
        for (let x = 0; x <= w; x += 8) {
            const y = yb + Math.sin(x * 0.007 + i * 1.1) * 35;
            if (x === 0) c.moveTo(0, y);
            else c.lineTo(x, y);
        }
        c.lineTo(w, h);
        c.closePath();
        c.fill();
    }
}

function motifEclipse(c, w, h) {
    const cx = w * 0.5,
        cy = h * 0.22,
        r = Math.min(w, h) * 0.1;
    c.fillStyle = 'rgba(15,0,30,0.85)';
    c.beginPath();
    c.arc(cx, cy, r * 0.95, 0, Math.PI * 2);
    c.fill();
    const gr = c.createRadialGradient(cx, cy, r * 0.9, cx, cy, r * 2.8);
    gr.addColorStop(0, 'rgba(160,80,255,0.18)');
    gr.addColorStop(0.5, 'rgba(100,0,180,0.08)');
    gr.addColorStop(1, 'rgba(0,0,0,0)');
    c.fillStyle = gr;
    c.beginPath();
    c.arc(cx, cy, r * 2.8, 0, Math.PI * 2);
    c.fill();
}

function motifNebuleuse(c, w, h) {
    [
        { cx: w * 0.2, cy: h * 0.3, col: 'rgba(80,0,160,0.07)' },
        { cx: w * 0.7, cy: h * 0.5, col: 'rgba(0,50,160,0.05)' },
        { cx: w * 0.5, cy: h * 0.7, col: 'rgba(160,40,0,0.04)' },
    ].forEach(({ cx, cy, col }) => {
        const g2 = c.createRadialGradient(cx, cy, 0, cx, cy, w * 0.35);
        g2.addColorStop(0, col);
        g2.addColorStop(1, 'rgba(0,0,0,0)');
        c.fillStyle = g2;
        c.fillRect(0, 0, w, h);
    });
    c.fillStyle = 'rgba(255,255,255,0.55)';
    for (let i = 0; i < 100; i++) {
        c.fillRect(
            (i * 127 + 50) % w,
            (i * 89 + 30) % h,
            1 + (i % 3 === 0 ? 1 : 0),
            1 + (i % 5 === 0 ? 1 : 0)
        );
    }
}

function motifArchives(c, w, h) {
    c.lineWidth = 0.8;
    for (let x = 60; x < w; x += 60) {
        c.beginPath();
        c.moveTo(x, 0);
        c.lineTo(x, h);
        c.stroke();
    }
    for (let y = 30; y < h; y += 30) {
        c.beginPath();
        c.moveTo(0, y);
        c.lineTo(w, y);
        c.stroke();
    }
}

function motifGrilleDistordue(c, w, h) {
    c.lineWidth = 0.5;
    const p = 70;
    for (let x = 0; x <= w; x += p) {
        c.beginPath();
        for (let y = 0; y <= h; y += 6) {
            const dx = Math.sin(y * 0.018) * 12;
            if (y === 0) c.moveTo(x + dx, y);
            else c.lineTo(x + dx, y);
        }
        c.stroke();
    }
    for (let y = 0; y <= h; y += p) {
        c.beginPath();
        for (let x = 0; x <= w; x += 6) {
            const dy = Math.sin(x * 0.018) * 12;
            if (x === 0) c.moveTo(x, y + dy);
            else c.lineTo(x, y + dy);
        }
        c.stroke();
    }
}

function motifFractales(c, w, h) {
    c.lineWidth = 1;
    const nb = 6;
    for (let i = 0; i < nb; i++) {
        const r = 55 + i * 22;
        c.beginPath();
        for (let j = 0; j <= 3; j++) {
            const a = (i / nb) * Math.PI * 2 + (j / 3) * Math.PI * 2;
            const x = w * 0.5 + Math.cos(a) * r;
            const y = h * 0.5 + Math.sin(a) * r;
            if (j === 0) c.moveTo(x, y);
            else c.lineTo(x, y);
        }
        c.closePath();
        c.stroke();
    }
}

function motifDistorsion(c, w, h) {
    c.lineWidth = 1;
    for (let i = 0; i < 15; i++) {
        const y = (i * 97) % h;
        c.beginPath();
        c.moveTo(0, y);
        for (let x = 0; x <= w; x += 25) c.lineTo(x, y + Math.sin(x * 0.04 + i) * 5);
        c.stroke();
    }
}

const MOTIFS = {
    circuits: motifCircuits(36),
    circuit_board: motifCircuits(48),
    cracks_lave: motifCracks(22),
    roche_volcanique: motifCracks(16),
    metal_plaques: motifMetalPlaques,
    braises_fond: motifBraisesFond,
    fond_marin: motifFondMarin,
    troncs: motifTroncs,
    cristaux: motifCristaux,
    blizzard_fond: motifBlizzardFond,
    dunes: motifDunes,
    eclipse: motifEclipse,
    nebuleuse: motifNebuleuse,
    archives: motifArchives,
    grille_distordue: motifGrilleDistordue,
    fractales: motifFractales,
    distorsion: motifDistorsion,
};

/**
 * @param {CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D} c
 * @param {string} motif
 * @param {number} w
 * @param {number} h
 */
export function dessinerMotifBiome(c, motif, w, h) {
    MOTIFS[motif]?.(c, w, h);
}
