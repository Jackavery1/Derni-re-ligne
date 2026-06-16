import { initialiserBoutonsNavigation } from './ui-boutons-navigation.js';
import { initialiserBoutonsPartie } from './ui-boutons-partie.js';

export function initialiserBoutons() {
    initialiserBoutonsNavigation();
    initialiserBoutonsPartie();
    void import('./ui-raccourcis-histoire.js').then(({ initialiserRaccourcisHistoire }) =>
        initialiserRaccourcisHistoire()
    );
}
