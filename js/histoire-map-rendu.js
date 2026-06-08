import { SEQUENCE_HISTOIRE } from './histoire-donnees.js';
import { BIOMES } from './config.js';
import { obtenirEtatHistoire, mondePeutEtreJoue, obtenirEtatMonde } from './histoire-mondes.js';
import { paradoxeEstDebloque } from './monde-paradoxe-etat.js';

const CONNEXIONS_CHEMIN = [
    ['monde_prologue', 'monde_lave'],
    ['monde_lave', 'monde_rouille'],
    ['monde_rouille', 'monde_boss_1'],
    ['monde_boss_1', 'monde_ocean'],
    ['monde_ocean', 'monde_foret'],
    ['monde_foret', 'monde_glace'],
    ['monde_glace', 'monde_boss_2'],
    ['monde_boss_2', 'monde_desert'],
    ['monde_desert', 'monde_eclipse'],
    ['monde_eclipse', 'monde_cyber'],
    ['monde_cyber', 'monde_boss_3'],
    ['monde_boss_3', 'monde_fuochi'],
    ['monde_fuochi', 'monde_cosmos'],
    ['monde_cosmos', 'monde_vide'],
    ['monde_vide', 'monde_boss_4'],
    ['monde_boss_4', 'monde_finale'],
];

let etoilesGenerees = null;

export function dessinerCarteHistoire(etatCarte, timestamp) {
    const { canvasCarte, ctxCarte } = etatCarte;
    if (!canvasCarte || !ctxCarte) return;

    const w = canvasCarte.width;
    const h = canvasCarte.height;

    ctxCarte.fillStyle = '#020210';
    ctxCarte.fillRect(0, 0, w, h);

    ctxCarte.strokeStyle = 'rgba(0,245,255,0.018)';
    ctxCarte.lineWidth = 1;
    for (let x = 0; x < w; x += 60) {
        ctxCarte.beginPath();
        ctxCarte.moveTo(x, 0);
        ctxCarte.lineTo(x, h);
        ctxCarte.stroke();
    }
    for (let y = 0; y < h; y += 60) {
        ctxCarte.beginPath();
        ctxCarte.moveTo(0, y);
        ctxCarte.lineTo(w, y);
        ctxCarte.stroke();
    }

    dessinerEtoilesFond(etatCarte, timestamp);
    dessinerEtiquettesChapitres(etatCarte);
    dessinerChemins(etatCarte, timestamp);
    dessinerTousLesNoeuds(etatCarte, timestamp);
}

function dessinerEtoilesFond(etatCarte, timestamp) {
    const { canvasCarte, ctxCarte } = etatCarte;
    if (!canvasCarte || !ctxCarte) return;

    if (!etoilesGenerees) {
        etoilesGenerees = [];
        for (let i = 0; i < 180; i++) {
            etoilesGenerees.push({
                x: Math.random(),
                y: Math.random(),
                r: 0.5 + Math.random() * 1.2,
                phase: Math.random() * Math.PI * 2,
                vitesse: 0.001 + Math.random() * 0.003,
            });
        }
    }

    const w = canvasCarte.width;
    const h = canvasCarte.height;
    for (const e of etoilesGenerees) {
        const alpha = 0.15 + 0.35 * (0.5 + 0.5 * Math.sin(timestamp * e.vitesse + e.phase));
        ctxCarte.fillStyle = `rgba(255,255,255,${alpha.toFixed(2)})`;
        ctxCarte.beginPath();
        ctxCarte.arc(e.x * w, e.y * h, e.r, 0, Math.PI * 2);
        ctxCarte.fill();
    }
}

function dessinerEtiquettesChapitres(etatCarte) {
    const { canvasCarte, ctxCarte, positionsNoeuds } = etatCarte;
    if (!canvasCarte || !ctxCarte) return;

    const w = canvasCarte.width;
    const chapitresCouleurs = {
        prologue: '#00f5ff',
        chapitre_1: '#ff4500',
        chapitre_2: '#00cfff',
        chapitre_3: '#ffbb44',
        chapitre_4: '#b400ff',
        finale: '#ff006e',
    };
    const chapitresLabels = {
        prologue: 'PROLOGUE',
        chapitre_1: '— CHAPITRE I — LE FEU',
        chapitre_2: '— CHAPITRE II — LES PROFONDEURS',
        chapitre_3: '— CHAPITRE III — LA MÉMOIRE',
        chapitre_4: '— CHAPITRE IV — LA FRACTURE',
        finale: '— FINALE —',
    };

    const rangees = [
        { chapId: 'prologue', y: positionsNoeuds['monde_prologue']?.y },
        { chapId: 'chapitre_1', y: positionsNoeuds['monde_lave']?.y },
        { chapId: 'chapitre_2', y: positionsNoeuds['monde_ocean']?.y },
        { chapId: 'chapitre_3', y: positionsNoeuds['monde_desert']?.y },
        { chapId: 'chapitre_4', y: positionsNoeuds['monde_fuochi']?.y },
        { chapId: 'finale', y: positionsNoeuds['monde_finale']?.y },
    ];

    for (const { chapId, y } of rangees) {
        if (!y) continue;
        const couleur = chapitresCouleurs[chapId] ?? '#ffffff';
        const label = chapitresLabels[chapId] ?? '';
        ctxCarte.save();
        ctxCarte.font = '7px "Press Start 2P", monospace';
        ctxCarte.textAlign = 'left';
        ctxCarte.fillStyle = couleur + '55';
        ctxCarte.fillText(label, 16, y - 34);
        ctxCarte.strokeStyle = couleur + '18';
        ctxCarte.lineWidth = 1;
        ctxCarte.beginPath();
        ctxCarte.moveTo(0, y - 20);
        ctxCarte.lineTo(w, y - 20);
        ctxCarte.stroke();
        ctxCarte.restore();
    }
}

