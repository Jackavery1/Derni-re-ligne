import {
    assombrir,
    eclaircir,
    coordsBloc,
    debutBloc,
    finBloc,
    tracerRectArrondi,
} from './rendu-blocs-utils.js';

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
