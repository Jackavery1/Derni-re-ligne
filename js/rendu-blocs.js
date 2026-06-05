import { BIOMES } from './config.js';

function couleurValide(hex) {
    return typeof hex === 'string' && hex.startsWith('#') && hex.length >= 7;
}

function assombrir(hex, facteur) {
    if (!couleurValide(hex)) hex = '#ffffff';
    const n = parseInt(hex.slice(1), 16);
    const r = Math.floor(((n >> 16) & 255) * facteur);
    const g = Math.floor(((n >> 8) & 255) * facteur);
    const b = Math.floor((n & 255) * facteur);
    return `rgb(${r},${g},${b})`;
}

function eclaircir(hex, facteur) {
    if (!couleurValide(hex)) hex = '#ffffff';
    const n = parseInt(hex.slice(1), 16);
    const r = Math.min(255, Math.floor(((n >> 16) & 255) * facteur));
    const g = Math.min(255, Math.floor(((n >> 8) & 255) * facteur));
    const b = Math.min(255, Math.floor((n & 255) * facteur));
    return `rgb(${r},${g},${b})`;
}

function pseudoAleatoire(graine) {
    const x = Math.sin(graine * 12.9898) * 43758.5453;
    return x - Math.floor(x);
}

function tracerRectArrondi(ctx2d, x, y, largeur, hauteur, rayon) {
    const r = Math.min(rayon, largeur / 2, hauteur / 2);
    ctx2d.beginPath();
    ctx2d.moveTo(x + r, y);
    ctx2d.lineTo(x + largeur - r, y);
    ctx2d.quadraticCurveTo(x + largeur, y, x + largeur, y + r);
    ctx2d.lineTo(x + largeur, y + hauteur - r);
    ctx2d.quadraticCurveTo(x + largeur, y + hauteur, x + largeur - r, y + hauteur);
    ctx2d.lineTo(x + r, y + hauteur);
    ctx2d.quadraticCurveTo(x, y + hauteur, x, y + hauteur - r);
    ctx2d.lineTo(x, y + r);
    ctx2d.quadraticCurveTo(x, y, x + r, y);
    ctx2d.closePath();
}

function coordsBloc(x, y, taille) {
    const px = x * taille;
    const py = y * taille;
    const b = Math.floor(taille * 0.17);
    const m = Math.max(1, Math.floor(taille * 0.06));
    return {
        px,
        py,
        b,
        m,
        cx: px + b,
        cy: py + b,
        cw: taille - b * 2,
        ch: taille - b * 2,
        centreX: px + taille / 2,
        centreY: py + taille / 2,
    };
}

function debutBloc(ctx2d, couleur, opacite, sansOmbre, shadowBlur) {
    ctx2d.save();
    ctx2d.globalAlpha = opacite;
    if (!sansOmbre) {
        ctx2d.shadowColor = couleur;
        ctx2d.shadowBlur = shadowBlur;
    }
}

function finBloc(ctx2d) {
    ctx2d.shadowBlur = 0;
    ctx2d.restore();
}

