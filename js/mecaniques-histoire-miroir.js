import { modeHistoireEnCours } from './etat/mode-histoire.js';
import { biomeActuelEstMiroir } from './mecaniques-histoire-queries.js';

export function appliquerCSSMiroir(actif) {
    const canvas = document.getElementById('canvas-plateau');
    if (!canvas) return;
    if (actif) {
        canvas.classList.add('biome-miroir');
    } else {
        canvas.classList.remove('biome-miroir');
    }
}

export function actionMiroir(actionDemandee) {
    if (!modeHistoireEnCours()) return actionDemandee;
    if (!biomeActuelEstMiroir()) return actionDemandee;
    if (actionDemandee === 'bas') return 'chute';
    if (actionDemandee === 'chute') return 'bas';
    return actionDemandee;
}
