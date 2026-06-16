const actionsHistoire = {
    demarrerMonde: null,
    demarrerMondeCache: null,
    arreterCarte: null,
    retourCarte: null,
    retourTitreDepuisCarte: null,
    continuerBossDistorsion: null,
};

/** @param {Partial<typeof actionsHistoire>} deps */
export function configurerActionsHistoire(deps) {
    Object.assign(actionsHistoire, deps);
}

export function obtenirActionsHistoire() {
    return actionsHistoire;
}
