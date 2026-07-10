import { CONFIG } from '../config/config-jeu.js';
import {
    particules,
    MAX_PARTICULES,
    obtenirBiomeActif,
    etat,
    VERTS_FORET,
} from '../etat/store-jeu.js';

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

function _particulesBiomeColonne(c, numeroLigne) {
    const biome = obtenirBiomeActif();
    if (biome === 'lave' && c % 2 === 0) {
        for (let e = 0; e < 3; e++) {
            if (particules.length >= MAX_PARTICULES) return;
            pousserParticuleJeu({
                type: 'etincelle',
                x: c * CONFIG.taille + Math.random() * CONFIG.taille,
                y: numeroLigne * CONFIG.taille + Math.random() * CONFIG.taille,
                vx: (Math.random() - 0.5) * 3,
                vy: -(Math.random() * 8 + 3),
                hauteur: 6,
                opacite: 1,
                couleur: `hsl(${20 + Math.random() * 30},100%,65%)`,
                rotation: Math.random() * Math.PI * 2,
                vRot: (Math.random() - 0.5) * 0.3,
            });
        }
    }
    if (biome === 'ocean' && c % 3 === 0) {
        if (particules.length >= MAX_PARTICULES) return;
        pousserParticuleJeu({
            type: 'defaut',
            x: c * CONFIG.taille + CONFIG.taille / 2,
            y: numeroLigne * CONFIG.taille,
            vx: (Math.random() - 0.5) * 1.5,
            vy: -(Math.random() * 4 + 2),
            taille: Math.random() * 6 + 3,
            opacite: 0.7,
            couleur: '#00cfff',
            rotation: 0,
            vRot: 0,
            trainee: true,
        });
    }
    if (biome === 'cosmos' && c % 2 === 0) {
        if (particules.length >= MAX_PARTICULES) return;
        pousserParticuleJeu({
            type: 'eclair',
            x: c * CONFIG.taille + CONFIG.taille / 2,
            y: numeroLigne * CONFIG.taille,
            vx: (Math.random() - 0.5) * 15,
            vy: (Math.random() - 0.5) * 12,
            longueur: 10,
            opacite: 1,
            couleur: Math.random() > 0.5 ? '#aa44ff' : '#ffffff',
            rotation: Math.random() * Math.PI * 2,
            vRot: 0,
        });
    }
}

export function creerParticulesLigne(numeroLigne) {
    const biome = obtenirBiomeActif();
    const nbBase = biome === 'fuochi' ? 14 : 7;
    const tailleMax = biome === 'fuochi' ? 10 : 3;

    for (let c = 0; c < CONFIG.colonnes; c++) {
        if (particules.length >= MAX_PARTICULES) return;
        let couleur = etat.plateau[numeroLigne][c] || '#ffffff';
        if (biome === 'foret' && Math.random() < 0.35) {
            couleur = VERTS_FORET[Math.floor(Math.random() * VERTS_FORET.length)];
        }

        for (let i = 0; i < nbBase; i++) {
            if (particules.length >= MAX_PARTICULES) return;
            creerParticuleJeuStandard(c, numeroLigne, couleur, tailleMax);
        }

        _particulesBiomeColonne(c, numeroLigne);
    }

    if (biome === 'fuochi') {
        for (let c = 0; c < CONFIG.colonnes; c++) {
            if (particules.length >= MAX_PARTICULES) return;
            const couleur = etat.plateau[numeroLigne][c] || '#ffe600';
            for (let i = 0; i < 6; i++) {
                if (particules.length >= MAX_PARTICULES) return;
                pousserParticuleJeu({
                    type: 'defaut',
                    x: c * CONFIG.taille + Math.random() * CONFIG.taille,
                    y: numeroLigne * CONFIG.taille + Math.random() * CONFIG.taille,
                    vx: (Math.random() - 0.5) * 9,
                    vy: (Math.random() - 2.8) * 5,
                    taille: Math.random() * 11 + 1,
                    opacite: 1,
                    couleur,
                    rotation: Math.random() * Math.PI * 2,
                    vRot: (Math.random() - 0.5) * 0.5,
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
