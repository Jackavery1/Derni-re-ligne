import { logger } from '../logger.js';
import { dessinerPortraitCutsceneInterne } from './portraits-cutscene-personnages.js';

export {
    definirHumeurRoboCutscene,
    obtenirHumeurRoboCutscene,
    definirHumeurVeraCutscene,
    obtenirHumeurVeraCutscene,
    definirHumeurBossCutscene,
    obtenirHumeurBossCutscene,
    obtenirHumeurPortraitCutsceneEtat,
} from './portraits-cutscene-etat.js';

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} w
 * @param {number} h
 * @param {string} personnageId
 * @param {number} t
 * @param {{ humeur?: string, params?: Record<string, number | boolean | number[]> | null }} [options]
 */
export function dessinerPortraitCutscene(ctx, w, h, personnageId, t, options = {}) {
    try {
        dessinerPortraitCutsceneInterne(ctx, w, h, personnageId, t, options);
    } catch (err) {
        logger.warn('[portraits-cutscene] erreur rendu :', err);
        ctx.clearRect(0, 0, w, h);
    }
}
