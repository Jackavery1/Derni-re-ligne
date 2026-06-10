/**
 * rendu-fond-biome.js
 * Fonds texturés animés biomes pour l'écran de jeu Tetris.
 *
 * RÈGLE ABSOLUE : Math.random() UNIQUEMENT dans _initParticules().
 * Toutes les positions dans _boucle() sont f(timestamp, valeurs_init) — pas de mutation.
 */

import { dessinerMotifBiome } from './rendu-motifs-biome.js';
import { obtenirEffetsAccessibiliteReduits } from './accessibilite.js';
import { store } from './store-core.js';

// ─── Configs biomes ───────────────────────────────────────────────────────────

const CONFIGS = {
    monde_prologue: {
        fond: ['#04030f', '#08071a'],
        motif: 'circuits',
        couleurMotif: 'rgba(0,200,180,0.07)',
        particules: { n: 12, couleur: '#00ddc8', type: 'circuit_spark', ampX: 6, vy: 0.5 },
    },
    monde_lave: {
        fond: ['#130100', '#260400'],
        motif: 'cracks_lave',
        couleurMotif: 'rgba(255,90,0,0.14)',
        particules: { n: 22, couleur: '#ff5500', type: 'braise', ampX: 9, vy: 1.2 },
    },
    monde_rouille: {
        fond: ['#110600', '#1e0a00'],
        motif: 'metal_plaques',
        couleurMotif: 'rgba(155,55,0,0.10)',
        particules: { n: 8, couleur: '#a03800', type: 'eclat', ampX: 4, vy: 0.4 },
    },
    monde_boss_1: {
        fond: ['#100000', '#250200'],
        motif: 'braises_fond',
        couleurMotif: 'rgba(255,40,0,0.16)',
        particules: { n: 32, couleur: '#ff6600', type: 'flamme', ampX: 13, vy: 1.5 },
    },
    monde_ocean: {
        fond: ['#010810', '#020f1e'],
        motif: 'fond_marin',
        couleurMotif: 'rgba(0,70,160,0.09)',
        particules: { n: 20, couleur: '#0066cc', type: 'bulle', ampX: 4, vy: 0.5 },
    },
    monde_foret: {
        fond: ['#020802', '#041404'],
        motif: 'troncs',
        couleurMotif: 'rgba(0,120,10,0.09)',
        particules: { n: 14, couleur: '#33aa33', type: 'feuille', ampX: 22, vy: 0.4 },
    },
    monde_glace: {
        fond: ['#030a10', '#05121c'],
        motif: 'cristaux',
        couleurMotif: 'rgba(140,210,255,0.09)',
        particules: { n: 16, couleur: '#99ccff', type: 'flocon', ampX: 6, vy: 0.4 },
    },
    monde_boss_2: {
        fond: ['#030508', '#050b12'],
        motif: 'blizzard_fond',
        couleurMotif: 'rgba(200,230,255,0.06)',
        particules: { n: 45, couleur: '#bbddff', type: 'neige', ampX: 0, vy: 1.8 },
    },
    monde_desert: {
        fond: ['#100900', '#1c1100'],
        motif: 'dunes',
        couleurMotif: 'rgba(190,140,40,0.09)',
        particules: { n: 28, couleur: '#bb9933', type: 'grain', ampX: 2, vy: 0.0 },
    },
    monde_eclipse: {
        fond: ['#060008', '#0b0014'],
        motif: 'eclipse',
        couleurMotif: 'rgba(110,0,200,0.10)',
        particules: { n: 14, couleur: '#9933ff', type: 'rayon', ampX: 0, vy: 0.0 },
    },
    monde_cyber: {
        fond: ['#010610', '#020c1c'],
        motif: 'circuit_board',
        couleurMotif: 'rgba(0,170,190,0.09)',
        particules: { n: 20, couleur: '#00bbdd', type: 'pluie_data', ampX: 0, vy: 1.0 },
    },
    monde_boss_3: {
        fond: ['#040010', '#080020'],
        motif: 'archives',
        couleurMotif: 'rgba(150,60,255,0.10)',
        particules: { n: 18, couleur: '#bb88ff', type: 'pluie_data', ampX: 0, vy: 0.7 },
    },
    monde_fuochi: {
        fond: ['#100100', '#200300'],
        motif: 'roche_volcanique',
        couleurMotif: 'rgba(255,80,0,0.12)',
        particules: { n: 26, couleur: '#ff4400', type: 'flamme', ampX: 11, vy: 1.3 },
    },
    monde_cosmos: {
        fond: ['#010008', '#030014'],
        motif: 'nebuleuse',
        couleurMotif: 'rgba(60,0,150,0.07)',
        particules: { n: 7, couleur: '#ffddaa', type: 'etoile_filante', ampX: 0, vy: 0.0 },
    },
    monde_vide: {
        fond: ['#000000', '#010106'],
        motif: 'grille_distordue',
        couleurMotif: 'rgba(70,70,70,0.05)',
        particules: { n: 14, couleur: '#333355', type: 'onde', ampX: 0, vy: 0.0 },
    },
    monde_boss_4: {
        fond: ['#040010', '#07001c'],
        motif: 'fractales',
        couleurMotif: 'rgba(255,80,255,0.08)',
        particules: { n: 24, couleur: null, type: 'energie', ampX: 0, vy: 0.0 },
    },
    monde_finale: {
        fond: ['#06061a', '#0a0a20'],
        motif: 'distorsion',
        couleurMotif: 'rgba(255,0,100,0.07)',
        particules: { n: 20, couleur: '#ff0080', type: 'glitch', ampX: 0, vy: 0.0 },
    },
};

