import { estEffetBossSample } from './audio-fichiers-effets-boss.js';

/**
 * Fallback procédural si les samples assets/sfx/boss sont indisponibles.
 * @param {AudioContext} ctx
 * @param {GainNode} gainEffets
 * @param {string} type
 * @param {number} t
 * @param {number} volume
 * @param {number} mult
 */
export function jouerEffetBossProcedural(ctx, gainEffets, type, t, volume, mult) {
    if (!estEffetBossSample(type)) return false;
    const gain = volume * mult;

    switch (type) {
        case 'boss_braise': {
            const o = ctx.createOscillator();
            const g = ctx.createGain();
            o.type = 'sawtooth';
            o.frequency.setValueAtTime(90, t);
            o.frequency.linearRampToValueAtTime(45, t + 0.14);
            g.gain.setValueAtTime(0.16 * gain, t);
            g.gain.linearRampToValueAtTime(0, t + 0.16);
            o.connect(g);
            g.connect(gainEffets);
            o.start(t);
            o.stop(t + 0.17);
            break;
        }
        case 'boss_gel': {
            const o = ctx.createOscillator();
            const g = ctx.createGain();
            o.type = 'sine';
            o.frequency.setValueAtTime(1400, t);
            o.frequency.exponentialRampToValueAtTime(420, t + 0.12);
            g.gain.setValueAtTime(0.11 * gain, t);
            g.gain.linearRampToValueAtTime(0, t + 0.14);
            o.connect(g);
            g.connect(gainEffets);
            o.start(t);
            o.stop(t + 0.15);
            break;
        }
        case 'boss_controles':
            [440, 330, 220].forEach((freq, i) => {
                const o = ctx.createOscillator();
                const g = ctx.createGain();
                o.type = 'square';
                o.frequency.value = freq;
                const ti = t + i * 0.07;
                g.gain.setValueAtTime(0, ti);
                g.gain.linearRampToValueAtTime(0.12 * gain, ti + 0.015);
                g.gain.linearRampToValueAtTime(0, ti + 0.1);
                o.connect(g);
                g.connect(gainEffets);
                o.start(ti);
                o.stop(ti + 0.11);
            });
            break;
        case 'boss_fantome': {
            const o = ctx.createOscillator();
            const g = ctx.createGain();
            o.type = 'triangle';
            o.frequency.setValueAtTime(520, t);
            o.frequency.linearRampToValueAtTime(780, t + 0.08);
            o.frequency.linearRampToValueAtTime(360, t + 0.16);
            g.gain.setValueAtTime(0.1 * gain, t);
            g.gain.linearRampToValueAtTime(0, t + 0.18);
            o.connect(g);
            g.connect(gainEffets);
            o.start(t);
            o.stop(t + 0.19);
            break;
        }
        case 'boss_distorsion':
            [880, 220, 660, 110].forEach((freq, i) => {
                const o = ctx.createOscillator();
                const g = ctx.createGain();
                o.type = 'sawtooth';
                o.frequency.value = freq;
                const ti = t + i * 0.04;
                g.gain.setValueAtTime(0.09 * gain, ti);
                g.gain.linearRampToValueAtTime(0, ti + 0.05);
                o.connect(g);
                g.connect(gainEffets);
                o.start(ti);
                o.stop(ti + 0.06);
            });
            break;
        case 'boss_permutation': {
            const o = ctx.createOscillator();
            const g = ctx.createGain();
            o.type = 'sine';
            o.frequency.setValueAtTime(260, t);
            o.frequency.linearRampToValueAtTime(920, t + 0.09);
            o.frequency.linearRampToValueAtTime(300, t + 0.16);
            g.gain.setValueAtTime(0.1 * gain, t);
            g.gain.linearRampToValueAtTime(0, t + 0.17);
            o.connect(g);
            g.connect(gainEffets);
            o.start(t);
            o.stop(t + 0.18);
            break;
        }
        default:
            return false;
    }
    return true;
}
