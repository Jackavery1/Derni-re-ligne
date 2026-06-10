import { CONFIG, BIOMES } from './config.js';
import {
    dessinerFondCosmos,
    dessinerFondCyber,
    dessinerFondDesert,
    dessinerFondForet,
    dessinerFondFuochi,
    dessinerFondGlace,
    dessinerFondLave,
    dessinerFondOcean,
} from './rendu-ambiance-fonds.js';
import {
    dessinerFlickerTrame,
    dessinerFondTrame,
    dessinerLigneEclipse,
} from './rendu-ambiance-histoire.js';
import {
    obtenirBiomeActif,
    obtenirEffetsReduits,
    obtenirCanvasPlateau,
    obtenirCtx,
} from './store-jeu.js';
import {
    dessinerParticulesAmbiance,
    initParticulesAmbiance,
    mettreAJourParticulesAmbiance,
} from './rendu-ambiance-particules.js';
import { modeHistoireEnCours } from './mode-histoire.js';

function dessinerGrille() {
    const ctx = obtenirCtx();
    ctx.save();
    ctx.strokeStyle = BIOMES[obtenirBiomeActif()]?.grilleCoul ?? 'rgba(255,255,255,0.038)';
    ctx.lineWidth = 0.5;
    const colonneMilieu = CONFIG.colonnes / 2;
    for (let c = 0; c <= CONFIG.colonnes; c++) {
        if (Number.isInteger(colonneMilieu) && c === colonneMilieu) continue;
        ctx.beginPath();
        ctx.moveTo(c * CONFIG.taille, 0);
        ctx.lineTo(c * CONFIG.taille, CONFIG.lignes * CONFIG.taille);
        ctx.stroke();
    }
    for (let l = 0; l <= CONFIG.lignes; l++) {
        ctx.beginPath();
        ctx.moveTo(0, l * CONFIG.taille);
        ctx.lineTo(CONFIG.colonnes * CONFIG.taille, l * CONFIG.taille);
        ctx.stroke();
    }
    ctx.restore();
}

export function dessinerFondBiome() {
    const ctx = obtenirCtx();
    const canvas = obtenirCanvasPlateau();
    if (!ctx || !canvas) return;

    const b = BIOMES[obtenirBiomeActif()];
    const w = canvas.width;
    const h = canvas.height;
    const t = performance.now() / 1000;

    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, b.fondCiel);
    grad.addColorStop(1, b.fondSol);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    if (!obtenirEffetsReduits()) {
        switch (obtenirBiomeActif()) {
            case 'lave':
                dessinerFondLave(ctx, w, h, t);
                break;
            case 'ocean':
                dessinerFondOcean(ctx, w, h, t);
                break;
            case 'foret':
                dessinerFondForet(ctx, w, h, t);
                break;
            case 'glace':
                dessinerFondGlace(ctx, w, h, t);
                break;
            case 'desert':
                dessinerFondDesert(ctx, w, h, t);
                break;
            case 'cyber':
                dessinerFondCyber(ctx, w, h, t);
                break;
            case 'fuochi':
                dessinerFondFuochi(ctx, w, h, t);
                break;
            case 'cosmos':
                dessinerFondCosmos(ctx, w, h, t);
                break;
        }
    }

    dessinerParticulesAmbiance();
    dessinerGrille();

    if (modeHistoireEnCours() && BIOMES[obtenirBiomeActif()]?.mecaniqueSpeciale === 'eclipse') {
        dessinerLigneEclipse();
    }
    if (modeHistoireEnCours() && BIOMES[obtenirBiomeActif()]?.mecaniqueSpeciale === 'trame') {
        dessinerFondTrame();
        dessinerFlickerTrame();
    }
}

export { initParticulesAmbiance, mettreAJourParticulesAmbiance };
