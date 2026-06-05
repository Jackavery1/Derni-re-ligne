import { CONFIG, BIOMES } from './config.js';
import { meteo } from './meteo.js';
import { logger } from './logger.js';
import { dessinerCelluleStyle } from './rendu-blocs.js';
import {
    etat,
    particules,
    particulesAmbiance,
    textesFlottants,
    couleurAmbRgb,
    secousse,
    flashVerrou,
    flashLignes,
    DUREE_TRANSITION,
    NB_PARTICULES_AMBIANCE,
    CARACTERES_HEX,
    VERTS_FORET,
    obtenirBiomeActif,
    obtenirTransitionAlpha,
    obtenirTransitionDebut,
    obtenirTempsAmbianceDecor,
    obtenirReliqueActive,
    obtenirEffetsReduits,
    obtenirPrefererMoinsAnimations,
    obtenirCanvasPlateau,
    obtenirCtx,
    obtenirCtxPreview,
    obtenirCanvasPreview,
    definirTransitionAlpha,
    definirTransitionDebut,
    reinitialiserTempsAmbianceDecor,
    ajouterTempsAmbianceDecor,
} from './contexte-jeu.js';
import {
    getCouleurPiece,
    obtenirForme,
    obtenirCouleurPiece,
    calculerDistanceChute,
    hexVersRgb,
} from './piece-jeu.js';

function aleaEntre(min, max) {
    return min + Math.random() * (max - min);
}

export function dessinerCellule(ctx2d, x, y, couleur, taille = CONFIG.taille, opacite = 1) {
    dessinerCelluleStyle(ctx2d, x, y, couleur, taille, opacite, obtenirBiomeActif(), {
        effetsReduits: obtenirEffetsReduits(),
        prefererMoinsAnimations: obtenirPrefererMoinsAnimations(),
    });
}

export function mettreAJourAmbiante(dt) {
    if (!etat.pieceActuelle) return;
    const cible = hexVersRgb(getCouleurPiece(etat.pieceActuelle.type));
    const t = Math.min(1, dt / 200);
    for (let i = 0; i < 3; i++) {
        couleurAmbRgb[i] += (cible[i] - couleurAmbRgb[i]) * t;
    }
}

function dessinerAmbianceJeu() {
    if (obtenirEffetsReduits()) return;
    const w = obtenirCanvasPlateau().width;
    const h = obtenirCanvasPlateau().height;
    const r = Math.round(couleurAmbRgb[0]);
    const g = Math.round(couleurAmbRgb[1]);
    const b = Math.round(couleurAmbRgb[2]);
    const amb = `rgba(${r},${g},${b}`;

    const gradBas = obtenirCtx().createRadialGradient(w / 2, h * 0.85, 0, w / 2, h * 0.85, w * 0.9);
    gradBas.addColorStop(0, `${amb},0.11)`);
    gradBas.addColorStop(1, `${amb},0)`);
    obtenirCtx().fillStyle = gradBas;
    obtenirCtx().fillRect(0, 0, w, h);

    if (etat.pieceActuelle) {
        const cx = etat.pieceActuelle.x * CONFIG.taille;
        const gradHaut = obtenirCtx().createRadialGradient(cx, 0, 0, cx, 0, w * 0.7);
        gradHaut.addColorStop(0, `${amb},0.07)`);
        gradHaut.addColorStop(1, `${amb},0)`);
        obtenirCtx().fillStyle = gradHaut;
        obtenirCtx().fillRect(0, 0, w, h);
    }
}

function dessinerVignette() {
    if (obtenirEffetsReduits()) return;
    const w = obtenirCanvasPlateau().width;
    const h = obtenirCanvasPlateau().height;
    const grad = obtenirCtx().createRadialGradient(w / 2, h / 2, h * 0.25, w / 2, h / 2, h * 0.78);
    grad.addColorStop(0, 'rgba(0,0,0,0)');
    grad.addColorStop(1, 'rgba(0,0,0,0.40)');
    obtenirCtx().fillStyle = grad;
    obtenirCtx().fillRect(0, 0, w, h);
}