function dessinerChemins(etatCarte, timestamp) {
    const { ctxCarte, positionsNoeuds } = etatCarte;
    if (!ctxCarte) return;

    const etatHist = obtenirEtatHistoire();
    const t = timestamp / 1200;

    for (const [idA, idB] of CONNEXIONS_CHEMIN) {
        const posA = positionsNoeuds[idA];
        const posB = positionsNoeuds[idB];
        if (!posA || !posB) continue;

        const aComplete = etatHist.mondesCompletes.includes(idA);
        const bComplete = etatHist.mondesCompletes.includes(idB);
        const bDisponible = mondePeutEtreJoue(idB, etatHist);

        ctxCarte.save();
        ctxCarte.setLineDash([6, 8]);
        ctxCarte.lineWidth = 1.5;

        if (aComplete && bComplete) {
            ctxCarte.strokeStyle = 'rgba(0,255,136,0.45)';
            ctxCarte.shadowColor = '#00ff88';
            ctxCarte.shadowBlur = 4;
        } else if (aComplete && bDisponible) {
            const alpha = 0.25 + 0.2 * Math.sin(t * Math.PI * 2);
            ctxCarte.strokeStyle = `rgba(0,245,255,${alpha.toFixed(2)})`;
        } else {
            ctxCarte.strokeStyle = 'rgba(60,60,90,0.3)';
        }

        ctxCarte.beginPath();
        ctxCarte.moveTo(posA.x, posA.y);
        ctxCarte.lineTo(posB.x, posB.y);
        ctxCarte.stroke();
        ctxCarte.restore();
    }
}

function dessinerTousLesNoeuds(etatCarte, timestamp) {
    const { positionsNoeuds } = etatCarte;
    const etatHist = obtenirEtatHistoire();
    const sequencePrincipale = SEQUENCE_HISTOIRE.filter((m) => !m.estCache);

    for (const monde of sequencePrincipale) {
        const pos = positionsNoeuds[monde.id];
        if (!pos) continue;
        dessinerNoeud(etatCarte, monde, pos, etatHist, timestamp);
    }

    const caches = SEQUENCE_HISTOIRE.filter((m) => m.estCache);
    for (const monde of caches) {
        const pos = positionsNoeuds[monde.id];
        if (!pos) continue;
        dessinerNoeudCache(etatCarte, monde, pos, etatHist, timestamp);
    }
}

function _dessinerHaloNoeud(ctx, x, y, rayon, couleur, pulse, estDisponible, estComplete) {
    if (!estDisponible || estComplete) return;
    ctx.shadowColor = couleur;
    ctx.shadowBlur = 10 + pulse * 16;
    ctx.strokeStyle = couleur;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(x, y, rayon + 8 + pulse * 4, 0, Math.PI * 2);
    ctx.stroke();
    ctx.shadowBlur = 0;
}

function _dessinerContourNoeud(ctx, x, y, rayon) {
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.shadowColor = '#ffffff';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(x, y, rayon + 5, 0, Math.PI * 2);
    ctx.stroke();
    ctx.shadowBlur = 0;
}

function _dessinerFormeNoeud(ctx, x, y, rayon, estBoss) {
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
        return;
    }
    ctx.beginPath();
    ctx.arc(x, y, rayon, 0, Math.PI * 2);
}

