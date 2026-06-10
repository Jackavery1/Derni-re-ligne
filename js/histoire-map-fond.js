// Fond �toil� carte histoire
// ── Fond Mode Histoire — donnees pre-calculees ──────────────────
let _etoilesHistoire = null;
let _constellationsHistoire = null;
let _nebuleusesHistoire = null;
let _planetesHistoire = null;

const _FORMES_CONSTELLATION = [
    {
        pts: [
            [0, 0],
            [1, 0],
            [0.5, 0.86],
        ],
        lignes: [
            [0, 1],
            [0, 2],
            [1, 2],
        ],
    },
    {
        pts: [
            [0, 0.5],
            [0.25, 0],
            [0.75, 0],
            [1, 0.5],
            [0.5, 1],
        ],
        lignes: [
            [0, 1],
            [1, 2],
            [2, 3],
            [3, 4],
            [4, 0],
        ],
    },
    {
        pts: [
            [0, 0],
            [0.33, 0.65],
            [0.66, 0.15],
            [1, 0.75],
        ],
        lignes: [
            [0, 1],
            [1, 2],
            [2, 3],
        ],
    },
    {
        pts: [
            [0, 0.25],
            [0.5, 0],
            [1, 0.35],
            [0.7, 1],
            [0.15, 0.85],
        ],
        lignes: [
            [0, 1],
            [1, 2],
            [2, 3],
            [3, 4],
        ],
    },
    {
        pts: [
            [0, 0],
            [0.5, 0.4],
            [1, 0],
            [0.5, 1],
        ],
        lignes: [
            [0, 1],
            [1, 2],
            [2, 3],
            [3, 0],
        ],
    },
    {
        pts: [
            [0, 0.5],
            [0.35, 0],
            [0.65, 0],
            [1, 0.5],
        ],
        lignes: [
            [0, 1],
            [2, 3],
            [1, 2],
        ],
    },
];