export function declencherSecousse(intensite) {
    secousse.timer = secousse.duree;
    secousse.intensite = intensite;
}

export function getDecalageSecousse() {
    if (secousse.timer <= 0) return { x: 0, y: 0 };
    const force = secousse.intensite * (secousse.timer / secousse.duree);
    const t = secousse.timer * 0.05;
    return {
        x: Math.sin(t * 7.3) * force,
        y: Math.cos(t * 5.1) * force,
    };
}

export function mettreAJourSecousse(dt) {
    if (secousse.timer > 0) secousse.timer -= dt;
}

export function dessinerFlashVerrou() {
    if (flashVerrou.timer <= 0) return;
    const opacite = (flashVerrou.timer / flashVerrou.duree) * 0.8;
    obtenirCtx().save();
    obtenirCtx().globalAlpha = opacite;
    obtenirCtx().fillStyle = '#ffffff';
    for (const cell of flashVerrou.cellules) {
        obtenirCtx().fillRect(cell.x * CONFIG.taille, cell.y * CONFIG.taille, CONFIG.taille, CONFIG.taille);
    }
    obtenirCtx().restore();
}

export function dessinerFlashLignes() {
    if (flashLignes.timer <= 0) return;
    const opacite = Math.min(0.9, flashLignes.timer / flashLignes.duree);
    obtenirCtx().save();
    obtenirCtx().globalAlpha = opacite;
    obtenirCtx().fillStyle = '#ffffff';
    for (const l of flashLignes.lignes) {
        obtenirCtx().fillRect(0, l * CONFIG.taille, obtenirCanvasPlateau().width, CONFIG.taille);
    }
    obtenirCtx().restore();
}

function creerParticuleAmbiance(idBiome) {
    const w = obtenirCanvasPlateau().width;
    const h = obtenirCanvasPlateau().height;
    const base = {
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        taille: 4,
        opacite: 0.2,
        couleur: '#ffffff',
        rotation: 0,
        vRot: 0,
        timer: 0,
        char: null,
    };

    switch (idBiome) {
        case 'lave':
            return Object.assign(base, {
                x: aleaEntre(0, w),
                y: aleaEntre(h * 0.3, h),
                vx: aleaEntre(-0.2, 0.2),
                vy: aleaEntre(-0.9, -0.35),
                taille: aleaEntre(4, 11),
                opacite: aleaEntre(0.15, 0.3),
                couleur: Math.random() < 0.5 ? '#ff4500' : '#ff6a00',
            });
        case 'ocean':
            return Object.assign(base, {
                x: aleaEntre(0, w),
                y: aleaEntre(h * 0.4, h),
                vx: aleaEntre(-0.08, 0.08),
                vy: aleaEntre(-0.35, -0.12),
                taille: aleaEntre(3, 8),
                opacite: aleaEntre(0.1, 0.2),
                couleur: Math.random() < 0.5 ? '#00cfff' : '#00e5ff',
            });
        case 'foret':
            return Object.assign(base, {
                x: aleaEntre(0, w),
                y: aleaEntre(-20, h * 0.3),
                vx: aleaEntre(-0.25, 0.25),
                vy: aleaEntre(0.2, 0.55),
                taille: aleaEntre(5, 10),
                opacite: aleaEntre(0.1, 0.25),
                couleur: VERTS_FORET[Math.floor(Math.random() * VERTS_FORET.length)],
                rotation: aleaEntre(0, Math.PI * 2),
                vRot: aleaEntre(-0.02, 0.02),
            });
        case 'glace':
            return Object.assign(base, {
                x: aleaEntre(0, w),
                y: aleaEntre(-15, h * 0.2),
                vx: aleaEntre(-0.15, 0.15),
                vy: aleaEntre(0.15, 0.4),
                taille: aleaEntre(1.5, 4),
                opacite: aleaEntre(0.08, 0.2),
                couleur: '#ffffff',
            });
        case 'desert':
            return Object.assign(base, {
                x: aleaEntre(-10, w * 0.3),
                y: aleaEntre(0, h),
                vx: aleaEntre(0.4, 1.1),
                vy: aleaEntre(-0.05, 0.05),
                taille: aleaEntre(1.5, 3.5),
                opacite: aleaEntre(0.05, 0.15),
                couleur: Math.random() < 0.5 ? '#ffbb44' : '#ffcc66',
            });
        case 'cyber':
            return Object.assign(base, {
                x: aleaEntre(0, w),
                y: aleaEntre(-20, h * 0.15),
                vx: aleaEntre(-0.05, 0.05),
                vy: aleaEntre(0.35, 0.75),
                taille: aleaEntre(6, 9),
                opacite: aleaEntre(0.05, 0.12),
                couleur: Math.random() < 0.5 ? '#ff00ff' : '#aa00ff',
                char: CARACTERES_HEX[Math.floor(Math.random() * 16)],
            });
        case 'fuochi': {
            const couleurs = BIOMES.fuochi.couleursBlocs;
            return Object.assign(base, {
                x: aleaEntre(0, w),
                y: aleaEntre(0, h),
                vx: aleaEntre(-0.6, 0.6),
                vy: aleaEntre(-0.6, 0.6),
                taille: aleaEntre(2, 5),
                opacite: aleaEntre(0.3, 0.6),
                couleur: couleurs[Math.floor(Math.random() * couleurs.length)],
                timer: aleaEntre(200, 600),
            });
        }
        case 'cosmos':
            return Object.assign(base, {
                x: aleaEntre(0, w),
                y: aleaEntre(0, h),
                vx: 0,
                vy: 0,
                taille: aleaEntre(1, 2.5),
                opacite: aleaEntre(0.05, 0.4),
                couleur: '#ffffff',
                timer: Math.random() * Math.PI * 2,
            });
        default:
            return base;
    }
}

