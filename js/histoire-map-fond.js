/** Fond étoilé animé — carte mode Histoire. */
import {
    obtenirCouchesFondHistoire,
    invaliderDonneesEtoilesHistoire,
} from './histoire-map-fond-donnees.js';
import { dessinerEtoileFond } from './histoire-map-fond-etoiles.js';

export { invaliderDonneesEtoilesHistoire };

export function dessinerEtoilesFond(etatCarte, timestamp) {
    const { canvasCarte, ctxCarte } = etatCarte;
    if (!canvasCarte || !ctxCarte) return;
    const w = canvasCarte.width;
    const h = canvasCarte.height;
    const t = timestamp / 1000;

    const { etoiles, constellations, nebuleuses, planetes } = obtenirCouchesFondHistoire(w, h);
    const offsetNeb = (etatCarte.camera?.y ?? 0) * 0.15;

    for (const neb of nebuleuses) {
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
    for (const plan of planetes) {
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

    for (const et of etoiles) {
        const ey = et.y - offsetEt;
        if (ey < -20 || ey > h + 20) continue;
        dessinerEtoileFond(ctxCarte, et, et.x, ey, t);
    }

    for (const constel of constellations) {
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
            dessinerEtoileFond(ctxCarte, pt, pt.x, ey, t);
        }
    }
}
