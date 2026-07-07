let promesseBoutons = null;

/** @returns {Promise<void>} */
export function attendreBoutonsPretes() {
    return promesseBoutons ?? Promise.resolve();
}

export function initialiserBoutons() {
    if (promesseBoutons) return promesseBoutons;
    promesseBoutons = import('./ui-boutons-assurer.js')
        .then(({ assurerBoutonsApresFragments, enregistrerEcouteurFragments }) => {
            enregistrerEcouteurFragments();
            return assurerBoutonsApresFragments();
        })
        .then(() => {
            void import('./ui-raccourcis-histoire.js').then(({ initialiserRaccourcisHistoire }) =>
                initialiserRaccourcisHistoire()
            );
        });
    return promesseBoutons;
}
