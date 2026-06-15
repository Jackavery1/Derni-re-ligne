import { logger } from './logger.js';
import { POSITION_PERSONNAGE } from './histoire-cutscene-config.js';
import { lierCanvasFondCutscene } from './histoire-cutscene-fonds.js';

export const refsDomCutscene = {
    canvasGauche: /** @type {HTMLCanvasElement | null} */ (null),
    canvasDroite: /** @type {HTMLCanvasElement | null} */ (null),
    ctxGauche: /** @type {CanvasRenderingContext2D | null} */ (null),
    ctxDroite: /** @type {CanvasRenderingContext2D | null} */ (null),
    canvasBg: /** @type {HTMLCanvasElement | null} */ (null),
    uiPret: false,
    fondPersonnageId: 'narrateur',
};

export function estLigneNarration(personnageId) {
    return (POSITION_PERSONNAGE[personnageId] ?? 'droite') === 'centre';
}

export function obtenirElTexteLigneCourante(personnageId) {
    if (estLigneNarration(personnageId)) {
        return (
            document.getElementById('texte-narration-cutscene') ??
            document.getElementById('texte-dialogue-cutscene')
        );
    }
    return document.getElementById('texte-dialogue-cutscene');
}

export function appliquerModeCutscene(estNarration) {
    const ecran = document.getElementById('ecran-histoire-cutscene');
    if (ecran) {
        ecran.classList.toggle('cutscene-mode-narration', estNarration);
        ecran.classList.toggle('cutscene-mode-dialogue', !estNarration);
    }
}

export function appliquerModeNarrateurCinematique(actif) {
    const ecran = document.getElementById('ecran-histoire-cutscene');
    if (!ecran) return;
    ecran.classList.toggle('mode-narrateur', actif);
    if (actif) {
        ecran.classList.remove('cutscene-mode-narration');
        ecran.classList.add('cutscene-mode-dialogue');
    }
}

export function viderTextesCutscene() {
    const dialogueEl = document.getElementById('texte-dialogue-cutscene');
    const narrationEl = document.getElementById('texte-narration-cutscene');
    const nomEl = document.getElementById('nom-perso-dialogue');
    if (dialogueEl) dialogueEl.textContent = '';
    if (narrationEl) narrationEl.textContent = '';
    if (nomEl) nomEl.textContent = '';
    appliquerModeCutscene(false);
    appliquerModeNarrateurCinematique(false);
}

export function overlayNarratifVisible() {
    const tuto = document.getElementById('overlay-tutoriel');
    if (tuto && !tuto.classList.contains('element-masque')) return true;
    return Boolean(document.querySelector('.objectif-overlay-visible'));
}

export function assurerZoneNarrationCutscene() {
    const ecran = document.getElementById('ecran-histoire-cutscene');
    if (!ecran || document.getElementById('texte-narration-cutscene')) return;

    let zone = document.getElementById('zone-narration-cutscene');
    if (!zone) {
        zone = document.createElement('div');
        zone.id = 'zone-narration-cutscene';
        zone.setAttribute('aria-live', 'polite');
        zone.setAttribute('aria-atomic', 'true');
        const ancre = document.getElementById('canvas-cutscene-bg');
        if (ancre?.nextSibling) {
            ecran.insertBefore(zone, ancre.nextSibling);
        } else {
            ecran.prepend(zone);
        }
    }

    const texte = document.createElement('div');
    texte.id = 'texte-narration-cutscene';
    zone.appendChild(texte);

    if (!document.getElementById('indicateur-suite-narration')) {
        const indicateur = document.createElement('span');
        indicateur.id = 'indicateur-suite-narration';
        indicateur.setAttribute('aria-hidden', 'true');
        indicateur.textContent = '▼';
        zone.appendChild(indicateur);
    }

    logger.debug('[cutscene] zone narration injectee (HTML cache obsolete)');
}

