/** Accès différé à navigation-ecrans pour éviter les cycles d'import. */
import {
    afficherEcranDiffere as afficherEcranActions,
    afficherEcranDiffereAsync as afficherEcranActionsAsync,
    cacherEcransDiffere as cacherEcransActions,
    configurerNavigationActions,
    obtenirNavigationActions,
} from './navigation-actions.js';

let _navigation = null;

async function obtenirNavigation() {
    if (!_navigation) {
        _navigation = import('./navigation-ecrans.js').then((m) => {
            configurerNavigationActions({
                cacherEcrans: m.cacherEcrans,
                afficherEcranAsync: m.afficherEcranAsync,
            });
            return m;
        });
    }
    return _navigation;
}

configurerNavigationActions({
    preccharger: () => obtenirNavigation(),
});

/** Précharge navigation-ecrans avant la première interaction (évite course au clic menu). */
export function precchargerNavigation() {
    return obtenirNavigation();
}

export function cacherEcransDiffere() {
    if (obtenirNavigationActions().cacherEcrans) {
        cacherEcransActions();
        return;
    }
    void obtenirNavigation().then(({ cacherEcrans }) => cacherEcrans());
}

export function afficherEcranDiffere(idEcran) {
    if (obtenirNavigationActions().afficherEcranAsync) {
        afficherEcranActions(idEcran);
        return;
    }
    void obtenirNavigation().then(({ afficherEcranAsync }) => afficherEcranAsync(idEcran));
}

export function afficherEcranDiffereAsync(idEcran) {
    if (obtenirNavigationActions().afficherEcranAsync) {
        return afficherEcranActionsAsync(idEcran);
    }
    return obtenirNavigation().then(({ afficherEcranAsync }) => afficherEcranAsync(idEcran));
}
