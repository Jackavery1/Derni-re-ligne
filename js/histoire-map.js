import { SEQUENCE_HISTOIRE, JOURNAUX_VERA } from './histoire-donnees.js';
import { BIOMES } from './config.js';
import { obtenirCanvas } from './dom-utils.js';
import {
    obtenirEtatHistoire,
    mondePeutEtreJoue,
    obtenirEtatMonde,
    demarrerMondeHistoire,
    demarrerMondeHistoireCache,
    masquerPanneauDetails,
    obtenirProgressionGlobale,
    SEUILS_COMPLETION,
} from './histoire-manager.js';
import { paradoxeEstDebloque } from './monde-paradoxe.js';

/** @type {HTMLCanvasElement | null} */
let canvasCarte = null;
/** @type {CanvasRenderingContext2D | null} */
let ctxCarte = null;
let idFrameCarte = null;
let carteActive = false;
let noeudSurvole = null;
let noeudSelectionne = null;
let dernierTapNoeud = null;
let dernierTapTemps = 0;
/** @type {Record<string, { x: number, y: number, rayon: number }>} */
let positionsNoeuds = {};
let _evenementsCarteAttaches = false;

export function initialiserCarteMonde() {
    canvasCarte = obtenirCanvas('canvas-histoire-map');
    if (!canvasCarte) return false;
    ctxCarte = canvasCarte.getContext('2d');
    _redimensionnerCanvas();
    _calculerPositionsNoeuds();
    if (!_evenementsCarteAttaches) {
        _attacherEvenementsCarteHistoire();
        _evenementsCarteAttaches = true;
    }
    _mettreAJourEnteteHistoire();
    return true;
}

function _redimensionnerCanvas() {
    if (!canvasCarte) return;
    canvasCarte.width = window.innerWidth;
    canvasCarte.height = window.innerHeight;
}

function _calculerPositionsNoeuds() {
    positionsNoeuds = {};
    if (!canvasCarte) return;

    const w = canvasCarte.width;
    const h = canvasCarte.height;
    const pX = w * 0.1;
    const pY = h * 0.09;
    const zoneH = h - pY * 2;
    const zoneW = w - pX * 2;
    const NB_RANGEES = 6;
    const pasY = zoneH / (NB_RANGEES - 1);

    _placerNoeud('monde_prologue', w / 2, pY, 22);

    const y1 = pY + pasY;
    _placerNoeud('monde_lave', pX + zoneW * 0.15, y1, 22);
    _placerNoeud('monde_rouille', pX + zoneW * 0.5, y1, 22);
    _placerNoeud('monde_boss_1', pX + zoneW * 0.85, y1, 28);

    const y2 = pY + pasY * 2;
    _placerNoeud('monde_ocean', pX + zoneW * 0.08, y2, 22);
    _placerNoeud('monde_foret', pX + zoneW * 0.33, y2, 22);
    _placerNoeud('monde_glace', pX + zoneW * 0.6, y2, 22);
    _placerNoeud('monde_boss_2', pX + zoneW * 0.88, y2, 28);

    const y3 = pY + pasY * 3;
    _placerNoeud('monde_desert', pX + zoneW * 0.08, y3, 22);
    _placerNoeud('monde_eclipse', pX + zoneW * 0.33, y3, 22);
    _placerNoeud('monde_cyber', pX + zoneW * 0.6, y3, 22);
    _placerNoeud('monde_boss_3', pX + zoneW * 0.88, y3, 28);

    const y4 = pY + pasY * 4;
    _placerNoeud('monde_fuochi', pX + zoneW * 0.08, y4, 22);
    _placerNoeud('monde_cosmos', pX + zoneW * 0.33, y4, 22);
    _placerNoeud('monde_vide', pX + zoneW * 0.6, y4, 22);
    _placerNoeud('monde_boss_4', pX + zoneW * 0.88, y4, 28);

    _placerNoeud('monde_finale', w / 2, pY + pasY * 5, 32);

    const etatHist = obtenirEtatHistoire();

    if (
        etatHist.conditionsMiroir.bossArchivisteVaincu &&
        etatHist.conditionsMiroir.tetrisTriplesCyber >= 3
    ) {
        _placerNoeud('monde_miroir', pX * 0.35, positionsNoeuds['monde_eclipse']?.y ?? h / 2, 20);
    }

    if (etatHist.conditionsTrame.miroirComplete) {
        _placerNoeud(
            'monde_trame',
            w - pX * 0.35,
            positionsNoeuds['monde_foret']?.y ?? h * 0.4,
            20
        );
    }

    if (paradoxeEstDebloque()) {
        _placerNoeud('monde_paradoxe', pX * 0.12, h - pY * 0.6, 8);
    }
}