function _initDonneesEtoilesHistoire(w, h) {
    if (_etoilesHistoire && _etoilesHistoire.w === w) return;

    const etoiles = [];
    const constellations = [];
    const hauteurTotale = h * 4.0;
    const yMin = -h * 0.5;
    const yMax = hauteurTotale + yMin;

    for (let i = 0; i < 800; i++) {
        etoiles.push({
            x: Math.random() * w,
            y: yMin + Math.random() * (yMax - yMin),
            type: 'cercle',
            rayon: 0.5 + Math.random() * 1.5,
            opaciteBase: 0.12 + Math.random() * 0.55,
            vitesse: 0.002 + Math.random() * 0.006,
            offset: Math.random() * Math.PI * 2,
        });
    }

    const ACCENTS = ['#ffffff', '#ccddff', '#00ddc8', '#aa55ff', '#ffcc44'];
    for (let c = 0; c < 45; c++) {
        const forme = _FORMES_CONSTELLATION[c % _FORMES_CONSTELLATION.length];
        const cx = Math.random() * w;
        const cy = yMin + Math.random() * (yMax - yMin);
        const echelle = 28 + Math.random() * 50;
        const points = forme.pts.map(([fx, fy], idx) => ({
            x: cx + (fx - 0.5) * echelle,
            y: cy + (fy - 0.5) * echelle,
            type: idx === 0 ? (c % 3 === 0 ? 'plus' : c % 3 === 1 ? 'croix' : 'cercle') : 'cercle',
            taille: idx === 0 && forme.pts.length > 2 ? 2 : 1,
            couleur: ACCENTS[c % ACCENTS.length],
            rayon: 0.8 + (idx === 0 ? 0.6 : 0.3),
            opaciteBase: 0.35 + (idx === 0 ? 0.25 : 0.15),
            vitesse: 0.002 + (c % 5) * 0.001,
            offset: (c * 0.7 + idx * 1.1) % (Math.PI * 2),
        }));
        constellations.push({ points, lignes: forme.lignes });
    }

    const nebuleuses = [
        {
            x: w * 0.15,
            y: -h * 0.1,
            rx: w * 0.28,
            ry: h * 0.18,
            c1: 'rgba(0,40,150,0.18)',
            c2: 'rgba(20,0,80,0.08)',
        },
        {
            x: w * 0.72,
            y: h * 0.25,
            rx: w * 0.24,
            ry: h * 0.16,
            c1: 'rgba(80,0,180,0.14)',
            c2: 'rgba(0,20,100,0.06)',
        },
        {
            x: w * 0.45,
            y: h * 0.65,
            rx: w * 0.32,
            ry: h * 0.2,
            c1: 'rgba(0,80,180,0.12)',
            c2: 'rgba(40,0,120,0.05)',
        },
        {
            x: w * 0.2,
            y: h * 0.9,
            rx: w * 0.22,
            ry: h * 0.14,
            c1: 'rgba(0,100,200,0.10)',
            c2: 'transparent',
        },
        {
            x: w * 0.8,
            y: h * 1.1,
            rx: w * 0.26,
            ry: h * 0.16,
            c1: 'rgba(60,0,150,0.12)',
            c2: 'transparent',
        },
    ];

    const planetes = [
        { x: w * 0.85, y: -h * 0.05, r: 6, couleur: '#3377ff', halo: 'rgba(0,80,255,0.15)' },
        { x: w * 0.12, y: h * 0.38, r: 4, couleur: '#aa44ff', halo: 'rgba(120,0,255,0.12)' },
        { x: w * 0.68, y: h * 0.8, r: 8, couleur: '#00ccaa', halo: 'rgba(0,200,160,0.14)' },
        { x: w * 0.3, y: h * 1.15, r: 5, couleur: '#ff4488', halo: 'rgba(255,0,100,0.12)' },
        { x: w * 0.92, y: h * 0.55, r: 3, couleur: '#ffcc44', halo: 'rgba(255,200,50,0.10)' },
        { x: w * 0.08, y: h * 1.45, r: 5, couleur: '#55aaff', halo: 'rgba(80,160,255,0.12)' },
        { x: w * 0.55, y: -h * 0.18, r: 4, couleur: '#cc66ff', halo: 'rgba(180,80,255,0.11)' },
        { x: w * 0.42, y: h * 1.6, r: 6, couleur: '#00dd88', halo: 'rgba(0,220,120,0.13)' },
        { x: w * 0.78, y: h * 1.25, r: 3, couleur: '#ff8866', halo: 'rgba(255,120,80,0.10)' },
        { x: w * 0.18, y: h * 0.08, r: 4, couleur: '#aaddff', halo: 'rgba(150,210,255,0.11)' },
        { x: w * 0.62, y: h * 0.18, r: 3, couleur: '#ff66cc', halo: 'rgba(255,80,180,0.10)' },
        { x: w * 0.25, y: h * 1.85, r: 5, couleur: '#8866ff', halo: 'rgba(120,90,255,0.12)' },
        { x: w * 0.48, y: h * 0.42, r: 3, couleur: '#44ffcc', halo: 'rgba(60,255,200,0.10)' },
        { x: w * 0.95, y: h * 0.95, r: 4, couleur: '#dd88ff', halo: 'rgba(200,120,255,0.11)' },
        { x: w * 0.05, y: h * 0.72, r: 3, couleur: '#ffaa55', halo: 'rgba(255,170,80,0.10)' },
        { x: w * 0.72, y: h * 1.48, r: 5, couleur: '#3388ff', halo: 'rgba(50,130,255,0.12)' },
        { x: w * 0.35, y: -h * 0.12, r: 3, couleur: '#66ffaa', halo: 'rgba(90,255,160,0.10)' },
        { x: w * 0.88, y: h * 1.72, r: 4, couleur: '#ff5599', halo: 'rgba(255,80,150,0.11)' },
        { x: w * 0.15, y: h * 2.05, r: 6, couleur: '#5599ff', halo: 'rgba(80,150,255,0.13)' },
        { x: w * 0.58, y: h * 2.2, r: 3, couleur: '#ccff44', halo: 'rgba(200,255,60,0.10)' },
        { x: w * 0.82, y: h * 0.32, r: 3, couleur: '#bb66ff', halo: 'rgba(180,90,255,0.10)' },
        { x: w * 0.38, y: h * 1.02, r: 4, couleur: '#00bbee', halo: 'rgba(0,185,235,0.11)' },
    ];

    _etoilesHistoire = { donnees: etoiles, w, h };
    _constellationsHistoire = { donnees: constellations, w, h };
    _nebuleusesHistoire = { donnees: nebuleuses, w, h };
    _planetesHistoire = { donnees: planetes, w, h };
}

export function invaliderDonneesEtoilesHistoire() {
    _etoilesHistoire = null;
    _constellationsHistoire = null;
    _nebuleusesHistoire = null;
    _planetesHistoire = null;
}

