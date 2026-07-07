import { fusionnerInjectionVivant } from './vivant-strategies-injection.js';
import { REGISTRE_CALCUL_VIVANT } from './vivant-strategies-calcul.js';
import { REGISTRE_DECLENCHEMENT_VIVANT } from './vivant-strategies-declenchement.js';

export function configurerStrategiesVivant(nouveauxDeps) {
    fusionnerInjectionVivant(nouveauxDeps);
}

export { REGISTRE_CALCUL_VIVANT, REGISTRE_DECLENCHEMENT_VIVANT };
