/** Configurations des comportements « vivant » par biome. */
export const COMPORTEMENTS_VIVANT = {
    classique: null,

    lave: {
        nom: 'CONVECTION',
        icone: '🔥',
        description: "Les blocs anciens s'embrasent et disparaissent",
        couleurAlerte: '#ff4500',
        intervalle: 22000,
        delaiMinimum: 30000,
        seuilAge: 15000,
        nbBlocs: 6,
    },

    ocean: {
        nom: 'COURANT MARIN',
        icone: '🌊',
        description: "Un courant deplace tous les blocs d'une case",
        couleurAlerte: '#00cfff',
        intervalle: 18000,
        delaiMinimum: 25000,
        directionActuelle: 1,
    },

    foret: {
        nom: 'CROISSANCE',
        icone: '🌿',
        description: 'Les blocs anciens font pousser de nouvelles cellules',
        couleurAlerte: '#00cc44',
        intervalle: 15500,
        delaiMinimum: 22000,
        seuilAge: 20000,
        nbPousses: 4,
    },

    glace: {
        nom: 'GIVRE',
        icone: '❄️',
        description: 'Le givre remplit partiellement des rangees vides',
        couleurAlerte: '#aaeeff',
        intervalle: 24000,
        delaiMinimum: 32000,
        nbGivre: 5,
    },

    desert: {
        nom: 'ENSABLEMENT',
        icone: '⌛',
        description: 'Le sable comble les trous les plus profonds',
        couleurAlerte: '#ffbb44',
        intervalle: 17000,
        delaiMinimum: 22000,
        nbGrains: 4,
    },

    cyber: {
        nom: 'CORRUPTION',
        icone: '⚠',
        description: 'Le virus efface des blocs aleatoirement',
        couleurAlerte: '#ff00ff',
        intervalle: 18500,
        delaiMinimum: 24000,
        nbBlocs: 3,
    },

    fuochi: {
        nom: 'EXPLOSION SPONTANÉE',
        icone: '💥',
        description: 'Une zone du plateau explose sans prevenir',
        couleurAlerte: '#ffe600',
        intervalle: 28000,
        delaiMinimum: 38000,
        rayon: 2,
    },

    cosmos: {
        nom: 'ANTIGRAVITÉ',
        icone: '🌌',
        description: "Les blocs flottants montent d'une case",
        couleurAlerte: '#7700ff',
        intervalle: 20000,
        delaiMinimum: 28000,
    },
};
