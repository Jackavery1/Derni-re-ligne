let _idFrameFin = null;
let _finActuelle = null;

export function demarrerFondFin(finId) {
    arreterFondFin();
    _finActuelle = finId;
    const canvas = /** @type {HTMLCanvasElement | null} */ (
        document.getElementById('canvas-fin-bg')
    );
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    _idFrameFin = requestAnimationFrame(_boucleFondFin);
}

export function arreterFondFin() {
    if (_idFrameFin) {
        cancelAnimationFrame(_idFrameFin);
        _idFrameFin = null;
    }
    _finActuelle = null;
}

function _boucleFondFin(timestamp) {
    const canvas = /** @type {HTMLCanvasElement | null} */ (
        document.getElementById('canvas-fin-bg')
    );
    if (!canvas || !_finActuelle) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    _dessinerFondFin(ctx, canvas.width, canvas.height, timestamp);
    _idFrameFin = requestAnimationFrame(_boucleFondFin);
}

function _dessinerFondFin(ctx, w, h, timestamp) {
    ctx.clearRect(0, 0, w, h);
    switch (_finActuelle) {
        case 'fin_normale':
            _fondNormale(ctx, w, h, timestamp);
            break;
        case 'fin_vraie':
            _fondVraie(ctx, w, h, timestamp);
            break;
        case 'fin_secrete':
            _fondSecrete(ctx, w, h, timestamp);
            break;
    }
}

function _fondNormale(ctx, w, h, timestamp) {
    const t = timestamp / 1000;
    for (let i = 0; i < 60; i++) {
        const x = (((i * 73 + Math.sin(t * 0.1 + i) * 10) % w) + w) % w;
        const y = (i * 47) % h;
        const a = 0.04 + 0.04 * Math.sin(t * 0.5 + i * 0.8);
        ctx.fillStyle = `rgba(0,245,255,${a})`;
        ctx.beginPath();
        ctx.arc(x, y, 1 + (i % 3) * 0.5, 0, Math.PI * 2);
        ctx.fill();
    }
}

function _fondVraie(ctx, w, h, timestamp) {
    const t = timestamp / 1200;
    ctx.save();
    ctx.lineWidth = 0.6;
    for (let i = 0; i < 12; i++) {
        const phase = (i / 12) * Math.PI * 2;
        const offset = Math.sin(t + phase) * h * 0.08;
        const y0 = (h / 12) * i + offset;
        const alpha = 0.05 + 0.03 * Math.abs(Math.sin(t + phase));
        ctx.strokeStyle = i % 2 === 0 ? `rgba(0,255,136,${alpha})` : `rgba(255,0,110,${alpha})`;
        ctx.beginPath();
        ctx.moveTo(0, y0);
        for (let x = 0; x <= w; x += 8) {
            const wave = Math.sin((x / w) * Math.PI * 4 + t + phase) * 18;
            ctx.lineTo(x, y0 + wave);
        }
        ctx.stroke();
    }
    ctx.restore();
}

function _fondSecrete(ctx, w, h, timestamp) {
    const t = timestamp / 1000;
    for (let i = 0; i < 30; i++) {
        const col = Math.floor((i * 37) % 10);
        const frac = (t * 0.08 + i * 0.07) % 1;
        const x = (col / 10) * w + (w / 10) * 0.1;
        const y = frac * h;
        const size = (w / 10) * 0.75;
        const hue = (i * 36 + t * 30) % 360;
        const a = Math.sin(frac * Math.PI) * 0.09;
        ctx.fillStyle = `hsla(${hue},100%,65%,${a})`;
        ctx.fillRect(x, y, size, size);
    }
    const glow = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, h * 0.5);
    glow.addColorStop(0, 'rgba(255,230,0,0.06)');
    glow.addColorStop(0.5, 'rgba(255,230,0,0.02)');
    glow.addColorStop(1, 'transparent');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, w, h);
}
