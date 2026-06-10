import { CONFIG } from './config.js';
import { etat, obtenirBiomeActif, obtenirCanvasPlateau, obtenirCtx } from './store-jeu.js';
import { COMPORTEMENTS_VIVANT, vivant, vivantPlateauTempsPret } from './vivant.js';

export function dessinerAvertissementsVivant() {
    if (vivant.phase !== 'alerte') return;
    if (vivant.cellulesAlerte.length === 0) return;

    const ctx = obtenirCtx();
    const canvasPlateau = obtenirCanvasPlateau();
    if (!ctx || !canvasPlateau) return;

    const t = performance.now() / 300;
    const intensite = vivant.timerAlerte / vivant.DUREE_ALERTE;
    const freqPuls = 1 + (1 - intensite) * 3;
    const pulse = 0.25 + Math.sin(t * freqPuls) * 0.2;
    const coul = vivant.couleurAlerte;

    ctx.save();

    vivant.cellulesAlerte.forEach(({ x, y }) => {
        const px = x * CONFIG.taille;
        const py = y * CONFIG.taille;

        ctx.globalAlpha = pulse * intensite;
        ctx.fillStyle = coul;
        ctx.shadowColor = coul;
        ctx.shadowBlur = 12;
        ctx.fillRect(px + 1, py + 1, CONFIG.taille - 2, CONFIG.taille - 2);

        ctx.globalAlpha = pulse * intensite * 1.5;
        ctx.strokeStyle = coul;
        ctx.lineWidth = 1.5;
        ctx.strokeRect(px + 1, py + 1, CONFIG.taille - 2, CONFIG.taille - 2);
    });

    const progression = 1 - vivant.timerAlerte / vivant.DUREE_ALERTE;
    const largeur = canvasPlateau.width * progression;
    ctx.globalAlpha = 0.7;
    ctx.fillStyle = coul;
    ctx.shadowColor = coul;
    ctx.shadowBlur = 6;
    ctx.fillRect(0, canvasPlateau.height - 3, largeur, 3);

    ctx.restore();
}

export function dessinerSignesVie() {
    const biomeId = obtenirBiomeActif();
    const config = COMPORTEMENTS_VIVANT[biomeId];
    if (!config || !vivantPlateauTempsPret()) return;

    const ctx = obtenirCtx();
    if (!ctx) return;

    const maintenant = Date.now();
    const t = maintenant / 1000;

    ctx.save();

    for (let l = 0; l < CONFIG.lignes; l++) {
        for (let c = 0; c < CONFIG.colonnes; c++) {
            if (etat.plateau[l][c] === 0) continue;
            if (vivant.plateauTemps[l][c] === 0) continue;

            const age = maintenant - vivant.plateauTemps[l][c];
            const px = c * CONFIG.taille;
            const py = l * CONFIG.taille;

            switch (biomeId) {
                case 'lave':
                    if (age > config.seuilAge * 0.7) {
                        const maturite = Math.min(
                            1,
                            (age - config.seuilAge * 0.7) / (config.seuilAge * 0.3)
                        );
                        ctx.globalAlpha = maturite * 0.4;
                        ctx.fillStyle = '#ff4500';
                        ctx.shadowColor = '#ff4500';
                        ctx.shadowBlur = 8;
                        ctx.fillRect(px + CONFIG.taille * 0.3, py, CONFIG.taille * 0.4, 4);
                    }
                    break;

                case 'foret':
                    if (age > config.seuilAge * 0.8) {
                        const maturite = Math.min(
                            1,
                            (age - config.seuilAge * 0.8) / (config.seuilAge * 0.2)
                        );
                        ctx.globalAlpha = maturite * 0.3 * (0.6 + Math.sin(t * 2 + c * 0.5) * 0.4);
                        ctx.strokeStyle = '#00ff88';
                        ctx.shadowColor = '#00ff88';
                        ctx.shadowBlur = 8;
                        ctx.lineWidth = 1;
                        ctx.strokeRect(px + 1, py + 1, CONFIG.taille - 2, CONFIG.taille - 2);
                    }
                    break;

                case 'cosmos':
                    if (l > 0 && etat.plateau[l - 1][c] === 0) {
                        ctx.globalAlpha = 0.3 + Math.sin(t * 3 + c) * 0.2;
                        ctx.fillStyle = '#aa44ff';
                        ctx.shadowColor = '#aa44ff';
                        ctx.shadowBlur = 6;
                        ctx.fillRect(px + CONFIG.taille * 0.4, py, CONFIG.taille * 0.2, 2);
                    }
                    break;

                case 'cyber':
                    if (Math.sin(t * 7 + c * 3 + l * 2) > 0.92) {
                        ctx.globalAlpha = 0.2;
                        ctx.fillStyle = '#ff00ff';
                        const scanY = Math.floor(
                            ((Math.sin(t * 7 + c * 3 + l * 2) + 1) / 2) * CONFIG.taille
                        );
                        ctx.fillRect(px, py + scanY, CONFIG.taille, 1);
                    }
                    break;
            }
        }
    }

    ctx.globalAlpha = 1;
    ctx.restore();
}
