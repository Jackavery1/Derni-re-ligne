import { assurerFragmentsArchi, assurerFragmentsCoop } from '../ui/charger-ecrans.js';

/** Initialisation différée des inputs coop / architecte (évite le chargement eager au boot). */
let coopInputPret = false;
let archiInputPret = false;

export async function assurerInputCoop() {
    await assurerFragmentsCoop();
    if (coopInputPret) return;
    const { initialiserInputCoop } = await import('./coop-input.js');
    initialiserInputCoop();
    coopInputPret = true;
}

export async function assurerInputArchi() {
    await assurerFragmentsArchi();
    if (archiInputPret) return;
    const { initialiserInputArchi } = await import('./archi-input.js');
    initialiserInputArchi();
    archiInputPret = true;
}
