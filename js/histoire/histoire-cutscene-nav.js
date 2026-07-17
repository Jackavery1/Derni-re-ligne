import { afficherEcranDiffereAsync, cacherEcransDiffere } from '../ui/navigation-actions.js';

export async function afficherEcranHistoire(idEcran) {
    await afficherEcranDiffereAsync(idEcran);
}

export function cacherEcransHistoire() {
    cacherEcransDiffere();
    return Promise.resolve();
}
