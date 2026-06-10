/** Navigation lazy (evite cycle import). */

/** @type {typeof import('./navigation-ecrans.js') | null} */
let _navigationModule = null;
const _navigationPromise = import('./navigation-ecrans.js').then((m) => {
    _navigationModule = m;
    return m;
});

export function afficherEcranHistoire(idEcran) {
    if (_navigationModule) {
        _navigationModule.afficherEcran(idEcran);
        return;
    }
    void _navigationPromise.then(({ afficherEcran }) => afficherEcran(idEcran));
}

export function cacherEcransHistoire() {
    if (_navigationModule) {
        _navigationModule.cacherEcrans();
        return;
    }
    void _navigationPromise.then(({ cacherEcrans }) => cacherEcrans());
}
