import { mkdirSync, writeFileSync, statSync, unlinkSync } from 'fs';
import { join } from 'path';
import { trouverFfmpeg, executerFfmpeg } from './media-utils.mjs';

const SAMPLE_RATE = 44100;
const OUT_DIR = 'assets/sfx/boss';

/** @type {Record<string, () => Float32Array>} */
const GENERATEURS = {
    boss_braise: genererBraise,
    boss_gel: genererGel,
    boss_controles: genererControles,
    boss_fantome: genererFantome,
    boss_distorsion: genererDistorsion,
    boss_permutation: genererPermutation,
};

function dureeEnSamples(secondes) {
    return Math.floor(SAMPLE_RATE * secondes);
}

/** @param {number} t @param {number} freq */
function sinus(t, freq) {
    return Math.sin((2 * Math.PI * freq * t) / SAMPLE_RATE);
}

/** @param {number} _t */
function bruitBlanc(_t) {
    return Math.random() * 2 - 1;
}

/**
 * @param {number} dureeSamples
 * @param {(i: number, t: number) => number} fn
 */
function remplir(dureeSamples, fn) {
    const buf = new Float32Array(dureeSamples);
    for (let i = 0; i < dureeSamples; i++) {
        buf[i] = fn(i, i / SAMPLE_RATE);
    }
    return normaliser(buf, 0.92);
}

/** @param {Float32Array} buf @param {number} gain */
function normaliser(buf, gain) {
    let peak = 0;
    for (let i = 0; i < buf.length; i++) peak = Math.max(peak, Math.abs(buf[i]));
    const mult = peak > 0 ? gain / peak : gain;
    return buf.map((s) => s * mult);
}

/** @param {Float32Array} samples */
function encoderWav(samples) {
    const dataSize = samples.length * 2;
    const buffer = Buffer.alloc(44 + dataSize);
    buffer.write('RIFF', 0);
    buffer.writeUInt32LE(36 + dataSize, 4);
    buffer.write('WAVE', 8);
    buffer.write('fmt ', 12);
    buffer.writeUInt32LE(16, 16);
    buffer.writeUInt16LE(1, 20);
    buffer.writeUInt16LE(1, 22);
    buffer.writeUInt32LE(SAMPLE_RATE, 24);
    buffer.writeUInt32LE(SAMPLE_RATE * 2, 28);
    buffer.writeUInt16LE(2, 32);
    buffer.writeUInt16LE(16, 34);
    buffer.write('data', 36);
    buffer.writeUInt32LE(dataSize, 40);
    for (let i = 0; i < samples.length; i++) {
        const s = Math.max(-1, Math.min(1, samples[i]));
        buffer.writeInt16LE(Math.round(s * 32767), 44 + i * 2);
    }
    return buffer;
}

function genererBraise() {
    const n = dureeEnSamples(0.42);
    return remplir(n, (i, t) => {
        const env = Math.exp(-t * 9);
        const sweep = sinus(i, 140 * Math.exp(-t * 4.5) + 35);
        const crack = bruitBlanc(i) * Math.exp(-t * 14) * 0.55;
        const rumble = sinus(i, 52) * Math.exp(-t * 2.2) * 0.35;
        return (sweep * 0.45 + crack + rumble) * env;
    });
}

function genererGel() {
    const n = dureeEnSamples(0.36);
    return remplir(n, (i, t) => {
        const env = Math.exp(-t * 7);
        const ping = sinus(i, 2200 * Math.exp(-t * 6) + 520) * Math.exp(-t * 11);
        const shimmer = bruitBlanc(i) * Math.exp(-t * 18) * 0.25;
        const ring = sinus(i, 1680) * Math.exp(-t * 9) * 0.2;
        return (ping * 0.65 + shimmer + ring) * env;
    });
}

