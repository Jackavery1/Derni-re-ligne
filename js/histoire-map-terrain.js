export function dessinerTerrainRiche(ctxCarte, w, h, timestamp, positionsNoeuds) {
    const t = timestamp / 1000;

    function yZone(id) {
        return positionsNoeuds[id]?.y ?? h / 2;
    }

    {
        for (let bras = 0; bras < 2; bras++) {
            const angle0 = bras * Math.PI + t * 0.01;
            ctxCarte.save();
            ctxCarte.translate(w * 0.5, h * 0.5);
            ctxCarte.globalAlpha = 0.03;
            for (let i = 0; i < 60; i++) {
                const angle = angle0 + i * 0.15;
                const r = 40 + i * 8;
                const sx = Math.cos(angle) * r;
                const sy = Math.sin(angle) * r * 0.4;
                ctxCarte.fillStyle = i % 3 === 0 ? '#aa88ff' : '#ffffff';
                ctxCarte.beginPath();
                ctxCarte.arc(sx, sy, 1 + (i % 4) * 0.3, 0, Math.PI * 2);
                ctxCarte.fill();
            }
            ctxCarte.restore();
        }
    }

    {
        const yC = (yZone('monde_lave') + yZone('monde_boss_1')) / 2;

        ctxCarte.save();
        ctxCarte.fillStyle = '#1a0500';
        ctxCarte.beginPath();
        ctxCarte.ellipse(w * 0.5, yC, w * 0.7, h * 0.14, 0, 0, Math.PI * 2);
        ctxCarte.fill();

        const couleesLave = [
            { x1: w * 0.05, y1: yC + 60, x2: w * 0.45, y2: yC - 30 },
            { x1: w * 0.55, y1: yC + 50, x2: w * 0.85, y2: yC - 40 },
        ];
        for (const cl of couleesLave) {
            const alpha = 0.12 + Math.sin(t * 0.9) * 0.04;
            const gradLave = ctxCarte.createLinearGradient(cl.x1, cl.y1, cl.x2, cl.y2);
            gradLave.addColorStop(0, `rgba(255,120,0,${alpha})`);
            gradLave.addColorStop(0.5, `rgba(255,60,0,${alpha * 1.5})`);
            gradLave.addColorStop(1, `rgba(200,20,0,${alpha * 0.5})`);
            ctxCarte.strokeStyle = gradLave;
            ctxCarte.lineWidth = 18;
            ctxCarte.lineCap = 'round';
            ctxCarte.shadowColor = '#ff4500';
            ctxCarte.shadowBlur = 14;
            ctxCarte.beginPath();
            const mx = (cl.x1 + cl.x2) / 2;
            const my = (cl.y1 + cl.y2) / 2;
            ctxCarte.moveTo(cl.x1, cl.y1);
            ctxCarte.quadraticCurveTo(mx + 30, my + 20, cl.x2, cl.y2);
            ctxCarte.stroke();
            ctxCarte.shadowBlur = 0;
        }

        const rochersPos = [
            [w * 0.06, yC + 20],
            [w * 0.18, yC + 35],
            [w * 0.6, yC + 25],
            [w * 0.78, yC + 40],
            [w * 0.9, yC + 15],
        ];
        for (const [rx, ry] of rochersPos) {
            const rs = 16 + ((Math.floor(rx) * 17 + Math.floor(ry) * 31) % 12);
            ctxCarte.fillStyle = '#0d0300';
            ctxCarte.strokeStyle = 'rgba(255,80,0,0.18)';
            ctxCarte.lineWidth = 1;
            ctxCarte.shadowColor = '#ff4500';
            ctxCarte.shadowBlur = 6;
            ctxCarte.beginPath();
            ctxCarte.moveTo(rx, ry - rs * 0.9);
            ctxCarte.lineTo(rx + rs, ry - rs * 0.3);
            ctxCarte.lineTo(rx + rs * 0.7, ry + rs * 0.5);
            ctxCarte.lineTo(rx - rs * 0.4, ry + rs * 0.5);
            ctxCarte.lineTo(rx - rs, ry - rs * 0.1);
            ctxCarte.closePath();
            ctxCarte.fill();
            ctxCarte.stroke();
            ctxCarte.shadowBlur = 0;
        }
        ctxCarte.restore();
    }

    {
        const yC = (yZone('monde_ocean') + yZone('monde_boss_2')) / 2;

        ctxCarte.save();
        const gradOcean = ctxCarte.createRadialGradient(w * 0.2, yC, 0, w * 0.2, yC, w * 0.28);
        gradOcean.addColorStop(0, 'rgba(0,60,150,0.20)');
        gradOcean.addColorStop(1, 'transparent');
        ctxCarte.fillStyle = gradOcean;
        ctxCarte.fillRect(0, yC - h * 0.12, w * 0.45, h * 0.2);

        for (let v = 0; v < 3; v++) {
            const vy = yC + 25 + v * 12;
            const alpha = 0.06 + Math.sin(t * 0.8 + v * 1.2) * 0.02;
            ctxCarte.strokeStyle = `rgba(0,200,255,${alpha})`;
            ctxCarte.lineWidth = 3;
            ctxCarte.beginPath();
            ctxCarte.moveTo(0, vy);
            for (let vx = 0; vx < w * 0.4; vx += 40) {
                ctxCarte.quadraticCurveTo(vx + 20, vy + Math.sin(t + vx * 0.04) * 6, vx + 40, vy);
            }
            ctxCarte.stroke();
        }

        const arbresPos = [w * 0.3, w * 0.37, w * 0.44];
        for (const ax of arbresPos) {
            const ay = yC - 5;
            for (let etage = 0; etage < 3; etage++) {
                const larg = 18 - etage * 4;
                const etageY = ay - etage * 12;
                ctxCarte.fillStyle = `rgba(0,${60 + etage * 15},${10 + etage * 5},0.30)`;
                ctxCarte.beginPath();
                ctxCarte.moveTo(ax, etageY - 14 + etage * 2);
                ctxCarte.lineTo(ax + larg, etageY);
                ctxCarte.lineTo(ax - larg, etageY);
                ctxCarte.closePath();
                ctxCarte.fill();
            }
        }

        const cristauxPos = [
            [w * 0.68, yC - 10],
            [w * 0.74, yC + 15],
            [w * 0.8, yC - 5],
        ];
        for (const [cx2, cy2] of cristauxPos) {
            for (let face = 0; face < 6; face++) {
                const angle = (face / 6) * Math.PI * 2;
                const r = 10;
                ctxCarte.strokeStyle = 'rgba(170,238,255,0.18)';
                ctxCarte.lineWidth = 1;
                ctxCarte.beginPath();
                ctxCarte.moveTo(cx2, cy2);
                ctxCarte.lineTo(cx2 + Math.cos(angle) * r, cy2 + Math.sin(angle) * r);
                ctxCarte.stroke();
            }
            ctxCarte.fillStyle = 'rgba(200,245,255,0.08)';
            ctxCarte.beginPath();
            ctxCarte.arc(cx2, cy2, 4, 0, Math.PI * 2);
            ctxCarte.fill();
        }
        ctxCarte.restore();
    }

    {
        const yC = (yZone('monde_desert') + yZone('monde_boss_3')) / 2;

        ctxCarte.save();

        const nbDunes = 4;
        for (let d = 0; d < nbDunes; d++) {
            const dx1 = w * (d / nbDunes);
            const dx2 = w * ((d + 1) / nbDunes);
            const peakX = (dx1 + dx2) / 2;
            const peakH = 18 + d * 6;
            const alphaD = 0.12 + Math.sin(t * 0.3 + d) * 0.03;
            ctxCarte.fillStyle = `rgba(200,150,40,${alphaD})`;
            ctxCarte.beginPath();
            ctxCarte.moveTo(dx1, yC + 40);
            ctxCarte.quadraticCurveTo(peakX, yC + 40 - peakH, dx2, yC + 40);
            ctxCarte.lineTo(dx2, yC + 60);
            ctxCarte.lineTo(dx1, yC + 60);
            ctxCarte.closePath();
            ctxCarte.fill();
        }

        const posEcl = positionsNoeuds['monde_eclipse'];
        if (posEcl) {
            const pulse = 1 + 0.1 * Math.sin(t * 0.7);
            for (let rayon = 30; rayon <= 55; rayon += 8) {
                const alphaC = (0.1 - (rayon - 30) * 0.003) * pulse;
                const gCour = ctxCarte.createRadialGradient(
                    posEcl.x,
                    posEcl.y,
                    rayon - 4,
                    posEcl.x,
                    posEcl.y,
                    rayon + 4
                );
                gCour.addColorStop(0, `rgba(255,200,50,${alphaC})`);
                gCour.addColorStop(1, 'transparent');
                ctxCarte.fillStyle = gCour;
                ctxCarte.beginPath();
                ctxCarte.arc(posEcl.x, posEcl.y, rayon + 4, 0, Math.PI * 2);
                ctxCarte.fill();
            }
            ctxCarte.fillStyle = 'rgba(8,8,20,0.6)';
            ctxCarte.beginPath();
            ctxCarte.arc(posEcl.x + 12, posEcl.y - 8, 22, 0, Math.PI * 2);
            ctxCarte.fill();
        }

        const xCyberStart = w * 0.52;
        ctxCarte.strokeStyle = 'rgba(200,0,255,0.07)';
        ctxCarte.lineWidth = 0.6;
        for (let gx = xCyberStart; gx < w; gx += 28) {
            ctxCarte.beginPath();
            ctxCarte.moveTo(gx, yC - h * 0.09);
            ctxCarte.lineTo(gx, yC + h * 0.09);
            ctxCarte.stroke();
        }
        for (let gy = yC - h * 0.09; gy < yC + h * 0.09; gy += 18) {
            ctxCarte.beginPath();
            ctxCarte.moveTo(xCyberStart, gy);
            ctxCarte.lineTo(w, gy);
            ctxCarte.stroke();
        }
        for (let ni = 0; ni < 5; ni++) {
            const nx = xCyberStart + ((ni * 173) % (w - xCyberStart));
            const ny = yC - h * 0.06 + ((ni * 89) % (h * 0.12));
            ctxCarte.fillStyle = `rgba(255,0,255,${0.15 + Math.sin(t * 3 + ni) * 0.07})`;
            ctxCarte.fillRect(nx - 2, ny - 2, 4, 4);
        }
        ctxCarte.restore();
    }

    {
        const yC = (yZone('monde_fuochi') + yZone('monde_boss_4')) / 2;

        ctxCarte.save();

        const nebCentreX = w * 0.43;
        const gNeb = ctxCarte.createRadialGradient(nebCentreX, yC, 0, nebCentreX, yC, h * 0.14);
        gNeb.addColorStop(0, 'rgba(80,0,200,0.12)');
        gNeb.addColorStop(0.5, 'rgba(40,0,120,0.06)');
        gNeb.addColorStop(1, 'transparent');
        ctxCarte.fillStyle = gNeb;
        ctxCarte.fillRect(0, yC - h * 0.15, w, h * 0.22);

        for (let fi = 0; fi < 12; fi++) {
            const fx = w * 0.05 + ((fi * 119) % (w * 0.25));
            const fy = yC - 30 + ((fi * 71) % 60);
            const fHue = (t * 80 + fi * 30) % 360;
            const fAlpha = 0.1 + Math.sin(t * 3 + fi * 0.8) * 0.05;
            ctxCarte.fillStyle = `hsla(${fHue},100%,65%,${fAlpha})`;
            for (let b = 0; b < 4; b++) {
                const ba = (b / 4) * Math.PI * 2;
                ctxCarte.beginPath();
                ctxCarte.moveTo(fx, fy);
                ctxCarte.lineTo(fx + Math.cos(ba) * 8, fy + Math.sin(ba) * 8);
                ctxCarte.lineWidth = 1.5;
                ctxCarte.strokeStyle = `hsla(${fHue},100%,65%,${fAlpha * 1.5})`;
                ctxCarte.stroke();
            }
            ctxCarte.beginPath();
            ctxCarte.arc(fx, fy, 2, 0, Math.PI * 2);
            ctxCarte.fill();
        }

        const videX = w * 0.65;
        for (let vi = 0; vi < 3; vi++) {
            const vx = videX + vi * 70;
            const vy = yC - 10 + vi * 20;
            const vr = 12 + vi * 5;
            const gVide = ctxCarte.createRadialGradient(vx, vy, 0, vx, vy, vr * 1.8);
            gVide.addColorStop(0, 'rgba(0,0,0,0.5)');
            gVide.addColorStop(0.6, 'rgba(5,0,15,0.30)');
            gVide.addColorStop(1, 'transparent');
            ctxCarte.fillStyle = gVide;
            ctxCarte.beginPath();
            ctxCarte.arc(vx, vy, vr * 1.8, 0, Math.PI * 2);
            ctxCarte.fill();
            ctxCarte.strokeStyle = `rgba(100,0,200,${0.12 + Math.sin(t + vi) * 0.05})`;
            ctxCarte.lineWidth = 1.5;
            ctxCarte.beginPath();
            ctxCarte.arc(vx, vy, vr, 0, Math.PI * 2);
            ctxCarte.stroke();
        }
        ctxCarte.restore();
    }

    {
        const pos = positionsNoeuds['monde_finale'];
        if (pos) {
            ctxCarte.save();
            const gCorruption = ctxCarte.createRadialGradient(
                pos.x,
                pos.y,
                0,
                pos.x,
                pos.y,
                h * 0.2
            );
            gCorruption.addColorStop(0, 'rgba(120,0,40,0.15)');
            gCorruption.addColorStop(0.5, 'rgba(60,0,20,0.08)');
            gCorruption.addColorStop(1, 'transparent');
            ctxCarte.fillStyle = gCorruption;
            ctxCarte.fillRect(0, pos.y - h * 0.14, w, h * 0.2);

            for (let i = 0; i < 6; i++) {
                const angle = (i / 6) * Math.PI * 2 + t * 0.3;
                const longueur = 70 + Math.sin(t * 1.5 + i) * 20;
                const tx1 = pos.x + Math.cos(angle) * 30;
                const ty1 = pos.y + Math.sin(angle) * 15;
                const tx2 = pos.x + Math.cos(angle) * longueur;
                const ty2 = pos.y + Math.sin(angle) * longueur * 0.5;
                const alphaT = 0.08 + Math.sin(t * 2 + i * 0.8) * 0.04;
                ctxCarte.strokeStyle = `rgba(255,0,110,${alphaT})`;
                ctxCarte.lineWidth = 2;
                ctxCarte.beginPath();
                ctxCarte.moveTo(tx1, ty1);
                ctxCarte.quadraticCurveTo(
                    (tx1 + tx2) / 2 + Math.sin(t + i) * 15,
                    (ty1 + ty2) / 2,
                    tx2,
                    ty2
                );
                ctxCarte.stroke();
            }

            ctxCarte.font = '11px serif';
            for (let s = 0; s < 3; s++) {
                const sa = t * 0.5 + s * ((Math.PI * 2) / 3);
                const sr = 55 + Math.sin(t + s) * 8;
                const sx = pos.x + Math.cos(sa) * sr;
                const sy = pos.y + Math.sin(sa) * sr * 0.5;
                ctxCarte.fillStyle = `rgba(255,0,110,${0.12 + Math.sin(t * 2 + s) * 0.05})`;
                ctxCarte.textAlign = 'center';
                ctxCarte.textBaseline = 'middle';
                ctxCarte.fillText('∞', sx, sy);
            }
            ctxCarte.restore();
        }
    }
}
