import { store } from './store-core.js';
import { chargerEtatHistoire } from './progression.js';

export function paradoxeEstDebloque() {
    const e = store.histoire.etat ?? chargerEtatHistoire();
    return (
        e.conditionsParadoxe.finSecreteObtenue &&
        (e.conditionsParadoxe.topsVolontairesPrologue ?? 0) >= 3
    );
}