export function dessinerBlocBiseaute(
    ctx2d,
    x,
    y,
    couleur,
    taille,
    opacite,
    sansOmbre,
    prefererMoinsAnimations
) {
    const { px, py, b, cx, cy, cw, ch } = coordsBloc(x, y, taille);
    debutBloc(ctx2d, couleur, opacite, sansOmbre || prefererMoinsAnimations, 8);

    const gradCorps = ctx2d.createLinearGradient(cx, cy, cx, cy + ch);
    gradCorps.addColorStop(0, eclaircir(couleur, 1.3));
    gradCorps.addColorStop(0.5, couleur);
    gradCorps.addColorStop(1, assombrir(couleur, 0.48));
    ctx2d.fillStyle = gradCorps;
    ctx2d.fillRect(cx, cy, cw, ch);
    ctx2d.shadowBlur = 0;

    ctx2d.beginPath();
    ctx2d.moveTo(px, py);
    ctx2d.lineTo(px + taille, py);
    ctx2d.lineTo(px + taille - b, py + b);
    ctx2d.lineTo(px + b, py + b);
    ctx2d.closePath();
    const gradTop = ctx2d.createLinearGradient(px, py, px, py + b);
    gradTop.addColorStop(0, 'rgba(255,255,255,0.55)');
    gradTop.addColorStop(1, 'rgba(255,255,255,0.08)');
    ctx2d.fillStyle = gradTop;
    ctx2d.fill();

    ctx2d.beginPath();
    ctx2d.moveTo(px, py);
    ctx2d.lineTo(px + b, py + b);
    ctx2d.lineTo(px + b, py + taille - b);
    ctx2d.lineTo(px, py + taille);
    ctx2d.closePath();
    const gradLeft = ctx2d.createLinearGradient(px, py, px + b, py);
    gradLeft.addColorStop(0, 'rgba(255,255,255,0.28)');
    gradLeft.addColorStop(1, 'rgba(255,255,255,0)');
    ctx2d.fillStyle = gradLeft;
    ctx2d.fill();

    ctx2d.beginPath();
    ctx2d.moveTo(px, py + taille);
    ctx2d.lineTo(px + taille, py + taille);
    ctx2d.lineTo(px + taille - b, py + taille - b);
    ctx2d.lineTo(px + b, py + taille - b);
    ctx2d.closePath();
    ctx2d.fillStyle = 'rgba(0,0,0,0.50)';
    ctx2d.fill();

    ctx2d.beginPath();
    ctx2d.moveTo(px + taille, py);
    ctx2d.lineTo(px + taille, py + taille);
    ctx2d.lineTo(px + taille - b, py + taille - b);
    ctx2d.lineTo(px + taille - b, py + b);
    ctx2d.closePath();
    ctx2d.fillStyle = 'rgba(0,0,0,0.32)';
    ctx2d.fill();

    const reflet = ctx2d.createRadialGradient(
        cx + cw * 0.28,
        cy + ch * 0.22,
        0,
        cx + cw * 0.28,
        cy + ch * 0.22,
        cw * 0.85
    );
    reflet.addColorStop(0, 'rgba(255,255,255,0.26)');
    reflet.addColorStop(1, 'rgba(255,255,255,0)');
    ctx2d.fillStyle = reflet;
    ctx2d.fillRect(cx, cy, cw, ch);

    finBloc(ctx2d);
}

export function dessinerBlocFondu(ctx2d, x, y, couleur, taille, opacite, sansOmbre) {
    const { px, py, m, centreX, centreY } = coordsBloc(x, y, taille);
    const largeur = taille - m * 2;
    const hauteur = taille - m * 2;
    const bx = px + m;
    const by = py + m;
    const rayon = taille * 0.22;

    debutBloc(ctx2d, couleur, opacite, sansOmbre, 16);

    tracerRectArrondi(ctx2d, bx, by, largeur, hauteur, rayon);
    const gradCorps = ctx2d.createRadialGradient(
        centreX,
        centreY,
        0,
        centreX,
        centreY,
        taille * 0.55
    );
    gradCorps.addColorStop(0, eclaircir(couleur, 1.25));
    gradCorps.addColorStop(0.55, couleur);
    gradCorps.addColorStop(1, assombrir(couleur, 0.45));
    ctx2d.fillStyle = gradCorps;
    ctx2d.fill();

    const lueur = ctx2d.createRadialGradient(centreX, centreY, 0, centreX, centreY, taille * 0.4);
    lueur.addColorStop(0, 'rgba(255,255,255,0.35)');
    lueur.addColorStop(1, 'rgba(255,255,255,0)');
    ctx2d.fillStyle = lueur;
    tracerRectArrondi(ctx2d, bx, by, largeur, hauteur, rayon);
    ctx2d.fill();

    ctx2d.shadowBlur = 0;
    ctx2d.beginPath();
    ctx2d.moveTo(bx + largeur * 0.2, by + hauteur);
    ctx2d.bezierCurveTo(
        centreX,
        by + hauteur + taille * 0.18,
        centreX,
        by + hauteur + taille * 0.12,
        bx + largeur * 0.8,
        by + hauteur
    );
    ctx2d.lineTo(bx + largeur * 0.8, by + hauteur - 2);
    ctx2d.bezierCurveTo(
        centreX,
        by + hauteur + taille * 0.08,
        centreX,
        by + hauteur + taille * 0.04,
        bx + largeur * 0.2,
        by + hauteur - 2
    );
    ctx2d.closePath();
    ctx2d.fillStyle = assombrir(couleur, 0.6);
    ctx2d.globalAlpha = opacite * 0.85;
    ctx2d.fill();

    finBloc(ctx2d);
}