export function initParticulesAmbiance() {
    particulesAmbiance.length = 0;
    const nb = NB_PARTICULES_AMBIANCE[obtenirBiomeActif()] ?? 0;
    for (let i = 0; i < nb; i++) {
        particulesAmbiance.push(creerParticuleAmbiance(obtenirBiomeActif()));
    }
    reinitialiserTempsAmbianceDecor();
}

function reinitialiserParticuleAmbiance(p) {
    const frais = creerParticuleAmbiance(obtenirBiomeActif());
    p.x = frais.x;
    p.y = frais.y;
    p.vx = frais.vx;
    p.vy = frais.vy;
    p.taille = frais.taille;
    p.opacite = frais.opacite;
    p.couleur = frais.couleur;
    p.rotation = frais.rotation;
    p.vRot = frais.vRot;
    p.timer = frais.timer;
    p.char = frais.char;
}

export function mettreAJourParticulesAmbiance(dt) {
    if (particulesAmbiance.length === 0) return;
    const facteur = dt / 16;
    const w = obtenirCanvasPlateau().width;
    const h = obtenirCanvasPlateau().height;
    ajouterTempsAmbianceDecor(dt);

    for (let i = 0; i < particulesAmbiance.length; i++) {
        const p = particulesAmbiance[i];

        switch (obtenirBiomeActif()) {
            case 'lave':
            case 'ocean':
                p.x += p.vx * facteur;
                p.y += p.vy * facteur;
                if (p.y < -p.taille) reinitialiserParticuleAmbiance(p);
                break;
            case 'foret':
            case 'glace':
                p.x += p.vx * facteur;
                p.y += p.vy * facteur;
                p.rotation += p.vRot * facteur;
                if (p.y > h + p.taille) reinitialiserParticuleAmbiance(p);
                break;
            case 'desert':
                p.x += p.vx * facteur;
                p.y += p.vy * facteur;
                if (p.x > w + p.taille) reinitialiserParticuleAmbiance(p);
                break;
            case 'cyber':
                p.y += p.vy * facteur;
                if (p.y > h + 10) reinitialiserParticuleAmbiance(p);
                break;
            case 'fuochi':
                p.timer -= dt;
                p.x += p.vx * facteur;
                p.y += p.vy * facteur;
                p.opacite = Math.max(0, p.timer / 400) * 0.6;
                if (p.timer <= 0) reinitialiserParticuleAmbiance(p);
                break;
            case 'cosmos':
                p.timer += dt * 0.003;
                p.opacite = 0.05 + (Math.sin(p.timer) * 0.5 + 0.5) * 0.35;
                break;
        }
    }
}