function _dessinerSymboleNoeud(ctx, monde, x, y, biome, estComplete, estDisponible) {
    const alpha = estComplete || estDisponible ? 1 : 0.25;
    ctx.globalAlpha = alpha;
    ctx.font = monde.estBoss ? '16px serif' : '13px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    if (!estDisponible && !estComplete) {
        ctx.fillStyle = '#3a3a5a';
        ctx.font = '13px serif';
        ctx.fillText('🔒', x, y);
    } else if (estComplete) {
        ctx.fillStyle = '#ffffff';
        ctx.fillText('✓', x, y);
    } else {
        ctx.fillStyle = '#ffffff';
        ctx.fillText(biome.icone, x, y);
    }
    ctx.globalAlpha = 1;
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

    _dessinerHaloNoeud(ctxCarte, x, y, rayon, couleur, pulse, estDisponible, estComplete);

    if (estSelectionne || estSurvole) {
        _dessinerContourNoeud(ctxCarte, x, y, rayon);
    }

    ctxCarte.shadowColor = couleur;
    ctxCarte.shadowBlur = estComplete || estDisponible ? 10 : 0;
    _dessinerFormeNoeud(ctxCarte, x, y, rayon, monde.estBoss);

    if (estComplete) {
        ctxCarte.fillStyle = couleur + 'aa';
    } else if (estDisponible) {
        ctxCarte.fillStyle = couleur + '33';
    } else {
        ctxCarte.fillStyle = '#06060f';
    }
    ctxCarte.fill();

    ctxCarte.strokeStyle = couleur;
    ctxCarte.lineWidth = estDisponible && !estComplete ? 2 : 1;
    ctxCarte.stroke();
    ctxCarte.shadowBlur = 0;

    _dessinerSymboleNoeud(ctxCarte, monde, x, y, biome, estComplete, estDisponible);

    ctxCarte.font = '5px "Press Start 2P", monospace';
    ctxCarte.textAlign = 'center';
    ctxCarte.fillStyle = estComplete || estDisponible ? couleur + 'cc' : '#2a2a4a';
    const labelY = monde.estBoss ? y + rayon + 13 : y + rayon + 11;
    ctxCarte.fillText(monde.nomAffiche, x, labelY);

    if (estDisponible && !estComplete) {
        dessinerRoboMiniature(etatCarte, x, y - rayon - 4, timestamp);
    }

    ctxCarte.restore();
}

function dessinerNoeudCache(etatCarte, monde, pos, etatHist, timestamp) {
    const { ctxCarte, noeudSelectionne, noeudSurvole } = etatCarte;
    if (!ctxCarte) return;

    const { x, y, rayon } = pos;
    const estDebloque = mondePeutEtreJoue(monde.id, etatHist);

    if (monde.id === 'monde_paradoxe') {
        if (!paradoxeEstDebloque()) return;
        const pulse = 0.5 + 0.5 * Math.sin(timestamp / 2000);
        ctxCarte.save();
        ctxCarte.globalAlpha = 0.06 + 0.04 * pulse;
        ctxCarte.fillStyle = '#ffe600';
        ctxCarte.beginPath();
        ctxCarte.arc(x, y, rayon, 0, Math.PI * 2);
        ctxCarte.fill();
        ctxCarte.restore();
        return;
    }

    ctxCarte.save();
    if (!estDebloque) {
        ctxCarte.globalAlpha = 0.15;
        ctxCarte.fillStyle = '#ffffff';
        ctxCarte.beginPath();
        ctxCarte.arc(x, y, 4, 0, Math.PI * 2);
        ctxCarte.fill();
        ctxCarte.globalAlpha = 1;
    } else {
        const t = timestamp / 600;
        const pulse = 0.5 + 0.5 * Math.sin(t);
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
        ctxCarte.font = '12px serif';
        ctxCarte.textAlign = 'center';
        ctxCarte.textBaseline = 'middle';
        ctxCarte.fillStyle = '#ffe600';
        ctxCarte.fillText('✦', x, y);

        if (noeudSelectionne === monde.id || noeudSurvole === monde.id) {
            ctxCarte.font = '5px "Press Start 2P", monospace';
            ctxCarte.fillStyle = '#ffe600';
            ctxCarte.fillText(monde.nomAffiche, x, y + rayon + 11);
        }
    }
    ctxCarte.restore();
}

function dessinerRoboMiniature(etatCarte, x, y, timestamp) {
    const { ctxCarte } = etatCarte;
    if (!ctxCarte) return;

    const bounce = Math.sin(timestamp / 380) * 2.5;
    const rx = Math.round(x - 8);
    const ry = Math.round(y - 14 + bounce);

    ctxCarte.save();
    ctxCarte.fillStyle = '#0c0c28';
    ctxCarte.strokeStyle = '#00f5ff';
    ctxCarte.lineWidth = 1;

    ctxCarte.fillRect(rx + 2, ry, 12, 9);
    ctxCarte.strokeRect(rx + 2, ry, 12, 9);
    ctxCarte.fillRect(rx + 3, ry + 9, 10, 5);
    ctxCarte.strokeRect(rx + 3, ry + 9, 10, 5);
    ctxCarte.fillStyle = '#00f5ff';
    ctxCarte.fillRect(rx + 4, ry + 2, 3, 3);
    ctxCarte.fillRect(rx + 9, ry + 2, 3, 3);
    const alphaBlink = 0.6 + 0.4 * Math.sin(timestamp / 700);
    ctxCarte.globalAlpha = alphaBlink;
    ctxCarte.fillStyle = '#ff006e';
    ctxCarte.fillRect(rx + 7, ry - 3, 2, 2);
    ctxCarte.globalAlpha = 1;

    ctxCarte.restore();
}