export function dessinerBlocCristal(ctx2d, x, y, couleur, taille, opacite, sansOmbre) {
    const { px, py, m } = coordsBloc(x, y, taille);
    const bx = px + m;
    const by = py + m;
    const largeur = taille - m * 2;
    const hauteur = taille - m * 2;
    const margeInt = Math.floor(taille * 0.28);

    debutBloc(ctx2d, couleur, opacite, sansOmbre, 14);
    ctx2d.shadowBlur = 0;

    ctx2d.fillStyle = couleur + '22';
    ctx2d.fillRect(bx, by, largeur, hauteur);

    ctx2d.strokeStyle = couleur;
    ctx2d.lineWidth = taille * 0.12;
    ctx2d.strokeRect(bx, by, largeur, hauteur);

    const ix = bx + margeInt;
    const iy = by + margeInt;
    const iw = largeur - margeInt * 2;
    const ih = hauteur - margeInt * 2;
    ctx2d.strokeStyle = couleur;
    ctx2d.lineWidth = Math.max(0.8, taille * 0.04);
    ctx2d.strokeRect(ix, iy, iw, ih);

    ctx2d.globalAlpha = opacite * 0.2;
    ctx2d.strokeStyle = couleur;
    ctx2d.lineWidth = 0.6;
    ctx2d.beginPath();
    ctx2d.moveTo(bx, by);
    ctx2d.lineTo(bx + largeur, by + hauteur);
    ctx2d.moveTo(bx + largeur, by);
    ctx2d.lineTo(bx, by + hauteur);
    ctx2d.stroke();

    ctx2d.globalAlpha = opacite * 0.5;
    const losange = taille * 0.14;
    ctx2d.fillStyle = 'rgba(255,255,255,0.5)';
    ctx2d.beginPath();
    ctx2d.moveTo(bx + losange, by + losange * 0.5);
    ctx2d.lineTo(bx + losange * 2, by + losange);
    ctx2d.lineTo(bx + losange, by + losange * 1.5);
    ctx2d.lineTo(bx, by + losange);
    ctx2d.closePath();
    ctx2d.fill();

    finBloc(ctx2d);
}

export function dessinerBlocOrganique(ctx2d, x, y, couleur, taille, opacite, sansOmbre) {
    const { px, py, m } = coordsBloc(x, y, taille);
    const bx = px + m;
    const by = py + m;
    const largeur = taille - m * 2;
    const hauteur = taille - m * 2;
    const rayon = taille * 0.38;

    debutBloc(ctx2d, couleur, opacite, sansOmbre, 8);

    tracerRectArrondi(ctx2d, bx, by, largeur, hauteur, rayon);
    const gradCorps = ctx2d.createLinearGradient(bx, by, bx, by + hauteur);
    gradCorps.addColorStop(0, eclaircir(couleur, 1.2));
    gradCorps.addColorStop(1, assombrir(couleur, 0.5));
    ctx2d.fillStyle = gradCorps;
    ctx2d.fill();

    ctx2d.shadowBlur = 0;
    ctx2d.strokeStyle = assombrir(couleur, 0.3);
    ctx2d.lineWidth = 0.8;
    for (let i = 0; i < 3; i++) {
        const ligneY = by + hauteur * (0.28 + i * 0.22);
        ctx2d.beginPath();
        ctx2d.moveTo(bx + largeur * 0.12, ligneY);
        for (let pas = 0; pas <= 8; pas++) {
            const t = pas / 8;
            const lx = bx + largeur * (0.12 + t * 0.76);
            const ly = ligneY + Math.sin(t * Math.PI * 2 + i) * 1;
            ctx2d.lineTo(lx, ly);
        }
        ctx2d.stroke();
    }

    ctx2d.strokeStyle = 'rgba(255,255,255,0.4)';
    ctx2d.lineWidth = taille * 0.06;
    ctx2d.beginPath();
    ctx2d.arc(bx + rayon * 0.6, by + rayon * 0.5, rayon * 0.55, Math.PI, Math.PI * 1.8);
    ctx2d.stroke();

    finBloc(ctx2d);
}