function dessinerScanlinesOcean() {
    const w = obtenirCanvasPlateau().width;
    const h = obtenirCanvasPlateau().height;
    const offset = (obtenirTempsAmbianceDecor() * 0.025) % 48;
    obtenirCtx().save();
    for (let y = -48 + offset; y < h; y += 48) {
        const grad = obtenirCtx().createLinearGradient(0, y, w, y + 6);
        grad.addColorStop(0, 'rgba(0,160,255,0)');
        grad.addColorStop(0.5, 'rgba(0,200,255,0.035)');
        grad.addColorStop(1, 'rgba(0,160,255,0)');
        obtenirCtx().fillStyle = grad;
        obtenirCtx().fillRect(0, y, w, 6);
    }
    obtenirCtx().restore();
}

function dessinerParticulesAmbiance() {
    if (obtenirEffetsReduits() || particulesAmbiance.length === 0) return;

    for (let i = 0; i < particulesAmbiance.length; i++) {
        const p = particulesAmbiance[i];
        obtenirCtx().save();
        obtenirCtx().globalAlpha = p.opacite;

        if (obtenirBiomeActif() === 'cyber' && p.char) {
            obtenirCtx().fillStyle = p.couleur;
            obtenirCtx().font = `${Math.round(p.taille)}px monospace`;
            obtenirCtx().fillText(p.char, p.x, p.y);
        } else if (obtenirBiomeActif() === 'foret') {
            obtenirCtx().translate(p.x + p.taille / 2, p.y + p.taille / 2);
            obtenirCtx().rotate(p.rotation);
            obtenirCtx().fillStyle = p.couleur;
            obtenirCtx().fillRect(-p.taille * 0.6, -p.taille * 0.25, p.taille * 1.2, p.taille * 0.5);
        } else if (obtenirBiomeActif() === 'lave' || obtenirBiomeActif() === 'ocean') {
            obtenirCtx().fillStyle = p.couleur;
            obtenirCtx().beginPath();
            obtenirCtx().arc(p.x, p.y, p.taille * 0.5, 0, Math.PI * 2);
            obtenirCtx().fill();
        } else {
            obtenirCtx().fillStyle = p.couleur;
            obtenirCtx().fillRect(p.x, p.y, p.taille, p.taille);
        }
        obtenirCtx().restore();
    }
}

function dessinerGrille() {
    obtenirCtx().strokeStyle = BIOMES[obtenirBiomeActif()].grilleCoul;
    obtenirCtx().lineWidth = 0.5;
    for (let c = 0; c <= CONFIG.colonnes; c++) {
        obtenirCtx().beginPath();
        obtenirCtx().moveTo(c * CONFIG.taille, 0);
        obtenirCtx().lineTo(c * CONFIG.taille, CONFIG.lignes * CONFIG.taille);
        obtenirCtx().stroke();
    }
    for (let l = 0; l <= CONFIG.lignes; l++) {
        obtenirCtx().beginPath();
        obtenirCtx().moveTo(0, l * CONFIG.taille);
        obtenirCtx().lineTo(CONFIG.colonnes * CONFIG.taille, l * CONFIG.taille);
        obtenirCtx().stroke();
    }
}

