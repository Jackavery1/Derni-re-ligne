import { CONFIG } from './config.js';
import { AudioMoteur } from './audio.js';
import { TONIQUES_BIOMES } from './audio-donnees.js';
import { etat, obtenirBiomeActif } from './store-jeu.js';
import { creerContexteAudio } from './dom-utils.js';
import { obtenirCanvas } from './dom-utils.js';

const GAMME_PENTA = [1, 9 / 8, 5 / 4, 3 / 2, 5 / 3];
const OCTAVES = 2;

const MAP_TIMBRE = {
    '#00f5ff': 'sine',
    '#ffe600': 'triangle',
    '#b400ff': 'sawtooth',
    '#00ff88': 'sine',
    '#ff006e': 'square',
    '#4488ff': 'sine',
    '#ff8800': 'sawtooth',
};

export const melodie = {
    notes: [],
    biome: null,
    titre: '',
    enLecture: false,
    timeoutLecture: null,
    timeoutsLecture: [],
    noteActive: -1,
};

export function reinitialiserMelodie() {
    arreterLectureMelodie();
    melodie.notes = [];
    melodie.biome = obtenirBiomeActif();
    melodie.titre = '';
    masquerBlocMelodie();
}

export function masquerBlocMelodie() {
    if (typeof document === 'undefined') return;
    const bloc = document.getElementById('bloc-melodie');
    if (bloc) bloc.style.display = 'none';
}

function couleurDominanteLigne(numeroLigne) {
    const comptage = {};
    for (let c = 0; c < CONFIG.colonnes; c++) {
        const col = etat.plateau[numeroLigne][c];
        if (col && col !== 0) {
            comptage[col] = (comptage[col] || 0) + 1;
        }
    }
    let maxCouleur = '#00f5ff';
    let maxCount = 0;
    for (const [coul, cnt] of Object.entries(comptage)) {
        if (cnt > maxCount) {
            maxCount = cnt;
            maxCouleur = coul;
        }
    }
    return maxCouleur;
}

export function ligneVersFrequence(numeroLigne) {
    const tonique = TONIQUES_BIOMES[melodie.biome ?? obtenirBiomeActif()] ?? 220;
    const totalNotes = GAMME_PENTA.length * OCTAVES;
    const index = Math.round((1 - numeroLigne / (CONFIG.lignes - 1)) * (totalNotes - 1));
    const octave = Math.floor(index / GAMME_PENTA.length);
    const degre = index % GAMME_PENTA.length;
    return tonique * Math.pow(2, octave) * GAMME_PENTA[degre];
}

export function couleurVersTimbre(couleurHex) {
    if (MAP_TIMBRE[couleurHex]) return MAP_TIMBRE[couleurHex];
    const n = parseInt(couleurHex.replace('#', ''), 16);
    const r = (n >> 16) & 255;
    const g = (n >> 8) & 255;
    const b = n & 255;
    if (r > g && r > b) return 'sawtooth';
    if (g > r && g > b) return 'sine';
    if (b > r && b > g) return 'triangle';
    return 'sine';
}

export function enregistrerNotesLignesCompletes() {
    const lignesCompletes = [];
    for (let l = CONFIG.lignes - 1; l >= 0; l--) {
        if (etat.plateau[l].every((c) => c !== 0)) lignesCompletes.push(l);
    }
    for (const l of lignesCompletes) {
        const couleurDom = couleurDominanteLigne(l);
        melodie.notes.push({
            frequence: ligneVersFrequence(l),
            timbre: couleurVersTimbre(couleurDom),
            couleur: couleurDom,
            duree: 0.35,
            ligne: l,
            timestamp: Date.now(),
        });
    }
}