/** @param {string} id @param {number} x @param {number} y @param {number} rayon */
function _placerNoeud(id, x, y, rayon) {
    positionsNoeuds[id] = { x, y, rayon };
}

export function demarrerCarteHistoire() {
    arreterCarteHistoire();
    if (!initialiserCarteMonde()) return;
    carteActive = true;
    idFrameCarte = requestAnimationFrame(_boucleCarte);
}

export function arreterCarteHistoire() {
    carteActive = false;
    if (idFrameCarte) {
        cancelAnimationFrame(idFrameCarte);
        idFrameCarte = null;
    }
}

/** @param {number} timestamp */
function _boucleCarte(timestamp) {
    if (!carteActive || !ctxCarte || !canvasCarte) return;
    _dessinerCarte(timestamp);
    idFrameCarte = requestAnimationFrame(_boucleCarte);
}

/** @param {number} timestamp */
function _dessinerCarte(timestamp) {
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

    _dessinerEtoilesFond(timestamp);
    _dessinerEtiquettesChapitres();
    _dessinerChemins(timestamp);
    _dessinerTousLesNoeuds(timestamp);
}

/** @type {Array<{ x: number, y: number, r: number, phase: number, vitesse: number }> | null} */
let _etoilesGenerees = null;

/** @param {number} timestamp */
function _dessinerEtoilesFond(timestamp) {
    if (!_etoilesGenerees) {
        _etoilesGenerees = [];
        for (let i = 0; i < 180; i++) {
            _etoilesGenerees.push({
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
    for (const e of _etoilesGenerees) {
        const alpha = 0.15 + 0.35 * (0.5 + 0.5 * Math.sin(timestamp * e.vitesse + e.phase));
        ctxCarte.fillStyle = `rgba(255,255,255,${alpha.toFixed(2)})`;
        ctxCarte.beginPath();
        ctxCarte.arc(e.x * w, e.y * h, e.r, 0, Math.PI * 2);
        ctxCarte.fill();
    }
}

function _dessinerEtiquettesChapitres() {
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

/** @param {number} timestamp */
function _dessinerChemins(timestamp) {
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

/** @param {number} timestamp */
function _dessinerTousLesNoeuds(timestamp) {
    const etatHist = obtenirEtatHistoire();
    const sequencePrincipale = SEQUENCE_HISTOIRE.filter((m) => !m.estCache);

    for (const monde of sequencePrincipale) {
        const pos = positionsNoeuds[monde.id];
        if (!pos) continue;
        _dessinerNoeud(monde, pos, etatHist, timestamp);
    }

    const caches = SEQUENCE_HISTOIRE.filter((m) => m.estCache);
    for (const monde of caches) {
        const pos = positionsNoeuds[monde.id];
        if (!pos) continue;
        _dessinerNoeudCache(monde, pos, etatHist, timestamp);
    }
}

/**
 * @param {typeof SEQUENCE_HISTOIRE[number]} monde
 * @param {{ x: number, y: number, rayon: number }} pos
 * @param {ReturnType<typeof obtenirEtatHistoire>} etatHist
 * @param {number} timestamp
 */
function _dessinerNoeud(monde, pos, etatHist, timestamp) {
    const { x, y, rayon } = pos;
    const etatMonde = obtenirEtatMonde(monde.id, etatHist);
    const estComplete = etatMonde === 'complete';
    const estDisponible = etatMonde === 'disponible';
    const estSelectionne = noeudSelectionne === monde.id;
    const estSurvole = noeudSurvole === monde.id;

    const biome = BIOMES[monde.biomeId] ?? BIOMES.classique;
    const couleur = estComplete || estDisponible ? biome.lueurCoul : '#1a1a2e';

    const t = timestamp / 900;
    const pulse = 0.5 + 0.5 * Math.sin(t);

    ctxCarte.save();

    if (estDisponible && !estComplete) {
        ctxCarte.shadowColor = couleur;
        ctxCarte.shadowBlur = 10 + pulse * 16;
        ctxCarte.strokeStyle = couleur;
        ctxCarte.lineWidth = 1;
        ctxCarte.beginPath();
        ctxCarte.arc(x, y, rayon + 8 + pulse * 4, 0, Math.PI * 2);
        ctxCarte.stroke();
        ctxCarte.shadowBlur = 0;
    }

    if (estSelectionne || estSurvole) {
        ctxCarte.strokeStyle = '#ffffff';
        ctxCarte.lineWidth = 2;
        ctxCarte.shadowColor = '#ffffff';
        ctxCarte.shadowBlur = 8;
        ctxCarte.beginPath();
        ctxCarte.arc(x, y, rayon + 5, 0, Math.PI * 2);
        ctxCarte.stroke();
        ctxCarte.shadowBlur = 0;
    }

    ctxCarte.shadowColor = couleur;
    ctxCarte.shadowBlur = estComplete || estDisponible ? 10 : 0;

    if (monde.estBoss) {
        ctxCarte.beginPath();
        for (let i = 0; i < 6; i++) {
            const angle = (i * Math.PI) / 3 - Math.PI / 6;
            const px = x + rayon * Math.cos(angle);
            const py = y + rayon * Math.sin(angle);
            if (i === 0) ctxCarte.moveTo(px, py);
            else ctxCarte.lineTo(px, py);
        }
        ctxCarte.closePath();
    } else {
        ctxCarte.beginPath();
        ctxCarte.arc(x, y, rayon, 0, Math.PI * 2);
    }

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

    const alpha = estComplete || estDisponible ? 1 : 0.25;
    ctxCarte.globalAlpha = alpha;
    ctxCarte.font = monde.estBoss ? '16px serif' : '13px serif';
    ctxCarte.textAlign = 'center';
    ctxCarte.textBaseline = 'middle';
    if (!estDisponible && !estComplete) {
        ctxCarte.fillStyle = '#3a3a5a';
        ctxCarte.font = '13px serif';
        ctxCarte.fillText('🔒', x, y);
    } else if (estComplete) {
        ctxCarte.fillStyle = '#ffffff';
        ctxCarte.fillText('✓', x, y);
    } else {
        ctxCarte.fillStyle = '#ffffff';
        ctxCarte.fillText(biome.icone, x, y);
    }
    ctxCarte.globalAlpha = 1;

    ctxCarte.font = '5px "Press Start 2P", monospace';
    ctxCarte.textAlign = 'center';
    ctxCarte.fillStyle = estComplete || estDisponible ? couleur + 'cc' : '#2a2a4a';
    const labelY = monde.estBoss ? y + rayon + 13 : y + rayon + 11;
    ctxCarte.fillText(monde.nomAffiche, x, labelY);

    if (estDisponible && !estComplete) {
        _dessinerRoboMiniature(x, y - rayon - 4, timestamp);
    }

    ctxCarte.restore();
}

/**
 * @param {typeof SEQUENCE_HISTOIRE[number]} monde
 * @param {{ x: number, y: number, rayon: number }} pos
 * @param {ReturnType<typeof obtenirEtatHistoire>} etatHist
 * @param {number} timestamp
 */
function _dessinerNoeudCache(monde, pos, etatHist, timestamp) {
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

/** @param {number} x @param {number} y @param {number} timestamp */
function _dessinerRoboMiniature(x, y, timestamp) {
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

function _attacherEvenementsCarteHistoire() {
    if (!canvasCarte) return;

    canvasCarte.addEventListener('mousemove', (e) => {
        const { cx, cy } = _coordsCanvas(e.clientX, e.clientY);
        const noeud = _noeudSousCurseur(cx, cy);
        const precedent = noeudSurvole;
        noeudSurvole = noeud?.id ?? null;
        if (noeudSurvole !== precedent) {
            canvasCarte.style.cursor = noeud ? 'pointer' : 'default';
        }
    });

    canvasCarte.addEventListener('mouseleave', () => {
        noeudSurvole = null;
        canvasCarte.style.cursor = 'default';
    });

    canvasCarte.addEventListener('click', (e) => {
        const { cx, cy } = _coordsCanvas(e.clientX, e.clientY);
        _traiterSelectionNoeud(_noeudSousCurseur(cx, cy), false);
    });

    canvasCarte.addEventListener(
        'touchend',
        (e) => {
            e.preventDefault();
            const touch = e.changedTouches[0];
            if (!touch) return;
            const { cx, cy } = _coordsCanvas(touch.clientX, touch.clientY);
            const noeud = _noeudSousCurseur(cx, cy);
            const maintenant = Date.now();
            const doubleTap =
                !!noeud && noeud.id === dernierTapNoeud && maintenant - dernierTapTemps < 450;
            dernierTapNoeud = noeud?.id ?? null;
            dernierTapTemps = maintenant;
            _traiterSelectionNoeud(noeud, doubleTap);
        },
        { passive: false }
    );
}

/** @param {ReturnType<typeof _noeudSousCurseur>} noeud @param {boolean} doubleTap */
function _traiterSelectionNoeud(noeud, doubleTap) {
    if (!noeud) {
        noeudSelectionne = null;
        masquerPanneauDetails();
        return;
    }

    noeudSelectionne = noeud.id;
    _mettreAJourPanneauDetails(noeud.monde, obtenirEtatHistoire());

    if (doubleTap && mondePeutEtreJoue(noeud.monde.id, obtenirEtatHistoire())) {
        _lancerMondeDepuisCarte(noeud.monde);
    }
}

/** @param {typeof SEQUENCE_HISTOIRE[number]} monde */
function _lancerMondeDepuisCarte(monde) {
    if (['monde_miroir', 'monde_trame', 'monde_paradoxe'].includes(monde.id)) {
        demarrerMondeHistoireCache(monde.id);
    } else {
        demarrerMondeHistoire(monde.id);
    }
}

/** @param {number} clientX @param {number} clientY */
function _coordsCanvas(clientX, clientY) {
    if (!canvasCarte) return { cx: clientX, cy: clientY };
    const rect = canvasCarte.getBoundingClientRect();
    const scaleX = canvasCarte.width / rect.width;
    const scaleY = canvasCarte.height / rect.height;
    return {
        cx: (clientX - rect.left) * scaleX,
        cy: (clientY - rect.top) * scaleY,
    };
}

/** @param {number} cx @param {number} cy */
function _noeudSousCurseur(cx, cy) {
    for (const [id, pos] of Object.entries(positionsNoeuds)) {
        const dx = cx - pos.x;
        const dy = cy - pos.y;
        const hitRadius = pos.rayon + 10;
        if (dx * dx + dy * dy <= hitRadius * hitRadius) {
            const monde = SEQUENCE_HISTOIRE.find((m) => m.id === id);
            if (!monde) continue;
            return { id, monde, pos };
        }
    }
    return null;
}

/**
 * @param {typeof SEQUENCE_HISTOIRE[number]} monde
 * @param {ReturnType<typeof obtenirEtatHistoire>} etatHist
 */
function _mettreAJourPanneauDetails(monde, etatHist) {
    const panneau = document.getElementById('histoire-monde-details');
    if (!panneau || !monde) return;

    const biome = BIOMES[monde.biomeId] ?? BIOMES.classique;
    const etatMonde = obtenirEtatMonde(monde.id, etatHist);
    const estBoss = monde.estBoss;

    const elNom = /** @type {HTMLElement | null} */ (panneau.querySelector('.histoire-detail-nom'));
    if (elNom) {
        elNom.textContent = monde.nomAffiche;
        elNom.style.color = biome.lueurCoul;
        elNom.style.textShadow = `0 0 8px ${biome.lueurCoul}`;
    }

    const elType = /** @type {HTMLElement | null} */ (
        panneau.querySelector('.histoire-detail-type')
    );
    if (elType) {
        elType.textContent = estBoss ? '⚔ COMBAT DE BOSS' : `${biome.icone} ${biome.nom}`;
        elType.style.color = estBoss ? 'var(--rose)' : biome.lueurCoul;
    }

    const elStatut = /** @type {HTMLElement | null} */ (
        panneau.querySelector('.histoire-detail-statut')
    );
    if (elStatut) {
        if (etatMonde === 'complete') {
            elStatut.textContent = '✓ COMPLÉTÉ';
            elStatut.style.color = 'var(--vert)';
        } else if (etatMonde === 'disponible') {
            const seuil = SEUILS_COMPLETION[monde.biomeId] ?? 10;
            elStatut.textContent = `OBJECTIF : ${seuil} LIGNES`;
            elStatut.style.color = 'var(--texte-dim)';
        } else {
            elStatut.textContent = '🔒 VERROUILLÉ';
            elStatut.style.color = 'var(--texte-dim)';
        }
    }

    const elJournal = /** @type {HTMLElement | null} */ (
        panneau.querySelector('.histoire-detail-journal')
    );
    if (elJournal) {
        const journalDispo = JOURNAUX_VERA.find(
            (j) => j.biomeId === monde.biomeId && !etatHist.journauxTrouves.includes(j.id)
        );
        elJournal.textContent = journalDispo ? '📔 TRANSMISSION CACHÉE' : '';
    }

    const btnJouer = /** @type {HTMLButtonElement | null} */ (
        panneau.querySelector('.bouton-jouer-monde')
    );
    if (btnJouer) {
        const peutJouer = etatMonde !== 'verrouille';
        btnJouer.style.display = peutJouer ? 'block' : 'none';
        btnJouer.textContent = etatMonde === 'complete' ? '↺ REJOUER' : '▶ JOUER';
        btnJouer.onclick = () => _lancerMondeDepuisCarte(monde);
    }

    panneau.style.display = 'flex';
}

function _mettreAJourEnteteHistoire() {
    const prog = obtenirProgressionGlobale();
    const elMondes = document.getElementById('histoire-prog-mondes');
    const elJournaux = document.getElementById('histoire-prog-journaux');
    if (elMondes) elMondes.textContent = `${prog.nbCompletes}/${prog.nbTotal} MONDES`;
    if (elJournaux)
        elJournaux.textContent = `${prog.nbJournaux}/${prog.nbJournauxTotal} TRANSMISSIONS`;
}

export function redimensionnerCarteHistoire() {
    if (!canvasCarte || !carteActive) return;
    _redimensionnerCanvas();
    _calculerPositionsNoeuds();
}
