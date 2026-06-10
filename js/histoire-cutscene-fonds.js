/** Fonds animes canvas cutscene. */
import { CONFIG_FOND_CUTSCENE } from './histoire-cutscene-config.js';

let _canvasBgCutscene = null;
let _ctxBg = null;
let _rafBg = null;
let _fondActif = null;

export function lierCanvasFondCutscene(canvas) {
    _canvasBgCutscene = canvas;
    _ctxBg = canvas?.getContext('2d') ?? null;
}

const FONDS_CUTSCENE = {
    scanlines(ctx, w, h, ts) {
        ctx.strokeStyle = 'rgba(0,221,200,0.12)';
        ctx.lineWidth = 1;
        const decal = (ts * 0.03) % 12;
        for (let y = -12 + decal; y < h; y += 12) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(w, y);
            ctx.stroke();
        }
        ctx.fillStyle = 'rgba(0,221,200,0.08)';
        for (let i = 0; i < 30; i++) {
            const phase = Math.abs(Math.sin(ts * 0.0008 + i * 0.7));
            if (phase > 0.8) {
                const x = Math.abs(Math.sin(i * 137) * w);
                const y = Math.abs(Math.sin(i * 89) * h);
                ctx.fillRect(x, y, 2, 2);
            }
        }
    },
    orbites(ctx, w, h, ts) {
        const cx = w * 0.5;
        const cy = h * 0.45;
        for (let i = 0; i < 6; i++) {
            const ang = ts * 0.0006 * (i % 2 === 0 ? 1 : -0.7) + i * 1.05;
            const rx = 180 + i * 40;
            const ry = 100 + i * 20;
            const x = cx + Math.cos(ang) * rx;
            const y = cy + Math.sin(ang) * ry;
            const alpha = 0.15 + 0.15 * Math.abs(Math.sin(ts * 0.001 + i));
            ctx.strokeStyle = `rgba(255,153,255,${alpha})`;
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.arc(x, y, 6 + i * 2, 0, Math.PI * 2);
            ctx.stroke();
        }
    },
    vortex(ctx, w, h, ts) {
        const cx = w * 0.5;
        const cy = h * 0.45;
        for (let i = 0; i < 5; i++) {
            const r = 60 + i * 50 + Math.sin(ts * 0.001 + i) * 20;
            const a = ts * 0.0008 * (i % 2 === 0 ? 1 : -1) + i;
            const alpha = 0.08 + 0.05 * i;
            ctx.strokeStyle = `rgba(153,68,255,${alpha})`;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(cx + Math.sin(a) * 15, cy + Math.cos(a) * 10, r, a, a + Math.PI * 1.6);
            ctx.stroke();
        }
        if (Math.sin(ts * 0.002) > 0.7) {
            const y = (ts * 0.05) % h;
            ctx.fillStyle = 'rgba(255,0,200,0.12)';
            ctx.fillRect(0, y, w, 2);
        }
    },
    terminal(ctx, w, h, ts) {
        ctx.font = '10px monospace';
        ctx.fillStyle = 'rgba(68,255,136,0.18)';
        for (let i = 0; i < 15; i++) {
            const y = (i * 77 + ts * 0.04) % h;
            const x = (i * 137) % w;
            ctx.fillText(String.fromCharCode(48 + ((i + Math.floor(ts * 0.01)) % 62)), x, y);
        }
    },
    flammes(ctx, w, h, ts) {
        const puls = 0.5 + 0.5 * Math.sin(ts * 0.003);
        ctx.fillStyle = `rgba(255,100,0,${puls * 0.08})`;
        ctx.fillRect(0, 0, w, h);
        for (let i = 0; i < 8; i++) {
            const yb = h * (0.5 + i * 0.07);
            ctx.strokeStyle = 'rgba(255,80,0,0.07)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(0, yb);
            for (let x = 0; x <= w; x += 20) {
                ctx.lineTo(x, yb + Math.sin(x * 0.03 + ts * 0.002) * 8);
            }
            ctx.stroke();
        }
    },
    neige(ctx, w, h, ts) {
        ctx.fillStyle = 'rgba(180,220,255,0.25)';
        for (let i = 0; i < 25; i++) {
            const x = (i * 137 + ts * 0.015 * ((i % 3) + 1)) % w;
            const y = (i * 89 + ts * 0.008 * ((i % 2) + 0.5)) % h;
            ctx.fillRect(x, y, 2, 2);
        }
    },
    pluie_data(ctx, w, h, ts) {
        ctx.font = '9px monospace';
        for (let i = 0; i < 20; i++) {
            const y = (i * 57 + ts * 0.025 * (0.5 + i * 0.07)) % h;
            const alpha = 0.08 + 0.08 * Math.abs(Math.sin(ts * 0.001 + i));
            ctx.fillStyle = `rgba(200,136,255,${alpha})`;
            ctx.fillText(
                String.fromCharCode(48 + ((i + Math.floor(ts * 0.008)) % 62)),
                (i * 97) % w,
                y
            );
        }
    },
    energie(ctx, w, h, ts) {
        for (let i = 0; i < 8; i++) {
            const ang = ts * 0.001 * (i % 2 === 0 ? 0.8 : -0.6) + i * 0.8;
            const r = 100 + Math.sin(ts * 0.0015 + i) * 40;
            const x = w * 0.5 + Math.cos(ang) * r;
            const y = h * 0.45 + Math.sin(ang) * r * 0.6;
            ctx.fillStyle = `hsla(${i * 45 + ts * 0.05},100%,60%,0.12)`;
            ctx.fillRect(x, y, 4, 4);
        }
    },
};

