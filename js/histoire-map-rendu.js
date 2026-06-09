import { SEQUENCE_HISTOIRE } from './histoire-donnees.js';
import { BIOMES } from './config.js';
import { obtenirEtatHistoire, mondePeutEtreJoue, obtenirEtatMonde } from './histoire-mondes.js';
import { paradoxeEstDebloque } from './monde-paradoxe-etat.js';
import { dessinerTerrainRiche as _dessinerTerrainRiche } from './histoire-map-terrain.js';
import { dessinerCheminsEpais } from './histoire-map-chemins.js';

const COULEURS_CHAPITRES = {
    prologue: '#00f5ff',
    chapitre_1: '#ff4500',
    chapitre_2: '#00cfff',
    chapitre_3: '#ffbb44',
    chapitre_4: '#b400ff',
    finale: '#ff006e',
};

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

let coucheEtoiles = null;
let tailleCanvasEtoiles = { w: 0, h: 0 };

export function invaliderCoucheEtoilesCarte() {
    coucheEtoiles = null;
}

function _appliquerTransformCamera(ctx, w, h, camera) {
    ctx.translate(w / 2, h / 2);
    ctx.scale(camera.zoom, camera.zoom);
    ctx.translate(-w / 2, -(h / 2 + camera.y));
}

function verifierRegenerationEtoiles(w, h) {
    if (coucheEtoiles && (tailleCanvasEtoiles.w !== w || tailleCanvasEtoiles.h !== h)) {
        coucheEtoiles = null;
    }
    tailleCanvasEtoiles = { w, h };
}

export function dessinerCarteHistoire(etatCarte, timestamp) {
    const { canvasCarte, ctxCarte } = etatCarte;
    if (!canvasCarte || !ctxCarte) return;
    const w = canvasCarte.width;
    const h = canvasCarte.height;

    ctxCarte.fillStyle = '#020210';
    ctxCarte.fillRect(0, 0, w, h);
    dessinerEtoilesFond(etatCarte, timestamp);
    _dessinerVignette(ctxCarte, w, h);

    ctxCarte.save();
    _appliquerTransformCamera(ctxCarte, w, h, etatCarte.camera);

    _dessinerTerrainRiche(ctxCarte, w, h, timestamp, etatCarte.positionsNoeuds);
    dessinerEtiquettesChapitres(etatCarte);
    dessinerChemins(etatCarte, timestamp);
    dessinerTousLesNoeuds(etatCarte, timestamp);
    _dessinerBrouillardFutur(ctxCarte, w, h, etatCarte);

    ctxCarte.restore();
}

function dessinerEtoilesFond(etatCarte, timestamp) {
    const { canvasCarte, ctxCarte } = etatCarte;
    if (!canvasCarte || !ctxCarte) return;
    const w = canvasCarte.width;
    const h = canvasCarte.height;
    const t = timestamp / 1000;

    verifierRegenerationEtoiles(w, h);

    if (!coucheEtoiles) {
        coucheEtoiles = [];
        for (let i = 0; i < 120; i++) {
            coucheEtoiles.push({
                x: Math.random() * w,
                y: Math.random() * h,
                r: 0.4 + Math.random() * 0.7,
                opBase: 0.08 + Math.random() * 0.18,
                phase: Math.random() * Math.PI * 2,
                vit: 0.0008 + Math.random() * 0.001,
                couleur: '#ffffff',
                couche: 0,
            });
        }
        const teintes = ['#aaeeff', '#ffccaa', '#ccaaff', '#aaffcc', '#ffaacc'];
        for (let i = 0; i < 60; i++) {
            coucheEtoiles.push({
                x: Math.random() * w,
                y: Math.random() * h,
                r: 0.8 + Math.random() * 1.0,
                opBase: 0.06 + Math.random() * 0.1,
                phase: Math.random() * Math.PI * 2,
                vit: 0.0015 + Math.random() * 0.002,
                couleur: teintes[i % teintes.length],
                couche: 1,
            });
        }
        for (let i = 0; i < 25; i++) {
            coucheEtoiles.push({
                x: Math.random() * w,
                y: Math.random() * h,
                r: 1.2 + Math.random() * 1.5,
                opBase: 0.25 + Math.random() * 0.35,
                phase: Math.random() * Math.PI * 2,
                vit: 0.002 + Math.random() * 0.004,
                couleur: '#ffffff',
                couche: 2,
            });
        }
    }

    ctxCarte.save();
    ctxCarte.strokeStyle = 'rgba(0,245,255,0.022)';
    ctxCarte.lineWidth = 0.5;
    const pas = 80;
    for (let x = 0; x < w; x += pas) {
        ctxCarte.beginPath();
        ctxCarte.moveTo(x, 0);
        ctxCarte.lineTo(x, h);
        ctxCarte.stroke();
    }
    for (let y = 0; y < h; y += pas) {
        ctxCarte.beginPath();
        ctxCarte.moveTo(0, y);
        ctxCarte.lineTo(w, y);
        ctxCarte.stroke();
    }
    ctxCarte.restore();

    for (const e of coucheEtoiles) {
        const scintil = 0.5 + 0.5 * Math.sin(t * e.vit * 1000 + e.phase);
        const op = e.opBase * (0.5 + 0.5 * scintil);
        ctxCarte.save();
        if (e.couche === 2) {
            ctxCarte.shadowColor = e.couleur;
            ctxCarte.shadowBlur = e.r * 3;
        }
        ctxCarte.fillStyle = e.couleur;
        ctxCarte.globalAlpha = op;
        ctxCarte.beginPath();
        ctxCarte.arc(e.x, e.y, e.r, 0, Math.PI * 2);
        ctxCarte.fill();
        ctxCarte.restore();
    }
}

