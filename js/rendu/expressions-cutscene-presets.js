export const PRESETS_VERA = {
    neutre: {
        fragmentVitesse: 0.6,
        fragmentRayon: 1,
        lueurRose: 1,
        inclinaison: 0,
        sourcils: false,
        scanline: 1,
        glitchAleatoire: true,
        glitchBandes: false,
    },
    douce: {
        fragmentVitesse: 0.35,
        fragmentRayon: 0.9,
        lueurRose: 1.2,
        inclinaison: 0.06,
        sourcils: false,
        scanline: 0.7,
        glitchAleatoire: false,
        glitchBandes: false,
    },
    inquiete: {
        fragmentVitesse: 1.1,
        fragmentRayon: 0.75,
        lueurRose: 1,
        inclinaison: 0,
        sourcils: true,
        scanline: 1.4,
        glitchAleatoire: false,
        glitchBandes: false,
    },
    determinee: {
        fragmentVitesse: 0.5,
        fragmentRayon: 1.05,
        lueurRose: 1.1,
        inclinaison: -0.04,
        sourcils: false,
        scanline: 0.85,
        glitchAleatoire: false,
        glitchBandes: false,
        visiereLumineuse: true,
    },
    glitch: {
        fragmentVitesse: 0.8,
        fragmentRayon: 1.3,
        lueurRose: 1,
        inclinaison: 0,
        sourcils: false,
        scanline: 1.6,
        glitchAleatoire: false,
        glitchBandes: true,
    },
};

export const PRESETS_DISTORSION = {
    menacante: {
        vortexVitesse: 1.3,
        aberrationChrom: 1,
        yeuxRouge: true,
        yeuxViolet: false,
        vortexIrregulier: 0,
    },
    souffrante: {
        vortexVitesse: 0.45,
        aberrationChrom: 0.4,
        yeuxRouge: true,
        yeuxViolet: false,
        vortexIrregulier: 0.7,
        paupiere: true,
    },
    curieuse: {
        vortexVitesse: 0.15,
        aberrationChrom: 0.2,
        yeuxRouge: true,
        yeuxViolet: false,
        vortexIrregulier: 0,
        unOeil: true,
    },
    apaisee: {
        vortexVitesse: 0.25,
        aberrationChrom: 0,
        yeuxRouge: false,
        yeuxViolet: true,
        vortexIrregulier: 0,
        fragmentsStables: true,
    },
};

export const PRESETS_BOSS = {
    calme: { vitesseAnim: 0.7, glow: 0.75, echelle: 1, vacillant: false },
    agressif: { vitesseAnim: 1.35, glow: 1.35, echelle: 1.05, vacillant: false },
    vacillant: { vitesseAnim: 1.1, glow: 0.9, echelle: 1, vacillant: true },
};

export const PRESETS_SYSTEME = {
    neutre: { alerte: false, clignotement: 1 },
    alerte: { alerte: true, clignotement: 2.8 },
};

export const PRESETS_FALLBACK = {
    veraNeutre: PRESETS_VERA.neutre,
    distorsionMenacante: PRESETS_DISTORSION.menacante,
    bossCalme: PRESETS_BOSS.calme,
    systemeNeutre: PRESETS_SYSTEME.neutre,
};