const ALIAS = {
    lave: 'monde_lave',
    ocean: 'monde_ocean',
    foret: 'monde_foret',
    glace: 'monde_glace',
    desert: 'monde_desert',
    eclipse: 'monde_eclipse',
    cyber: 'monde_cyber',
    fuochi: 'monde_fuochi',
    cosmos: 'monde_cosmos',
    vide: 'monde_vide',
};

let _canvas = null;
let _ctx = null;
let _couche = null;
let _biomeCourant = null;
let _particules = [];
let _rafId = null;
let _actif = false;

export function demarrerFondBiome(biomeId) {
    const cle = ALIAS[biomeId] ?? biomeId;
    if (!CONFIGS[cle]) return;

    _canvas = /** @type {HTMLCanvasElement | null} */ (
        document.getElementById('canvas-fond-biome')
    );
    if (!_canvas) return;
    _ctx = _canvas.getContext('2d');

    _ajusterDimensions();

    if (_biomeCourant !== cle || !_couche) {
        _biomeCourant = cle;
        _genererCouche(CONFIGS[cle]);
        _initParticules(CONFIGS[cle]);
    }

    if (!_actif) {
        _actif = true;
        requestAnimationFrame(_boucle);
    }
}

export function arreterFondBiome() {
    _actif = false;
    if (_rafId) {
        cancelAnimationFrame(_rafId);
        _rafId = null;
    }
    if (_ctx && _canvas) _ctx.clearRect(0, 0, _canvas.width, _canvas.height);
}

export function invaliderCacheFond() {
    _couche = null;
    _biomeCourant = null;
}

function _ajusterDimensions() {
    const parent = _canvas.parentElement ?? document.body;
    const w = parent.clientWidth || window.innerWidth;
    const h = parent.clientHeight || window.innerHeight;
    if (_canvas.width !== w || _canvas.height !== h) {
        _canvas.width = w;
        _canvas.height = h;
        _couche = null;
    }
}

function _genererCouche(config) {
    const w = _canvas.width,
        h = _canvas.height;
    _couche = new OffscreenCanvas(w, h);
    const c = _couche.getContext('2d');

    const g = c.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, config.fond[0]);
    g.addColorStop(1, config.fond[1]);
    c.fillStyle = g;
    c.fillRect(0, 0, w, h);

    c.strokeStyle = config.couleurMotif;
    c.fillStyle = config.couleurMotif;
    c.lineWidth = 1.5;
    dessinerMotifBiome(c, config.motif, w, h);
}

