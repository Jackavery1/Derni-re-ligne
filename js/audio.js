import { logger } from './logger.js';
import { creerContexteAudio } from './dom-utils.js';
import { GAMMES, TONIQUES_BIOMES, MUSIQUE_BIOMES } from './audio-donnees.js';

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
    return Math.round(tempoBase * (1 + Math.min(niv - 1, 10) * 0.02));
}

export function noteVersFreq(demiTon, octave = 0, biomeId) {
    const tonique = TONIQUES_BIOMES[biomeId ?? obtenirBiomeActifFn()] ?? 220;
    return tonique * Math.pow(2, (demiTon + octave * 12) / 12);
}

function genererSequence(config, biomeId) {
    const gamme = GAMMES[config.gamme] ?? GAMMES.dorien;
    return config.melodie.map((idx) => {
        if (idx === null) return null;
        const demiTon = gamme[idx % gamme.length];
        return noteVersFreq(demiTon, idx >= gamme.length ? 1 : 0, biomeId);
    });
}

function genererSequenceBasse(config, biomeId) {
    if (!config.basseLine || !config.basse) return null;
    const gamme = GAMMES[config.gamme] ?? GAMMES.dorien;
    return config.basseLine.map((idx) => {
        if (idx === null) return null;
        const demiTon = gamme[idx % gamme.length];
        return noteVersFreq(demiTon, -1, biomeId);
    });
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

    jouerNoteMusique(freq, config, volume) {
        if (!this.ctx || !this.gainMusique || this.muet) return;
        if (this.ctx.state === 'suspended') this.ctx.resume();

        const ctx = this.ctx;
        const t = ctx.currentTime;
        const adsr = config.adsr;
        const tempo = calculerTempoActuel(config.tempo);
        const dur = config.tenueNote ? (60 / tempo) * 1.8 : (60 / tempo) * 0.85;

        const osc = ctx.createOscillator();
        osc.type = config.timbre;
        osc.frequency.value = freq;

        let noeudSource = osc;
        if (config.filtreFreq) {
            const filtre = ctx.createBiquadFilter();
            filtre.type = 'lowpass';
            filtre.frequency.value = config.filtreFreq;
            filtre.Q.value = 1.5;
            osc.connect(filtre);
            noeudSource = filtre;
        }

        const env = ctx.createGain();
        env.gain.setValueAtTime(0, t);
        env.gain.linearRampToValueAtTime(volume, t + adsr.a);
        env.gain.linearRampToValueAtTime(volume * adsr.s, t + adsr.a + adsr.d);
        env.gain.setValueAtTime(volume * adsr.s, t + dur - adsr.r);
        env.gain.linearRampToValueAtTime(0, t + dur);

        noeudSource.connect(env);
        env.connect(this.gainMusique);
        osc.start(t);
        osc.stop(t + dur + 0.01);

        if (config.harmonique) {
            this.jouerNoteSimple(freq * 2, config.timbre, config.volHarmonique, dur);
        }

        if (config.echoActif) {
            setTimeout(() => {
                if (this.musiqueActive) {
                    this.jouerNoteSimple(freq, config.timbre, config.echoVolume, dur * 0.7);
                }
            }, config.echoDelai * 1000);
        }
    },

    jouerBasse(freq, config, volume) {
        if (!this.ctx || !this.gainMusique || this.muet) return;
        const ctx = this.ctx;
        const t = ctx.currentTime;
        const tempo = calculerTempoActuel(config.tempo);
        const dur = (60 / tempo) * 1.6;
        const adsr = config.adsr;

        const osc = ctx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.value = freq;

        const filtre = ctx.createBiquadFilter();
        filtre.type = 'lowpass';
        filtre.frequency.value = 400;
        filtre.Q.value = 0.8;
        osc.connect(filtre);

        const env = ctx.createGain();
        env.gain.setValueAtTime(0, t);
        env.gain.linearRampToValueAtTime(volume, t + 0.01);
        env.gain.linearRampToValueAtTime(volume * 0.6, t + 0.08);
        env.gain.setValueAtTime(volume * 0.6, t + dur - 0.1);
        env.gain.linearRampToValueAtTime(0, t + dur);

        filtre.connect(env);
        env.connect(this.gainMusique);
        osc.start(t);
        osc.stop(t + dur + 0.01);
    },

    jouerNoteSimple(freq, timbre, volume, duree) {
        if (!this.ctx || !this.gainMusique || this.muet) return;
        const ctx = this.ctx;
        const t = ctx.currentTime;

        const osc = ctx.createOscillator();
        osc.type = timbre;
        osc.frequency.value = freq;

        const env = ctx.createGain();
        env.gain.setValueAtTime(0, t);
        env.gain.linearRampToValueAtTime(volume, t + 0.02);
        env.gain.linearRampToValueAtTime(0, t + duree);

        osc.connect(env);
        env.connect(this.gainMusique);
        osc.start(t);
        osc.stop(t + duree + 0.01);
    },

    tickerMusique() {
        if (!this.musiqueActive || this.muet || !this.configMusique) return;
        const config = this.configMusique;
        const step = this.stepActuel;
        const freq = this.sequenceActuelle[step];
        const freqB = this.seqBasse?.[step];

        if (freq !== null && freq !== undefined) {
            this.jouerNoteMusique(freq, config, config.volumeMelodie);
        }
        if (freqB !== null && freqB !== undefined) {
            this.jouerBasse(freqB, config, config.volumeBasse ?? 0.3);
        }

        this.stepActuel = (step + 1) % this.sequenceActuelle.length;

        if (this.stepActuel === 0) {
            const biomeId = this.biomeMusique;
            clearInterval(this.intervalMusique);
            this.intervalMusique = null;
            setTimeout(() => {
                if (this.musiqueActive && biomeId) this.demarrerMusique(biomeId, true);
            }, 0);
        }
    },

    demarrerMusique(biomeId, conserverPosition = false) {
        if (!this.initialise || !this.ctx) return;
        if (this.ctx.state === 'suspended') this.ctx.resume();

        const config = MUSIQUE_BIOMES[biomeId];
        if (!config) return;

        if (!conserverPosition) {
            clearInterval(this.intervalMusique);
            this.intervalMusique = null;
            this.stepActuel = 0;
        }

        this.biomeMusique = biomeId;
        this.configMusique = config;
        this.sequenceActuelle = genererSequence(config, biomeId);
        this.seqBasse = genererSequenceBasse(config, biomeId);
        this.musiqueActive = true;

        if (this.gainMusique) {
            this.gainMusique.gain.cancelScheduledValues(this.ctx.currentTime);
            this.gainMusique.gain.value = this.muet
                ? 0
                : this.gainMusiqueNormal * this.volumeMusique;
        }

        const msParStep = 60000 / calculerTempoActuel(config.tempo) / 4;
        if (!this.intervalMusique) {
            this.tickerMusique();
            this.intervalMusique = setInterval(() => this.tickerMusique(), msParStep);
        }
    },

    relancerIntervalleMusique() {
        if (!this.musiqueActive || !this.biomeMusique || !this.configMusique) return;
        clearInterval(this.intervalMusique);
        const msParStep = 60000 / calculerTempoActuel(this.configMusique.tempo) / 4;
        this.intervalMusique = setInterval(() => this.tickerMusique(), msParStep);
    },

    definirVolumePauseMusique(enPause) {
        if (!this.gainMusique || !this.ctx) return;
        this._enPauseMusique = enPause;
        if (enPause) {
            this.gainMusique.gain.value = 0.2;
        } else {
            this.gainMusique.gain.value = this.muet
                ? 0
                : this.gainMusiqueNormal * this.volumeMusique;
        }
    },

    transitionMusique(biomeId) {
        if (!this.ctx) {
            this.demarrerMusique(biomeId);
            return;
        }
        this.arreterMusique(300);
        setTimeout(() => this.demarrerMusique(biomeId), 350);
    },

    arreterMusique(fadeDuree = 0) {
        this.musiqueActive = false;
        clearInterval(this.intervalMusique);
        this.intervalMusique = null;

        if (!this.gainMusique || !this.ctx) {
            this.biomeMusique = null;
            this.configMusique = null;
            return;
        }

        if (fadeDuree > 0) {
            const t = this.ctx.currentTime;
            this.gainMusique.gain.cancelScheduledValues(t);
            this.gainMusique.gain.setValueAtTime(this.gainMusique.gain.value, t);
            this.gainMusique.gain.linearRampToValueAtTime(0, t + fadeDuree / 1000);
            setTimeout(() => {
                if (this.gainMusique) {
                    this.gainMusique.gain.value = this.muet
                        ? 0
                        : this.gainMusiqueNormal * this.volumeMusique;
                }
            }, fadeDuree + 50);
        }

        this.biomeMusique = null;
        this.configMusique = null;
        this.stepActuel = 0;
    },

    son(type) {
        if (!this.ctx || !this.gainEffets || this.muet) return;
        if (this.ctx.state === 'suspended') this.ctx.resume();

        const ctx = this.ctx;
        const t = ctx.currentTime;
        const biomeId = obtenirBiomeActifFn();

        switch (type) {
            case 'deplacement': {
                const o = ctx.createOscillator();
                const g = ctx.createGain();
                o.type = 'sine';
                o.frequency.value = 440;
                g.gain.setValueAtTime(0.06 * this.volumeEffets, t);
                g.gain.linearRampToValueAtTime(0, t + 0.04);
                o.connect(g);
                g.connect(this.gainEffets);
                o.start(t);
                o.stop(t + 0.05);
                break;
            }
            case 'rotation': {
                const o = ctx.createOscillator();
                const g = ctx.createGain();
                o.type = 'sine';
                o.frequency.setValueAtTime(330, t);
                o.frequency.linearRampToValueAtTime(550, t + 0.06);
                g.gain.setValueAtTime(0.08 * this.volumeEffets, t);
                g.gain.linearRampToValueAtTime(0, t + 0.07);
                o.connect(g);
                g.connect(this.gainEffets);
                o.start(t);
                o.stop(t + 0.08);
                break;
            }
            case 'verrou': {
                const o = ctx.createOscillator();
                const g = ctx.createGain();
                const f = ctx.createBiquadFilter();
                o.type = 'sawtooth';
                o.frequency.value = 100;
                f.type = 'lowpass';
                f.frequency.value = 300;
                g.gain.setValueAtTime(0.18 * this.volumeEffets, t);
                g.gain.linearRampToValueAtTime(0, t + 0.09);
                o.connect(f);
                f.connect(g);
                g.connect(this.gainEffets);
                o.start(t);
                o.stop(t + 0.1);
                break;
            }
            case 'ligne_1':
                [261, 329, 392].forEach((freq, i) => {
                    const o = ctx.createOscillator();
                    const g = ctx.createGain();
                    o.type = 'triangle';
                    o.frequency.value = freq;
                    g.gain.setValueAtTime(0, t + i * 0.02);
                    g.gain.linearRampToValueAtTime(0.14 * this.volumeEffets, t + i * 0.02 + 0.02);
                    g.gain.linearRampToValueAtTime(0, t + 0.3);
                    o.connect(g);
                    g.connect(this.gainEffets);
                    o.start(t + i * 0.02);
                    o.stop(t + 0.35);
                });
                break;
            case 'ligne_2':
                [261, 329, 392, 523].forEach((freq, i) => {
                    const o = ctx.createOscillator();
                    const g = ctx.createGain();
                    o.type = 'triangle';
                    o.frequency.value = freq;
                    g.gain.setValueAtTime(0, t + i * 0.02);
                    g.gain.linearRampToValueAtTime(0.16 * this.volumeEffets, t + i * 0.02 + 0.02);
                    g.gain.linearRampToValueAtTime(0, t + 0.4);
                    o.connect(g);
                    g.connect(this.gainEffets);
                    o.start(t + i * 0.02);
                    o.stop(t + 0.45);
                });
                break;
            case 'ligne_3':
                [261, 329, 392, 523, 659].forEach((freq, i) => {
                    const o = ctx.createOscillator();
                    const g = ctx.createGain();
                    o.type = 'triangle';
                    o.frequency.value = freq;
                    g.gain.setValueAtTime(0, t + i * 0.025);
                    g.gain.linearRampToValueAtTime(0.18 * this.volumeEffets, t + i * 0.025 + 0.02);
                    g.gain.linearRampToValueAtTime(0, t + 0.5);
                    o.connect(g);
                    g.connect(this.gainEffets);
                    o.start(t + i * 0.025);
                    o.stop(t + 0.55);
                });
                break;
            case 'tetris': {
                const freqsTetris = [
                    noteVersFreq(0, 0, biomeId),
                    noteVersFreq(4, 0, biomeId),
                    noteVersFreq(7, 0, biomeId),
                    noteVersFreq(12, 0, biomeId),
                ];
                freqsTetris.forEach((freq, i) => {
                    const o = ctx.createOscillator();
                    const g = ctx.createGain();
                    o.type = 'triangle';
                    o.frequency.value = freq;
                    const ti = t + i * 0.06;
                    g.gain.setValueAtTime(0, ti);
                    g.gain.linearRampToValueAtTime(0.22 * this.volumeEffets, ti + 0.03);
                    g.gain.linearRampToValueAtTime(
                        i === 3 ? 0.15 * this.volumeEffets : 0,
                        ti + 0.22
                    );
                    if (i === 3) g.gain.linearRampToValueAtTime(0, ti + 0.6);
                    o.connect(g);
                    g.connect(this.gainEffets);
                    o.start(ti);
                    o.stop(ti + 0.65);
                });
                break;
            }
            case 'niveau':
                [
                    noteVersFreq(0, 0, biomeId),
                    noteVersFreq(5, 0, biomeId),
                    noteVersFreq(12, 0, biomeId),
                ].forEach((freq, i) => {
                    const o = ctx.createOscillator();
                    const g = ctx.createGain();
                    o.type = 'square';
                    o.frequency.value = freq;
                    const ti = t + i * 0.1;
                    g.gain.setValueAtTime(0, ti);
                    g.gain.linearRampToValueAtTime(0.2 * this.volumeEffets, ti + 0.02);
                    g.gain.linearRampToValueAtTime(0, ti + 0.18);
                    o.connect(g);
                    g.connect(this.gainEffets);
                    o.start(ti);
                    o.stop(ti + 0.2);
                });
                break;
            case 'game_over':
                [
                    noteVersFreq(7, 0, biomeId),
                    noteVersFreq(5, 0, biomeId),
                    noteVersFreq(3, 0, biomeId),
                    noteVersFreq(1, 0, biomeId),
                    noteVersFreq(-1, 0, biomeId),
                ].forEach((freq, i) => {
                    const o = ctx.createOscillator();
                    const g = ctx.createGain();
                    o.type = 'sawtooth';
                    o.frequency.value = freq;
                    const ti = t + i * 0.15;
                    g.gain.setValueAtTime(0, ti);
                    g.gain.linearRampToValueAtTime(0.18 * this.volumeEffets, ti + 0.02);
                    g.gain.linearRampToValueAtTime(0, ti + 0.28);
                    o.connect(g);
                    g.connect(this.gainEffets);
                    o.start(ti);
                    o.stop(ti + 0.3);
                });
                break;
            case 'hold': {
                const o = ctx.createOscillator();
                const g = ctx.createGain();
                o.type = 'sine';
                o.frequency.setValueAtTime(800, t);
                o.frequency.linearRampToValueAtTime(300, t + 0.1);
                g.gain.setValueAtTime(0.1 * this.volumeEffets, t);
                g.gain.linearRampToValueAtTime(0, t + 0.12);
                o.connect(g);
                g.connect(this.gainEffets);
                o.start(t);
                o.stop(t + 0.13);
                break;
            }
            case 'relique':
                [
                    noteVersFreq(0, 0, biomeId),
                    noteVersFreq(7, 0, biomeId),
                    noteVersFreq(12, 0, biomeId),
                ].forEach((freq, i) => {
                    const o = ctx.createOscillator();
                    const g = ctx.createGain();
                    o.type = 'sine';
                    o.frequency.value = freq;
                    const ti = t + i * 0.12;
                    g.gain.setValueAtTime(0, ti);
                    g.gain.linearRampToValueAtTime(0.15 * this.volumeEffets, ti + 0.03);
                    g.gain.linearRampToValueAtTime(0, ti + 0.25);
                    o.connect(g);
                    g.connect(this.gainEffets);
                    o.start(ti);
                    o.stop(ti + 0.28);
                });
                break;
            case 'menu_hover':
            case 'menu_select': {
                const o = ctx.createOscillator();
                const g = ctx.createGain();
                o.type = 'sine';
                o.frequency.value = 880;
                g.gain.setValueAtTime(0.06 * this.volumeEffets, t);
                g.gain.linearRampToValueAtTime(0, t + 0.03);
                o.connect(g);
                g.connect(this.gainEffets);
                o.start(t);
                o.stop(t + 0.04);
                break;
            }
            case 'chute': {
                const o = ctx.createOscillator();
                const g = ctx.createGain();
                o.type = 'sine';
                o.frequency.value = 160;
                g.gain.setValueAtTime(0.08 * this.volumeEffets, t);
                g.gain.linearRampToValueAtTime(0, t + 0.06);
                o.connect(g);
                g.connect(this.gainEffets);
                o.start(t);
                o.stop(t + 0.07);
                break;
            }
        }
    },
};

export { GAMMES, TONIQUES_BIOMES, MUSIQUE_BIOMES };
