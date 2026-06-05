import { CONFIG } from './config.js';
import { particules, MAX_PARTICULES, obtenirBiomeActif, etat, VERTS_FORET } from './store-jeu.js';

export function pousserParticuleJeu(config) {
    if (particules.length >= MAX_PARTICULES) return;
    particules.push(config);
}

export function creerParticuleJeuStandard(c, numeroLigne, couleur, tailleMax) {
    pousserParticuleJeu({
        type: 'defaut',
        x: c * CONFIG.taille + Math.random() * CONFIG.taille,
        y: numeroLigne * CONFIG.taille + Math.random() * CONFIG.taille,
        vx: (Math.random() - 0.5) * 16,
        vy: -Math.random() * 12,
        taille: Math.random() * tailleMax + 2,
        opacite: 1,
        couleur,
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.25,
        trainee: obtenirBiomeActif() === 'ocean',
    });
}

export function creerParticulesExplosion(colonneCell, ligneCell, couleur) {
    for (let i = 0; i < 8; i++) {
        pousserParticuleJeu({
            type: 'defaut',
            x: colonneCell * CONFIG.taille + CONFIG.taille / 2,
            y: ligneCell * CONFIG.taille + CONFIG.taille / 2,
            vx: (Math.random() - 0.5) * 10,
            vy: (Math.random() - 0.5) * 10,
            taille: Math.random() * 5 + 3,
            opacite: 1,
            couleur,
            rotation: Math.random() * Math.PI * 2,
            vRot: (Math.random() - 0.5) * 0.4,
        });
    }
}

export function creerParticulesLigne(numeroLigne) {
    const nbBase = obtenirBiomeActif() === 'fuochi' ? 14 : 7;
    const tailleMax = obtenirBiomeActif() === 'fuochi' ? 10 : 3;

    for (let c = 0; c < CONFIG.colonnes; c++) {
        if (particules.length >= MAX_PARTICULES) return;
        let couleur = etat.plateau[numeroLigne][c] || '#ffffff';
        if (obtenirBiomeActif() === 'foret' && Math.random() < 0.35) {
            couleur = VERTS_FORET[Math.floor(Math.random() * VERTS_FORET.length)];
        }

        for (let i = 0; i < nbBase; i++) {
            if (particules.length >= MAX_PARTICULES) return;
            creerParticuleJeuStandard(c, numeroLigne, couleur, tailleMax);
        }

        if (obtenirBiomeActif() === 'lave') {
            for (let e = 0; e < 3; e++) {
                if (particules.length >= MAX_PARTICULES) return;
                pousserParticuleJeu({
                    type: 'etincelle',
                    x: c * CONFIG.taille + Math.random() * CONFIG.taille,
                    y: numeroLigne * CONFIG.taille + Math.random() * CONFIG.taille,
                    vx: (Math.random() - 0.5) * 10,
                    vy: -Math.random() * 14 - 4,
                    hauteur: 6,
                    opacite: 1,
                    couleur: '#ff8800',
                    rotation: Math.random() * Math.PI * 2,
                    vRot: 0,
                });
            }
        }

        if (obtenirBiomeActif() === 'cosmos') {
            for (let e = 0; e < 2; e++) {
                if (particules.length >= MAX_PARTICULES) return;
                const angle = Math.random() * Math.PI * 2;
                const vitesse = 8 + Math.random() * 18;
                pousserParticuleJeu({
                    type: 'eclair',
                    x: c * CONFIG.taille + CONFIG.taille / 2,
                    y: numeroLigne * CONFIG.taille + CONFIG.taille / 2,
                    vx: Math.cos(angle) * vitesse,
                    vy: Math.sin(angle) * vitesse,
                    longueur: 10 + Math.random() * 12,
                    opacite: 1,
                    couleur,
                    rotation: angle,
                    vRot: 0,
                });
            }
        }
    }
}

export function mettreAJourParticules(deltaTemps) {
    const facteur = deltaTemps / 16;
    for (let i = particules.length - 1; i >= 0; i--) {
        const p = particules[i];
        p.x += p.vx * facteur;
        p.y += p.vy * facteur;
        if (p.type !== 'eclair') p.vy += 0.18 * facteur;
        p.rotation += p.vRot * facteur;
        p.opacite -= (p.type === 'eclair' ? 0.04 : 0.022) * facteur;
        if (p.opacite <= 0) particules.splice(i, 1);
    }
}
