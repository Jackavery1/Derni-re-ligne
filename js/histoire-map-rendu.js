import { SEQUENCE_HISTOIRE } from './histoire-donnees.js';
import { BIOMES } from './config.js';
import { obtenirEtatHistoire, mondePeutEtreJoue, obtenirEtatMonde } from './histoire-mondes.js';
import { paradoxeEstDebloque } from './monde-paradoxe-etat.js';
import { appliquerTransformCamera } from './histoire-map-camera.js';

// ── Fond Mode Histoire — données pré-calculées ──────────────────
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

export function dessinerCarteHistoire(etatCarte, timestamp) {
    const { canvasCarte: cvs, ctxCarte: ctx } = etatCarte;
    if (!cvs || !ctx) return;
    const w = cvs.width;
    const h = cvs.height;

    ctx.fillStyle = '#020210';
    ctx.fillRect(0, 0, w, h);
    dessinerEtoilesFond(etatCarte, timestamp);

    ctx.save();
    appliquerTransformCamera(etatCarte.camera, ctx, w, h);

    _dessinerChemins(etatCarte, timestamp);
    _dessinerEtiquettesChapitres(etatCarte);
    _dessinerTousLesNoeuds(etatCarte, timestamp);

    ctx.restore();

    _dessinerVignette(ctx, w, h);
    _dessinerPanelMondeSélectionné(etatCarte, ctx, w, h);
}