export function dessinerBlocGlace(ctx2d, x, y, couleur, taille, opacite, sansOmbre) {
    const { px, py, m, centreX, centreY } = coordsBloc(x, y, taille);
    const bx = px + m;
    const by = py + m;
    const largeur = taille - m * 2;
    const hauteur = taille - m * 2;

    debutBloc(ctx2d, couleur, opacite, sansOmbre, 20);
    ctx2d.shadowBlur = 0;

    ctx2d.fillStyle = couleur + '18';
    ctx2d.fillRect(bx, by, largeur, hauteur);

    ctx2d.strokeStyle = couleur;
    ctx2d.lineWidth = 0.8;
    ctx2d.strokeRect(bx + 0.5, by + 0.5, largeur - 1, hauteur - 1);

    ctx2d.fillStyle = 'rgba(255,255,255,0.45)';
    ctx2d.beginPath();
    ctx2d.moveTo(bx, by);
    ctx2d.lineTo(bx + largeur, by);
    ctx2d.lineTo(centreX, centreY);
    ctx2d.closePath();
    ctx2d.fill();

    const rPetit = taille * 0.05;
    ctx2d.fillStyle = 'rgba(255,255,255,0.8)';
    ctx2d.beginPath();
    ctx2d.arc(bx + largeur * 0.22, by + hauteur * 0.2, rPetit, 0, Math.PI * 2);
    ctx2d.fill();

    ctx2d.fillStyle = 'rgba(255,255,255,0.15)';
    ctx2d.beginPath();
    ctx2d.arc(bx + largeur * 0.78, by + hauteur * 0.78, rPetit, 0, Math.PI * 2);
    ctx2d.fill();

    if (!sansOmbre) {
        ctx2d.shadowColor = couleur;
        ctx2d.shadowBlur = 20;
        ctx2d.strokeStyle = 'transparent';
        ctx2d.strokeRect(bx, by, largeur, hauteur);
    }

    finBloc(ctx2d);
}

export function dessinerBlocGrain(ctx2d, x, y, couleur, taille, opacite, sansOmbre) {
    const { px, py, m } = coordsBloc(x, y, taille);
    const bx = px + m;
    const by = py + m;
    const largeur = taille - m * 2;
    const hauteur = taille - m * 2;

    debutBloc(ctx2d, couleur, opacite, sansOmbre, 4);
    ctx2d.shadowBlur = 0;

    const gradCorps = ctx2d.createLinearGradient(bx, by, bx + largeur, by + hauteur);
    gradCorps.addColorStop(0, eclaircir(couleur, 1.15));
    gradCorps.addColorStop(1, assombrir(couleur, 0.6));
    ctx2d.fillStyle = gradCorps;
    ctx2d.fillRect(bx, by, largeur, hauteur);

    const graine = x * 1000 + y;
    for (let i = 0; i < 18; i++) {
        const alea = pseudoAleatoire(graine + i * 17.31);
        const alea2 = pseudoAleatoire(graine + i * 31.7);
        const gx = bx + alea * (largeur - 2);
        const gy = by + alea2 * (hauteur - 2);
        ctx2d.fillStyle =
            pseudoAleatoire(graine + i) > 0.5 ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)';
        ctx2d.fillRect(gx, gy, 1.5, 1.5);
    }

    ctx2d.fillStyle = assombrir(couleur, 0.75);
    const usure = 2;
    ctx2d.fillRect(bx, by, usure, usure);
    ctx2d.fillRect(bx + largeur - usure, by, usure, usure);
    ctx2d.fillRect(bx, by + hauteur - usure, usure, usure);
    ctx2d.fillRect(bx + largeur - usure, by + hauteur - usure, usure, usure);

    finBloc(ctx2d);
}

