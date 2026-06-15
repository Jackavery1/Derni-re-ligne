import { SEQUENCE_HISTOIRE } from './histoire-donnees.js';
import { BIOMES } from './config.js';
import { obtenirEtatHistoire, mondePeutEtreJoue, obtenirEtatMonde } from './histoire-mondes.js';
import { sansAccentsE } from './texte-jeu.js';
import { dessinerRoboMiniature } from './rendu-robo-mini.js';
import { dessinerIconePixel, iconesPixelChargees } from './icones-pixel.js';
import { obtenirIdIconeMondeHistoire } from './biome-icones-map.js';

function _positionLabel(pos, rayon, w) {
    const centreX = w * 0.5;
    const marge = rayon + 14;

    if (pos.x < centreX - 20) {
        return { x: pos.x + marge, y: pos.y, align: 'left' };
    } else if (pos.x > centreX + 20) {
        return { x: pos.x - marge, y: pos.y, align: 'right' };
    } else {
        return { x: pos.x, y: pos.y + rayon + 16, align: 'center' };
    }
}

function _traceFormeNoeud(ctx, x, y, rayon, estBoss) {
    if (estBoss) {
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            const angle = (i * Math.PI) / 3 - Math.PI / 6;
            const px = x + rayon * Math.cos(angle);
            const py = y + rayon * Math.sin(angle);
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.closePath();
    } else {
        ctx.beginPath();
        ctx.arc(x, y, rayon, 0, Math.PI * 2);
    }
}

function _dessinerNoeudFantome(etatCarte, pos, timestamp) {
    const { ctxCarte } = etatCarte;
    if (!ctxCarte) return;
    const t = timestamp / 1000;
    const { x, y, rayon } = pos;

    ctxCarte.save();
    ctxCarte.globalAlpha = 0.1 + 0.05 * Math.sin(t * 1.5);
    ctxCarte.strokeStyle = '#ffffff';
    ctxCarte.lineWidth = 1;
    ctxCarte.setLineDash([4, 6]);
    ctxCarte.beginPath();
    ctxCarte.arc(x, y, rayon, 0, Math.PI * 2);
    ctxCarte.stroke();
    ctxCarte.setLineDash([]);
    ctxCarte.globalAlpha = 0.08;
    ctxCarte.fillStyle = '#ffffff';
    ctxCarte.font = '6px "Press Start 2P", monospace';
    ctxCarte.textAlign = 'center';
    ctxCarte.textBaseline = 'middle';
    ctxCarte.fillText('?', x, y);
    ctxCarte.restore();
}

function _dessinerPulseDisponible(ctx, x, y, rayon, couleur, pulse) {
    ctx.shadowColor = couleur;
    ctx.shadowBlur = 10 + pulse * 16;
    ctx.strokeStyle = couleur;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(x, y, rayon + 8 + pulse * 4, 0, Math.PI * 2);
    ctx.stroke();
    ctx.shadowBlur = 0;
}

function _dessinerSurbrillanceNoeud(ctx, x, y, rayon) {
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.shadowColor = '#ffffff';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(x, y, rayon + 5, 0, Math.PI * 2);
    ctx.stroke();
    ctx.shadowBlur = 0;
}

function _dessinerCorpsNoeud(ctx, x, y, rayon, monde, couleur, estComplete, estDisponible) {
    _traceFormeNoeud(ctx, x, y, rayon, monde.estBoss);

    if (estComplete) {
        ctx.fillStyle = couleur + 'aa';
    } else if (estDisponible) {
        ctx.fillStyle = couleur + '33';
    } else {
        ctx.fillStyle = '#06060f';
    }
    ctx.shadowColor = couleur;
    ctx.shadowBlur = estComplete || estDisponible ? 10 : 0;
    ctx.fill();

    ctx.strokeStyle = couleur;
    ctx.lineWidth = estDisponible && !estComplete ? 2 : 1;
    ctx.stroke();
    ctx.shadowBlur = 0;
}

function _dessinerIconeNoeud(ctx, x, y, rayon, monde, biome, estComplete, estDisponible) {
    const alpha = estComplete || estDisponible ? 1 : 0.3;
    ctx.save();
    ctx.globalAlpha = alpha;

    if (!estDisponible && !estComplete) {
        ctx.font = '8px "Press Start 2P", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#3a3a5a';
        ctx.fillText('?', x, y);
        ctx.restore();
        return;
    }

    const idIcone = obtenirIdIconeMondeHistoire(monde.id, monde.biomeId);
    const taillePixel = Math.max(1, Math.floor((rayon * 1.35) / 16));
    const taille = 16 * taillePixel;

    if (iconesPixelChargees()) {
        dessinerIconePixel(ctx, idIcone, x - taille / 2, y - taille / 2, taillePixel, {
            accent: biome.lueurCoul,
        });
    } else {
        ctx.font = '13px serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(biome.icone, x, y);
    }

    if (estComplete) {
        ctx.globalAlpha = 1;
        ctx.font = '6px "Press Start 2P", monospace';
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = biome.lueurCoul;
        ctx.shadowBlur = 6;
        ctx.fillText('OK', x + rayon * 0.52, y - rayon * 0.52);
        ctx.shadowBlur = 0;
    }

    ctx.restore();
}

