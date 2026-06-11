export function creerMethodesEffets({ noteVersFreq, obtenirBiomeActif, obtenirMultEffets }) {
    const multEffets = () => (typeof obtenirMultEffets === 'function' ? obtenirMultEffets() : 1);
    return {
        son(type) {
            if (!this.ctx || !this.gainEffets || this.muet) return;
            if (this.ctx.state === 'suspended') this.ctx.resume();

            const ctx = this.ctx;
            const t = ctx.currentTime;
            const biomeId = obtenirBiomeActif();

            switch (type) {
                case 'deplacement': {
                    const o = ctx.createOscillator();
                    const g = ctx.createGain();
                    o.type = 'sine';
                    o.frequency.value = 440;
                    g.gain.setValueAtTime(0.06 * this.volumeEffets * multEffets(), t);
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
                    g.gain.setValueAtTime(0.08 * this.volumeEffets * multEffets(), t);
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
                    g.gain.setValueAtTime(0.18 * this.volumeEffets * multEffets(), t);
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
                        g.gain.linearRampToValueAtTime(
                            0.14 * this.volumeEffets * multEffets(),
                            t + i * 0.02 + 0.02
                        );
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
                        g.gain.linearRampToValueAtTime(
                            0.16 * this.volumeEffets * multEffets(),
                            t + i * 0.02 + 0.02
                        );
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
                        g.gain.linearRampToValueAtTime(
                            0.18 * this.volumeEffets * multEffets(),
                            t + i * 0.025 + 0.02
                        );
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
                        g.gain.linearRampToValueAtTime(
                            0.22 * this.volumeEffets * multEffets(),
                            ti + 0.03
                        );
                        g.gain.linearRampToValueAtTime(
                            i === 3 ? 0.15 * this.volumeEffets * multEffets() : 0,
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
                        g.gain.linearRampToValueAtTime(
                            0.2 * this.volumeEffets * multEffets(),
                            ti + 0.02
                        );
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
                        g.gain.linearRampToValueAtTime(
                            0.18 * this.volumeEffets * multEffets(),
                            ti + 0.02
                        );
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
                    g.gain.setValueAtTime(0.1 * this.volumeEffets * multEffets(), t);
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
                        g.gain.linearRampToValueAtTime(
                            0.15 * this.volumeEffets * multEffets(),
                            ti + 0.03
                        );
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
                    g.gain.setValueAtTime(0.06 * this.volumeEffets * multEffets(), t);
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
                    g.gain.setValueAtTime(0.08 * this.volumeEffets * multEffets(), t);
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
}