export function initDomCutscene() {
    refsDomCutscene.canvasGauche = /** @type {HTMLCanvasElement | null} */ (
        document.getElementById('canvas-portrait-gauche')
    );
    refsDomCutscene.canvasDroite = /** @type {HTMLCanvasElement | null} */ (
        document.getElementById('canvas-portrait-droite')
    );
    refsDomCutscene.canvasBg = /** @type {HTMLCanvasElement | null} */ (
        document.getElementById('canvas-cutscene-bg')
    );
    if (refsDomCutscene.canvasGauche) {
        refsDomCutscene.ctxGauche = refsDomCutscene.canvasGauche.getContext('2d');
    }
    if (refsDomCutscene.canvasDroite) {
        refsDomCutscene.ctxDroite = refsDomCutscene.canvasDroite.getContext('2d');
    }
    if (refsDomCutscene.canvasBg) lierCanvasFondCutscene(refsDomCutscene.canvasBg);
    refsDomCutscene.uiPret = Boolean(refsDomCutscene.canvasGauche && refsDomCutscene.canvasDroite);
    return refsDomCutscene.uiPret;
}

export function reinitDomPortraitsCutscene() {
    refsDomCutscene.canvasGauche?.classList.remove('parle', 'ecoute');
    refsDomCutscene.canvasDroite?.classList.remove('parle', 'ecoute');
    refsDomCutscene.canvasGauche?.classList.add('absent');
    refsDomCutscene.canvasDroite?.classList.add('absent');
    if (refsDomCutscene.ctxGauche && refsDomCutscene.canvasGauche) {
        refsDomCutscene.ctxGauche.clearRect(
            0,
            0,
            refsDomCutscene.canvasGauche.width,
            refsDomCutscene.canvasGauche.height
        );
    }
    if (refsDomCutscene.ctxDroite && refsDomCutscene.canvasDroite) {
        refsDomCutscene.ctxDroite.clearRect(
            0,
            0,
            refsDomCutscene.canvasDroite.width,
            refsDomCutscene.canvasDroite.height
        );
    }
}

export function appliquerFondPersonnageEcran(personnageId) {
    const ecran = document.getElementById('ecran-histoire-cutscene');
    if (!ecran) return refsDomCutscene.fondPersonnageId;
    if (refsDomCutscene.fondPersonnageId !== personnageId) {
        ecran.dataset.personnage = personnageId;
        refsDomCutscene.fondPersonnageId = personnageId;
    }
    return refsDomCutscene.fondPersonnageId;
}

export function mettreAJourProgressCutscene(index, total) {
    const elProgress = document.getElementById('histoire-cutscene-progress');
    if (elProgress && total > 0) {
        elProgress.textContent = `${index + 1} / ${total}`;
    }
}

export function viderProgressCutscene() {
    const elProgress = document.getElementById('histoire-cutscene-progress');
    if (elProgress) elProgress.textContent = '';
}

export function preparerTexteLigneCutscene({
    personnageId,
    estNarration,
    police,
    couleurPerso,
    nom,
}) {
    const dialogueEl = document.getElementById('texte-dialogue-cutscene');
    const narrationEl = document.getElementById('texte-narration-cutscene');
    if (!dialogueEl) return null;

    const estNarrationEffective = estNarration;

    if (estNarrationEffective) {
        appliquerModeNarrateurCinematique(false);
        appliquerModeCutscene(true);
        dialogueEl.textContent = '';
        dialogueEl.className = '';
        delete dialogueEl.dataset.glitch;
    } else {
        appliquerModeNarrateurCinematique(false);
        appliquerModeCutscene(false);
        if (narrationEl) narrationEl.textContent = '';
    }

    const nomEl = document.getElementById('nom-perso-dialogue');
    if (nomEl) {
        if (estNarrationEffective) {
            nomEl.textContent = '';
        } else {
            nomEl.textContent = nom;
            nomEl.style.setProperty('--couleur-perso', couleurPerso);
        }
    }

    const texteEl = estNarrationEffective ? (narrationEl ?? dialogueEl) : dialogueEl;
    texteEl.className = estNarrationEffective
        ? `cutscene-police-${police}`
        : `cutscene-police-${police}`;
    if (personnageId === 'distorsion' && !estNarrationEffective) texteEl.dataset.glitch = '';
    else delete texteEl.dataset.glitch;

    return { texteEl, estNarration: estNarrationEffective };
}
