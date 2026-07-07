import { store } from '../etat/store-jeu.js';
import { chargerEtatHistoire } from '../io/progression.js';

export function paradoxeEstDebloque() {
    const e = store.histoire.etat ?? chargerEtatHistoire();
    return (
        e.conditionsParadoxe.finSecreteObtenue &&
        (e.conditionsParadoxe.topsVolontairesPrologue ?? 0) >= 3
    );
}
