import {
    particulesAmbiance,
    CARACTERES_HEX,
    obtenirBiomeActif,
    obtenirCanvasPlateau,
} from './store-jeu.js';

const MAX_PARTICULES_AMBIANCE = 40;
let idxParticulesAmbiance = 0;
const HEX_CHARS = CARACTERES_HEX;

export function creerParticulAmbiance(props) {
    if (particulesAmbiance.length < MAX_PARTICULES_AMBIANCE) {
        particulesAmbiance.push({
            actif: true,
            age: 0,
            rotation: 0,
            vRot: 0,
            sinPhase: 0,
            scintille: 0,
            char: '',
            ...props,
        });
    } else {
        const p = particulesAmbiance[idxParticulesAmbiance];
        Object.assign(p, {
            actif: true,
            age: 0,
            rotation: 0,
            vRot: 0,
            sinPhase: 0,
            scintille: 0,
            char: '',
            ...props,
        });
        idxParticulesAmbiance = (idxParticulesAmbiance + 1) % MAX_PARTICULES_AMBIANCE;
    }
}

export function initParticulesAmbiance() {
    particulesAmbiance.length = 0;
    idxParticulesAmbiance = 0;

    const canvas = obtenirCanvasPlateau();
    if (!canvas) return;
    const w = canvas.width;
    const h = canvas.height;

    switch (obtenirBiomeActif()) {
        case 'classique':
            break;

        case 'lave':
            for (let i = 0; i < 20; i++) {
                creerParticulAmbiance({
                    type: 'bulle_lave',
                    x: Math.random() * w,
                    y: h * 0.5 + Math.random() * h * 0.5,
                    vx: (Math.random() - 0.5) * 0.4,
                    vy: -(Math.random() * 0.6 + 0.2),
                    taille: Math.random() * 5 + 2,
                    opacite: Math.random() * 0.22 + 0.06,
                    couleur: `hsl(${15 + Math.random() * 20},100%,${45 + Math.random() * 20}%)`,
                    dureeVie: 0,
                });
            }
            break;

        case 'ocean':
            for (let i = 0; i < 25; i++) {
                creerParticulAmbiance({
                    type: 'bulle_eau',
                    x: Math.random() * w,
                    y: Math.random() * h,
                    vx: (Math.random() - 0.5) * 0.2,
                    vy: -(Math.random() * 0.4 + 0.08),
                    taille: Math.random() * 4 + 1.5,
                    opacite: Math.random() * 0.15 + 0.05,
                    couleur: '#00cfff',
                    sinPhase: Math.random() * Math.PI * 2,
                    dureeVie: 0,
                });
            }
            for (let i = 0; i < 3; i++) {
                creerParticulAmbiance({
                    type: 'rayon_eau',
                    x: w * (0.2 + i * 0.3) + (Math.random() - 0.5) * 40,
                    y: 0,
                    vx: 0,
                    vy: 0,
                    opacite: Math.random() * 0.06 + 0.02,
                    couleur: '#00cfff',
                    taille: Math.random() * 15 + 8,
                    dureeVie: 0,
                    sinPhase: Math.random() * Math.PI * 2,
                });
            }
            break;

        case 'foret':
            for (let i = 0; i < 20; i++) {
                creerParticulAmbiance({
                    type: 'feuille',
                    x: Math.random() * w,
                    y: Math.random() * h,
                    vx: (Math.random() - 0.5) * 0.6,
                    vy: Math.random() * 0.5 + 0.15,
                    taille: Math.random() * 6 + 3,
                    opacite: Math.random() * 0.2 + 0.06,
                    couleur: `hsl(${100 + Math.random() * 40},70%,${35 + Math.random() * 20}%)`,
                    rotation: Math.random() * Math.PI * 2,
                    vRot: (Math.random() - 0.5) * 0.04,
                    sinPhase: Math.random() * Math.PI * 2,
                    dureeVie: 0,
                });
            }
            break;

        case 'glace':
            for (let i = 0; i < 30; i++) {
                creerParticulAmbiance({
                    type: 'flocon',
                    x: Math.random() * w,
                    y: Math.random() * h,
                    vx: (Math.random() - 0.5) * 0.3,
                    vy: Math.random() * 0.4 + 0.08,
                    taille: Math.random() * 2.5 + 0.8,
                    opacite: Math.random() * 0.18 + 0.04,
                    couleur: '#ddf4ff',
                    rotation: Math.random() * Math.PI * 2,
                    vRot: (Math.random() - 0.5) * 0.02,
                    sinPhase: Math.random() * Math.PI * 2,
                    dureeVie: 0,
                });
            }
            break;

        case 'desert':
            for (let i = 0; i < 25; i++) {
                creerParticulAmbiance({
                    type: 'grain_sable',
                    x: Math.random() * w,
                    y: Math.random() * h,
                    vx: Math.random() * 1.5 + 0.5,
                    vy: (Math.random() - 0.5) * 0.15,
                    taille: Math.random() * 2 + 0.8,
                    opacite: Math.random() * 0.12 + 0.03,
                    couleur: `hsl(${35 + Math.random() * 15},60%,${55 + Math.random() * 20}%)`,
                    dureeVie: 0,
                });
            }
            break;

        case 'cyber':
            for (let i = 0; i < 18; i++) {
                creerParticulAmbiance({
                    type: 'code_hex',
                    x: Math.random() * w,
                    y: Math.random() * h,
                    vx: 0,
                    vy: Math.random() * 0.8 + 0.3,
                    taille: Math.random() * 3 + 5,
                    opacite: Math.random() * 0.12 + 0.03,
                    couleur: Math.random() > 0.5 ? '#ff00ff' : '#00ffff',
                    char: HEX_CHARS[Math.floor(Math.random() * HEX_CHARS.length)],
                    age: Math.random() * 2000,
                    dureeVie: 2500 + Math.random() * 1500,
                });
            }
            break;

        case 'fuochi':
            for (let i = 0; i < 5; i++) {
                creerParticulAmbiance({
                    type: 'braise',
                    x: Math.random() * w,
                    y: h * 0.5 + Math.random() * h * 0.5,
                    vx: (Math.random() - 0.5) * 0.8,
                    vy: -(Math.random() * 1.5 + 0.5),
                    taille: Math.random() * 3 + 1.5,
                    opacite: Math.random() * 0.4 + 0.2,
                    couleur: `hsl(${Math.random() * 60},100%,${60 + Math.random() * 20}%)`,
                    dureeVie: 0,
                });
            }
            break;

        case 'cosmos':
            for (let i = 0; i < 35; i++) {
                creerParticulAmbiance({
                    type: 'etoile_cosmos',
                    x: Math.random() * w,
                    y: Math.random() * h,
                    vx: 0,
                    vy: 0,
                    taille: Math.random() * 1.8 + 0.4,
                    opacite: Math.random() * 0.35 + 0.05,
                    couleur:
                        Math.random() > 0.8 ? `hsl(${Math.random() * 360},70%,85%)` : '#ffffff',
                    scintille: Math.random() * Math.PI * 2,
                    vRot: Math.random() * 0.02 + 0.005,
                    dureeVie: 0,
                });
            }
            break;
    }
}
