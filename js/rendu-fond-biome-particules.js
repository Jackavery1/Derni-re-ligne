/**
 * RÈGLE : Math.random() uniquement dans creerParticulesFondBiome().
 */

/** @param {ReturnType<typeof import('./rendu-fond-biome-donnees.js').obtenirConfigFondBiome>} config @param {number} w @param {number} h */
export function creerParticulesFondBiome(config, w, h) {
    const p = config.particules;
    const particules = [];
    for (let i = 0; i < p.n; i++) {
        particules.push({
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
    return particules;
}

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {ReturnType<typeof import('./rendu-fond-biome-donnees.js').obtenirConfigFondBiome>} config
 * @param {ReturnType<typeof creerParticulesFondBiome>} particules
 * @param {number} ts
 * @param {number} w
 * @param {number} h
 * @param {{ reduits: boolean, facteurAmp: number }} opts
 */
export function dessinerParticulesFondBiome(ctx, config, particules, ts, w, h, opts) {
    const { reduits, facteurAmp } = opts;
    const type = config.particules.type;
    const couleur = config.particules.couleur;

    ctx.save();
    particules.forEach((p, i) => {
        if (reduits && i % 3 !== 0) return;
        const phase = 0.5 + 0.5 * Math.sin(ts * 0.001 * p.vitesse + p.offset);
        ctx.globalAlpha = 0.3 + phase * 0.7;

        const ampX = p.ampX * facteurAmp;
        let x, y;

        switch (type) {
            case 'braise':
            case 'flamme': {
                x = p.x0 + Math.sin(ts * 0.0006 * p.vitesse + p.offset) * ampX;
                y = h - ((ts * 0.04 * p.vitesse + p.decalY) % (h * 1.1));
                const tF = p.taille * (type === 'flamme' ? 1 + phase * 0.6 : 1);
                ctx.fillStyle = phase > 0.65 ? '#ffcc00' : couleur;
                ctx.fillRect(x, y, tF, tF * 1.8);
                break;
            }
            case 'eclat': {
                x = p.x0 + Math.sin(ts * 0.0004 + p.offset) * ampX;
                y = (p.y0 + ts * 0.008 * p.vitesse) % h;
                ctx.fillStyle = couleur;
                ctx.fillRect(x, y, p.taille, p.taille);
                break;
            }
            case 'bulle': {
                x = p.x0 + Math.sin(ts * 0.0005 + p.offset) * ampX;
                y = h - ((ts * 0.02 * p.vitesse + p.decalY) % (h * 1.2));
                ctx.strokeStyle = couleur;
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.arc(x, y, p.taille + 1, 0, Math.PI * 2);
                ctx.stroke();
                break;
            }
            case 'feuille': {
                x = (((p.x0 - ts * 0.012 * p.vitesse + p.decalX) % w) + w) % w;
                y = p.y0 + Math.sin(ts * 0.001 * p.vitesse + p.offset) * 18 * facteurAmp;
                ctx.fillStyle = couleur;
                ctx.fillRect(x, y, p.taille, p.taille);
                break;
            }
            case 'flocon': {
                x = p.x0 + Math.sin(ts * 0.0005 + p.offset) * ampX;
                y = (p.decalY + ts * 0.008 * p.vitesse) % h;
                ctx.strokeStyle = couleur;
                ctx.lineWidth = 0.8;
                for (let b = 0; b < 4; b++) {
                    const a = (b / 4) * Math.PI * 2;
                    ctx.beginPath();
                    ctx.moveTo(x, y);
                    ctx.lineTo(x + Math.cos(a) * 4, y + Math.sin(a) * 4);
                    ctx.stroke();
                }
                break;
            }
            case 'neige': {
                x = (p.decalX + ts * 0.018 * p.vitesse) % w;
                y = p.y0 + Math.sin(ts * 0.0008 + p.offset) * 5;
                ctx.fillStyle = couleur;
                ctx.fillRect(x, y, p.taille, p.taille);
                break;
            }
            case 'grain': {
                x = (p.decalX + ts * 0.015 * p.vitesse) % w;
                y = p.y0 + Math.sin(ts * 0.001 + p.offset) * 4;
                ctx.fillStyle = couleur;
                ctx.fillRect(x, y, 1, 1);
                break;
            }
            case 'rayon': {
                const ang = p.angle + ts * 0.00008 * p.vitesse;
                const cx = w * 0.5;
                const cy = h * 0.22;
                const r0 = Math.min(w, h) * 0.1;
                ctx.strokeStyle = couleur;
                ctx.lineWidth = 1.2;
                ctx.globalAlpha = phase * 0.28;
                ctx.beginPath();
                ctx.moveTo(cx + Math.cos(ang) * r0, cy + Math.sin(ang) * r0);
                ctx.lineTo(
                    cx + Math.cos(ang) * (r0 + p.longueur * phase),
                    cy + Math.sin(ang) * (r0 + p.longueur * phase)
                );
                ctx.stroke();
                break;
            }
            case 'pluie_data': {
                y = (p.decalY + ts * 0.025 * p.vitesse) % h;
                ctx.fillStyle = couleur;
                ctx.font = '9px monospace';
                ctx.fillText(String.fromCharCode(48 + ((i + Math.floor(ts * 0.01)) % 10)), p.x0, y);
                break;
            }
            case 'etoile_filante': {
                const cycle = (ts * 0.00015 * p.vitesse + p.offset / (Math.PI * 2)) % 1;
                if (cycle < 0.12) {
                    const prog = cycle / 0.12;
                    const ang = Math.PI * 0.28;
                    ctx.strokeStyle = couleur;
                    ctx.lineWidth = 1.5;
                    ctx.globalAlpha = (1 - prog) * 0.85;
                    ctx.beginPath();
                    ctx.moveTo(p.x0, p.y0);
                    ctx.lineTo(
                        p.x0 + Math.cos(ang) * p.longueur * prog,
                        p.y0 + Math.sin(ang) * p.longueur * prog
                    );
                    ctx.stroke();
                }
                break;
            }
            case 'onde': {
                const r = (ts * 0.02 * p.vitesse + p.decalY * 0.5) % (Math.max(w, h) * 0.7);
                ctx.strokeStyle = couleur;
                ctx.lineWidth = 0.8;
                ctx.globalAlpha = (1 - r / (Math.max(w, h) * 0.7)) * 0.22;
                ctx.beginPath();
                ctx.arc(w * 0.5, h * 0.5, r, 0, Math.PI * 2);
                ctx.stroke();
                break;
            }
            case 'energie': {
                const ang = p.angle + ts * 0.001 * p.vitesse;
                const r = 100 + Math.sin(ts * 0.002 + p.offset) * 30;
                ctx.fillStyle = `hsl(${p.teinte + ts * 0.05}, 100%, 60%)`;
                ctx.fillRect(
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
                    ctx.fillStyle = couleur;
                    ctx.globalAlpha = 0.18;
                    ctx.fillRect(xg, yg, 60 + p.taille * 18, 2);
                }
                break;
            }
            case 'circuit_spark':
            default: {
                x = p.x0 + Math.sin(ts * 0.001 * p.vitesse + p.offset) * ampX;
                y = (p.decalY + ts * 0.01 * p.vitesse) % h;
                ctx.fillStyle = couleur ?? '#ffffff';
                ctx.fillRect(x, y, p.taille, p.taille);
            }
        }
    });
    ctx.globalAlpha = 1;
    ctx.restore();
}
