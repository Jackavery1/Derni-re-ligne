import { GAMMES } from './audio-donnees.js';
import { obtenirConfigMusiqueBiome } from './audio-fallback-biomes.js';

function genererSequence(config, biomeId, noteVersFreq) {
    const gamme = GAMMES[config.gamme] ?? GAMMES.dorien;
    return config.melodie.map((idx) => {
        if (idx === null) return null;
        const demiTon = gamme[idx % gamme.length];
        return noteVersFreq(demiTon, idx >= gamme.length ? 1 : 0, biomeId);
    });
}

function genererSequenceBasse(config, biomeId, noteVersFreq) {
    if (!config.basseLine || !config.basse) return null;
    const gamme = GAMMES[config.gamme] ?? GAMMES.dorien;
    return config.basseLine.map((idx) => {
        if (idx === null) return null;
        const demiTon = gamme[idx % gamme.length];
        return noteVersFreq(demiTon, -1, biomeId);
    });
}

export function creerMethodesMusique({ calculerTempoActuel, noteVersFreq, obtenirMultMusique }) {
    const multMusique = () => (typeof obtenirMultMusique === 'function' ? obtenirMultMusique() : 1);
    return {
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
                this.jouerNoteMusique(freq, config, config.volumeMelodie * multMusique());
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

            const config = obtenirConfigMusiqueBiome(biomeId);
            if (!config) return;

            if (!conserverPosition) {
                clearInterval(this.intervalMusique);
                this.intervalMusique = null;
                this.stepActuel = 0;
            }

            this.biomeMusique = biomeId;
            this.configMusique = config;
            this.sequenceActuelle = genererSequence(config, biomeId, noteVersFreq);
            this.seqBasse = genererSequenceBasse(config, biomeId, noteVersFreq);
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

        jouerStingerBoss() {
            if (!this.ctx || !this.gainEffets || this.muet) return;
            const notes = [196, 247, 294];
            notes.forEach((freq, i) => {
                setTimeout(() => this.jouerNoteSimple(freq, 'square', 0.12, 0.22), i * 110);
            });
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
    };
}
