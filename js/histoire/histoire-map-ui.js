export { lierBoutonsCarteHistoire } from './histoire-boutons-carte.js';
export { initialiserModalTrameCarte, fermerModalTrameCarte } from './histoire-map-modal-trame.js';
export {
    mettreAJourAriaCarteHistoire,
    mettreAJourSelectMondesClavier,
    attacherEvenementsCarteHistoire,
    traiterSelectionNoeud,
} from './histoire-map-interactions.js';
export { mettreAJourEnteteHistoire } from './histoire-map-entete.js';

import { annulerPrechargementMedias } from '../io/prechargement-medias.js';
import { fermerModalTrameCarte } from './histoire-map-modal-trame.js';
import { obtenirActionsHistoire } from './histoire-actions.js';

export function lancerMondeDepuisCarte(monde) {
    annulerPrechargementMedias();
    fermerModalTrameCarte();
    const actions = obtenirActionsHistoire();
    if (['monde_miroir', 'monde_trame', 'monde_paradoxe'].includes(monde.id)) {
        actions.demarrerMondeCache?.(monde.id);
    } else {
        actions.demarrerMonde?.(monde.id);
    }
}