function dessinerEtiquettesChapitres(etatCarte) {
    const { canvasCarte, ctxCarte, positionsNoeuds } = etatCarte;
    if (!canvasCarte || !ctxCarte) return;
    const w = canvasCarte.width;

    const rangees = [
        {
            chapId: 'prologue',
            mondeRef: 'monde_prologue',
            label: 'PROLOGUE',
            couleur: COULEURS_CHAPITRES.prologue,
        },
        {
            chapId: 'chapitre_1',
            mondeRef: 'monde_lave',
            label: 'â€” CHAPITRE I â€” LE FEU',
            couleur: COULEURS_CHAPITRES.chapitre_1,
        },
        {
            chapId: 'chapitre_2',
            mondeRef: 'monde_ocean',
            label: 'â€” CHAPITRE II â€” LES PROFONDEURS',
            couleur: COULEURS_CHAPITRES.chapitre_2,
        },
        {
            chapId: 'chapitre_3',
            mondeRef: 'monde_desert',
            label: 'â€” CHAPITRE III â€” LA MÃ‰MOIRE',
            couleur: COULEURS_CHAPITRES.chapitre_3,
        },
        {
            chapId: 'chapitre_4',
            mondeRef: 'monde_fuochi',
            label: 'â€” CHAPITRE IV â€” LA FRACTURE',
            couleur: COULEURS_CHAPITRES.chapitre_4,
        },
        {
            chapId: 'finale',
            mondeRef: 'monde_finale',
            label: 'â€” FINALE â€”',
            couleur: COULEURS_CHAPITRES.finale,
        },
    ];

    for (const { mondeRef, label, couleur } of rangees) {
        const pos = positionsNoeuds[mondeRef];
        if (!pos) continue;
        const y = pos.y - 50;

        ctxCarte.save();

        const gradLigne = ctxCarte.createLinearGradient(0, y, w, y);
        gradLigne.addColorStop(0, 'transparent');
        gradLigne.addColorStop(0.08, couleur + '55');
        gradLigne.addColorStop(0.5, couleur + '33');
        gradLigne.addColorStop(0.92, couleur + '55');
        gradLigne.addColorStop(1, 'transparent');
        ctxCarte.strokeStyle = gradLigne;
        ctxCarte.lineWidth = 0.8;
        ctxCarte.beginPath();
        ctxCarte.moveTo(0, y);
        ctxCarte.lineTo(w, y);
        ctxCarte.stroke();

        const lx = 14;
        ctxCarte.fillStyle = couleur;
        ctxCarte.globalAlpha = 0.6;
        ctxCarte.shadowColor = couleur;
        ctxCarte.shadowBlur = 6;
        ctxCarte.beginPath();
        ctxCarte.moveTo(lx, y - 4);
        ctxCarte.lineTo(lx + 4, y);
        ctxCarte.lineTo(lx, y + 4);
        ctxCarte.lineTo(lx - 4, y);
        ctxCarte.closePath();
        ctxCarte.fill();
        ctxCarte.shadowBlur = 0;

        ctxCarte.font = '7px "Press Start 2P", monospace';
        ctxCarte.textAlign = 'left';
        ctxCarte.globalAlpha = 0.75;
        ctxCarte.fillStyle = couleur;
        ctxCarte.shadowColor = couleur;
        ctxCarte.shadowBlur = 8;
        ctxCarte.fillText(label, 26, y - 5);

        ctxCarte.restore();
    }
}

