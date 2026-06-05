import { BIOMES } from './config.js';
import { logger } from './logger.js';

const GAMMES = {
    dorien: [0, 2, 3, 5, 7, 9, 10, 12],
    phrygien: [0, 1, 3, 5, 7, 8, 10, 12],
    majeur: [0, 2, 4, 5, 7, 9, 11, 12],
    pentatonique: [0, 2, 4, 7, 9, 12],
    lydien: [0, 2, 4, 6, 7, 9, 11, 12],
    arabian: [0, 1, 4, 5, 7, 8, 11, 12],
    chromatique: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    whole_tone: [0, 2, 4, 6, 8, 10, 12],
};

export function noteVersFreq(demiTon, octave = 0) {
    return 220 * Math.pow(2, (demiTon + octave * 12) / 12);
}

import { creerContexteAudio } from './dom-utils.js';

let obtenirTempoActuel = () => 120;
/** @type {(cle: string, valeur: string) => void} */
let ecrireStockageFn = () => {};
let onMuteChangeFn = () => {};

export function configurerAudioMoteur({ obtenirTempo, ecrireStockage, onMuteChange }) {
    if (obtenirTempo) obtenirTempoActuel = obtenirTempo;
    if (ecrireStockage) ecrireStockageFn = ecrireStockage;
    if (onMuteChange) onMuteChangeFn = onMuteChange;
}

