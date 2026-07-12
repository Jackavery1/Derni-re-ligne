/** Lecture assets/sfx/boss/{type}.{ogg,wav} avec fallback procédural dans audio-effets.js */

/** @type {readonly string[]} */
export const EFFETS_BOSS_SAMPLES = [
    'boss_braise',
    'boss_gel',
    'boss_controles',
    'boss_fantome',
    'boss_distorsion',
    'boss_permutation',
];

/** @type {Set<string>} */
const TYPES_BOSS = new Set(EFFETS_BOSS_SAMPLES);

/** @type {Map<string, AudioBuffer | null>} */
const cacheBuffers = new Map();

/** @type {Map<string, Promise<AudioBuffer | null>>} */
const chargementsEnCours = new Map();

/** @param {string} type */
export function estEffetBossSample(type) {
    return TYPES_BOSS.has(type);
}

/**
 * @param {string} type
 * @returns {string[]}
 */
export function urlsEffetBoss(type) {
    const base = `assets/sfx/boss/${type}`;
    return [`${base}.ogg`, `${base}.wav`];
}

/**
 * @param {string} type
 * @param {AudioContext} ctx
 * @returns {Promise<AudioBuffer | null>}
 */
export async function chargerBufferEffetBoss(type, ctx) {
    if (!estEffetBossSample(type)) return null;
    if (cacheBuffers.has(type)) return cacheBuffers.get(type) ?? null;
    if (chargementsEnCours.has(type)) return chargementsEnCours.get(type);

    const promesse = (async () => {
        for (const url of urlsEffetBoss(type)) {
            try {
                const reponse = await fetch(url);
                if (!reponse.ok) continue;
                const brut = await reponse.arrayBuffer();
                const buffer = await ctx.decodeAudioData(brut);
                cacheBuffers.set(type, buffer);
                return buffer;
            } catch {
                /* format suivant */
            }
        }
        cacheBuffers.set(type, null);
        return null;
    })();

    chargementsEnCours.set(type, promesse);
    try {
        return await promesse;
    } finally {
        chargementsEnCours.delete(type);
    }
}

export function viderCacheBuffersEffetsBoss() {
    cacheBuffers.clear();
    chargementsEnCours.clear();
}

/** @param {string} type */
export function effetBossSampleCharge(type) {
    return estEffetBossSample(type) && cacheBuffers.get(type) != null;
}

/** @param {AudioContext} ctx */
export async function prechargerEffetsBoss(ctx) {
    await Promise.all(EFFETS_BOSS_SAMPLES.map((type) => chargerBufferEffetBoss(type, ctx)));
}

export function creerMethodesEffetsBoss() {
    return {
        /** @param {string} type @param {number} [mult=1] @returns {boolean} */
        jouerEffetBossSample(type, mult = 1) {
            if (!this.ctx || !this.gainEffets || this.muet || !estEffetBossSample(type)) {
                return false;
            }
            const buffer = cacheBuffers.get(type);
            if (!buffer) return false;

            const source = this.ctx.createBufferSource();
            source.buffer = buffer;
            const gain = this.ctx.createGain();
            const t = this.ctx.currentTime;
            gain.gain.setValueAtTime(0.85 * this.volumeEffets * mult, t);
            source.connect(gain);
            gain.connect(this.gainEffets);
            source.start(t);
            return true;
        },

        async prechargerEffetsBossSamples() {
            if (!this.ctx) return;
            await prechargerEffetsBoss(this.ctx);
        },
    };
}