function dessinerChemins(etatCarte, timestamp) {
    dessinerCheminsEpais(etatCarte, timestamp, CONNEXIONS_CHEMIN);
}

function dessinerTousLesNoeuds(etatCarte, timestamp) {
    const { positionsNoeuds, mondesVisibles, mondesFantomes } = etatCarte;
    const etatHist = obtenirEtatHistoire();
    const sequencePrincipale = SEQUENCE_HISTOIRE.filter((m) => !m.estCache);

    for (const monde of sequencePrincipale) {
        const pos = positionsNoeuds[monde.id];
        if (!pos) continue;

        if (!mondesVisibles.has(monde.id) && !mondesFantomes.has(monde.id)) {
            continue;
        }

        if (mondesFantomes.has(monde.id)) {
            _dessinerNoeudFantome(etatCarte, monde, pos, timestamp);
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

function _dessinerNoeudFantome(etatCarte, monde, pos, timestamp) {
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

function _traceFormeNoeud(ctx, x, y, rayon, estBoss) {
    if (estBoss) {
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            const a = (i / 6) * Math.PI * 2 - Math.PI / 6;
            const mx = x + rayon * Math.cos(a);
            const my = y + rayon * Math.sin(a);
            if (i === 0) ctx.moveTo(mx, my);
            else ctx.lineTo(mx, my);
        }
        ctx.closePath();
    } else {
        ctx.beginPath();
        ctx.arc(x, y, rayon, 0, Math.PI * 2);
    }
}

function _dessinerNoeudVerrouille(ctxCarte, monde, x, y, rayon, estBoss) {
    const gradBrume = ctxCarte.createRadialGradient(x, y, 0, x, y, rayon * 2.5);
    gradBrume.addColorStop(0, 'rgba(5,5,15,0.45)');
    gradBrume.addColorStop(1, 'transparent');
    ctxCarte.fillStyle = gradBrume;
    ctxCarte.beginPath();
    ctxCarte.arc(x, y, rayon * 2.5, 0, Math.PI * 2);
    ctxCarte.fill();

    ctxCarte.fillStyle = 'rgba(20,20,36,0.9)';
    ctxCarte.strokeStyle = 'rgba(40,40,60,0.5)';
    ctxCarte.lineWidth = 1;
    _traceFormeNoeud(ctxCarte, x, y, rayon, estBoss);
    ctxCarte.fill();
    ctxCarte.stroke();

    ctxCarte.fillStyle = 'rgba(100,100,130,0.6)';
    ctxCarte.font = `${Math.floor(rayon * 0.7)}px serif`;
    ctxCarte.textAlign = 'center';
    ctxCarte.textBaseline = 'middle';
    ctxCarte.fillText('ðŸ”’', x, y);

    ctxCarte.font = '5px "Press Start 2P", monospace';
    ctxCarte.fillStyle = 'rgba(60,60,80,0.7)';
    ctxCarte.fillText(monde.nomAffiche, x, y + rayon + 12);
}

function _dessinerAuraComplete(ctxCarte, x, y, rayon, couleur, t) {
    const angle = t * 0.4;
    for (let i = 0; i < 8; i++) {
        const a = angle + (i / 8) * Math.PI * 2;
        const rx = x + Math.cos(a) * (rayon + 10);
        const ry = y + Math.sin(a) * (rayon + 10);
        const op = 0.2 + 0.15 * Math.sin(t * 2 + i);
        ctxCarte.fillStyle = couleur;
        ctxCarte.globalAlpha = op;
        ctxCarte.beginPath();
        ctxCarte.arc(rx, ry, 1.5, 0, Math.PI * 2);
        ctxCarte.fill();
    }
    ctxCarte.globalAlpha = 1;

    const gradOk = ctxCarte.createRadialGradient(x, y, rayon * 0.6, x, y, rayon * 1.8);
    gradOk.addColorStop(0, couleur + '22');
    gradOk.addColorStop(1, 'transparent');
    ctxCarte.fillStyle = gradOk;
    ctxCarte.beginPath();
    ctxCarte.arc(x, y, rayon * 1.8, 0, Math.PI * 2);
    ctxCarte.fill();
}

function _dessinerPulseDisponible(ctxCarte, x, y, rayon, couleur, t) {
    const pulse = 0.5 + 0.5 * Math.sin(t * 2.2);
    const r1 = rayon + 6 + pulse * 5;
    const r2 = rayon + 14 + pulse * 4;

    ctxCarte.strokeStyle = couleur;
    ctxCarte.lineWidth = 1.5;
    ctxCarte.globalAlpha = 0.5 + pulse * 0.3;
    ctxCarte.shadowColor = couleur;
    ctxCarte.shadowBlur = 10 + pulse * 8;
    ctxCarte.beginPath();
    ctxCarte.arc(x, y, r1, 0, Math.PI * 2);
    ctxCarte.stroke();

    ctxCarte.globalAlpha = 0.2 + pulse * 0.15;
    ctxCarte.lineWidth = 0.8;
    ctxCarte.beginPath();
    ctxCarte.arc(x, y, r2, 0, Math.PI * 2);
    ctxCarte.stroke();

    ctxCarte.shadowBlur = 0;
    ctxCarte.globalAlpha = 1;
}

function _dessinerSurbrillanceNoeud(ctxCarte, x, y, rayon) {
    ctxCarte.strokeStyle = '#ffffff';
    ctxCarte.lineWidth = 2;
    ctxCarte.shadowColor = '#ffffff';
    ctxCarte.shadowBlur = 12;
    ctxCarte.globalAlpha = 0.8;
    ctxCarte.beginPath();
    ctxCarte.arc(x, y, rayon + 6, 0, Math.PI * 2);
    ctxCarte.stroke();
    ctxCarte.shadowBlur = 0;
    ctxCarte.globalAlpha = 1;
}

function _dessinerOrbePlanetaire(ctx, x, y, rayon, estBoss, estComplete, estDisponible, couleur) {
    const actif = estComplete || estDisponible;

    if (estBoss) {
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            const a = (i / 6) * Math.PI * 2 - Math.PI / 6;
            const bx2 = x + rayon * Math.cos(a);
            const by2 = y + rayon * Math.sin(a);
            if (i === 0) ctx.moveTo(bx2, by2);
            else ctx.lineTo(bx2, by2);
        }
        ctx.closePath();
    } else {
        ctx.beginPath();
        ctx.arc(x, y, rayon, 0, Math.PI * 2);
    }

    if (actif) {
        const gOrbe = ctx.createRadialGradient(
            x - rayon * 0.3,
            y - rayon * 0.3,
            rayon * 0.1,
            x,
            y,
            rayon
        );
        gOrbe.addColorStop(0, estComplete ? couleur + 'ff' : couleur + '88');
        gOrbe.addColorStop(0.4, couleur + (estComplete ? 'cc' : '55'));
        gOrbe.addColorStop(0.8, couleur + (estComplete ? '66' : '22'));
        gOrbe.addColorStop(1, couleur + '11');
        ctx.fillStyle = gOrbe;

        const gAtmo = ctx.createRadialGradient(x, y, rayon * 0.8, x, y, rayon * 1.6);
        gAtmo.addColorStop(0, couleur + '30');
        gAtmo.addColorStop(1, 'transparent');
        ctx.save();
        ctx.beginPath();
        ctx.arc(x, y, rayon * 1.6, 0, Math.PI * 2);
        ctx.fillStyle = gAtmo;
        ctx.fill();
        ctx.restore();
    } else {
        ctx.fillStyle = 'rgba(10,8,18,0.85)';
    }

    ctx.shadowColor = actif ? couleur : 'transparent';
    ctx.shadowBlur = estComplete ? 20 : estDisponible ? 14 : 0;
    ctx.fill();

    ctx.strokeStyle = actif ? couleur + 'aa' : 'rgba(40,35,60,0.6)';
    ctx.lineWidth = estComplete ? 1.5 : 1;
    ctx.stroke();
    ctx.shadowBlur = 0;

    if (actif) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(x, y, rayon, 0, Math.PI * 2);
        ctx.clip();
        const gReflet = ctx.createRadialGradient(
            x - rayon * 0.35,
            y - rayon * 0.35,
            0,
            x - rayon * 0.35,
            y - rayon * 0.35,
            rayon * 0.55
        );
        gReflet.addColorStop(0, 'rgba(255,255,255,0.28)');
        gReflet.addColorStop(1, 'transparent');
        ctx.fillStyle = gReflet;
        ctx.fillRect(x - rayon, y - rayon, rayon, rayon);
        ctx.restore();
    }
}

function dessinerNoeud(etatCarte, monde, pos, etatHist, timestamp) {
    const { ctxCarte, noeudSelectionne, noeudSurvole, mondeActuel } = etatCarte;
    if (!ctxCarte) return;
    const { x, y, rayon } = pos;
    const etatMonde = obtenirEtatMonde(monde.id, etatHist);
    const estComplete = etatMonde === 'complete';
    const estDisponible = etatMonde === 'disponible';
    const estVerrouille = etatMonde === 'verrouille';
    const estMondeActuel = mondeActuel === monde.id;
    const estSelectionne = noeudSelectionne === monde.id;
    const estSurvole = noeudSurvole === monde.id;
    const estBoss = monde.estBoss;
    const biome = BIOMES[monde.biomeId] ?? BIOMES.classique;
    const couleur = estComplete || estDisponible ? biome.lueurCoul : '#1a1a2e';
    const t = timestamp / 1000;

    ctxCarte.save();

    if (estVerrouille) {
        _dessinerNoeudVerrouille(ctxCarte, monde, x, y, rayon, estBoss);
        ctxCarte.restore();
        return;
    }

    if (estComplete) _dessinerAuraComplete(ctxCarte, x, y, rayon, couleur, t);
    else if (estDisponible) _dessinerPulseDisponible(ctxCarte, x, y, rayon, couleur, t);

    if (estMondeActuel && estDisponible) {
        const pulseActuel = 0.35 + 0.25 * Math.sin(t * 3);
        ctxCarte.strokeStyle = `rgba(0,245,255,${pulseActuel})`;
        ctxCarte.lineWidth = 2.5;
        ctxCarte.shadowColor = '#00f5ff';
        ctxCarte.shadowBlur = 12;
        ctxCarte.beginPath();
        ctxCarte.arc(x, y, rayon + 6 + Math.sin(t * 2) * 2, 0, Math.PI * 2);
        ctxCarte.stroke();
        ctxCarte.shadowBlur = 0;
    }

    if (estSelectionne || estSurvole) _dessinerSurbrillanceNoeud(ctxCarte, x, y, rayon);

    _dessinerOrbePlanetaire(ctxCarte, x, y, rayon, estBoss, estComplete, estDisponible, couleur);

    _dessinerIconeEtLabelNoeud(
        ctxCarte,
        etatCarte,
        monde,
        biome,
        x,
        y,
        rayon,
        estBoss,
        estComplete,
        estDisponible,
        couleur,
        timestamp
    );

    ctxCarte.restore();
}

function _dessinerIconeEtLabelNoeud(
    ctxCarte,
    etatCarte,
    monde,
    biome,
    x,
    y,
    rayon,
    estBoss,
    estComplete,
    estDisponible,
    couleur,
    timestamp
) {
    const iconAlpha = estComplete || estDisponible ? 1 : 0.25;
    ctxCarte.globalAlpha = iconAlpha;

    if (estComplete) {
        ctxCarte.font = `${Math.floor(rayon * 0.7)}px serif`;
        ctxCarte.textAlign = 'center';
        ctxCarte.textBaseline = 'middle';
        ctxCarte.fillText(biome.icone, x, y);

        ctxCarte.fillStyle = '#00ff88';
        ctxCarte.font = `bold ${Math.floor(rayon * 0.45)}px monospace`;
        ctxCarte.globalAlpha = 0.9;
        ctxCarte.fillText('âœ“', x + rayon * 0.55, y - rayon * 0.55);
    } else if (estDisponible) {
        ctxCarte.font = `${Math.floor(rayon * 0.7)}px serif`;
        ctxCarte.textAlign = 'center';
        ctxCarte.textBaseline = 'middle';
        ctxCarte.fillStyle = '#ffffff';
        ctxCarte.fillText(biome.icone, x, y);
    } else {
        ctxCarte.fillStyle = '#3a3a5a';
        ctxCarte.font = `${Math.floor(rayon * 0.6)}px serif`;
        ctxCarte.textAlign = 'center';
        ctxCarte.textBaseline = 'middle';
        ctxCarte.fillText('ðŸ”’', x, y);
    }
    ctxCarte.globalAlpha = 1;

    ctxCarte.font = '5px "Press Start 2P", monospace';
    ctxCarte.textAlign = 'center';
    ctxCarte.textBaseline = 'top';
    ctxCarte.fillStyle = estComplete || estDisponible ? couleur + 'cc' : 'rgba(50,50,70,0.6)';
    ctxCarte.shadowColor = estComplete || estDisponible ? couleur : 'transparent';
    ctxCarte.shadowBlur = estComplete ? 4 : 0;
    const labelY = estBoss ? y + rayon + 12 : y + rayon + 10;
    ctxCarte.fillText(monde.nomAffiche, x, labelY);
    ctxCarte.shadowBlur = 0;

    if (estDisponible) {
        dessinerRoboMiniature(etatCarte, x, y - rayon - 6, timestamp);
    }
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
        ctxCarte.fillText('âœ¦', x, y);

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
    const t = timestamp / 1000;
    const bond = Math.sin(t * 3.5) * 3.5;
    const cx = Math.round(x);
    const cy = Math.round(y - 18 + bond);

    ctxCarte.save();
    ctxCarte.shadowColor = '#00f5ff';
    ctxCarte.shadowBlur = 10 + Math.sin(t * 2) * 4;

    ctxCarte.fillStyle = '#5533aa';
    ctxCarte.fillRect(cx - 8, cy + 7, 16, 12);

    ctxCarte.fillStyle = '#221155';
    ctxCarte.fillRect(cx - 5, cy + 9, 10, 8);
    ctxCarte.strokeStyle = '#00ddc8';
    ctxCarte.lineWidth = 0.6;
    ctxCarte.strokeRect(cx - 5, cy + 9, 10, 8);
    ctxCarte.beginPath();
    ctxCarte.moveTo(cx - 3, cy + 13);
    ctxCarte.lineTo(cx + 3, cy + 13);
    ctxCarte.stroke();

    ctxCarte.fillStyle = '#cc2222';
    ctxCarte.shadowColor = '#ff3333';
    ctxCarte.shadowBlur = 6;
    ctxCarte.fillRect(cx - 7, cy - 2, 14, 10);

    ctxCarte.fillStyle = '#00ddc8';
    ctxCarte.shadowColor = '#00ddc8';
    ctxCarte.shadowBlur = 5;
    ctxCarte.beginPath();
    ctxCarte.arc(cx - 3, cy + 3, 2.5, 0, Math.PI * 2);
    ctxCarte.fill();
    ctxCarte.beginPath();
    ctxCarte.arc(cx + 3, cy + 3, 2.5, 0, Math.PI * 2);
    ctxCarte.fill();

    ctxCarte.fillStyle = '#081820';
    ctxCarte.shadowBlur = 0;
    ctxCarte.beginPath();
    ctxCarte.arc(cx - 3, cy + 3, 1, 0, Math.PI * 2);
    ctxCarte.fill();
    ctxCarte.beginPath();
    ctxCarte.arc(cx + 3, cy + 3, 1, 0, Math.PI * 2);
    ctxCarte.fill();

    ctxCarte.strokeStyle = '#8899aa';
    ctxCarte.lineWidth = 1;
    ctxCarte.beginPath();
    ctxCarte.moveTo(cx, cy - 2);
    ctxCarte.lineTo(cx, cy - 7);
    ctxCarte.stroke();

    const ledAlpha = 0.6 + 0.4 * Math.sin(t * 4);
    ctxCarte.fillStyle = '#00ff44';
    ctxCarte.globalAlpha = ledAlpha;
    ctxCarte.shadowColor = '#00ff44';
    ctxCarte.shadowBlur = 4;
    ctxCarte.beginPath();
    ctxCarte.arc(cx, cy - 8, 2, 0, Math.PI * 2);
    ctxCarte.fill();
    ctxCarte.globalAlpha = 1;
    ctxCarte.shadowBlur = 0;

    ctxCarte.strokeStyle = '#7a8899';
    ctxCarte.lineWidth = 1.5;
    for (let s = 0; s < 3; s++) {
        const dy = s * 3;
        ctxCarte.beginPath();
        ctxCarte.moveTo(cx - 8, cy + 9 + dy);
        ctxCarte.lineTo(cx - 12, cy + 9 + dy);
        ctxCarte.stroke();
        ctxCarte.beginPath();
        ctxCarte.moveTo(cx + 8, cy + 9 + dy);
        ctxCarte.lineTo(cx + 12, cy + 9 + dy);
        ctxCarte.stroke();
    }

    ctxCarte.strokeStyle = '#667788';
    ctxCarte.lineWidth = 2;
    ctxCarte.beginPath();
    ctxCarte.moveTo(cx - 4, cy + 19);
    ctxCarte.lineTo(cx - 4, cy + 24);
    ctxCarte.stroke();
    ctxCarte.beginPath();
    ctxCarte.moveTo(cx + 4, cy + 19);
    ctxCarte.lineTo(cx + 4, cy + 24);
    ctxCarte.stroke();
    ctxCarte.fillStyle = '#cc2222';
    ctxCarte.fillRect(cx - 7, cy + 24, 7, 4);
    ctxCarte.fillRect(cx + 1, cy + 24, 7, 4);

    ctxCarte.globalAlpha = 0.18 - bond * 0.02;
    ctxCarte.fillStyle = '#000000';
    ctxCarte.beginPath();
    ctxCarte.ellipse(cx, cy + 30, 9, 3, 0, 0, Math.PI * 2);
    ctxCarte.fill();
    ctxCarte.globalAlpha = 1;

    ctxCarte.restore();
}

function _dessinerBrouillardFutur(ctxCarte, w, h, etatCarte) {
    const { positionsNoeuds, mondesVisibles, mondesFantomes } = etatCarte;

    let yFrontiere = -1;
    for (const [id, pos] of Object.entries(positionsNoeuds)) {
        const estRelevant = mondesVisibles.has(id) || mondesFantomes.has(id);
        if (!estRelevant) continue;
        if (pos.y > yFrontiere) yFrontiere = pos.y;
    }

    if (yFrontiere < 0) return;

    const yDebut = yFrontiere + 50;

    const grad1 = ctxCarte.createLinearGradient(0, yDebut - 80, 0, yDebut + 40);
    grad1.addColorStop(0, 'transparent');
    grad1.addColorStop(1, 'rgba(2,2,14,0.78)');
    ctxCarte.save();
    ctxCarte.fillStyle = grad1;
    ctxCarte.fillRect(0, yDebut - 80, w, 120);
    ctxCarte.restore();

    if (yDebut + 40 < h) {
        ctxCarte.save();
        ctxCarte.fillStyle = 'rgba(2,2,14,0.82)';
        ctxCarte.fillRect(0, yDebut + 40, w, h - yDebut - 40);
        ctxCarte.restore();
    }

    if (yDebut + 40 < h) {
        ctxCarte.save();
        ctxCarte.font = '9px monospace';
        const symboles = ['âˆž', '?', '#', 'âš ', 'â€¦', 'â–‘'];
        for (let i = 0; i < 10; i++) {
            const sx = (i * 173) % w;
            const sy = yDebut + 60 + ((i * 83) % Math.max(1, h - yDebut - 80));
            const alpha = 0.04 + 0.02 * Math.sin(i * 1.7);
            ctxCarte.fillStyle = `rgba(180,0,60,${alpha})`;
            ctxCarte.fillText(symboles[i % symboles.length], sx, sy);
        }
        ctxCarte.restore();
    }

    const couleurHorizon = '#ff006e';
    const grad2 = ctxCarte.createLinearGradient(0, yDebut - 5, w, yDebut - 5);
    grad2.addColorStop(0, 'transparent');
    grad2.addColorStop(0.2, couleurHorizon + '20');
    grad2.addColorStop(0.5, couleurHorizon + '40');
    grad2.addColorStop(0.8, couleurHorizon + '20');
    grad2.addColorStop(1, 'transparent');
    ctxCarte.save();
    ctxCarte.strokeStyle = grad2;
    ctxCarte.lineWidth = 1;
    ctxCarte.beginPath();
    ctxCarte.moveTo(0, yDebut);
    ctxCarte.lineTo(w, yDebut);
    ctxCarte.stroke();
    ctxCarte.restore();
}

function _dessinerVignette(ctxCarte, w, h) {
    const grad = ctxCarte.createRadialGradient(
        w / 2,
        h / 2,
        h * 0.3,
        w / 2,
        h / 2,
        Math.max(w, h) * 0.75
    );
    grad.addColorStop(0, 'transparent');
    grad.addColorStop(1, 'rgba(1,1,8,0.65)');
    ctxCarte.save();
    ctxCarte.fillStyle = grad;
    ctxCarte.fillRect(0, 0, w, h);
    ctxCarte.restore();
}
