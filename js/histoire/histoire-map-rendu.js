import { appliquerTransformCamera } from './histoire-map-camera.js';
import { dessinerEtoilesFond, invaliderDonneesEtoilesHistoire } from './histoire-map-fond.js';
import { dessinerTousLesNoeuds } from './histoire-map-noeuds.js';
import { dessinerCheminsCarte } from './histoire-map-rendu-chemins.js';
import {
    dessinerBrouillardFutur,
    dessinerEtiquettesChapitres,
    dessinerIndicateurScroll,
    dessinerVignetteCarte,
    synchroniserPanneauMondeSelectionne,
} from './histoire-map-rendu-overlays.js';

export { invaliderDonneesEtoilesHistoire };

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

    dessinerCheminsCarte(etatCarte, timestamp);
    dessinerTousLesNoeuds(etatCarte, timestamp);

    ctx.restore();

    dessinerBrouillardFutur(etatCarte, ctx, w, h);
    dessinerEtiquettesChapitres(etatCarte, w, h);
    dessinerVignetteCarte(ctx, w, h);
    dessinerIndicateurScroll(etatCarte, ctx, w, h);
    synchroniserPanneauMondeSelectionne(etatCarte);
}
