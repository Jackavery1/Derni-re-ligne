import {
    coop_deplacerGauche,
    coop_deplacerDroite,
    coop_deplacerBas,
} from './logique/coop-logique.js';

export function obtenirCarteDasCoop() {
    return {
        j1: {
            KeyA: () => coop_deplacerGauche('j1'),
            KeyD: () => coop_deplacerDroite('j1'),
            KeyS: () => coop_deplacerBas('j1'),
        },
        j2: {
            ArrowLeft: () => coop_deplacerGauche('j2'),
            ArrowRight: () => coop_deplacerDroite('j2'),
            ArrowDown: () => coop_deplacerBas('j2'),
        },
    };
}