function genererControles() {
    const n = dureeEnSamples(0.38);
    return remplir(n, (i, t) => {
        let sum = 0;
        [260, 390, 520].forEach((freq, idx) => {
            const debut = idx * 0.09;
            if (t < debut) return;
            const local = t - debut;
            const env = Math.exp(-local * 16);
            sum += sinus(i, freq) * env * 0.55;
            sum += (local < 0.012 ? bruitBlanc(i) * 0.15 : 0) * env;
        });
        return sum;
    });
}

function genererFantome() {
    const n = dureeEnSamples(0.44);
    return remplir(n, (i, t) => {
        const env = Math.exp(-t * 5.5);
        const wobble =
            430 +
            210 * Math.sin((2 * Math.PI * 7 * t) / 1) +
            90 * Math.sin((2 * Math.PI * 13 * t) / 1);
        const voix = sinus(i, wobble) * 0.55;
        const echo =
            t > 0.06
                ? sinus(i - dureeEnSamples(0.06), wobble) * Math.exp(-(t - 0.06) * 8) * 0.25
                : 0;
        return (voix + echo) * env;
    });
}

function genererDistorsion() {
    const n = dureeEnSamples(0.34);
    return remplir(n, (i, t) => {
        let sum = 0;
        for (let k = 0; k < 4; k++) {
            const debut = k * 0.07;
            if (t < debut) continue;
            const local = t - debut;
            const env = Math.exp(-local * 22);
            const freq = [880, 220, 660, 140][k];
            const wave = Math.tanh(sinus(i, freq) * 2.4 + bruitBlanc(i) * 0.35);
            sum += wave * env * 0.45;
        }
        return sum;
    });
}

function genererPermutation() {
    const n = dureeEnSamples(0.4);
    return remplir(n, (i, t) => {
        const env = Math.exp(-t * 6);
        const sweep =
            280 +
            640 * Math.sin((Math.PI * t) / 0.18) ** 2 +
            120 * Math.sin((2 * Math.PI * 9 * t) / 1);
        const glide = sinus(i, sweep) * 0.6;
        const whoosh = bruitBlanc(i) * Math.sin((Math.PI * t) / 0.22) * 0.12;
        return (glide + whoosh) * env;
    });
}

function convertirOgg(ffmpeg, cheminWav, cheminOgg) {
    executerFfmpeg(ffmpeg, [
        '-y',
        '-i',
        cheminWav,
        '-af',
        'loudnorm=I=-16:TP=-1.5',
        '-ar',
        '48000',
        '-ac',
        '1',
        '-c:a',
        'libopus',
        '-b:a',
        '48k',
        cheminOgg,
    ]);
}

mkdirSync(OUT_DIR, { recursive: true });

const ffmpeg = trouverFfmpeg();
console.log('\n=== Generation SFX boss (samples) ===\n');

for (const [nom, generer] of Object.entries(GENERATEURS)) {
    const cheminWav = join(OUT_DIR, `${nom}.wav`);
    const pcm = generer();
    writeFileSync(cheminWav, encoderWav(pcm));
    const koWav = Math.round((statSync(cheminWav).size / 1024) * 10) / 10;
    process.stdout.write(`  ${nom}.wav (temp) — ${koWav} Ko`);

    if (ffmpeg) {
        const cheminOgg = join(OUT_DIR, `${nom}.ogg`);
        convertirOgg(ffmpeg, cheminWav, cheminOgg);
        const koOgg = Math.round((statSync(cheminOgg).size / 1024) * 10) / 10;
        process.stdout.write(` → ${nom}.ogg — ${koOgg} Ko`);
        unlinkSync(cheminWav);
        process.stdout.write(' (wav retire)');
    }
    process.stdout.write('\n');
}

if (!ffmpeg) {
    console.log('\nffmpeg absent — .wav temporaires conserves (decodeAudioData OK en local).');
}

console.log(
    '\nTermine. Relancez npm run sync:sw si le precache doit inclure les nouveaux fichiers.\n'
);