function _fondEtoilesDefaut(ctx, w, h, ts) {
    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    for (let i = 0; i < 40; i++) {
        const puls = 0.5 + 0.5 * Math.sin(ts * 0.0005 * ((i % 5) + 1) + i * 0.6);
        ctx.globalAlpha = puls * 0.3;
        ctx.fillRect(
            (i * 127) % w,
            (i * 89) % h,
            1 + (i % 4 === 0 ? 1 : 0),
            1 + (i % 7 === 0 ? 1 : 0)
        );
    }
    ctx.globalAlpha = 1;
}

function _boucleFondCutscene(ts) {
    if (!_fondActif || !_ctxBg) return;
    _rafBg = requestAnimationFrame(_boucleFondCutscene);
    if (document.hidden) return;

    const w = _canvasBgCutscene.width;
    const h = _canvasBgCutscene.height;
    _ctxBg.clearRect(0, 0, w, h);

    _ctxBg.fillStyle = 'rgba(4,4,20,0.85)';
    _ctxBg.fillRect(0, 0, w, h);

    const dessiner = FONDS_CUTSCENE[_fondActif.type] ?? _fondEtoilesDefaut;
    dessiner(_ctxBg, w, h, ts);
}

export function demarrerFondCutscene(personnageId) {
    if (!_ctxBg || !_canvasBgCutscene) return;
    _fondActif = CONFIG_FOND_CUTSCENE[personnageId] ?? CONFIG_FOND_CUTSCENE.narrateur;
    _canvasBgCutscene.width = window.innerWidth;
    _canvasBgCutscene.height = window.innerHeight;
    if (!_rafBg) _rafBg = requestAnimationFrame(_boucleFondCutscene);
}

export function stopFondCutscene() {
    if (_rafBg) {
        cancelAnimationFrame(_rafBg);
        _rafBg = null;
    }
    _fondActif = null;
    if (_ctxBg && _canvasBgCutscene) {
        _ctxBg.clearRect(0, 0, _canvasBgCutscene.width, _canvasBgCutscene.height);
    }
}

export function estFondCutsceneActif() {
    return _rafBg != null;
}
