/** Injection partagée entre calcul et déclenchement vivant. */
export const injectionVivant = {
    /** @type {{ supprimerCellule: (x: number, y: number) => void, poserCellule: (x: number, y: number, couleur: string) => void, pousserParticule: (config: object) => void, vivant: object, comportements: object }} */
    deps: {
        supprimerCellule: () => {},
        poserCellule: () => {},
        pousserParticule: () => {},
        vivant: { plateauTemps: [], directionCourant: 1 },
        comportements: {},
    },
};

/** @param {Partial<typeof injectionVivant.deps>} nouveauxDeps */
export function fusionnerInjectionVivant(nouveauxDeps) {
    injectionVivant.deps = { ...injectionVivant.deps, ...nouveauxDeps };
}