function dessinerFondBiome() {
    const b = BIOMES[obtenirBiomeActif()];
    const grad = obtenirCtx().createLinearGradient(0, 0, 0, obtenirCanvasPlateau().height);
    grad.addColorStop(0, b.fondCiel);
    grad.addColorStop(1, b.fondSol);
    obtenirCtx().fillStyle = grad;
    obtenirCtx().fillRect(0, 0, obtenirCanvasPlateau().width, obtenirCanvasPlateau().height);

    if (obtenirBiomeActif() === 'ocean' && !obtenirEffetsReduits()) {
        dessinerScanlinesOcean();
    }

    dessinerParticulesAmbiance();
    dessinerGrille();
}

export function demarrerTransition() {
    definirTransitionAlpha(0);
    definirTransitionDebut(performance.now());
}

function mettreAJourTransition() {
    if (obtenirTransitionAlpha() >= 1) return;
    const ecoule = performance.now() - obtenirTransitionDebut();
    definirTransitionAlpha(Math.min(1, ecoule / DUREE_TRANSITION));
}

function dessinerBlocsVerrouilles() {
    for (let l = 0; l < CONFIG.lignes; l++) {
        for (let c = 0; c < CONFIG.colonnes; c++) {
            if (etat.plateau[l][c])
                dessinerCellule(obtenirCtx(), c, l, etat.plateau[l][c]);
        }
    }
}

export function dessinerPlateau() {
    if (!obtenirCtx() || !obtenirCanvasPlateau()) return;
    obtenirCtx().globalAlpha = 1;
    obtenirCtx().globalCompositeOperation = 'source-over';
    obtenirCtx().clearRect(0, 0, obtenirCanvasPlateau().width, obtenirCanvasPlateau().height);
    dessinerFondBiome();
    dessinerBlocsVerrouilles();
    dessinerAmbianceJeu();
    dessinerVignette();

    if (meteo.masquerPlateau) {
        const yMasque = (CONFIG.lignes - 4) * CONFIG.taille;
        const grad = obtenirCtx().createLinearGradient(0, yMasque, 0, obtenirCanvasPlateau().height);
        grad.addColorStop(0, 'rgba(180,230,255,0)');
        grad.addColorStop(0.4, 'rgba(180,230,255,0.55)');
        grad.addColorStop(1, 'rgba(180,230,255,0.85)');
        obtenirCtx().fillStyle = grad;
        obtenirCtx().fillRect(0, yMasque, obtenirCanvasPlateau().width, obtenirCanvasPlateau().height - yMasque);
        obtenirCtx().fillStyle = 'rgba(255,255,255,0.7)';
        for (let i = 0; i < 15; i++) {
            const bx = ((performance.now() * 0.02 + i * 73) % 1) * obtenirCanvasPlateau().width;
            const by =
                yMasque +
                ((performance.now() * 0.04 + i * 37) % 1) * (obtenirCanvasPlateau().height - yMasque);
            obtenirCtx().fillRect(bx, by, 2, 2);
        }
    }
}

export function rendreFrameJeu() {
    if (!obtenirCtx() || !etat.estEnCours) return;
    try {
        obtenirCtx().save();
        obtenirCtx().globalAlpha = 1;
        obtenirCtx().globalCompositeOperation = 'source-over';
        dessinerPlateau();
        if (etat.pieceActuelle) {
            dessinerPieceFantome();
            dessinerPieceActive();
        }
        obtenirCtx().restore();
    } catch (err) {
        logger.error('Erreur rendu plateau:', err);
    }
}

export function dessinerPieceFantome() {
    if (!etat.pieceActuelle) return;
    const distance = calculerDistanceChute(etat.pieceActuelle);
    const forme = obtenirForme(etat.pieceActuelle);
    const couleur = obtenirCouleurPiece(etat.pieceActuelle);
    for (let l = 0; l < forme.length; l++) {
        for (let c = 0; c < forme[l].length; c++) {
            if (!forme[l][c]) continue;
            const x = etat.pieceActuelle.x + c;
            const y = etat.pieceActuelle.y + l + distance;
            if (y >= 0) dessinerCellule(obtenirCtx(), x, y, couleur, CONFIG.taille, 0.12);
        }
    }
}

