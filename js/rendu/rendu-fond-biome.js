import { dessinerMotifBiome } from './rendu-motifs-biome.js';
import { obtenirEffetsAccessibiliteReduits } from '../ui/accessibilite.js';
import { store } from '../etat/store-jeu.js';
import { resoudreConfigFondBiome, obtenirConfigFondBiome } from './rendu-fond-biome-donnees.js';
import {
    creerParticulesFondBiome,
    dessinerParticulesFondBiome,
} from './rendu-fond-biome-particules.js';

let _canvas = null;
let _ctx = null;
let _couche = null;
let _biomeCourant = null;
let _particules = [];
let _rafId = null;
let _actif = false;

export function demarrerFondBiome(biomeId) {
    const cle = resoudreConfigFondBiome(biomeId);
    if (!cle) return;

    _canvas = /** @type {HTMLCanvasElement | null} */ (
        document.getElementById('canvas-fond-biome')
    );
    if (!_canvas) return;
    _ctx = _canvas.getContext('2d');

    _ajusterDimensions();

    if (_biomeCourant !== cle || !_couche) {
        _biomeCourant = cle;
        _genererCouche(obtenirConfigFondBiome(cle));
        _particules = creerParticulesFondBiome(
            obtenirConfigFondBiome(cle),
            _canvas.width,
            _canvas.height
        );
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
    const w = _canvas.width;
    const h = _canvas.height;
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

function _boucle(ts) {
    if (!_actif) return;
    _rafId = requestAnimationFrame(_boucle);

    _ajusterDimensions();
    const w = _canvas.width;
    const h = _canvas.height;

    if (_couche) {
        _ctx.drawImage(_couche, 0, 0);
    } else if (_biomeCourant) {
        _genererCouche(obtenirConfigFondBiome(_biomeCourant));
        _ctx.drawImage(_couche, 0, 0);
    }

    const config = obtenirConfigFondBiome(_biomeCourant);
    if (!config) return;

    const reduits = obtenirEffetsAccessibiliteReduits();
    const facteurAmp = reduits ? 1 / 3 : store.surtensionActive ? 1.25 : 1;
    dessinerParticulesFondBiome(_ctx, config, _particules, ts, w, h, {
        reduits,
        facteurAmp,
    });
}
