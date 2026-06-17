import { store } from './store-core.js';
import { obtenirCanvas } from './dom-utils.js';
import { modeHistoireEnCours } from './mode-histoire.js';
import {
    obtenirParamsPortraitBossCombat,
    obtenirExpressionBossCombat,
} from './reactions-boss-portrait.js';
import { dessinerPortraitBossCombat } from './portraits-boss-combat.js';

/** @returns {'calme'|'irrite'|'enrage'|'attaque'|'vaincu'} */
function _obtenirEtatPortraitBoss() {
    if (store.histoire.boss.vaincu) return 'vaincu';
    if (store.histoire.boss._flashAttaque) return 'attaque';
    if (modeHistoireEnCours() && store.histoire.boss.actif) {
        const expr = obtenirExpressionBossCombat();
        if (expr === 'vacillant') return 'enrage';
        if (expr === 'agressif') return 'irrite';
        return 'calme';
    }
    const boss = store.histoire.boss.actif;
    if (!boss) return 'calme';
    const pct = (store.histoire.boss.pv / boss.pvMax) * 100;
    if (pct > 66) return 'calme';
    if (pct > 33) return 'irrite';
    return 'enrage';
}

function _appliquerClassePortraitBoss(etatPortrait) {
    const canvas = document.getElementById('canvas-boss-portrait');
    if (!canvas) return;
    canvas.classList.remove(
        'etat-calme',
        'etat-irrite',
        'etat-enrage',
        'etat-attaque',
        'etat-vaincu'
    );
    canvas.classList.add(`etat-${etatPortrait}`);
}

/** @param {number} timestamp */
export function rendrePortraitBoss(timestamp) {
    if (typeof document === 'undefined') return;
    const canvas = obtenirCanvas('canvas-boss-portrait');
    if (!canvas || !store.histoire.boss.actif) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    const etatPortrait = _obtenirEtatPortraitBoss();
    _appliquerClassePortraitBoss(etatPortrait);
    const t = timestamp / 1000;
    const paramsCombat = modeHistoireEnCours() ? obtenirParamsPortraitBossCombat(timestamp) : null;
    const intensite = paramsCombat
        ? paramsCombat.glow
        : etatPortrait === 'enrage'
          ? 1.6
          : etatPortrait === 'irrite'
            ? 1.25
            : 1;
    const vitesseAnim = paramsCombat?.vitesseAnim ?? 1;
    const tAnim = t * vitesseAnim;
    const echelle = paramsCombat?.echelle ?? 1;
    const vacillant = paramsCombat?.vacillant === true;

    if (store.histoire.boss.vaincu) {
        _dessinerFragmentationBoss(ctx, w, h, t);
        return;
    }

    const shakeX = vacillant
        ? Math.sin(t * 22) * 2
        : etatPortrait === 'enrage'
          ? Math.sin(t * 22) * 2
          : 0;
    const shakeY = vacillant
        ? Math.cos(t * 19) * 1.5
        : etatPortrait === 'enrage'
          ? Math.cos(t * 19) * 1.5
          : 0;
    ctx.save();
    ctx.translate(w / 2 + shakeX, h / 2 + shakeY);
    ctx.scale(echelle, echelle);
    ctx.translate(-w / 2, -h / 2);
    ctx.globalAlpha = Math.min(1, 0.85 + (intensite - 1) * 0.15);

    dessinerPortraitBossCombat(ctx, w, h, store.histoire.boss.actif.id, tAnim, {
        intensite,
        vacillant,
        vitesseAnim,
        echelle,
    });

    ctx.restore();

    if (etatPortrait === 'attaque') {
        ctx.save();
        ctx.globalAlpha = 0.35 + 0.25 * Math.sin(t * 30);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, w, h);
        ctx.restore();
    }
}

/** @param {CanvasRenderingContext2D} ctx @param {number} w @param {number} h @param {number} t */
function _dessinerFragmentationBoss(ctx, w, h, t) {
    ctx.fillStyle = '#050508';
    ctx.fillRect(0, 0, w, h);
    const couleur = store.histoire.boss.actif?.couleur ?? '#ff006e';
    const fragments = [
        { x: 0.2, y: 0.3, rot: 0.2, s: 0.18 },
        { x: 0.55, y: 0.25, rot: -0.4, s: 0.14 },
        { x: 0.75, y: 0.45, rot: 0.8, s: 0.12 },
        { x: 0.35, y: 0.6, rot: 1.2, s: 0.16 },
        { x: 0.6, y: 0.7, rot: -0.6, s: 0.13 },
    ];
    for (const f of fragments) {
        ctx.save();
        ctx.translate(w * f.x, h * (f.y + t * 0.02));
        ctx.rotate(f.rot + t * 0.5);
        ctx.fillStyle = couleur;
        ctx.globalAlpha = 0.7;
        ctx.fillRect(-w * f.s, -h * f.s * 0.6, w * f.s * 2, h * f.s * 1.2);
        ctx.restore();
    }
}
