import { CONFIG } from '../config/config-jeu.js';
import { etat } from '../etat/store-jeu.js';
import { injectionVivant } from './vivant-strategies-injection.js';

function declencherLave(cellulesAlerte) {
    const deps = injectionVivant.deps;
    cellulesAlerte.forEach(({ x, y }) => {
        if (etat.plateau[y][x] === 0) return;
        for (let i = 0; i < 6; i++) {
            deps.pousserParticule({
                x: x * CONFIG.taille + Math.random() * CONFIG.taille,
                y: y * CONFIG.taille + Math.random() * CONFIG.taille,
                vx: (Math.random() - 0.5) * 4,
                vy: -Math.random() * 5 - 2,
                taille: Math.random() * 5 + 3,
                opacite: 1,
                couleur: `hsl(${20 + Math.random() * 30},100%,${50 + Math.random() * 20}%)`,
                rotation: Math.random() * Math.PI * 2,
                vRot: (Math.random() - 0.5) * 0.3,
            });
        }
        deps.supprimerCellule(x, y);
    });
}

function declencherOcean() {
    const deps = injectionVivant.deps;
    const dir = deps.vivant.directionCourant;
    const colonnes =
        dir > 0
            ? Array.from({ length: CONFIG.colonnes }, (_, i) => CONFIG.colonnes - 1 - i)
            : Array.from({ length: CONFIG.colonnes }, (_, i) => i);

    for (let l = 0; l < CONFIG.lignes; l++) {
        for (const c of colonnes) {
            if (etat.plateau[l][c] === 0) continue;
            const nc = c + dir;
            if (nc < 0 || nc >= CONFIG.colonnes) {
                deps.supprimerCellule(c, l);
            } else if (etat.plateau[l][nc] === 0) {
                etat.plateau[l][nc] = etat.plateau[l][c];
                deps.vivant.plateauTemps[l][nc] = deps.vivant.plateauTemps[l][c];
                etat.plateau[l][c] = 0;
                deps.vivant.plateauTemps[l][c] = 0;
            }
        }
    }
    deps.comportements.ocean.directionActuelle *= -1;
    deps.vivant.directionCourant *= -1;
}

function declencherForet() {
    const deps = injectionVivant.deps;
    const maintenant = Date.now();
    const config = deps.comportements.foret;
    const dirs = [
        [-1, 0],
        [1, 0],
        [0, -1],
        [0, 1],
    ];
    let nbPousses = 0;

    for (let l = 0; l < CONFIG.lignes && nbPousses < config.nbPousses; l++) {
        for (let c = 0; c < CONFIG.colonnes; c++) {
            if (etat.plateau[l][c] === 0) continue;
            const age = maintenant - deps.vivant.plateauTemps[l][c];
            if (age < config.seuilAge) continue;

            const libres = dirs
                .map(([dl, dc]) => ({ y: l + dl, x: c + dc }))
                .filter(
                    ({ y, x }) =>
                        y >= 0 &&
                        y < CONFIG.lignes &&
                        x >= 0 &&
                        x < CONFIG.colonnes &&
                        etat.plateau[y][x] === 0
                );

            if (libres.length === 0) continue;

            const cible = libres[Math.floor(Math.random() * libres.length)];
            const couleurParente = etat.plateau[l][c];
            deps.poserCellule(cible.x, cible.y, /** @type {string} */ (String(couleurParente)));
            deps.pousserParticule({
                x: cible.x * CONFIG.taille + CONFIG.taille / 2,
                y: cible.y * CONFIG.taille + CONFIG.taille / 2,
                vx: (Math.random() - 0.5) * 3,
                vy: -Math.random() * 3,
                taille: 3,
                opacite: 0.9,
                couleur: '#00ff88',
                rotation: 0,
                vRot: 0.2,
            });
            nbPousses++;
            if (nbPousses >= config.nbPousses) break;
        }
    }
}

function declencherGlace(cellulesAlerte) {
    const deps = injectionVivant.deps;
    const couleurGivre = '#aaeeff';
    cellulesAlerte.forEach(({ x, y }) => {
        if (etat.plateau[y][x] !== 0) return;
        deps.poserCellule(x, y, couleurGivre);
        deps.pousserParticule({
            x: x * CONFIG.taille + CONFIG.taille / 2,
            y: y * CONFIG.taille + CONFIG.taille / 2,
            vx: (Math.random() - 0.5) * 2,
            vy: (Math.random() - 0.5) * 2,
            taille: 2,
            opacite: 0.8,
            couleur: '#ffffff',
            rotation: Math.random() * Math.PI * 2,
            vRot: 0.1,
        });
    });
}

