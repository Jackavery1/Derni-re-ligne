import { CONFIG } from './config.js';
import { store } from './store-jeu.js';
import {
    textesFlottants,
    secousse,
    flashVerrou,
    flashLignes,
    flashTopout,
    DUREE_TRANSITION,
    obtenirCanvasPlateau,
    obtenirCtx,
    obtenirTransitionAlpha,
    obtenirTransitionDebut,
    definirTransitionAlpha,
    definirTransitionDebut,
    obtenirEffetsAccessibiliteReduits,
} from './store-jeu.js';

export function declencherSecousse(intensite) {
    if (obtenirEffetsAccessibiliteReduits()) return;
    let force = intensite;
    if (store.surtensionActive) force *= 1.5;
    secousse.timer = secousse.duree;
    secousse.intensite = force;
}

export function obtenirDecalageSecousse() {
    if (obtenirEffetsAccessibiliteReduits() || secousse.timer <= 0) return { x: 0, y: 0 };
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
    if (obtenirEffetsAccessibiliteReduits() || flashVerrou.timer <= 0) return;
    const opacite = (flashVerrou.timer / flashVerrou.duree) * 0.8;
    obtenirCtx().save();
    obtenirCtx().globalAlpha = opacite;
    obtenirCtx().fillStyle = '#ffffff';
    for (const cell of flashVerrou.cellules) {
        obtenirCtx().fillRect(
            cell.x * CONFIG.taille,
            cell.y * CONFIG.taille,
            CONFIG.taille,
            CONFIG.taille
        );
    }
    obtenirCtx().restore();
}

export function dessinerFlashLignes() {
    if (obtenirEffetsAccessibiliteReduits() || flashLignes.timer <= 0) return;
    const opacite = Math.min(0.9, flashLignes.timer / flashLignes.duree);
    obtenirCtx().save();
    obtenirCtx().globalAlpha = opacite;
    obtenirCtx().fillStyle = '#ffffff';
    for (const l of flashLignes.lignes) {
        obtenirCtx().fillRect(0, l * CONFIG.taille, obtenirCanvasPlateau().width, CONFIG.taille);
    }
    obtenirCtx().restore();
}

export function declencherFlashTopout() {
    flashTopout.timer = flashTopout.duree;
}

export function dessinerFlashTopout() {
    if (obtenirEffetsAccessibiliteReduits() || flashTopout.timer <= 0) return;
    const canvasPlateau = obtenirCanvasPlateau();
    if (!canvasPlateau) return;
    const opacite = (flashTopout.timer / flashTopout.duree) * 0.5;
    obtenirCtx().save();
    obtenirCtx().globalAlpha = opacite;
    obtenirCtx().fillStyle = '#ff2244';
    obtenirCtx().fillRect(0, 0, canvasPlateau.width, canvasPlateau.height);
    obtenirCtx().restore();
}

export function demarrerTransition() {
    definirTransitionAlpha(0);
    definirTransitionDebut(performance.now());
}

export function mettreAJourTransition() {
    if (obtenirTransitionAlpha() >= 1) return;
    const ecoule = performance.now() - obtenirTransitionDebut();
    definirTransitionAlpha(Math.min(1, ecoule / DUREE_TRANSITION));
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
