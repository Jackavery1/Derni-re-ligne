/** Lecture fichier assets/musique/{biomeId}.{ogg,m4a} avec fallback procédural. */

/** @type {Map<string, AudioBuffer | null>} */
const cacheBuffers = new Map();

/** @type {Map<string, Promise<AudioBuffer | null>>} */
const chargementsEnCours = new Map();

/**
 * @param {string} biomeId
 * @returns {string[]}
 */
export function urlsMusiqueFichier(biomeId) {
    const base = `assets/musique/${biomeId}`;
    return [`${base}.ogg`, `${base}.m4a`];
}

/**
 * @param {string} biomeId
 * @param {AudioContext} ctx
 * @returns {Promise<AudioBuffer | null>}
 */
export async function chargerBufferMusique(biomeId, ctx) {
    if (cacheBuffers.has(biomeId)) return cacheBuffers.get(biomeId) ?? null;
    if (chargementsEnCours.has(biomeId)) return chargementsEnCours.get(biomeId);

    const promesse = (async () => {
        for (const url of urlsMusiqueFichier(biomeId)) {
            try {
                const reponse = await fetch(url);
                if (!reponse.ok) continue;
                const brut = await reponse.arrayBuffer();
                const buffer = await ctx.decodeAudioData(brut);
                cacheBuffers.set(biomeId, buffer);
                return buffer;
            } catch {
                /* essayer le format suivant */
            }
        }
        cacheBuffers.set(biomeId, null);
        return null;
    })();

    chargementsEnCours.set(biomeId, promesse);
    try {
        return await promesse;
    } finally {
        chargementsEnCours.delete(biomeId);
    }
}

export function viderCacheBuffersMusique() {
    cacheBuffers.clear();
    chargementsEnCours.clear();
}

export function creerMethodesMusiqueFichier() {
    return {
        /** @type {AudioBufferSourceNode | null} */
        sourceFichierMusique: null,

        arreterLectureFichier() {
            if (!this.sourceFichierMusique) return;
            try {
                this.sourceFichierMusique.stop();
            } catch {
                /* déjà arrêté */
            }
            this.sourceFichierMusique = null;
        },

        /**
         * @param {AudioBuffer} buffer
         */
        demarrerLectureFichier(buffer) {
            if (!this.ctx || !this.gainMusique || this.muet) return;
            this.arreterLectureFichier();
            const source = this.ctx.createBufferSource();
            source.buffer = buffer;
            source.loop = true;
            source.connect(this.gainMusique);
            source.start(0);
            this.sourceFichierMusique = source;
        },

        /**
         * @param {string} biomeId
         * @returns {Promise<boolean>}
         */
        async tenterMusiqueFichier(biomeId) {
            if (!this.ctx) return false;
            const buffer = await chargerBufferMusique(biomeId, this.ctx);
            if (!buffer || this.biomeMusique !== biomeId || !this.musiqueActive) return false;
            clearInterval(this.intervalMusique);
            this.intervalMusique = null;
            this.demarrerLectureFichier(buffer);
            return true;
        },
    };
}
