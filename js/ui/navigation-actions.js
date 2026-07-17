const actionsNavigation = {
    cacherEcrans: null,
    afficherEcranAsync: null,
    /** @type {(() => Promise<unknown>) | null} */
    preccharger: null,
};

/** @param {Partial<typeof actionsNavigation>} deps */
export function configurerNavigationActions(deps) {
    Object.assign(actionsNavigation, deps);
}

export function obtenirNavigationActions() {
    return actionsNavigation;
}

async function assurerConfigure() {
    if (actionsNavigation.afficherEcranAsync) return;
    if (!actionsNavigation.preccharger) {
        throw new Error('[navigation-actions] navigation non configuree');
    }
    await actionsNavigation.preccharger();
}

export function cacherEcransDiffere() {
    if (actionsNavigation.cacherEcrans) {
        actionsNavigation.cacherEcrans();
        return;
    }
    if (!actionsNavigation.preccharger) return;
    void actionsNavigation.preccharger().then(() => actionsNavigation.cacherEcrans?.());
}

/** @param {string} idEcran */
export function afficherEcranDiffere(idEcran) {
    if (actionsNavigation.afficherEcranAsync) {
        void actionsNavigation.afficherEcranAsync(idEcran);
        return;
    }
    if (!actionsNavigation.preccharger) return;
    void actionsNavigation
        .preccharger()
        .then(() => actionsNavigation.afficherEcranAsync?.(idEcran));
}

/** @param {string} idEcran */
export function afficherEcranDiffereAsync(idEcran) {
    if (actionsNavigation.afficherEcranAsync) {
        return actionsNavigation.afficherEcranAsync(idEcran);
    }
    return assurerConfigure().then(() => actionsNavigation.afficherEcranAsync(idEcran));
}