export function dessinerEtoilesFond(etatCarte, timestamp) {
    const { canvasCarte, ctxCarte } = etatCarte;
    if (!canvasCarte || !ctxCarte) return;
    const w = canvasCarte.width;
    const h = canvasCarte.height;
    const t = timestamp / 1000;

    _initDonneesEtoilesHistoire(w, h);

    const offsetNeb = (etatCarte.camera?.y ?? 0) * 0.15;

    for (const neb of _nebuleusesHistoire.donnees) {
        const ny = neb.y - offsetNeb;
        const grad = ctxCarte.createRadialGradient(
            neb.x,
            ny,
            0,
            neb.x,
            ny,
            Math.max(neb.rx, neb.ry)
        );
        grad.addColorStop(0, neb.c1);
        grad.addColorStop(0.5, neb.c2);
        grad.addColorStop(1, 'transparent');

        ctxCarte.save();
        ctxCarte.scale(1, neb.ry / neb.rx);
        ctxCarte.fillStyle = grad;
        ctxCarte.beginPath();
        ctxCarte.arc(neb.x, ny * (neb.rx / neb.ry), neb.rx, 0, Math.PI * 2);
        ctxCarte.fill();
        ctxCarte.restore();
    }

    const offsetPlan = (etatCarte.camera?.y ?? 0) * 0.08;
    for (const plan of _planetesHistoire.donnees) {
        const py = plan.y - offsetPlan;

        const gradPlan = ctxCarte.createRadialGradient(
            plan.x,
            py,
            plan.r * 0.5,
            plan.x,
            py,
            plan.r * 3.5
        );
        gradPlan.addColorStop(0, plan.halo);
        gradPlan.addColorStop(1, 'transparent');
        ctxCarte.fillStyle = gradPlan;
        ctxCarte.beginPath();
        ctxCarte.arc(plan.x, py, plan.r * 3.5, 0, Math.PI * 2);
        ctxCarte.fill();

        const gradCorps = ctxCarte.createRadialGradient(
            plan.x - plan.r * 0.3,
            py - plan.r * 0.3,
            plan.r * 0.1,
            plan.x,
            py,
            plan.r
        );
        gradCorps.addColorStop(0, plan.couleur + 'ff');
        gradCorps.addColorStop(0.6, plan.couleur + 'aa');
        gradCorps.addColorStop(1, plan.couleur + '44');
        ctxCarte.fillStyle = gradCorps;
        ctxCarte.beginPath();
        ctxCarte.arc(plan.x, py, plan.r, 0, Math.PI * 2);
        ctxCarte.fill();
    }

    const offsetEt = (etatCarte.camera?.y ?? 0) * 0.05;

    for (const et of _etoilesHistoire.donnees) {
        const ey = et.y - offsetEt;
        if (ey < -20 || ey > h + 20) continue;
        _dessinerEtoileFond(ctxCarte, et, et.x, ey, t);
    }

    for (const constel of _constellationsHistoire.donnees) {
        let visible = false;
        const ptsEcran = constel.points.map((pt) => {
            const ey = pt.y - offsetEt;
            if (ey >= -40 && ey <= h + 40) visible = true;
            return { pt, ey };
        });
        if (!visible) continue;

        ctxCarte.save();
        ctxCarte.strokeStyle = 'rgba(255,255,255,0.09)';
        ctxCarte.lineWidth = 0.8;
        for (const [i, j] of constel.lignes) {
            const a = ptsEcran[i];
            const b = ptsEcran[j];
            if (!a || !b) continue;
            ctxCarte.beginPath();
            ctxCarte.moveTo(a.pt.x, a.ey);
            ctxCarte.lineTo(b.pt.x, b.ey);
            ctxCarte.stroke();
        }
        ctxCarte.restore();

        for (const { pt, ey } of ptsEcran) {
            _dessinerEtoileFond(ctxCarte, pt, pt.x, ey, t);
        }
    }
}

function _dessinerEtoileFond(ctx, et, x, y, t) {
    if (et.type === 'cercle') {
        const scintil = 0.5 + 0.5 * Math.sin(t * et.vitesse * 60 + et.offset);
        ctx.globalAlpha = 1;
        ctx.fillStyle = `rgba(255,255,255,${(et.opaciteBase * scintil).toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(x, y, et.rayon, 0, Math.PI * 2);
        ctx.fill();
        return;
    }

    const alpha = 0.4 + 0.5 * Math.abs(Math.sin(t * et.vitesse * 60 + et.offset));
    _dessinerEtoilePixel(ctx, x, y, et.taille ?? 1, et.couleur ?? '#ffffff', alpha, et.type);
}

function _dessinerEtoilePixel(ctx, x, y, taille, couleur, alpha, type) {
    ctx.globalAlpha = alpha;
    ctx.fillStyle = couleur;

    if (type === 'point') {
        ctx.fillRect(x, y, 2, 2);
    } else if (type === 'plus') {
        const b = taille;
        ctx.fillRect(x - 1, y - 1, 2, 2);
        ctx.fillRect(x - b - 1, y - 1, b, 2);
        ctx.fillRect(x + 2, y - 1, b, 2);
        ctx.fillRect(x - 1, y - b - 1, 2, b);
        ctx.fillRect(x - 1, y + 2, 2, b);
        ctx.globalAlpha = alpha * 0.25;
        ctx.fillRect(x - b - 2, y - 1, 1, 2);
        ctx.fillRect(x + b + 2, y - 1, 1, 2);
        ctx.fillRect(x - 1, y - b - 2, 2, 1);
        ctx.fillRect(x - 1, y + b + 2, 2, 1);
    } else if (type === 'croix') {
        const b = taille;
        ctx.fillRect(x - 1, y - 1, 2, 2);
        for (let i = 1; i <= b; i++) {
            ctx.fillRect(x - 1 - i, y - 1 - i, 2, 2);
            ctx.fillRect(x - 1 + i, y - 1 - i, 2, 2);
            ctx.fillRect(x - 1 - i, y - 1 + i, 2, 2);
            ctx.fillRect(x - 1 + i, y - 1 + i, 2, 2);
        }
    }

    ctx.globalAlpha = 1;
}