export const AudioMoteur = {
    ctx: null,
    gainMaitre: null,
    gainMusique: null,
    gainEffets: null,
    actif: false,
    muet: false,
    intervalMusique: null,
    sequenceStep: 0,
    noteActuelle: null,
    biomeMusique: null,
    sequence: [],
    volumeEffets: 0.4,
    volumeMusique: 0.25,
    mesuresCompteur: 0,

    init() {
        if (this.ctx) {
            this.actif = true;
            if (this.ctx.state === 'suspended') this.ctx.resume();
            return;
        }
        try {
            this.ctx = creerContexteAudio();
            if (!this.ctx) throw new Error('AudioContext indisponible');
            this.gainMaitre = this.ctx.createGain();
            this.gainMusique = this.ctx.createGain();
            this.gainEffets = this.ctx.createGain();
            this.gainMusique.connect(this.gainMaitre);
            this.gainEffets.connect(this.gainMaitre);
            this.gainMaitre.connect(this.ctx.destination);
            this.appliquerVolumes();
            this.actif = true;
        } catch (err) {
            logger.warn('Initialisation Web Audio impossible :', err);
            this.muet = true;
        }
    },

    appliquerVolumes() {
        if (!this.gainMaitre) return;
        this.gainMaitre.gain.value = this.muet ? 0 : 1;
        if (this.gainMusique) {
            this.gainMusique.gain.value = this.muet ? 0 : this.volumeMusique;
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
        this.muet = !this.muet;
        ecrireStockageFn('tetrisNeo_muet', this.muet.toString());
        this.appliquerVolumes();
        onMuteChangeFn();
        if (!this.muet) this.son('deplacement');
    },

    genererSequence(gamme) {
        const seq = [];
        for (let i = 0; i < 16; i++) {
            if (Math.random() < 0.14) {
                seq.push(-1);
            } else if (i > 0 && Math.random() < 0.22) {
                seq.push(seq[i - 1]);
            } else {
                seq.push(Math.floor(Math.random() * gamme.length));
            }
        }
        return seq;
    },

    regenererSequence(biomeId) {
        const config = BIOMES[biomeId]?.musique;
        const gamme = GAMMES[config?.gamme] ?? GAMMES.dorien;
        this.sequence = this.genererSequence(gamme);
        this.mesuresCompteur = 0;
    },

    jouerNote(freq, timbre, duree, volume) {
        if (this.muet || !this.ctx || !freq) return;
        if (this.ctx.state === 'suspended') this.ctx.resume();

        const t0 = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const env = this.ctx.createGain();
        osc.type = timbre || 'square';
        osc.frequency.setValueAtTime(freq, t0);

        const vol = Math.min(0.35, volume);
        env.gain.setValueAtTime(0.001, t0);
        env.gain.linearRampToValueAtTime(vol, t0 + 0.01);
        env.gain.linearRampToValueAtTime(vol * 0.7, t0 + 0.01 + 0.05);
        env.gain.setValueAtTime(vol * 0.7, t0 + duree - 0.1);
        env.gain.linearRampToValueAtTime(0.001, t0 + duree);

        osc.connect(env);
        env.connect(this.gainMusique);
        osc.start(t0);
        osc.stop(t0 + duree + 0.02);
        this.noteActuelle = osc;
    },

    jouerBasse(freq, duree) {
        if (this.muet || !this.ctx) return;
        const t0 = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const filtre = this.ctx.createBiquadFilter();
        const env = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, t0);
        filtre.type = 'lowpass';
        filtre.frequency.value = 300;
        const vol = 0.12;
        env.gain.setValueAtTime(0.001, t0);
        env.gain.linearRampToValueAtTime(vol, t0 + 0.02);
        env.gain.exponentialRampToValueAtTime(0.001, t0 + duree);
        osc.connect(filtre);
        filtre.connect(env);
        env.connect(this.gainMusique);
        osc.start(t0);
        osc.stop(t0 + duree + 0.02);
    },

    tickerMusique() {
        if (!this.ctx || !this.biomeMusique) return;
        const config = BIOMES[this.biomeMusique]?.musique;
        if (!config) return;

        const gamme = GAMMES[config.gamme] ?? GAMMES.dorien;
        const idxNote = this.sequence[this.sequenceStep % 16];

        if (idxNote >= 0) {
            const demiTon = gamme[idxNote % gamme.length];
            const duree = (60 / obtenirTempoActuel() / 4) * 0.85;
            this.jouerNote(noteVersFreq(demiTon), config.timbre, duree, 0.14);
        }

        if (config.basse && this.sequenceStep % 2 === 0) {
            const demiTonBasse = gamme[0];
            this.jouerBasse(noteVersFreq(demiTonBasse, -1), 60 / obtenirTempoActuel() / 2);
        }

        this.sequenceStep++;
        if (this.sequenceStep % 16 === 0) {
            this.mesuresCompteur++;
            if (this.mesuresCompteur >= 4) {
                this.regenererSequence(this.biomeMusique);
            }
        }
    },

    demarrerMusique(biomeId) {
        if (!this.ctx || this.muet) return;
        this.arreterMusique();
        this.biomeMusique = biomeId;
        this.sequenceStep = 0;
        this.regenererSequence(biomeId);

        const msParStep = (60 / obtenirTempoActuel()) * 250;
        this.tickerMusique();
        this.intervalMusique = setInterval(() => this.tickerMusique(), msParStep);
    },

    relancerIntervalleMusique() {
        if (!this.biomeMusique || !this.ctx) return;
        clearInterval(this.intervalMusique);
        const msParStep = (60 / obtenirTempoActuel()) * 250;
        this.intervalMusique = setInterval(() => this.tickerMusique(), msParStep);
    },

    fadeGainMusique(cible, dureeMs, puis) {
        if (!this.gainMusique || !this.ctx) {
            if (puis) puis();
            return;
        }
        const t0 = this.ctx.currentTime;
        this.gainMusique.gain.cancelScheduledValues(t0);
        this.gainMusique.gain.setValueAtTime(this.gainMusique.gain.value, t0);
        this.gainMusique.gain.linearRampToValueAtTime(cible, t0 + dureeMs / 1000);
        if (puis) setTimeout(puis, dureeMs);
    },

    transitionMusique(biomeId) {
        if (!this.ctx) {
            this.demarrerMusique(biomeId);
            return;
        }
        this.fadeGainMusique(0, 300, () => {
            this.demarrerMusique(biomeId);
            if (this.gainMusique) {
                this.gainMusique.gain.value = 0;
            }
            this.fadeGainMusique(this.muet ? 0 : this.volumeMusique, 400);
        });
    },

    arreterMusique() {
        clearInterval(this.intervalMusique);
        this.intervalMusique = null;
        this.biomeMusique = null;
        this.sequenceStep = 0;
        if (this.gainMusique && this.ctx) {
            this.gainMusique.gain.cancelScheduledValues(this.ctx.currentTime);
            this.gainMusique.gain.value = this.muet ? 0 : this.volumeMusique;
        }
    },

    jouerOscEffet(opts) {
        if (this.muet || !this.ctx) return;
        if (this.ctx.state === 'suspended') this.ctx.resume();

        const t0 = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = opts.timbre || 'square';
        const f0 = opts.freq ?? 440;
        const f1 = opts.freqFin ?? f0;
        osc.frequency.setValueAtTime(f0, t0);
        if (f1 !== f0) {
            osc.frequency.linearRampToValueAtTime(f1, t0 + opts.duree);
        }
        const vol = Math.min(0.4, (opts.volume ?? 0.1) * this.volumeEffets);
        gain.gain.setValueAtTime(vol, t0);
        gain.gain.exponentialRampToValueAtTime(0.001, t0 + opts.duree);
        osc.connect(gain);
        gain.connect(this.gainEffets);
        osc.start(t0);
        osc.stop(t0 + opts.duree + 0.02);
    },

    jouerAccord(freqs, timbre, duree, volume) {
        for (const f of freqs) {
            this.jouerOscEffet({ freq: f, timbre, duree, volume: volume / freqs.length });
        }
    },

    son(type) {
        if (this.muet || !this.ctx) return;
        if (this.ctx.state === 'suspended') this.ctx.resume();

        switch (type) {
            case 'deplacement':
                this.jouerOscEffet({ freq: 440, duree: 0.04, timbre: 'square', volume: 0.08 });
                break;
            case 'rotation':
                this.jouerOscEffet({
                    freq: 330,
                    freqFin: 550,
                    duree: 0.06,
                    timbre: 'square',
                    volume: 0.1,
                });
                break;
            case 'verrou':
                this.jouerOscEffet({ freq: 120, duree: 0.08, timbre: 'sawtooth', volume: 0.18 });
                break;
            case 'ligne_1':
                this.jouerAccord([440, 554], 'square', 0.12, 0.2);
                break;
            case 'ligne_2':
                this.jouerAccord([440, 554, 659], 'square', 0.14, 0.25);
                break;
            case 'ligne_3':
                this.jouerAccord([440, 554, 659, 880], 'square', 0.16, 0.28);
                break;
            case 'tetris': {
                [523, 659, 784, 1047].forEach((f, i) => {
                    setTimeout(() => {
                        this.jouerOscEffet({
                            freq: f,
                            duree: 0.18,
                            timbre: 'square',
                            volume: 0.22,
                        });
                        this.jouerOscEffet({
                            freq: f * 0.5,
                            duree: 0.25,
                            timbre: 'triangle',
                            volume: 0.08,
                        });
                    }, i * 55);
                });
                break;
            }
            case 'niveau':
                [660, 880, 1108].forEach((f, i) => {
                    setTimeout(() => {
                        this.jouerOscEffet({
                            freq: f,
                            duree: 0.14,
                            timbre: 'triangle',
                            volume: 0.18,
                        });
                    }, i * 70);
                });
                break;
            case 'game_over': {
                const notes = [392, 370, 349, 330, 311];
                notes.forEach((f, i) => {
                    setTimeout(() => {
                        this.jouerOscEffet({
                            freq: f,
                            duree: 0.12,
                            timbre: 'sawtooth',
                            volume: 0.14,
                        });
                    }, i * 90);
                });
                break;
            }
            case 'hold':
                this.jouerOscEffet({
                    freq: 800,
                    freqFin: 300,
                    duree: 0.1,
                    timbre: 'triangle',
                    volume: 0.12,
                });
                break;
            case 'menu_hover':
                this.jouerOscEffet({ freq: 880, duree: 0.02, timbre: 'square', volume: 0.06 });
                break;
            case 'chute':
                this.jouerOscEffet({ freq: 160, duree: 0.06, timbre: 'triangle', volume: 0.12 });
                break;
        }
    },
};