export function dessinerBlocCircuit(ctx2d, x, y, couleur, taille, opacite, sansOmbre) {
    const { px, py, m, centreX, centreY } = coordsBloc(x, y, taille);
    const bx = px + m;
    const by = py + m;
    const largeur = taille - m * 2;
    const hauteur = taille - m * 2;

    debutBloc(ctx2d, couleur, opacite, sansOmbre, 12);
    ctx2d.shadowBlur = 0;

    ctx2d.fillStyle = assombrir(couleur, 0.15);
    ctx2d.fillRect(bx, by, largeur, hauteur);

    ctx2d.strokeStyle = couleur;
    ctx2d.lineWidth = 1;
    ctx2d.strokeRect(bx + 0.5, by + 0.5, largeur - 1, hauteur - 1);

    ctx2d.globalAlpha = opacite * 0.6;
    ctx2d.strokeStyle = couleur;
    ctx2d.lineWidth = 1;
    const x1 = bx + largeur * 0.2;
    const x2 = bx + largeur * 0.8;
    const y1 = by + hauteur * 0.2;
    const y2 = by + hauteur * 0.8;
    ctx2d.beginPath();
    ctx2d.moveTo(x1, centreY);
    ctx2d.lineTo(x2, centreY);
    ctx2d.moveTo(centreX, y1);
    ctx2d.lineTo(centreX, y2);
    ctx2d.stroke();

    const rayonPastille = taille * 0.06;
    ctx2d.fillStyle = couleur;
    for (const [cx, cy] of [
        [x1, y1],
        [x2, y1],
        [x1, y2],
        [x2, y2],
    ]) {
        ctx2d.beginPath();
        ctx2d.arc(cx, cy, rayonPastille, 0, Math.PI * 2);
        ctx2d.fill();
    }

    const carrePuce = taille * 0.12;
    ctx2d.fillRect(bx + 2, by + 2, carrePuce, carrePuce);
    ctx2d.fillRect(
        bx + largeur - carrePuce - 2,
        by + hauteur - carrePuce - 2,
        carrePuce,
        carrePuce
    );

    const reflet = ctx2d.createRadialGradient(bx, by, 0, bx, by, taille * 0.65);
    reflet.addColorStop(0, 'rgba(255,255,255,0.25)');
    reflet.addColorStop(1, 'rgba(255,255,255,0)');
    ctx2d.fillStyle = reflet;
    ctx2d.fillRect(bx, by, largeur, hauteur);

    finBloc(ctx2d);
}

export function dessinerBlocDiamant(ctx2d, x, y, couleur, taille, opacite, sansOmbre) {
    const { px, py, m, centreX, centreY } = coordsBloc(x, y, taille);
    const bx = px + m;
    const by = py + m;
    const largeur = taille - m * 2;
    const hauteur = taille - m * 2;
    const xD = bx + largeur;
    const yD = by + hauteur;

    debutBloc(ctx2d, couleur, opacite, sansOmbre, 18);
    ctx2d.shadowBlur = 0;

    const facettes = [
        {
            pts: [
                [bx, by],
                [xD, by],
                [centreX, centreY],
            ],
            teinte: eclaircir(couleur, 1.5),
        },
        {
            pts: [
                [bx, yD],
                [xD, yD],
                [centreX, centreY],
            ],
            teinte: assombrir(couleur, 0.35),
        },
        {
            pts: [
                [bx, by],
                [bx, yD],
                [centreX, centreY],
            ],
            teinte: eclaircir(couleur, 1.2),
        },
        {
            pts: [
                [xD, by],
                [xD, yD],
                [centreX, centreY],
            ],
            teinte: assombrir(couleur, 0.55),
        },
    ];

    for (const f of facettes) {
        ctx2d.fillStyle = f.teinte;
        ctx2d.beginPath();
        ctx2d.moveTo(f.pts[0][0], f.pts[0][1]);
        ctx2d.lineTo(f.pts[1][0], f.pts[1][1]);
        ctx2d.lineTo(f.pts[2][0], f.pts[2][1]);
        ctx2d.closePath();
        ctx2d.fill();
    }

    ctx2d.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx2d.lineWidth = 0.8;
    ctx2d.strokeRect(bx + 0.5, by + 0.5, largeur - 1, hauteur - 1);

    ctx2d.fillStyle = 'rgba(255,255,255,0.8)';
    ctx2d.beginPath();
    ctx2d.arc(centreX, centreY, taille * 0.08, 0, Math.PI * 2);
    ctx2d.fill();

    finBloc(ctx2d);
}

