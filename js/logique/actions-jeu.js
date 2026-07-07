const actions = {
    planifierBoucle: null,
    terminerPartie: null,
    demarrerJeu: null,
    basculerPause: null,
    confirmerRecommencer: null,
    quitterVersMenu: null,
    deplacerGauche: null,
    deplacerDroite: null,
    deplacerBas: null,
    chuteRapide: null,
    tourner: null,
    utiliserReserve: null,
};

/** @param {Partial<typeof actions>} deps */
export function configurerActionsJeu(deps) {
    Object.assign(actions, deps);
}

export function obtenirActions() {
    return actions;
}