export function dessinerPieceActive() {
    if (!etat.pieceActuelle) return;
    const forme = obtenirForme(etat.pieceActuelle);
    const couleur = obtenirCouleurPiece(etat.pieceActuelle);
    const relique = obtenirReliqueActive() ?? etat.pieceActuelle.reliqueData;

    if (meteo.masquerPiece) {
        obtenirCtx().fillStyle = 'rgba(255,180,50,0.18)';
        for (let i = 0; i < 20; i++) {
            const sx = ((performance.now() * 0.15 + i * 53.7) % 1) * obtenirCanvasPlateau().width;
            const sy = ((i * 17.3) % 1) * obtenirCanvasPlateau().height;
            obtenirCtx().fillRect(sx, sy, 8, 1);
        }
    }

    if (relique) {
        obtenirCtx().save();
        obtenirCtx().shadowBlur = 20 + Math.sin(performance.now() / 200) * 8;
        obtenirCtx().shadowColor = relique.couleur;
    }

    if (meteo.masquerPiece) obtenirCtx().globalAlpha = 0.08;

    for (let l = 0; l < forme.length; l++) {
        for (let c = 0; c < forme[l].length; c++) {
            if (!forme[l][c]) continue;
            const x = etat.pieceActuelle.x + c;
            const y = etat.pieceActuelle.y + l;
            if (y >= 0) dessinerCellule(obtenirCtx(), x, y, couleur);
        }
    }

    if (meteo.masquerPiece) obtenirCtx().globalAlpha = 1;

    if (relique) {
        obtenirCtx().restore();
        obtenirCtx().font = `${CONFIG.taille * 0.7}px serif`;
        obtenirCtx().fillStyle = relique.couleur;
        obtenirCtx().textAlign = 'left';
        obtenirCtx().fillText(
            relique.icone,
            (etat.pieceActuelle.x + 1) * CONFIG.taille,
            Math.max(12, (etat.pieceActuelle.y - 0.2) * CONFIG.taille)
        );
    }
}

export function dessinerParticules() {
    for (let i = 0; i < particules.length; i++) {
        const p = particules[i];
        obtenirCtx().save();
        obtenirCtx().globalAlpha = p.opacite;
        obtenirCtx().fillStyle = p.couleur;

        if (p.type === 'etincelle') {
            obtenirCtx().translate(p.x + 0.5, p.y + p.hauteur / 2);
            obtenirCtx().rotate(p.rotation);
            obtenirCtx().fillRect(-0.5, -p.hauteur / 2, 1, p.hauteur);
        } else if (p.type === 'eclair') {
            obtenirCtx().translate(p.x, p.y);
            obtenirCtx().rotate(p.rotation);
            if (!obtenirPrefererMoinsAnimations()) {
                obtenirCtx().shadowColor = p.couleur;
                obtenirCtx().shadowBlur = 6;
            }
            obtenirCtx().fillRect(0, -1, p.longueur, 2);
        } else {
            if (p.trainee && !obtenirPrefererMoinsAnimations()) {
                obtenirCtx().shadowColor = p.couleur;
                obtenirCtx().shadowBlur = 20;
            } else if (!obtenirPrefererMoinsAnimations()) {
                obtenirCtx().shadowColor = p.couleur;
                obtenirCtx().shadowBlur = 4 + p.opacite * 8;
            }
            obtenirCtx().translate(p.x + p.taille / 2, p.y + p.taille / 2);
            obtenirCtx().rotate(p.rotation);
            obtenirCtx().fillRect(-p.taille / 2, -p.taille / 2, p.taille, p.taille);
        }
        obtenirCtx().restore();
    }
}

export function obtenirYHautTas() {
    for (let l = 0; l < CONFIG.lignes; l++) {
        if (etat.plateau[l].some((c) => c !== 0)) {
            return l * CONFIG.taille;
        }
    }
    return obtenirCanvasPlateau().height * 0.4;
}

