/** Initialisation audio et thème visuel au démarrage d'une partie (solo ou coop). */
import { AudioMoteur } from './audio.js';
import { appliquerThemeBiome, appliquerTextesBiome } from '../rendu/themes-biome.js';
import { arreterAnimationMenu } from '../menu-fond.js';

/**
 * @param {string} biomeId
 * @param {{ delaiMusique?: number, biomePrecedent?: string | null }} [opts]
 */
export function initialiserAudioBiome(biomeId, opts = {}) {
    appliquerThemeBiome(biomeId);
    appliquerTextesBiome(biomeId);
    AudioMoteur.init();
    if (AudioMoteur.ctx && AudioMoteur.actif) {
        const biomePrecedent = opts.biomePrecedent ?? AudioMoteur.biomeMusique;
        AudioMoteur.arreterMusique(0);
        const delai =
            opts.delaiMusique ?? (biomePrecedent && biomePrecedent !== biomeId ? 350 : 50);
        setTimeout(() => AudioMoteur.demarrerMusique(biomeId), delai);
    }
    arreterAnimationMenu();
}