export function dessinerBlocNebuleuse(ctx2d, x, y, couleur, taille, opacite, sansOmbre) {
    const { px, py, m, centreX, centreY } = coordsBloc(x, y, taille);
    const bx = px + m;
    const by = py + m;
    const largeur = taille - m * 2;
    const hauteur = taille - m * 2;

    debutBloc(ctx2d, couleur, opacite, sansOmbre, 22);

    const gradCorps = ctx2d.createRadialGradient(
        centreX,
        centreY,
        0,
        centreX,
        centreY,
        taille * 0.52
    );
    gradCorps.addColorStop(0, eclaircir(couleur, 1.4));
    gradCorps.addColorStop(0.45, couleur);
    gradCorps.addColorStop(1, assombrir(couleur, 0.3));
    ctx2d.fillStyle = gradCorps;
    ctx2d.fillRect(bx, by, largeur, hauteur);

    ctx2d.shadowBlur = 0;
    const graine = x + y;
    for (let i = 0; i < 5; i++) {
        const alea = pseudoAleatoire(graine + i * 9.13);
        const alea2 = pseudoAleatoire(graine + i * 23.5);
        const sx = bx + alea * largeur;
        const sy = by + alea2 * hauteur;
        const rayonEtoile = 1 + pseudoAleatoire(graine + i * 3) * 1;
        ctx2d.fillStyle = `rgba(255,255,255,${0.5 + pseudoAleatoire(graine + i * 5) * 0.4})`;
        ctx2d.beginPath();
        ctx2d.arc(sx, sy, rayonEtoile, 0, Math.PI * 2);
        ctx2d.fill();
    }

    const halo = ctx2d.createRadialGradient(centreX, centreY, 0, centreX, centreY, taille * 0.9);
    halo.addColorStop(0, couleur + '44');
    halo.addColorStop(1, 'rgba(0,0,0,0)');
    ctx2d.fillStyle = halo;
    ctx2d.globalAlpha = opacite;
    ctx2d.fillRect(px, py, taille, taille);

    finBloc(ctx2d);
}

const RENDERERS = {
    biseaute: (ctx2d, x, y, couleur, taille, opacite, sansOmbre, prefs) =>
        dessinerBlocBiseaute(
            ctx2d,
            x,
            y,
            couleur,
            taille,
            opacite,
            sansOmbre,
            prefs.prefererMoinsAnimations
        ),
    fondu: (ctx2d, x, y, couleur, taille, opacite, sansOmbre) =>
        dessinerBlocFondu(ctx2d, x, y, couleur, taille, opacite, sansOmbre),
    cristal: (ctx2d, x, y, couleur, taille, opacite, sansOmbre) =>
        dessinerBlocCristal(ctx2d, x, y, couleur, taille, opacite, sansOmbre),
    organique: (ctx2d, x, y, couleur, taille, opacite, sansOmbre) =>
        dessinerBlocOrganique(ctx2d, x, y, couleur, taille, opacite, sansOmbre),
    glace: (ctx2d, x, y, couleur, taille, opacite, sansOmbre) =>
        dessinerBlocGlace(ctx2d, x, y, couleur, taille, opacite, sansOmbre),
    grain: (ctx2d, x, y, couleur, taille, opacite, sansOmbre) =>
        dessinerBlocGrain(ctx2d, x, y, couleur, taille, opacite, sansOmbre),
    circuit: (ctx2d, x, y, couleur, taille, opacite, sansOmbre) =>
        dessinerBlocCircuit(ctx2d, x, y, couleur, taille, opacite, sansOmbre),
    diamant: (ctx2d, x, y, couleur, taille, opacite, sansOmbre) =>
        dessinerBlocDiamant(ctx2d, x, y, couleur, taille, opacite, sansOmbre),
    nebuleuse: (ctx2d, x, y, couleur, taille, opacite, sansOmbre) =>
        dessinerBlocNebuleuse(ctx2d, x, y, couleur, taille, opacite, sansOmbre),
};

export function dessinerCelluleStyle(ctx2d, x, y, couleur, taille, opacite, biomeId, preferences) {
    const { effetsReduits } = preferences;
    const px = x * taille;
    const py = y * taille;

    if (effetsReduits) {
        ctx2d.save();
        ctx2d.globalAlpha = opacite;
        const g = ctx2d.createLinearGradient(px, py, px, py + taille);
        g.addColorStop(0, eclaircir(couleur, 1.15));
        g.addColorStop(1, assombrir(couleur, 0.5));
        ctx2d.fillStyle = g;
        ctx2d.fillRect(px + 2, py + 2, taille - 4, taille - 4);
        ctx2d.restore();
        return;
    }

    const style = BIOMES[biomeId]?.styleBloc ?? 'biseaute';
    const sansOmbre = opacite < 1;
    const renderer = RENDERERS[style] ?? RENDERERS.biseaute;
    renderer(ctx2d, x, y, couleur, taille, opacite, sansOmbre, preferences);
}
