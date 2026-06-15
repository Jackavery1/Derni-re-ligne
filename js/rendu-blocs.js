import { BIOMES } from './config.js';
import { assombrir, eclaircir } from './rendu-blocs-utils.js';
import {
    dessinerBlocBiseaute,
    dessinerBlocFondu,
    dessinerBlocCristal,
    dessinerBlocOrganique,
    dessinerBlocGlace,
    dessinerBlocGrain,
    dessinerBlocCircuit,
    dessinerBlocDiamant,
    dessinerBlocNebuleuse,
} from './rendu-blocs-styles.js';

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
    const { effetsReduits, sansOmbreExterne } = preferences;
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
        if (biomeId === 'vide') {
            ctx2d.strokeStyle = 'rgba(180,150,190,0.28)';
            ctx2d.lineWidth = 1;
            ctx2d.strokeRect(px + 1.5, py + 1.5, taille - 3, taille - 3);
        }
        ctx2d.restore();
        return;
    }

    const style = BIOMES[biomeId]?.styleBloc ?? 'biseaute';
    const sansOmbre = opacite < 1 || sansOmbreExterne === true;
    const renderer = RENDERERS[style] ?? RENDERERS.biseaute;
    renderer(ctx2d, x, y, couleur, taille, opacite, sansOmbre, preferences);

    if (biomeId === 'vide' && opacite > 0.05) {
        ctx2d.save();
        ctx2d.globalAlpha = opacite * 0.35;
        ctx2d.strokeStyle = 'rgba(200,160,180,0.4)';
        ctx2d.lineWidth = 1;
        ctx2d.strokeRect(px + 1.5, py + 1.5, taille - 3, taille - 3);
        ctx2d.restore();
    }
}
