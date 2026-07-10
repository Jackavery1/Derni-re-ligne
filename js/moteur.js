import { configurerActionsMoteur } from './logique/moteur-config-actions.js';
import { initialiserSystemesMoteur } from './moteur-init-systemes.js';
import { initialiserInterfaceMoteur } from './moteur-init-interface.js';

configurerActionsMoteur();

/** Initialise le jeu : canvas, audio, constellation, UI et boucle principale. */
export function initialiserApplication() {
    if (!initialiserSystemesMoteur()) return;
    initialiserInterfaceMoteur();
}
