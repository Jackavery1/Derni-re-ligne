/** Registre et préchargement des assets image portraits cutscene (fallback canvas si absent). */
import { PORTRAIT_VERA_SRC, prechargerPortraitVera } from './rendu/portrait-vera-assets.js';

/** Chemins shell SW (préfixe `./`) — source unique pour tests et documentation. */
export const URLS_PORTRAITS_PRECACHE = [`./${PORTRAIT_VERA_SRC}`];

export function prechargerPortraitsCutscene() {
    return Promise.all([prechargerPortraitVera()]);
}
