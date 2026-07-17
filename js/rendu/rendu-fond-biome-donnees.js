export const CONFIGS_FOND_BIOME = {
    monde_prologue: {
        fond: ['#04030f', '#08071a'],
        motif: 'circuits',
        couleurMotif: 'rgba(0,200,180,0.07)',
        particules: { n: 12, couleur: '#00ddc8', type: 'circuit_spark', ampX: 6, vy: 0.5 },
    },
    monde_lave: {
        fond: ['#130100', '#260400'],
        motif: 'cracks_lave',
        couleurMotif: 'rgba(255,90,0,0.14)',
        particules: { n: 22, couleur: '#ff5500', type: 'braise', ampX: 9, vy: 1.2 },
    },
    monde_rouille: {
        fond: ['#110600', '#1e0a00'],
        motif: 'metal_plaques',
        couleurMotif: 'rgba(155,55,0,0.10)',
        particules: { n: 8, couleur: '#a03800', type: 'eclat', ampX: 4, vy: 0.4 },
    },
    monde_boss_1: {
        fond: ['#100000', '#250200'],
        motif: 'braises_fond',
        couleurMotif: 'rgba(255,40,0,0.16)',
        particules: { n: 32, couleur: '#ff6600', type: 'flamme', ampX: 13, vy: 1.5 },
    },
    monde_ocean: {
        fond: ['#010810', '#020f1e'],
        motif: 'fond_marin',
        couleurMotif: 'rgba(0,70,160,0.09)',
        particules: { n: 20, couleur: '#0066cc', type: 'bulle', ampX: 4, vy: 0.5 },
    },
    monde_foret: {
        fond: ['#020802', '#041404'],
        motif: 'troncs',
        couleurMotif: 'rgba(0,120,10,0.09)',
        particules: { n: 14, couleur: '#33aa33', type: 'feuille', ampX: 22, vy: 0.4 },
    },
    monde_glace: {
        fond: ['#030a10', '#05121c'],
        motif: 'cristaux',
        couleurMotif: 'rgba(140,210,255,0.09)',
        particules: { n: 16, couleur: '#99ccff', type: 'flocon', ampX: 6, vy: 0.4 },
    },
    monde_boss_2: {
        fond: ['#030508', '#050b12'],
        motif: 'blizzard_fond',
        couleurMotif: 'rgba(200,230,255,0.06)',
        particules: { n: 45, couleur: '#bbddff', type: 'neige', ampX: 0, vy: 1.8 },
    },
    monde_desert: {
        fond: ['#100900', '#1c1100'],
        motif: 'dunes',
        couleurMotif: 'rgba(190,140,40,0.09)',
        particules: { n: 28, couleur: '#bb9933', type: 'grain', ampX: 2, vy: 0.0 },
    },
    monde_eclipse: {
        fond: ['#060008', '#0b0014'],
        motif: 'eclipse',
        couleurMotif: 'rgba(110,0,200,0.10)',
        particules: { n: 14, couleur: '#9933ff', type: 'rayon', ampX: 0, vy: 0.0 },
    },
    monde_cyber: {
        fond: ['#010610', '#020c1c'],
        motif: 'circuit_board',
        couleurMotif: 'rgba(0,170,190,0.09)',
        particules: { n: 20, couleur: '#00bbdd', type: 'pluie_data', ampX: 0, vy: 1.0 },
    },
    monde_boss_3: {
        fond: ['#040010', '#080020'],
        motif: 'archives',
        couleurMotif: 'rgba(150,60,255,0.10)',
        particules: { n: 18, couleur: '#bb88ff', type: 'pluie_data', ampX: 0, vy: 0.7 },
    },
    monde_fuochi: {
        fond: ['#100100', '#200300'],
        motif: 'roche_volcanique',
        couleurMotif: 'rgba(255,80,0,0.12)',
        particules: { n: 26, couleur: '#ff4400', type: 'flamme', ampX: 11, vy: 1.3 },
    },
    monde_cosmos: {
        fond: ['#010008', '#030014'],
        motif: 'nebuleuse',
        couleurMotif: 'rgba(60,0,150,0.07)',
        particules: { n: 7, couleur: '#ffddaa', type: 'etoile_filante', ampX: 0, vy: 0.0 },
    },
    monde_vide: {
        fond: ['#000000', '#050408'],
        motif: 'grille_distordue',
        couleurMotif: 'rgba(140,110,150,0.05)',
        particules: { n: 10, couleur: 'rgba(200,170,190,0.55)', type: 'grain', ampX: 3, vy: 0.0 },
    },
    monde_boss_4: {
        fond: ['#040010', '#07001c'],
        motif: 'fractales',
        couleurMotif: 'rgba(255,80,255,0.08)',
        particules: { n: 24, couleur: null, type: 'energie', ampX: 0, vy: 0.0 },
    },
    monde_finale: {
        fond: ['#06061a', '#0a0a20'],
        motif: 'distorsion',
        couleurMotif: 'rgba(255,0,100,0.07)',
        particules: { n: 20, couleur: '#ff0080', type: 'glitch', ampX: 0, vy: 0.0 },
    },
};

const ALIAS_FOND_BIOME = {
    classique: 'monde_prologue',
    prologue: 'monde_prologue',
    lave: 'monde_lave',
    ocean: 'monde_ocean',
    foret: 'monde_foret',
    glace: 'monde_glace',
    desert: 'monde_desert',
    eclipse: 'monde_eclipse',
    cyber: 'monde_cyber',
    fuochi: 'monde_fuochi',
    cosmos: 'monde_cosmos',
    vide: 'monde_vide',
    rouille: 'monde_rouille',
};

/** @param {string} biomeId */
export function resoudreConfigFondBiome(biomeId) {
    const cle = ALIAS_FOND_BIOME[biomeId] ?? biomeId;
    return CONFIGS_FOND_BIOME[cle] ? cle : null;
}

/** @param {string} cle */
export function obtenirConfigFondBiome(cle) {
    return CONFIGS_FOND_BIOME[cle] ?? null;
}
