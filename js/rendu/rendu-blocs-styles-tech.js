import {
    assombrir,
    eclaircir,
    coordsBloc,
    debutBloc,
    finBloc,
    pseudoAleatoire,
} from './rendu-blocs-utils.js';

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
