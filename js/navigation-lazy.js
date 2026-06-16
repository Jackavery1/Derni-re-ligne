/** Accès différé à navigation-ecrans pour éviter les cycles d'import. */
let _navigation = null;

async function obtenirNavigation() {
    if (!_navigation) {
        _navigation = import('./navigation-ecrans.js');
    }
    return _navigation;
}

export function cacherEcransDiffere() {
    void obtenirNavigation().then(({ cacherEcrans }) => cacherEcrans());
}

export function afficherEcranDiffere(idEcran) {
    void obtenirNavigation().then(({ afficherEcranAsync }) => afficherEcranAsync(idEcran));
}

export function afficherEcranDiffereAsync(idEcran) {
    return obtenirNavigation().then(({ afficherEcranAsync }) => afficherEcranAsync(idEcran));
}