function dessinerEtoilesFond(etatCarte, timestamp) {
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

function _positionLabel(pos, rayon, w) {
    const centreX = w * 0.5;
    const marge = rayon + 14;

    if (pos.x < centreX - 20) {
        return { x: pos.x + marge, y: pos.y, align: 'left' };
    } else if (pos.x > centreX + 20) {
        return { x: pos.x - marge, y: pos.y, align: 'right' };
    } else {
        return { x: pos.x, y: pos.y + rayon + 16, align: 'center' };
    }
}

function _dessinerEtiquettesChapitres(etatCarte) {
    const { ctxCarte, positionsNoeuds } = etatCarte;
    if (!ctxCarte) return;

    const chapitresCouleurs = {
        prologue: '#00f5ff',
        chapitre_1: '#ff4500',
        chapitre_2: '#00cfff',
        chapitre_3: '#ffbb44',
        chapitre_4: '#b400ff',
        finale: '#ff006e',
    };
    const chapitresLabels = {
        prologue: 'PROLOGUE',
        chapitre_1: '— CHAPITRE I — LE FEU',
        chapitre_2: '— CHAPITRE II — LES PROFONDEURS',
        chapitre_3: '— CHAPITRE III — LA MÉMOIRE',
        chapitre_4: '— CHAPITRE IV — LA FRACTURE',
        finale: '— FINALE —',
    };

    const rangees = [
        { chapId: 'prologue', ids: ['monde_prologue', 'monde_lave'] },
        { chapId: 'chapitre_1', ids: ['monde_lave', 'monde_boss_1'] },
        { chapId: 'chapitre_2', ids: ['monde_boss_1', 'monde_boss_2'] },
        { chapId: 'chapitre_3', ids: ['monde_boss_2', 'monde_boss_3'] },
        { chapId: 'chapitre_4', ids: ['monde_boss_3', 'monde_boss_4'] },
        { chapId: 'finale', ids: ['monde_finale'] },
    ];

    for (const { chapId, ids } of rangees) {
        const ys = ids.map((id) => positionsNoeuds[id]?.y).filter((y) => y != null);
        if (!ys.length) continue;

        const yMoy = chapId === 'finale' ? ys[0] : ys.reduce((a, b) => a + b, 0) / ys.length;
        const couleur = chapitresCouleurs[chapId] ?? '#ffffff';
        const label = chapitresLabels[chapId] ?? '';

        ctxCarte.save();
        ctxCarte.font = '7px "Press Start 2P", monospace';
        ctxCarte.textAlign = 'left';
        ctxCarte.textBaseline = 'middle';
        ctxCarte.fillStyle = couleur + '55';
        ctxCarte.fillText(label, 12, yMoy);
        ctxCarte.restore();
    }
}

function _dessinerChemins(etatCarte, timestamp) {
    const { ctxCarte: ctx, positionsNoeuds, mondesVisibles, mondesFantomes } = etatCarte;
    if (!ctx) return;
    const etatHist = obtenirEtatHistoire();
    const t = timestamp / 1000;

    const CONNEXIONS = [
        ['monde_prologue', 'monde_lave'],
        ['monde_lave', 'monde_rouille'],
        ['monde_rouille', 'monde_boss_1'],
        ['monde_boss_1', 'monde_ocean'],
        ['monde_ocean', 'monde_foret'],
        ['monde_foret', 'monde_glace'],
        ['monde_glace', 'monde_boss_2'],
        ['monde_boss_2', 'monde_desert'],
        ['monde_desert', 'monde_eclipse'],
        ['monde_eclipse', 'monde_cyber'],
        ['monde_cyber', 'monde_boss_3'],
        ['monde_boss_3', 'monde_fuochi'],
        ['monde_fuochi', 'monde_cosmos'],
        ['monde_cosmos', 'monde_vide'],
        ['monde_vide', 'monde_boss_4'],
        ['monde_boss_4', 'monde_finale'],
    ];

    const COULEURS = {
        'monde_prologue-monde_lave': '#ff6a00',
        'monde_lave-monde_rouille': '#ff4500',
        'monde_rouille-monde_boss_1': '#ff4500',
        'monde_boss_1-monde_ocean': '#00cfff',
        'monde_ocean-monde_foret': '#00cfff',
        'monde_foret-monde_glace': '#aaeeff',
        'monde_glace-monde_boss_2': '#aaeeff',
        'monde_boss_2-monde_desert': '#ffbb44',
        'monde_desert-monde_eclipse': '#ffbb44',
        'monde_eclipse-monde_cyber': '#ff00ff',
        'monde_cyber-monde_boss_3': '#ff00ff',
        'monde_boss_3-monde_fuochi': '#b400ff',
        'monde_fuochi-monde_cosmos': '#b400ff',
        'monde_cosmos-monde_vide': '#7700ff',
        'monde_vide-monde_boss_4': '#440088',
        'monde_boss_4-monde_finale': '#ff006e',
    };

    function _ptControleS(posA, posB) {
        const dx = posB.x - posA.x;
        const dy = posB.y - posA.y;
        const len = Math.sqrt(dx * dx + dy * dy) || 1;

        const px = -dy / len;
        const py = dx / len;

        const amp = Math.min(60, Math.max(18, len * 0.22));

        const cp1x = posA.x + dx * 0.35 + px * amp;
        const cp1y = posA.y + dy * 0.35 + py * amp;

        const cp2x = posB.x - dx * 0.35 - px * amp;
        const cp2y = posB.y - dy * 0.35 - py * amp;

        return { cp1x, cp1y, cp2x, cp2y };
    }

    function _tracerChemin(posA, posB) {
        const dx = posB.x - posA.x;
        const dy = posB.y - posA.y;
        const len = Math.sqrt(dx * dx + dy * dy) || 1;

        const startX = posA.x + (dx / len) * (posA.rayon + 4);
        const startY = posA.y + (dy / len) * (posA.rayon + 4);
        const endX = posB.x - (dx / len) * (posB.rayon + 4);
        const endY = posB.y - (dy / len) * (posB.rayon + 4);

        const { cp1x, cp1y, cp2x, cp2y } = _ptControleS(posA, posB);

        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, endX, endY);
    }

    for (const [idA, idB] of CONNEXIONS) {
        const posA = positionsNoeuds[idA];
        const posB = positionsNoeuds[idB];
        if (!posA || !posB) continue;

        const aVis = !mondesVisibles || mondesVisibles.has(idA) || mondesFantomes?.has(idA);
        const bVis = !mondesVisibles || mondesVisibles.has(idB) || mondesFantomes?.has(idB);
        if (!aVis && !bVis) continue;

        const aComplete = etatHist.mondesCompletes?.includes(idA);
        const bComplete = etatHist.mondesCompletes?.includes(idB);
        const bDispo = mondePeutEtreJoue(idB, etatHist);
        const cle = `${idA}-${idB}`;
        const couleur = COULEURS[cle] ?? '#00f5ff';

        ctx.save();
        ctx.lineCap = 'round';
        ctx.setLineDash([]);

        if (aComplete && bComplete) {
            _tracerChemin(posA, posB);
            ctx.strokeStyle = 'rgba(0,0,0,0.55)';
            ctx.lineWidth = 14;
            ctx.stroke();
            _tracerChemin(posA, posB);
            ctx.strokeStyle = couleur + '99';
            ctx.shadowColor = couleur;
            ctx.shadowBlur = 8;
            ctx.lineWidth = 8;
            ctx.stroke();
            ctx.shadowBlur = 0;
            _tracerChemin(posA, posB);
            ctx.strokeStyle = 'rgba(255,255,255,0.14)';
            ctx.lineWidth = 2;
            ctx.stroke();
            const { cp1x, cp1y, cp2x, cp2y } = _ptControleS(posA, posB);
            for (let p = 0; p < 3; p++) {
                const u = (t * 0.22 + p * 0.33) % 1.0;
                const q = 1 - u;
                const px =
                    q * q * q * posA.x +
                    3 * q * q * u * cp1x +
                    3 * q * u * u * cp2x +
                    u * u * u * posB.x;
                const py =
                    q * q * q * posA.y +
                    3 * q * q * u * cp1y +
                    3 * q * u * u * cp2y +
                    u * u * u * posB.y;
                ctx.globalAlpha = Math.sin(u * Math.PI) * 0.75;
                ctx.fillStyle = '#ffffff';
                ctx.shadowColor = couleur;
                ctx.shadowBlur = 5;
                ctx.beginPath();
                ctx.arc(px, py, 2.5, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;
            }
            ctx.globalAlpha = 1;
        } else if (aComplete && bDispo) {
            const alpha = 0.38 + 0.24 * Math.sin(t * 2.2);
            _tracerChemin(posA, posB);
            ctx.strokeStyle = 'rgba(0,0,0,0.40)';
            ctx.lineWidth = 12;
            ctx.stroke();
            _tracerChemin(posA, posB);
            ctx.strokeStyle = `rgba(0,245,255,${alpha})`;
            ctx.shadowColor = '#00f5ff';
            ctx.shadowBlur = 7;
            ctx.lineWidth = 7;
            ctx.stroke();
            ctx.shadowBlur = 0;
        } else {
            _tracerChemin(posA, posB);
            ctx.strokeStyle = 'rgba(40,35,65,0.55)';
            ctx.lineWidth = 5;
            ctx.setLineDash([5, 9]);
            ctx.stroke();
            ctx.setLineDash([]);
        }

        ctx.restore();
    }
}

function _dessinerVignette(ctx, w, h) {
    const grad = ctx.createRadialGradient(w / 2, h / 2, h * 0.25, w / 2, h / 2, h * 0.78);
    grad.addColorStop(0, 'rgba(0,0,0,0)');
    grad.addColorStop(1, 'rgba(0,0,0,0.40)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
}

function _dessinerPanelMondeSélectionné(etatCarte, ctx, w, h) {
    void ctx;
    void w;
    void h;

    const idSel = etatCarte.noeudSelectionne ?? null;
    const panneau = document.getElementById('histoire-monde-details');

    if (!idSel) {
        panneau?.classList.add('histoire-panneau-masque');
        return;
    }

    panneau?.classList.remove('histoire-panneau-masque');
}

function _dessinerTousLesNoeuds(etatCarte, timestamp) {
    const { positionsNoeuds } = etatCarte;
    const etatHist = obtenirEtatHistoire();
    const sequencePrincipale = SEQUENCE_HISTOIRE.filter((m) => !m.estCache);

    for (const monde of sequencePrincipale) {
        const pos = positionsNoeuds[monde.id];
        if (!pos) continue;
        dessinerNoeud(etatCarte, monde, pos, etatHist, timestamp);
    }

    const caches = SEQUENCE_HISTOIRE.filter((m) => m.estCache);
    for (const monde of caches) {
        const pos = positionsNoeuds[monde.id];
        if (!pos) continue;
        dessinerNoeudCache(etatCarte, monde, pos, etatHist, timestamp);
    }
}

function dessinerNoeud(etatCarte, monde, pos, etatHist, timestamp) {
    const { ctxCarte, noeudSelectionne, noeudSurvole } = etatCarte;
    if (!ctxCarte) return;

    const { x, y, rayon } = pos;
    const etatMonde = obtenirEtatMonde(monde.id, etatHist);
    const estComplete = etatMonde === 'complete';
    const estDisponible = etatMonde === 'disponible';
    const estSelectionne = noeudSelectionne === monde.id;
    const estSurvole = noeudSurvole === monde.id;

    const biome = BIOMES[monde.biomeId] ?? BIOMES.classique;
    const couleur = estComplete || estDisponible ? biome.lueurCoul : '#1a1a2e';

    const t = timestamp / 900;
    const pulse = 0.5 + 0.5 * Math.sin(t);

    ctxCarte.save();

    if (estDisponible && !estComplete) {
        ctxCarte.shadowColor = couleur;
        ctxCarte.shadowBlur = 10 + pulse * 16;
        ctxCarte.strokeStyle = couleur;
        ctxCarte.lineWidth = 1;
        ctxCarte.beginPath();
        ctxCarte.arc(x, y, rayon + 8 + pulse * 4, 0, Math.PI * 2);
        ctxCarte.stroke();
        ctxCarte.shadowBlur = 0;
    }

    if (estSelectionne || estSurvole) {
        ctxCarte.strokeStyle = '#ffffff';
        ctxCarte.lineWidth = 2;
        ctxCarte.shadowColor = '#ffffff';
        ctxCarte.shadowBlur = 8;
        ctxCarte.beginPath();
        ctxCarte.arc(x, y, rayon + 5, 0, Math.PI * 2);
        ctxCarte.stroke();
        ctxCarte.shadowBlur = 0;
    }

    ctxCarte.shadowColor = couleur;
    ctxCarte.shadowBlur = estComplete || estDisponible ? 10 : 0;

    if (monde.estBoss) {
        ctxCarte.beginPath();
        for (let i = 0; i < 6; i++) {
            const angle = (i * Math.PI) / 3 - Math.PI / 6;
            const px = x + rayon * Math.cos(angle);
            const py = y + rayon * Math.sin(angle);
            if (i === 0) ctxCarte.moveTo(px, py);
            else ctxCarte.lineTo(px, py);
        }
        ctxCarte.closePath();
    } else {
        ctxCarte.beginPath();
        ctxCarte.arc(x, y, rayon, 0, Math.PI * 2);
    }

    if (estComplete) {
        ctxCarte.fillStyle = couleur + 'aa';
    } else if (estDisponible) {
        ctxCarte.fillStyle = couleur + '33';
    } else {
        ctxCarte.fillStyle = '#06060f';
    }
    ctxCarte.fill();

    ctxCarte.strokeStyle = couleur;
    ctxCarte.lineWidth = estDisponible && !estComplete ? 2 : 1;
    ctxCarte.stroke();
    ctxCarte.shadowBlur = 0;

    const alpha = estComplete || estDisponible ? 1 : 0.25;
    ctxCarte.globalAlpha = alpha;
    ctxCarte.font = monde.estBoss ? '16px serif' : '13px serif';
    ctxCarte.textAlign = 'center';
    ctxCarte.textBaseline = 'middle';
    if (!estDisponible && !estComplete) {
        ctxCarte.fillStyle = '#3a3a5a';
        ctxCarte.font = '13px serif';
        ctxCarte.fillText('🔒', x, y);
    } else if (estComplete) {
        ctxCarte.fillStyle = '#ffffff';
        ctxCarte.fillText('✓', x, y);
    } else {
        ctxCarte.fillStyle = '#ffffff';
        ctxCarte.fillText(biome.icone, x, y);
    }
    ctxCarte.globalAlpha = 1;

    ctxCarte.font = '5px "Press Start 2P", monospace';
    const w = etatCarte.canvasCarte.width;
    const lbl = _positionLabel(pos, rayon, w);
    ctxCarte.textAlign = lbl.align;
    ctxCarte.textBaseline = 'middle';
    ctxCarte.fillStyle = estComplete || estDisponible ? couleur + 'cc' : '#2a2a4a';
    ctxCarte.fillText(monde.nomAffiche, lbl.x, lbl.y);

    if (estDisponible && !estComplete) {
        dessinerRoboMiniature(etatCarte, x, y - rayon - 4, timestamp);
    }

    ctxCarte.restore();
}

function dessinerNoeudCache(etatCarte, monde, pos, etatHist, timestamp) {
    const { ctxCarte, noeudSelectionne, noeudSurvole } = etatCarte;
    if (!ctxCarte) return;

    const { x, y, rayon } = pos;
    const estDebloque = mondePeutEtreJoue(monde.id, etatHist);

    if (monde.id === 'monde_paradoxe') {
        if (!paradoxeEstDebloque()) return;
        const pulse = 0.5 + 0.5 * Math.sin(timestamp / 2000);
        ctxCarte.save();
        ctxCarte.globalAlpha = 0.06 + 0.04 * pulse;
        ctxCarte.fillStyle = '#ffe600';
        ctxCarte.beginPath();
        ctxCarte.arc(x, y, rayon, 0, Math.PI * 2);
        ctxCarte.fill();
        ctxCarte.restore();
        return;
    }

    ctxCarte.save();
    if (!estDebloque) {
        ctxCarte.globalAlpha = 0.15;
        ctxCarte.fillStyle = '#ffffff';
        ctxCarte.beginPath();
        ctxCarte.arc(x, y, 4, 0, Math.PI * 2);
        ctxCarte.fill();
        ctxCarte.globalAlpha = 1;
    } else {
        const t = timestamp / 600;
        const pulse = 0.5 + 0.5 * Math.sin(t);
        ctxCarte.shadowColor = '#ffe600';
        ctxCarte.shadowBlur = 6 + pulse * 10;
        ctxCarte.strokeStyle = '#ffe600';
        ctxCarte.lineWidth = 1.5;
        ctxCarte.fillStyle = 'rgba(255,230,0,0.15)';
        ctxCarte.beginPath();
        ctxCarte.arc(x, y, rayon, 0, Math.PI * 2);
        ctxCarte.fill();
        ctxCarte.stroke();
        ctxCarte.shadowBlur = 0;
        ctxCarte.font = '12px serif';
        ctxCarte.textAlign = 'center';
        ctxCarte.textBaseline = 'middle';
        ctxCarte.fillStyle = '#ffe600';
        ctxCarte.fillText('✦', x, y);

        if (noeudSelectionne === monde.id || noeudSurvole === monde.id) {
            ctxCarte.font = '5px "Press Start 2P", monospace';
            ctxCarte.fillStyle = '#ffe600';
            ctxCarte.fillText(monde.nomAffiche, x, y + rayon + 11);
        }
    }
    ctxCarte.restore();
}

function dessinerRoboMiniature(etatCarte, x, y, timestamp) {
    const { ctxCarte } = etatCarte;
    if (!ctxCarte) return;

    const bounce = Math.sin(timestamp / 380) * 2.5;
    const rx = Math.round(x - 8);
    const ry = Math.round(y - 14 + bounce);

    ctxCarte.save();
    ctxCarte.fillStyle = '#0c0c28';
    ctxCarte.strokeStyle = '#00f5ff';
    ctxCarte.lineWidth = 1;

    ctxCarte.fillRect(rx + 2, ry, 12, 9);
    ctxCarte.strokeRect(rx + 2, ry, 12, 9);
    ctxCarte.fillRect(rx + 3, ry + 9, 10, 5);
    ctxCarte.strokeRect(rx + 3, ry + 9, 10, 5);
    ctxCarte.fillStyle = '#00f5ff';
    ctxCarte.fillRect(rx + 4, ry + 2, 3, 3);
    ctxCarte.fillRect(rx + 9, ry + 2, 3, 3);
    const alphaBlink = 0.6 + 0.4 * Math.sin(timestamp / 700);
    ctxCarte.globalAlpha = alphaBlink;
    ctxCarte.fillStyle = '#ff006e';
    ctxCarte.fillRect(rx + 7, ry - 3, 2, 2);
    ctxCarte.globalAlpha = 1;

    ctxCarte.restore();
}
