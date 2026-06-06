import { initialiserBoutonsNavigation } from './ui-boutons-navigation.js';
import { initialiserBoutonsPartie } from './ui-boutons-partie.js';
import { initialiserBoutonsHistoire } from './ui-boutons-histoire.js';

export function initialiserBoutons() {
    initialiserBoutonsNavigation();
    initialiserBoutonsPartie();
    initialiserBoutonsHistoire();
}
