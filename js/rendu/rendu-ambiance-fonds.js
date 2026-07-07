import { particulesAmbiance } from '../etat/store-jeu.js';

export function dessinerFondLave(ctx2d, w, h, t) {
    const lueur = ctx2d.createRadialGradient(w / 2, h, 0, w / 2, h, w * 0.9);
    lueur.addColorStop(0, `rgba(255,69,0,${0.12 + Math.sin(t * 0.7) * 0.05})`);
    lueur.addColorStop(1, 'rgba(0,0,0,0)');
    ctx2d.fillStyle = lueur;
    ctx2d.fillRect(0, 0, w, h);

    ctx2d.save();
    for (let k = 0; k < 3; k++) {
        ctx2d.beginPath();
        ctx2d.moveTo(0, h);
        for (let x = 0; x <= w; x += 3) {
            const y =
                h * (0.78 + k * 0.07) + Math.sin((x / w) * Math.PI * 3 + t * (0.4 + k * 0.15)) * 8;
            if (x === 0) ctx2d.moveTo(x, y);
            else ctx2d.lineTo(x, y);
        }
        ctx2d.lineTo(w, h);
        ctx2d.lineTo(0, h);
        ctx2d.closePath();
        ctx2d.fillStyle = `rgba(${180 + k * 20},${40 + k * 10},0,${0.08 - k * 0.02})`;
        ctx2d.fill();
    }
    ctx2d.restore();
}

export function dessinerFondOcean(ctx2d, w, h, t) {
    for (let i = 0; i < particulesAmbiance.length; i++) {
        const p = particulesAmbiance[i];
        if (!p.actif || p.type !== 'rayon_eau') continue;
        ctx2d.save();
        const grad = ctx2d.createLinearGradient(p.x - p.taille / 2, 0, p.x + p.taille / 2, h);
        grad.addColorStop(0, `rgba(0,180,255,${p.opacite})`);
        grad.addColorStop(0.6, `rgba(0,100,200,${p.opacite * 0.3})`);
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx2d.fillStyle = grad;
        ctx2d.transform(1, 0, Math.sin(t * 0.2 + p.sinPhase) * 0.15, 1, 0, 0);
        ctx2d.fillRect(p.x - p.taille / 2, 0, p.taille, h);
        ctx2d.restore();
    }

    ctx2d.save();
    ctx2d.globalAlpha = 0.025;
    ctx2d.fillStyle = '#000000';
    for (let y = 0; y < h; y += 4) {
        ctx2d.fillRect(0, y, w, 1);
    }
    ctx2d.restore();
}

export function dessinerFondForet(ctx2d, w, h, t) {
    for (let i = 0; i < 4; i++) {
        const bx = w * (0.15 + i * 0.22) + Math.sin(t * 0.2 + i) * 8;
        const by = h * 0.15 + Math.sin(t * 0.15 + i * 1.3) * 15;
        const br = 25 + Math.sin(t * 0.3 + i * 0.7) * 8;
        const bokeh = ctx2d.createRadialGradient(bx, by, 0, bx, by, br);
        bokeh.addColorStop(0, `rgba(180,230,100,${0.06 + i * 0.01})`);
        bokeh.addColorStop(1, 'rgba(0,0,0,0)');
        ctx2d.fillStyle = bokeh;
        ctx2d.fillRect(0, 0, w, h);
    }
    const brume = ctx2d.createLinearGradient(0, h * 0.7, 0, h);
    brume.addColorStop(0, 'rgba(0,80,20,0)');
    brume.addColorStop(1, 'rgba(0,60,10,0.08)');
    ctx2d.fillStyle = brume;
    ctx2d.fillRect(0, 0, w, h);
}

export function dessinerFondGlace(ctx2d, w, h, t) {
    for (let i = 0; i < 3; i++) {
        const ax = w * (0.2 + i * 0.3);
        const ay = h * 0.08;
        const hue = 160 + i * 30;
        const aurora = ctx2d.createRadialGradient(ax, ay, 0, ax, ay, h * 0.35);
        aurora.addColorStop(0, `hsla(${hue},80%,70%,${0.04 + Math.sin(t * 0.3 + i) * 0.02})`);
        aurora.addColorStop(1, 'rgba(0,0,0,0)');
        ctx2d.fillStyle = aurora;
        ctx2d.fillRect(0, 0, w, h);
    }
    const brume = ctx2d.createLinearGradient(0, h * 0.8, 0, h);
    brume.addColorStop(0, 'rgba(170,220,255,0)');
    brume.addColorStop(1, 'rgba(200,240,255,0.06)');
    ctx2d.fillStyle = brume;
    ctx2d.fillRect(0, 0, w, h);
}

