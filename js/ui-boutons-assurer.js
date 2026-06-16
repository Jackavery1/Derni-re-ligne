/** Re-attache les handlers apres injection lazy-load de fragments HTML. */
export async function assurerBoutonsApresFragments() {
    const [nav, partie, histoire] = await Promise.all([
        import('./ui-boutons-navigation.js'),
        import('./ui-boutons-partie.js'),
        import('./histoire-map-ui.js'),
    ]);
    nav.initialiserBoutonsNavigation();
    partie.initialiserBoutonsPartie();
    histoire.lierBoutonsCarteHistoire();
}

let ecouteurFragmentsOk = false;

export function enregistrerEcouteurFragments() {
    if (ecouteurFragmentsOk || typeof document === 'undefined') return;
    ecouteurFragmentsOk = true;
    document.addEventListener('neo:fragments-injectes', () => {
        void assurerBoutonsApresFragments();
    });
}
