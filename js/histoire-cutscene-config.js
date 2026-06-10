/** Constantes cutscene histoire. */
export const POSITION_PERSONNAGE = {
    robo: 'gauche',
    vera: 'droite',
    distorsion: 'droite',
    narrateur: 'centre',
    systeme: 'droite',
    brasier: 'droite',
    brasier_voix: 'droite',
    sentinelle: 'droite',
    sentinelle_voix: 'droite',
    archiviste: 'droite',
    archiviste_voix: 'droite',
    avantgarde: 'droite',
    avantgarde_voix: 'droite',
};

export const COULEUR_PERSONNAGE = {
    robo: '#00ddc8',
    vera: '#ff99ff',
    distorsion: '#9944ff',
    narrateur: 'rgba(255,255,255,0.5)',
    systeme: '#44ff88',
    brasier: '#ff6600',
    brasier_voix: '#ff6600',
    sentinelle: '#aaddff',
    sentinelle_voix: '#aaddff',
    archiviste: '#cc88ff',
    archiviste_voix: '#cc88ff',
    avantgarde: '#ff88ff',
    avantgarde_voix: '#ff88ff',
};

export const CONFIG_FOND_CUTSCENE = {
    robo: { type: 'scanlines', couleur: '#00ddc8' },
    vera: { type: 'orbites', couleur: '#ff99ff' },
    distorsion: { type: 'vortex', couleur: '#9944ff' },
    systeme: { type: 'terminal', couleur: '#44ff88' },
    brasier: { type: 'flammes', couleur: '#ff6600' },
    brasier_voix: { type: 'flammes', couleur: '#ff6600' },
    sentinelle: { type: 'neige', couleur: '#aaddff' },
    sentinelle_voix: { type: 'neige', couleur: '#aaddff' },
    archiviste: { type: 'pluie_data', couleur: '#cc88ff' },
    archiviste_voix: { type: 'pluie_data', couleur: '#cc88ff' },
    avantgarde: { type: 'energie', couleur: '#ff88ff' },
    avantgarde_voix: { type: 'energie', couleur: '#ff88ff' },
    narrateur: { type: 'etoiles', couleur: 'rgba(255,255,255,0.3)' },
};

const ALIAS_PORTRAIT_META = {
    archiviste_voix: 'archiviste',
    avantgarde_voix: 'avantgarde',
};

const ALIAS_PORTRAIT_RENDU = {
    archiviste_voix: 'archiviste',
    avantgarde_voix: 'avantgarde',
};

export function idPortraitMeta(personnageId) {
    return ALIAS_PORTRAIT_META[personnageId] ?? personnageId;
}

export function idPortraitRendu(personnageId) {
    return ALIAS_PORTRAIT_RENDU[personnageId] ?? personnageId;
}
