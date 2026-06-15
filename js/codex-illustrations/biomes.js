export function dessinerIllustCircuits(ctx2d, w, h) {
    ctx2d.fillStyle = '#08081a';
    ctx2d.fillRect(0, 0, w, h);
    ctx2d.strokeStyle = '#00f5ff44';
    ctx2d.lineWidth = 1;
    for (let i = 0; i < 6; i++) {
        const x = (i / 5) * w;
        const y = (i / 5) * h;
        ctx2d.beginPath();
        ctx2d.moveTo(x, 0);
        ctx2d.lineTo(x, h);
        ctx2d.stroke();
        ctx2d.beginPath();
        ctx2d.moveTo(0, y);
        ctx2d.lineTo(w, y);
        ctx2d.stroke();
    }
    ctx2d.fillStyle = '#00f5ff';
    for (let i = 1; i < 5; i++) {
        for (let j = 1; j < 4; j++) {
            if ((i + j) % 2 === 0) {
                ctx2d.beginPath();
                ctx2d.arc((i / 5) * w, (j / 3) * h, 3, 0, Math.PI * 2);
                ctx2d.fill();
            }
        }
    }
}

export function dessinerIllustLave(ctx2d, w, h) {
    const grad = ctx2d.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#1a0400');
    grad.addColorStop(1, '#cc2200');
    ctx2d.fillStyle = grad;
    ctx2d.fillRect(0, 0, w, h);
    ctx2d.strokeStyle = '#ff4500';
    ctx2d.lineWidth = 2;
    ctx2d.shadowColor = '#ff4500';
    ctx2d.shadowBlur = 8;
    for (let k = 0; k < 3; k++) {
        ctx2d.beginPath();
        for (let x = 0; x <= w; x += 4) {
            const y = h * 0.5 + k * 15 + Math.sin((x / w) * Math.PI * 4 + k) * 12;
            if (x === 0) ctx2d.moveTo(x, y);
            else ctx2d.lineTo(x, y);
        }
        ctx2d.stroke();
    }
    ctx2d.shadowBlur = 0;
}

export function dessinerIllustOcean(ctx2d, w, h) {
    const grad = ctx2d.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#000d1a');
    grad.addColorStop(1, '#003366');
    ctx2d.fillStyle = grad;
    ctx2d.fillRect(0, 0, w, h);
    ctx2d.strokeStyle = '#00cfff66';
    ctx2d.lineWidth = 1;
    for (let i = 0; i < 12; i++) {
        const bx = (i * 73) % w;
        const by = h * 0.2 + ((i * 37) % (h * 0.7));
        const br = 3 + (i % 5);
        ctx2d.beginPath();
        ctx2d.arc(bx, by, br, 0, Math.PI * 2);
        ctx2d.stroke();
    }
    const rayGrad = ctx2d.createLinearGradient(0, 0, w * 0.6, h);
    rayGrad.addColorStop(0, 'rgba(0,180,255,0.12)');
    rayGrad.addColorStop(1, 'transparent');
    ctx2d.fillStyle = rayGrad;
    ctx2d.fillRect(0, 0, w, h);
}

export function dessinerIllustForet(ctx2d, w, h) {
    ctx2d.fillStyle = '#020f02';
    ctx2d.fillRect(0, 0, w, h);
    const troncs = [w * 0.2, w * 0.5, w * 0.8];
    troncs.forEach((tx) => {
        ctx2d.fillStyle = '#00aa22cc';
        ctx2d.shadowColor = '#00cc44';
        ctx2d.shadowBlur = 10;
        ctx2d.beginPath();
        ctx2d.arc(tx, h * 0.4, h * 0.22, 0, Math.PI * 2);
        ctx2d.fill();
        ctx2d.shadowBlur = 0;
        ctx2d.fillStyle = '#443322';
        ctx2d.fillRect(tx - 4, h * 0.55, 8, h * 0.45);
    });
}