function _dessinerLabelNoeud(
    ctx,
    etatCarte,
    monde,
    pos,
    rayon,
    couleur,
    estComplete,
    estDisponible
) {
    const w = etatCarte.canvasCarte.width;
    const lbl = _positionLabel(pos, rayon, w);
    ctx.font = '5px "Press Start 2P", monospace';
    ctx.textAlign = lbl.align;
    ctx.textBaseline = 'middle';
    ctx.fillStyle = estComplete || estDisponible ? couleur + 'cc' : '#2a2a4a';
    ctx.fillText(sansAccentsE(monde.nomAffiche), lbl.x, lbl.y);
}

function dessinerNoeud(etatCarte, monde, pos, etatHist, timestamp) {
    const { ctxCarte, noeudSelectionne, noeudSurvole } = etatCarte;
    if (!ctxCarte) return;

    const { x, y, rayon } = pos;
    const etatMonde = obtenirEtatMonde(monde.id, etatHist);
    const estComplete = etatMonde === 'complete';
    const estDisponible = etatMonde === 'disponible';
    const estSelectionne = noeudSelectionne === monde.id;
    const estSurvole = noeudSurvole === monde.id;
    const biome = BIOMES[monde.biomeId] ?? BIOMES.classique;
    const couleur = estComplete || estDisponible ? biome.lueurCoul : '#1a1a2e';
    const pulse = 0.5 + 0.5 * Math.sin(timestamp / 900);

    ctxCarte.save();

    if (estDisponible && !estComplete) {
        _dessinerPulseDisponible(ctxCarte, x, y, rayon, couleur, pulse);
    }

    if (estSelectionne || estSurvole) {
        _dessinerSurbrillanceNoeud(ctxCarte, x, y, rayon);
    }

    _dessinerCorpsNoeud(ctxCarte, x, y, rayon, monde, couleur, estComplete, estDisponible);
    _dessinerIconeNoeud(ctxCarte, x, y, rayon, monde, biome, estComplete, estDisponible);
    _dessinerLabelNoeud(
        ctxCarte,
        etatCarte,
        monde,
        pos,
        rayon,
        couleur,
        estComplete,
        estDisponible
    );

    if (estDisponible && !estComplete) {
        dessinerRoboMiniature(ctxCarte, x, y - rayon - 10, timestamp);
    }

    ctxCarte.restore();
}

function dessinerNoeudCache(etatCarte, monde, pos, etatHist, timestamp) {
    const { ctxCarte, noeudSelectionne, noeudSurvole } = etatCarte;
    if (!ctxCarte) return;

    if (!mondePeutEtreJoue(monde.id, etatHist)) return;

    const { x, y, rayon } = pos;
    const t = timestamp / 600;
    const pulse = 0.5 + 0.5 * Math.sin(t);

    ctxCarte.save();
    ctxCarte.shadowColor = '#ffe600';
    ctxCarte.shadowBlur = 6 + pulse * 10;
    ctxCarte.strokeStyle = '#ffe600';
    ctxCarte.lineWidth = 1.5;
    ctxCarte.fillStyle = 'rgba(255,230,0,0.15)';
    ctxCarte.beginPath();
    ctxCarte.arc(x, y, rayon, 0, Math.PI * 2);
    ctxCarte.fill();
    ctxCarte.stroke();
    ctxCarte.shadowBlur = 0;

    const idIcone = obtenirIdIconeMondeHistoire(monde.id, monde.biomeId);
    const taillePixel = Math.max(1, Math.floor((rayon * 1.2) / 16));
    const taille = 16 * taillePixel;
    if (iconesPixelChargees()) {
        dessinerIconePixel(ctxCarte, idIcone, x - taille / 2, y - taille / 2, taillePixel, {
            accent: '#ffe600',
        });
    } else {
        ctxCarte.font = '12px serif';
        ctxCarte.textAlign = 'center';
        ctxCarte.textBaseline = 'middle';
        ctxCarte.fillStyle = '#ffe600';
        ctxCarte.fillText('✦', x, y);
    }

    if (noeudSelectionne === monde.id || noeudSurvole === monde.id) {
        ctxCarte.font = '5px "Press Start 2P", monospace';
        ctxCarte.fillStyle = '#ffe600';
        ctxCarte.fillText(sansAccentsE(monde.nomAffiche), x, y + rayon + 11);
    }
    ctxCarte.restore();
}

export function dessinerTousLesNoeuds(etatCarte, timestamp) {
    const { positionsNoeuds, mondesVisibles, mondesFantomes } = etatCarte;
    const etatHist = obtenirEtatHistoire();
    const sequencePrincipale = SEQUENCE_HISTOIRE.filter((m) => !m.estCache);

    for (const monde of sequencePrincipale) {
        const pos = positionsNoeuds[monde.id];
        if (!pos) continue;

        if (!mondesVisibles.has(monde.id) && !mondesFantomes.has(monde.id)) continue;

        if (mondesFantomes.has(monde.id)) {
            _dessinerNoeudFantome(etatCarte, pos, timestamp);
        } else if (mondesVisibles.has(monde.id)) {
            dessinerNoeud(etatCarte, monde, pos, etatHist, timestamp);
        }
    }

    const caches = SEQUENCE_HISTOIRE.filter((m) => m.estCache);
    for (const monde of caches) {
        const pos = positionsNoeuds[monde.id];
        if (!pos) continue;
        if (mondesVisibles.has(monde.id)) {
            dessinerNoeudCache(etatCarte, monde, pos, etatHist, timestamp);
        }
    }
}
