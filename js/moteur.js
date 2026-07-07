import { configurerActionsMoteur } from './logique/moteur-config-actions.js';
import { initialiserSystemesMoteur } from './moteur-init-systemes.js';
import { initialiserInterfaceMoteur } from './moteur-init-interface.js';
import { obtenirEcranActuel } from './etat/store-jeu.js';

export { obtenirEcranActuel as ecranActuel };

configurerActionsMoteur();

/** Initialise le jeu : canvas, audio, constellation, UI et boucle principale. */
export function initialiserApplication() {
    if (!initialiserSystemesMoteur()) return;
    initialiserInterfaceMoteur();
}