export function genererTitreMelodie() {
    if (melodie.notes.length === 0) return '';

    const adjectifsBas = ['SOMBRE', 'PROFOND', 'GRAVE', 'LOURD', 'DENSE'];
    const adjectifsHaut = ['LÉGER', 'CRISTALLIN', 'AIGU', 'CÉLESTE', 'ÉTHÉRÉ'];
    const adjectifsMid = ['ÉQUILIBRÉ', 'FLUIDE', 'ONDULANT', 'VIVANT', 'ORGANIQUE'];

    const timbresNoms = {
        sine: ['RÊVERIE', 'MURMURE', 'VAGUE', 'BRUME'],
        triangle: ['CHALEUR', 'AMBRE', 'LUEUR', 'ÉCLAT'],
        sawtooth: ['FOUDRE', 'FRACAS', 'TEMPÊTE', 'ÉCLIPSE'],
        square: ['PIXEL', 'ARCADE', 'GLITCH', 'SIGNAL'],
    };

    const freqs = melodie.notes.map((n) => n.frequence);
    const minFreq = Math.min(...freqs);
    const maxFreq = Math.max(...freqs);
    const ambitus = maxFreq / minFreq;

    let adjectif;
    if (ambitus > 3) adjectif = adjectifsMid[Math.floor(Math.random() * adjectifsMid.length)];
    else if (minFreq < 300)
        adjectif = adjectifsBas[Math.floor(Math.random() * adjectifsBas.length)];
    else adjectif = adjectifsHaut[Math.floor(Math.random() * adjectifsHaut.length)];

    const comptTimbre = {};
    melodie.notes.forEach((n) => {
        comptTimbre[n.timbre] = (comptTimbre[n.timbre] || 0) + 1;
    });
    const timbreDom = Object.entries(comptTimbre).sort((a, b) => b[1] - a[1])[0][0];
    const motsTimbre = timbresNoms[timbreDom] || ['MÉLODIE'];
    const motTimbre = motsTimbre[Math.floor(Math.random() * motsTimbre.length)];
    const num = String(melodie.notes.length).padStart(3, '0');

    return `${adjectif} ${motTimbre} — OP.${num}`;
}

export function audioMelodieDisponible() {
    if (typeof window === 'undefined') return false;
    return !!(window.AudioContext || /** @type {any} */ (window).webkitAudioContext);
}

function obtenirContexteMelodie() {
    if (AudioMoteur.ctx) return AudioMoteur.ctx;
    return creerContexteAudio();
}

export function arreterLectureMelodie() {
    if (melodie.timeoutLecture) {
        clearTimeout(melodie.timeoutLecture);
        melodie.timeoutLecture = null;
    }
    melodie.timeoutsLecture.forEach((id) => clearTimeout(id));
    melodie.timeoutsLecture = [];
    melodie.enLecture = false;
    melodie.noteActive = -1;
    if (typeof document !== 'undefined') {
        dessinerPianoRoll();
        const btn = document.getElementById('btn-reecouter');
        if (btn) btn.textContent = '▶ RÉÉCOUTER';
    }
}

export function jouerMelodie() {
    if (melodie.notes.length === 0) return;
    if (melodie.enLecture) {
        arreterLectureMelodie();
        return;
    }

    const audioCtx = obtenirContexteMelodie();
    if (!audioCtx) return;

    if (audioCtx.state === 'suspended') audioCtx.resume();

    melodie.enLecture = true;
    if (typeof document !== 'undefined') {
        const btn = document.getElementById('btn-reecouter');
        if (btn) btn.textContent = '♪ EN COURS...';
    }

    const gainMaitre = audioCtx.createGain();
    gainMaitre.gain.value = 0.4;
    gainMaitre.connect(audioCtx.destination);

    let delaiCumul = 0.05;

    melodie.notes.forEach((note, index) => {
        const osc = audioCtx.createOscillator();
        const env = audioCtx.createGain();

        osc.type = note.timbre;
        osc.frequency.value = note.frequence;

        const t = audioCtx.currentTime + delaiCumul;
        env.gain.setValueAtTime(0, t);
        env.gain.linearRampToValueAtTime(0.6, t + 0.02);
        env.gain.linearRampToValueAtTime(0.4, t + 0.06);
        env.gain.setValueAtTime(0.4, t + note.duree - 0.05);
        env.gain.linearRampToValueAtTime(0, t + note.duree);

        osc.connect(env);
        env.connect(gainMaitre);
        osc.start(t);
        osc.stop(t + note.duree + 0.01);

        const delay = delaiCumul * 1000;
        const timeoutId = setTimeout(() => {
            surlignerNoteVisualisation(index);
        }, delay);
        melodie.timeoutsLecture.push(timeoutId);

        delaiCumul += note.duree * 0.7 + 0.05 + Math.random() * 0.08;
    });

    melodie.timeoutLecture = setTimeout(
        () => {
            arreterLectureMelodie();
        },
        delaiCumul * 1000 + 500
    );
}

