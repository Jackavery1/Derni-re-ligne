export function initialiserBoutons() {
    void import('./ui-boutons-assurer.js').then(
        ({ assurerBoutonsApresFragments, enregistrerEcouteurFragments }) => {
            enregistrerEcouteurFragments();
            void assurerBoutonsApresFragments();
        }
    );
    void import('./ui-raccourcis-histoire.js').then(({ initialiserRaccourcisHistoire }) =>
        initialiserRaccourcisHistoire()
    );
}
