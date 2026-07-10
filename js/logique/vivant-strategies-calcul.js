import { CONFIG } from '../config/config-jeu.js';
import { etat } from '../etat/store-jeu.js';
import { injectionVivant } from './vivant-strategies-injection.js';

function calculerLave(config) {
    const deps = injectionVivant.deps;
    const maintenant = Date.now();
    const cellules = [];
    for (let l = 0; l < CONFIG.lignes; l++) {
        for (let c = 0; c < CONFIG.colonnes; c++) {
            if (etat.plateau[l][c] === 0) continue;
            const age = maintenant - deps.vivant.plateauTemps[l][c];
            if (age >= config.seuilAge) cellules.push({ x: c, y: l });
        }
    }
    cellules.sort(
        (a, b) => deps.vivant.plateauTemps[b.y][b.x] - deps.vivant.plateauTemps[a.y][a.x]
    );
    return cellules.slice(0, config.nbBlocs);
}

function calculerOcean() {
    const cellules = [];
    for (let l = 0; l < CONFIG.lignes; l++) {
        for (let c = 0; c < CONFIG.colonnes; c++) {
            if (etat.plateau[l][c] !== 0) cellules.push({ x: c, y: l });
        }
    }
    return cellules;
}

function calculerForet(config) {
    const deps = injectionVivant.deps;
    const maintenant = Date.now();
    const cellules = [];
    for (let l = 0; l < CONFIG.lignes; l++) {
        for (let c = 0; c < CONFIG.colonnes; c++) {
            if (etat.plateau[l][c] === 0) continue;
            const age = maintenant - deps.vivant.plateauTemps[l][c];
            if (age >= config.seuilAge) cellules.push({ x: c, y: l });
        }
    }
    return cellules.slice(0, config.nbPousses * 2);
}

function calculerGlace(config) {
    const cellules = [];
    for (let l = CONFIG.lignes - 1; l >= 0; l--) {
        const nbOccupees = etat.plateau[l].filter((c) => c !== 0).length;
        if (nbOccupees > 0 && nbOccupees < CONFIG.colonnes) {
            for (let c = 0; c < CONFIG.colonnes; c++) {
                if (etat.plateau[l][c] === 0) cellules.push({ x: c, y: l });
            }
            if (cellules.length >= config.nbGivre * 3) break;
        }
    }
    return cellules.sort(() => Math.random() - 0.5).slice(0, config.nbGivre);
}

function calculerDesert(config) {
    const cellules = [];
    for (let c = 0; c < CONFIG.colonnes; c++) {
        let occupeeAuDessus = false;
        for (let l = 0; l < CONFIG.lignes; l++) {
            if (etat.plateau[l][c] !== 0) occupeeAuDessus = true;
            else if (occupeeAuDessus) cellules.push({ x: c, y: l });
        }
    }
    cellules.sort((a, b) => b.y - a.y);
    return cellules.slice(0, config.nbGrains);
}

function calculerCyber(config) {
    const cellules = [];
    for (let l = 0; l < Math.floor(CONFIG.lignes / 2); l++) {
        for (let c = 0; c < CONFIG.colonnes; c++) {
            if (etat.plateau[l][c] !== 0) cellules.push({ x: c, y: l });
        }
    }
    return cellules.sort(() => Math.random() - 0.5).slice(0, config.nbBlocs);
}

function calculerFuochi(config) {
    const lExplosion = Math.floor(CONFIG.lignes * 0.6 + Math.random() * CONFIG.lignes * 0.3);
    const cExplosion = Math.floor(Math.random() * CONFIG.colonnes);
    const r = config.rayon;
    const cellules = [];
    for (let dl = -r; dl <= r; dl++) {
        for (let dc = -r; dc <= r; dc++) {
            const ny = lExplosion + dl;
            const nx = cExplosion + dc;
            if (
                ny >= 0 &&
                ny < CONFIG.lignes &&
                nx >= 0 &&
                nx < CONFIG.colonnes &&
                etat.plateau[ny][nx] !== 0
            ) {
                cellules.push({ x: nx, y: ny });
            }
        }
    }
    return cellules;
}

function calculerCosmos() {
    const cellules = [];
    for (let l = 1; l < CONFIG.lignes; l++) {
        for (let c = 0; c < CONFIG.colonnes; c++) {
            if (etat.plateau[l][c] === 0) continue;
            if (etat.plateau[l - 1][c] === 0) cellules.push({ x: c, y: l });
        }
    }
    return cellules;
}

/** @type {Record<string, (config: object) => Array<{x: number, y: number}>>} */
export const REGISTRE_CALCUL_VIVANT = {
    lave: calculerLave,
    ocean: calculerOcean,
    foret: calculerForet,
    glace: calculerGlace,
    desert: calculerDesert,
    cyber: calculerCyber,
    fuochi: calculerFuochi,
    cosmos: calculerCosmos,
};