export function surlignerNoteVisualisation(index) {
    melodie.noteActive = index;
    dessinerPianoRoll();
}

export function dessinerPianoRoll() {
    if (typeof document === 'undefined') return;
    const canvas = obtenirCanvas('canvas-melodie');
    if (!canvas || melodie.notes.length === 0) return;

    const ctx2 = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    ctx2.clearRect(0, 0, w, h);

    ctx2.strokeStyle = 'rgba(255,255,255,0.04)';
    ctx2.lineWidth = 0.5;
    for (let i = 0; i < 10; i++) {
        const y = (i / 10) * h;
        ctx2.beginPath();
        ctx2.moveTo(0, y);
        ctx2.lineTo(w, y);
        ctx2.stroke();
    }

    const nb = melodie.notes.length;
    const largNote = Math.max(4, Math.min(20, (w - 8) / nb - 2));
    const espNote = (w - 8) / nb;

    const freqs = melodie.notes.map((n) => n.frequence);
    const minFreq = Math.min(...freqs);
    const maxFreq = Math.max(...freqs);
    const range = maxFreq - minFreq || 1;

    melodie.notes.forEach((note, i) => {
        const x = 4 + i * espNote;
        const yNorm = 1 - (note.frequence - minFreq) / range;
        const yPos = 4 + yNorm * (h - 16);
        const hauteur = 6 + (note.duree / 0.35) * 4;
        const active = i === melodie.noteActive;

        ctx2.save();
        ctx2.shadowColor = note.couleur;
        ctx2.shadowBlur = active ? 14 : 6;
        ctx2.fillStyle = note.couleur;
        ctx2.globalAlpha = active ? 1 : 0.75;
        if (active) ctx2.filter = 'brightness(1.8)';
        ctx2.fillRect(x, yPos - hauteur / 2, largNote, hauteur);

        if (i < nb - 1) {
            const note2 = melodie.notes[i + 1];
            const yNorm2 = 1 - (note2.frequence - minFreq) / range;
            const yPos2 = 4 + yNorm2 * (h - 16);
            ctx2.strokeStyle = note.couleur + '44';
            ctx2.lineWidth = 0.8;
            ctx2.beginPath();
            ctx2.moveTo(x + largNote / 2, yPos);
            ctx2.lineTo(x + espNote + largNote / 2, yPos2);
            ctx2.stroke();
        }

        ctx2.restore();
    });
}

export function afficherMelodieGameOver() {
    if (typeof document === 'undefined') return;
    if (melodie.notes.length === 0) {
        masquerBlocMelodie();
        return;
    }

    melodie.titre = genererTitreMelodie();

    const bloc = document.getElementById('bloc-melodie');
    const titreEl = document.getElementById('melodie-titre-oeuvre');
    const btn = document.getElementById('btn-reecouter');

    if (!bloc || !titreEl) return;

    titreEl.textContent = melodie.titre;
    bloc.style.display = 'flex';

    if (btn) {
        btn.style.display = audioMelodieDisponible() ? '' : 'none';
        btn.textContent = '▶ RÉÉCOUTER';
    }

    melodie.noteActive = -1;
    setTimeout(dessinerPianoRoll, 100);
}