function _initParticules(config) {
    const w = _canvas.width,
        h = _canvas.height;
    const p = config.particules;
    _particules = [];
    for (let i = 0; i < p.n; i++) {
        _particules.push({
            x0: Math.random() * w,
            y0: Math.random() * h,
            decalY: Math.random() * h,
            decalX: Math.random() * w,
            offset: Math.random() * Math.PI * 2,
            vitesse: 0.5 + Math.random() * 1.0,
            ampX: p.ampX * (0.5 + Math.random() * 1.0),
            taille: 1.5 + Math.random() * 2.5,
            teinte: Math.random() * 360,
            longueur: 60 + Math.random() * 100,
            angle: (i / p.n) * Math.PI * 2,
        });
    }
}

function _boucle(ts) {
    if (!_actif) return;
    _rafId = requestAnimationFrame(_boucle);

    _ajusterDimensions();
    const w = _canvas.width,
        h = _canvas.height;

    if (_couche) {
        _ctx.drawImage(_couche, 0, 0);
    } else if (_biomeCourant) {
        _genererCouche(CONFIGS[_biomeCourant]);
        _ctx.drawImage(_couche, 0, 0);
    }

    const config = CONFIGS[_biomeCourant];
    if (!config) return;

    _ctx.save();
    const reduits = obtenirEffetsAccessibiliteReduits();
    const facteurAmp = reduits ? 1 / 3 : store.surtensionActive ? 1.25 : 1;
    _particules.forEach((p, i) => {
        if (reduits && i % 3 !== 0) return;
        const phase = 0.5 + 0.5 * Math.sin(ts * 0.001 * p.vitesse + p.offset);
        _ctx.globalAlpha = 0.3 + phase * 0.7;

        const type = config.particules.type;
        const couleur = config.particules.couleur;
        const ampX = p.ampX * facteurAmp;
        let x, y;

        switch (type) {
            case 'braise':
            case 'flamme': {
                x = p.x0 + Math.sin(ts * 0.0006 * p.vitesse + p.offset) * ampX;
                y = h - ((ts * 0.04 * p.vitesse + p.decalY) % (h * 1.1));
                const tF = p.taille * (type === 'flamme' ? 1 + phase * 0.6 : 1);
                _ctx.fillStyle = phase > 0.65 ? '#ffcc00' : couleur;
                _ctx.fillRect(x, y, tF, tF * 1.8);
                break;
            }
            case 'eclat': {
                x = p.x0 + Math.sin(ts * 0.0004 + p.offset) * ampX;
                y = (p.y0 + ts * 0.008 * p.vitesse) % h;
                _ctx.fillStyle = couleur;
                _ctx.fillRect(x, y, p.taille, p.taille);
                break;
            }
            case 'bulle': {
                x = p.x0 + Math.sin(ts * 0.0005 + p.offset) * ampX;
                y = h - ((ts * 0.02 * p.vitesse + p.decalY) % (h * 1.2));
                _ctx.strokeStyle = couleur;
                _ctx.lineWidth = 1;
                _ctx.beginPath();
                _ctx.arc(x, y, p.taille + 1, 0, Math.PI * 2);
                _ctx.stroke();
                break;
            }
            case 'feuille': {
                x = (((p.x0 - ts * 0.012 * p.vitesse + p.decalX) % w) + w) % w;
                y = p.y0 + Math.sin(ts * 0.001 * p.vitesse + p.offset) * 18 * facteurAmp;
                _ctx.fillStyle = couleur;
                _ctx.fillRect(x, y, p.taille, p.taille);
                break;
            }
            case 'flocon': {
                x = p.x0 + Math.sin(ts * 0.0005 + p.offset) * ampX;
                y = (p.decalY + ts * 0.008 * p.vitesse) % h;
                _ctx.strokeStyle = couleur;
                _ctx.lineWidth = 0.8;
                for (let b = 0; b < 4; b++) {
                    const a = (b / 4) * Math.PI * 2;
                    _ctx.beginPath();
                    _ctx.moveTo(x, y);
                    _ctx.lineTo(x + Math.cos(a) * 4, y + Math.sin(a) * 4);
                    _ctx.stroke();
                }
                break;
            }
            case 'neige': {
                x = (p.decalX + ts * 0.018 * p.vitesse) % w;
                y = p.y0 + Math.sin(ts * 0.0008 + p.offset) * 5;
                _ctx.fillStyle = couleur;
                _ctx.fillRect(x, y, p.taille, p.taille);
                break;
            }
            case 'grain': {
                x = (p.decalX + ts * 0.015 * p.vitesse) % w;
                y = p.y0 + Math.sin(ts * 0.001 + p.offset) * 4;
                _ctx.fillStyle = couleur;
                _ctx.fillRect(x, y, 1, 1);
                break;
            }
            case 'rayon': {
                const ang = p.angle + ts * 0.00008 * p.vitesse;
                const cx = w * 0.5,
                    cy = h * 0.22;
                const r0 = Math.min(w, h) * 0.1;
                _ctx.strokeStyle = couleur;
                _ctx.lineWidth = 1.2;
                _ctx.globalAlpha = phase * 0.28;
                _ctx.beginPath();
                _ctx.moveTo(cx + Math.cos(ang) * r0, cy + Math.sin(ang) * r0);
                _ctx.lineTo(
                    cx + Math.cos(ang) * (r0 + p.longueur * phase),
                    cy + Math.sin(ang) * (r0 + p.longueur * phase)
                );
                _ctx.stroke();
                break;
            }
            case 'pluie_data': {
                y = (p.decalY + ts * 0.025 * p.vitesse) % h;
                _ctx.fillStyle = couleur;
                _ctx.font = '9px monospace';
                _ctx.fillText(
                    String.fromCharCode(48 + ((i + Math.floor(ts * 0.01)) % 10)),
                    p.x0,
                    y
                );
                break;
            }
            case 'etoile_filante': {
                const cycle = (ts * 0.00015 * p.vitesse + p.offset / (Math.PI * 2)) % 1;
                if (cycle < 0.12) {
                    const prog = cycle / 0.12;
                    const ang = Math.PI * 0.28;
                    _ctx.strokeStyle = couleur;
                    _ctx.lineWidth = 1.5;
                    _ctx.globalAlpha = (1 - prog) * 0.85;
                    _ctx.beginPath();
                    _ctx.moveTo(p.x0, p.y0);
                    _ctx.lineTo(
                        p.x0 + Math.cos(ang) * p.longueur * prog,
                        p.y0 + Math.sin(ang) * p.longueur * prog
                    );
                    _ctx.stroke();
                }
                break;
            }
            case 'onde': {
                const r = (ts * 0.02 * p.vitesse + p.decalY * 0.5) % (Math.max(w, h) * 0.7);
                _ctx.strokeStyle = couleur;
                _ctx.lineWidth = 0.8;
                _ctx.globalAlpha = (1 - r / (Math.max(w, h) * 0.7)) * 0.22;
                _ctx.beginPath();
                _ctx.arc(w * 0.5, h * 0.5, r, 0, Math.PI * 2);
                _ctx.stroke();
                break;
            }
            case 'energie': {
                const ang = p.angle + ts * 0.001 * p.vitesse;
                const r = 100 + Math.sin(ts * 0.002 + p.offset) * 30;
                _ctx.fillStyle = `hsl(${p.teinte + ts * 0.05}, 100%, 60%)`;
                _ctx.fillRect(
                    w * 0.5 + Math.cos(ang) * r,
                    h * 0.5 + Math.sin(ang) * r,
                    p.taille + 1,
                    p.taille + 1
                );
                break;
            }
            case 'glitch': {
                const actif = Math.sin(ts * 0.003 * p.vitesse + p.offset) > 0.78;
                if (actif) {
                    const yg = (((p.y0 + Math.sin(ts * 0.0008 + p.offset) * 50) % h) + h) % h;
                    const xg = w * 0.15 + Math.abs(Math.sin(ts * 0.001 + p.offset)) * w * 0.7;
                    _ctx.fillStyle = couleur;
                    _ctx.globalAlpha = 0.18;
                    _ctx.fillRect(xg, yg, 60 + p.taille * 18, 2);
                }
                break;
            }
            case 'circuit_spark':
            default: {
                x = p.x0 + Math.sin(ts * 0.001 * p.vitesse + p.offset) * ampX;
                y = (p.decalY + ts * 0.01 * p.vitesse) % h;
                _ctx.fillStyle = couleur ?? '#ffffff';
                _ctx.fillRect(x, y, p.taille, p.taille);
            }
        }
    });
    _ctx.globalAlpha = 1;
    _ctx.restore();
}