export function afficherTexteFlottant(texte, couleur, taille, options = {}) {
    const decaleY = textesFlottants.length * 22;
    textesFlottants.push({
        texte,
        x: options.x ?? obtenirCanvasPlateau().width / 2,
        y: (options.y ?? obtenirCanvasPlateau().height / 2) + decaleY,
        couleur: couleur ?? '#ffe600',
        opacite: 1,
        vy: options.vy ?? -0.8,
        taille: taille ?? 10,
        arcEnCiel: options.arcEnCiel ?? false,
        age: 0,
        duree: 1500,
    });
}

export function mettreAJourTextesFlottants(deltaTemps) {
    const facteur = deltaTemps / 16;
    for (let i = textesFlottants.length - 1; i >= 0; i--) {
        const t = textesFlottants[i];
        t.age += deltaTemps;
        t.y += t.vy * facteur;
        t.opacite = 1 - t.age / t.duree;
        if (t.age >= t.duree) textesFlottants.splice(i, 1);
    }
}

export function dessinerTextesFlottants() {
    for (const t of textesFlottants) {
        if (t.opacite <= 0) continue;
        obtenirCtx().save();
        obtenirCtx().globalAlpha = Math.max(0, t.opacite);
        obtenirCtx().font = `${t.taille}px 'Press Start 2P', monospace`;
        obtenirCtx().textAlign = 'center';
        if (t.arcEnCiel) {
            const teinte = (performance.now() / 15 + t.x) % 360;
            obtenirCtx().fillStyle = `hsl(${teinte}, 100%, 62%)`;
            obtenirCtx().shadowColor = obtenirCtx().fillStyle;
        } else {
            obtenirCtx().fillStyle = t.couleur;
            obtenirCtx().shadowColor = t.couleur;
        }
        obtenirCtx().shadowBlur = 14;
        obtenirCtx().fillText(t.texte, t.x, t.y);
        obtenirCtx().restore();
    }
}

export function dessinerPreview(ctx2d, canvasEl, piece) {
    const tailleCell = 23;
    ctx2d.clearRect(0, 0, canvasEl.width, canvasEl.height);
    if (!piece) return;
    dessinerPieceDansPreview(ctx2d, canvasEl, piece, 0, canvasEl.height, tailleCell);
}

function dessinerPieceDansPreview(ctx2d, canvasEl, piece, slotY, slotHauteur, tailleCell) {
    const forme = obtenirForme(piece);
    const couleur = obtenirCouleurPiece(piece);
    const largeur = forme[0].length;
    const hauteur = forme.length;
    const offsetX = Math.floor((canvasEl.width / tailleCell - largeur) / 2);
    const offsetY = slotY + Math.floor((slotHauteur / tailleCell - hauteur) / 2);
    for (let l = 0; l < forme.length; l++) {
        for (let c = 0; c < forme[l].length; c++) {
            if (!forme[l][c]) continue;
            dessinerCellule(ctx2d, offsetX + c, offsetY + l, couleur, tailleCell);
        }
    }
}

export function dessinerFileNext() {
    const tailleCell = 18;
    const espacement = 68;
    obtenirCtxPreview().clearRect(0, 0, obtenirCanvasPreview().width, obtenirCanvasPreview().height);

    if (!etat.filePieces || etat.filePieces.length === 0) return;

    etat.filePieces.slice(0, 3).forEach((piece, index) => {
        if (!piece) return;
        const forme = obtenirForme(piece);
        const couleur = obtenirCouleurPiece(piece);
        const largeur = forme[0].length;
        const offsetX = Math.floor((obtenirCanvasPreview().width / tailleCell - largeur) / 2);
        const offsetY = Math.floor((espacement * index) / tailleCell) + 1;

        for (let l = 0; l < forme.length; l++) {
            for (let c = 0; c < forme[l].length; c++) {
                if (!forme[l][c]) continue;
                dessinerCellule(obtenirCtxPreview(), offsetX + c, offsetY + l, couleur, tailleCell);
            }
        }
    });
}

export { mettreAJourTransition };
