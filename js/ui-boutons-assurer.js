/** Re-attache les handlers apres injection lazy-load de fragments HTML. */
import { lierBoutonsCarteHistoire } from './histoire-boutons-carte.js';

export async function assurerBoutonsApresFragments() {
    const [nav, partie] = await Promise.all([
        import('./ui-boutons-navigation.js'),
        import('./ui-boutons-partie.js'),
    ]);
    nav.initialiserBoutonsNavigation();
    partie.initialiserBoutonsPartie();
    lierBoutonsCarteHistoire();
}

let ecouteurFragmentsOk = false;

export function enregistrerEcouteurFragments() {
    if (ecouteurFragmentsOk || typeof document === 'undefined') return;
    ecouteurFragmentsOk = true;
    document.addEventListener('neo:fragments-injectes', () => {
        void assurerBoutonsApresFragments();
    });
}
