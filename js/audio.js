import { logger } from './logger.js';
import { creerContexteAudio } from './dom-utils.js';
import { GAMMES, TONIQUES_BIOMES, MUSIQUE_BIOMES } from './audio-donnees.js';
import { creerMethodesMusique } from './audio-musique.js';
import { creerMethodesEffets } from './audio-effets.js';
import {
    obtenirMultiplicateurEffetsBiome,
    obtenirMultiplicateurMusiqueBiome,
} from './audio-mix-biome.js';

let obtenirBiomeActifFn = () => 'classique';
let obtenirNiveauFn = () => 1;
/** @type {(cle: string, valeur: string) => void} */
let ecrireStockageFn = () => {};
let onMuteChangeFn = () => {};

export function configurerAudioMoteur({
    obtenirBiomeActif,
    obtenirNiveau,
    ecrireStockage,
    onMuteChange,
}) {
    if (obtenirBiomeActif) obtenirBiomeActifFn = obtenirBiomeActif;
    if (obtenirNiveau) obtenirNiveauFn = obtenirNiveau;
    if (ecrireStockage) ecrireStockageFn = ecrireStockage;
    if (onMuteChange) onMuteChangeFn = onMuteChange;
}

export function calculerTempoActuel(tempoBase) {
    const niv = obtenirNiveauFn() || 1;
    const accel = Math.round(tempoBase * (1 + Math.min(niv - 1, 10) * 0.02));
    const drift =
        1 + Math.sin((typeof performance !== 'undefined' ? performance.now() : 0) / 45000) * 0.04;
    return Math.round(accel * drift);
}

export function noteVersFreq(demiTon, octave = 0, biomeId) {
    const tonique = TONIQUES_BIOMES[biomeId ?? obtenirBiomeActifFn()] ?? 220;
    return tonique * Math.pow(2, (demiTon + octave * 12) / 12);
}

export const AudioMoteur = {
    ctx: null,
    gainMaitre: null,
    gainMusique: null,
    gainEffets: null,
    actif: false,
    initialise: false,
    muet: false,
    intervalMusique: null,
    stepActuel: 0,
    sequenceActuelle: [],
    seqBasse: null,
    musiqueActive: false,
    biomeMusique: null,
    configMusique: null,
    volumeEffets: 1.0,
    volumeMusique: 1.0,
    gainMusiqueNormal: 0.7,
    _enPauseMusique: false,

    init() {
        if (this.initialise) {
            this.actif = true;
            if (this.ctx?.state === 'suspended') this.ctx.resume();
            return;
        }
        try {
            this.ctx = creerContexteAudio();
            if (!this.ctx) return;

            this.gainMaitre = this.ctx.createGain();
            this.gainMaitre.gain.value = 0.5;
            this.gainMaitre.connect(this.ctx.destination);

            this.gainMusique = this.ctx.createGain();
            this.gainMusique.gain.value = this.gainMusiqueNormal;
            this.gainMusique.connect(this.gainMaitre);

            this.gainEffets = this.ctx.createGain();
            this.gainEffets.gain.value = 1.0;
            this.gainEffets.connect(this.gainMaitre);

            this.initialise = true;
            this.actif = true;
            this.appliquerVolumes();
        } catch (err) {
            logger.warn('Web Audio API non disponible :', err);
        }
    },

    appliquerVolumes() {
        if (!this.gainMaitre) return;
        this.gainMaitre.gain.value = this.muet ? 0 : 0.5;
        if (this.gainMusique && !this._enPauseMusique) {
            this.gainMusique.gain.value = this.muet
                ? 0
                : this.gainMusiqueNormal * this.volumeMusique;
        }
        if (this.gainEffets) {
            this.gainEffets.gain.value = this.muet ? 0 : this.volumeEffets;
        }
    },

    reglerVolumeEffets(v) {
        this.volumeEffets = Math.max(0, Math.min(1, v));
        this.appliquerVolumes();
    },

    reglerVolumeMusique(v) {
        this.volumeMusique = Math.max(0, Math.min(1, v));
        this.appliquerVolumes();
    },

    basculerMute() {
        if (!this.ctx) return;
        this.muet = !this.muet;
        ecrireStockageFn('derniereLigne_muet', this.muet.toString());
        const t = this.ctx.currentTime;
        this.gainMaitre.gain.cancelScheduledValues(t);
        this.gainMaitre.gain.setValueAtTime(this.gainMaitre.gain.value, t);
        this.gainMaitre.gain.linearRampToValueAtTime(this.muet ? 0 : 0.5, t + 0.1);
        onMuteChangeFn();
        if (!this.muet) this.son('deplacement');
    },
    ...creerMethodesMusique({
        calculerTempoActuel,
        noteVersFreq,
        obtenirMultMusique: () => obtenirMultiplicateurMusiqueBiome(obtenirBiomeActifFn()),
    }),
    ...creerMethodesEffets({
        noteVersFreq,
        obtenirBiomeActif: () => obtenirBiomeActifFn(),
        obtenirMultEffets: () => obtenirMultiplicateurEffetsBiome(obtenirBiomeActifFn()),
    }),
};

export { GAMMES, TONIQUES_BIOMES, MUSIQUE_BIOMES };