function declencherDesert(cellulesAlerte) {
    const deps = injectionVivant.deps;
    const couleurSable = '#c8a060';
    cellulesAlerte.forEach(({ x, y }) => {
        if (etat.plateau[y][x] !== 0) return;
        deps.poserCellule(x, y, couleurSable);
        for (let i = 0; i < 4; i++) {
            deps.pousserParticule({
                x: x * CONFIG.taille + Math.random() * CONFIG.taille,
                y: (y - 1) * CONFIG.taille,
                vx: (Math.random() - 0.5) * 2,
                vy: Math.random() * 3 + 1,
                taille: 1.5,
                opacite: 0.8,
                couleur: '#ffbb44',
                rotation: 0,
                vRot: 0,
            });
        }
    });
}

function declencherCyber(cellulesAlerte) {
    const deps = injectionVivant.deps;
    cellulesAlerte.forEach(({ x, y }) => {
        if (etat.plateau[y][x] === 0) return;
        for (let i = 0; i < 5; i++) {
            deps.pousserParticule({
                x: x * CONFIG.taille + Math.random() * CONFIG.taille,
                y: y * CONFIG.taille + Math.random() * CONFIG.taille,
                vx: (Math.random() - 0.5) * 8,
                vy: (Math.random() - 0.5) * 6,
                taille: Math.random() * 3 + 1,
                opacite: 1,
                couleur: Math.random() > 0.5 ? '#ff00ff' : '#00ffff',
                rotation: Math.random() * Math.PI * 2,
                vRot: (Math.random() - 0.5) * 0.5,
            });
        }
        deps.supprimerCellule(x, y);
    });
}

function declencherFuochi(cellulesAlerte) {
    const deps = injectionVivant.deps;
    const couleurs = ['#ff2244', '#ffe600', '#00aaff', '#ff8800', '#00ff88'];
    cellulesAlerte.forEach(({ x, y }) => {
        if (etat.plateau[y][x] === 0) return;
        const coul = couleurs[Math.floor(Math.random() * couleurs.length)];
        for (let i = 0; i < 8; i++) {
            deps.pousserParticule({
                x: x * CONFIG.taille + CONFIG.taille / 2,
                y: y * CONFIG.taille + CONFIG.taille / 2,
                vx: (Math.random() - 0.5) * 12,
                vy: (Math.random() - 2.5) * 6,
                taille: Math.random() * 5 + 2,
                opacite: 1,
                couleur: coul,
                rotation: Math.random() * Math.PI * 2,
                vRot: (Math.random() - 0.5) * 0.4,
            });
        }
        deps.supprimerCellule(x, y);
    });
}

function declencherCosmos() {
    const deps = injectionVivant.deps;
    for (let l = 1; l < CONFIG.lignes; l++) {
        for (let c = 0; c < CONFIG.colonnes; c++) {
            if (etat.plateau[l][c] === 0) continue;
            if (etat.plateau[l - 1][c] !== 0) continue;
            etat.plateau[l - 1][c] = etat.plateau[l][c];
            deps.vivant.plateauTemps[l - 1][c] = deps.vivant.plateauTemps[l][c];
            etat.plateau[l][c] = 0;
            deps.vivant.plateauTemps[l][c] = 0;
            deps.pousserParticule({
                x: c * CONFIG.taille + CONFIG.taille / 2,
                y: l * CONFIG.taille,
                vx: (Math.random() - 0.5) * 2,
                vy: -Math.random() * 3 - 1,
                taille: 2,
                opacite: 0.9,
                couleur: '#aa44ff',
                rotation: 0,
                vRot: 0.15,
            });
        }
    }
}

/** @type {Record<string, (cellulesAlerte: Array<{x: number, y: number}>) => void>} */
export const REGISTRE_DECLENCHEMENT_VIVANT = {
    lave: declencherLave,
    ocean: declencherOcean,
    foret: declencherForet,
    glace: declencherGlace,
    desert: declencherDesert,
    cyber: declencherCyber,
    fuochi: declencherFuochi,
    cosmos: declencherCosmos,
};