export function dessinerFondDesert(ctx2d, w, h, t) {
    const soleil = ctx2d.createRadialGradient(w * 0.75, h * 0.05, 0, w * 0.75, h * 0.05, h * 0.5);
    soleil.addColorStop(0, `rgba(255,200,50,${0.08 + Math.sin(t * 0.4) * 0.02})`);
    soleil.addColorStop(1, 'rgba(0,0,0,0)');
    ctx2d.fillStyle = soleil;
    ctx2d.fillRect(0, 0, w, h);

    ctx2d.save();
    ctx2d.globalAlpha = 0.015;
    ctx2d.strokeStyle = '#ffaa00';
    ctx2d.lineWidth = 0.5;
    for (let y = h * 0.5; y < h; y += 8) {
        ctx2d.beginPath();
        for (let x = 0; x <= w; x += 4) {
            const dy = Math.sin((x / w) * Math.PI * 6 + t * 1.5) * 1.2;
            if (x === 0) ctx2d.moveTo(x, y + dy);
            else ctx2d.lineTo(x, y + dy);
        }
        ctx2d.stroke();
    }
    ctx2d.restore();
}

export function dessinerFondCyber(ctx2d, w, h, t) {
    ctx2d.save();
    ctx2d.globalAlpha = 0.04;
    ctx2d.strokeStyle = '#ff00ff';
    ctx2d.lineWidth = 0.5;
    const espH = 20;
    for (let y = 0; y < h; y += espH) {
        ctx2d.beginPath();
        ctx2d.moveTo(0, y);
        ctx2d.lineTo(w, y);
        ctx2d.stroke();
    }
    for (let x = 0; x < w; x += espH) {
        ctx2d.beginPath();
        ctx2d.moveTo(x, 0);
        ctx2d.lineTo(x, h);
        ctx2d.stroke();
    }
    ctx2d.restore();

    const lueur = ctx2d.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, h * 0.7);
    lueur.addColorStop(0, `rgba(180,0,255,${0.04 + Math.sin(t * 1.2) * 0.02})`);
    lueur.addColorStop(1, 'rgba(0,0,0,0)');
    ctx2d.fillStyle = lueur;
    ctx2d.fillRect(0, 0, w, h);
}

export function dessinerFondFuochi(ctx2d, w, h, t) {
    const coulsFuochi = [
        { hx: w * 0.2, hy: h * 0.3, coul: '#ff2244' },
        { hx: w * 0.8, hy: h * 0.2, coul: '#ffe600' },
        { hx: w * 0.5, hy: h * 0.6, coul: '#00aaff' },
    ];
    for (let i = 0; i < coulsFuochi.length; i++) {
        const { hx, hy, coul } = coulsFuochi[i];
        const halo = ctx2d.createRadialGradient(
            hx + Math.sin(t * 0.4) * 15,
            hy + Math.cos(t * 0.3) * 10,
            0,
            hx,
            hy,
            h * 0.4
        );
        halo.addColorStop(
            0,
            `${coul}${Math.floor(8 + Math.sin(t) * 3)
                .toString(16)
                .padStart(2, '0')}`
        );
        halo.addColorStop(1, 'rgba(0,0,0,0)');
        ctx2d.fillStyle = halo;
        ctx2d.fillRect(0, 0, w, h);
    }
}

export function dessinerFondCosmos(ctx2d, w, h, t) {
    const neb = ctx2d.createRadialGradient(
        w / 2 + Math.sin(t * 0.1) * 20,
        h / 2 + Math.cos(t * 0.08) * 15,
        0,
        w / 2,
        h / 2,
        h * 0.65
    );
    neb.addColorStop(0, `rgba(80,0,200,${0.08 + Math.sin(t * 0.2) * 0.02})`);
    neb.addColorStop(0.4, `rgba(0,50,180,${0.04 + Math.sin(t * 0.15) * 0.01})`);
    neb.addColorStop(1, 'rgba(0,0,0,0)');
    ctx2d.fillStyle = neb;
    ctx2d.fillRect(0, 0, w, h);
}
