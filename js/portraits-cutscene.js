import { logger } from './logger.js';
import { dessinerPortraitCutsceneInterne } from './portraits-cutscene-personnages.js';

export { definirHumeurRoboCutscene, obtenirHumeurRoboCutscene } from './portraits-cutscene-etat.js';

export function dessinerPortraitCutscene(ctx, w, h, personnageId, t) {
    try {
        dessinerPortraitCutsceneInterne(ctx, w, h, personnageId, t);
    } catch (err) {
        logger.warn('[portraits-cutscene] erreur rendu :', err);
        ctx.clearRect(0, 0, w, h);
    }
}