export function dessinerIllustGlace(ctx2d, w, h) {
    const grad = ctx2d.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#030d14');
    grad.addColorStop(1, '#0a2030');
    ctx2d.fillStyle = grad;
    ctx2d.fillRect(0, 0, w, h);
    ctx2d.strokeStyle = '#aaeeffaa';
    ctx2d.lineWidth = 0.8;
    [
        [w * 0.3, h * 0.5],
        [w * 0.7, h * 0.3],
        [w * 0.5, h * 0.7],
    ].forEach(([cx, cy]) => {
        for (let a = 0; a < 6; a++) {
            const angle = (a / 6) * Math.PI * 2;
            const r = 20 + (a % 2) * 10;
            ctx2d.beginPath();
            ctx2d.moveTo(cx, cy);
            ctx2d.lineTo(cx + Math.cos(angle) * r, cy + Math.sin(angle) * r);
            ctx2d.stroke();
        }
    });
}

export function dessinerIllustDesert(ctx2d, w, h) {
    const grad = ctx2d.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#140800');
    grad.addColorStop(1, '#3d1a00');
    ctx2d.fillStyle = grad;
    ctx2d.fillRect(0, 0, w, h);
    ctx2d.fillStyle = '#c87320aa';
    ctx2d.beginPath();
    ctx2d.moveTo(0, h);
    ctx2d.bezierCurveTo(w * 0.25, h * 0.5, w * 0.5, h * 0.7, w * 0.75, h * 0.45);
    ctx2d.bezierCurveTo(w * 0.88, h * 0.3, w, h * 0.55, w, h);
    ctx2d.closePath();
    ctx2d.fill();
    ctx2d.fillStyle = '#ffbb4466';
    ctx2d.shadowColor = '#ffbb44';
    ctx2d.shadowBlur = 20;
    ctx2d.beginPath();
    ctx2d.arc(w * 0.8, h * 0.2, 18, 0, Math.PI * 2);
    ctx2d.fill();
    ctx2d.shadowBlur = 0;
}

export function dessinerIllustCyber(ctx2d, w, h) {
    ctx2d.fillStyle = '#0a000f';
    ctx2d.fillRect(0, 0, w, h);
    ctx2d.shadowBlur = 4;
    for (let c = 0; c < 16; c++) {
        const x = (c / 15) * w;
        const len = 10 + ((c * 17) % 40);
        const y = (c * 31) % (h - len);
        const hue = 280 + c * 10;
        ctx2d.fillStyle = `hsla(${hue},100%,65%,0.6)`;
        ctx2d.shadowColor = `hsl(${hue},100%,60%)`;
        ctx2d.fillRect(x - 1, y, 2, len);
    }
    ctx2d.shadowBlur = 0;
}

export function dessinerIllustFuochi(ctx2d, w, h) {
    ctx2d.fillStyle = '#02020a';
    ctx2d.fillRect(0, 0, w, h);
    [
        [w * 0.25, h * 0.35],
        [w * 0.75, h * 0.25],
        [w * 0.5, h * 0.55],
    ].forEach(([cx, cy], k) => {
        const couleurs = ['#ff2244', '#ffe600', '#00aaff'];
        ctx2d.strokeStyle = couleurs[k];
        ctx2d.shadowColor = couleurs[k];
        ctx2d.shadowBlur = 8;
        ctx2d.lineWidth = 1;
        for (let r = 0; r < 12; r++) {
            const a = (r / 12) * Math.PI * 2;
            const len = 15 + (r % 3) * 8;
            ctx2d.beginPath();
            ctx2d.moveTo(cx, cy);
            ctx2d.lineTo(cx + Math.cos(a) * len, cy + Math.sin(a) * len);
            ctx2d.stroke();
        }
    });
    ctx2d.shadowBlur = 0;
}

export function dessinerIllustCosmos(ctx2d, w, h) {
    ctx2d.fillStyle = '#000008';
    ctx2d.fillRect(0, 0, w, h);
    for (let i = 0; i < 40; i++) {
        const sx = (i * 73) % w;
        const sy = (i * 37) % h;
        const sr = 0.5 + (i % 3) * 0.5;
        ctx2d.fillStyle = `rgba(255,255,255,${0.3 + (i % 4) * 0.15})`;
        ctx2d.beginPath();
        ctx2d.arc(sx, sy, sr, 0, Math.PI * 2);
        ctx2d.fill();
    }
    const nebGrad = ctx2d.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, 50);
    nebGrad.addColorStop(0, 'rgba(100,0,255,0.25)');
    nebGrad.addColorStop(0.5, 'rgba(0,100,255,0.1)');
    nebGrad.addColorStop(1, 'transparent');
    ctx2d.fillStyle = nebGrad;
    ctx2d.fillRect(0, 0, w, h);
}
