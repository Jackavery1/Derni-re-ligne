import { store } from './store-core.js';
import { modeHistoireEnCours } from './mode-histoire.js';
import { obtenirHistoireTextesSync } from './charger-histoire-textes.js';
import { logger } from './logger.js';

export const DUREE_PRESENTATION_BOSS_MS = 2500;
export const DUREE_AFFICHAGE_DIALOGUE_MS = 4000;
const DELAI_FUSION_FILE_MS = 2000;
const SEUILS_PHASE_CLASSIQUES = [50, 25];
const SEUIL_DISTORSION_PHASE_3 = 33;

/** @returns {typeof import('./histoire-textes.js').DIALOGUES_COMBAT_BOSS[string] | undefined} */
function _dialoguesBoss(bossId) {
    if (!modeHistoireEnCours()) return undefined;
    try {
        return obtenirHistoireTextesSync().DIALOGUES_COMBAT_BOSS?.[bossId];
    } catch {
        return undefined;
    }
}

function _etatDialogues() {
    if (!store.histoire.boss._dialogues) {
        store.histoire.boss._dialogues = {
            file: /** @type {string[]} */ ([]),
            affichageRestantMs: 0,
            dernierDeclenchementMs: 0,
            seuilsPvVus: /** @type {number[]} */ ([]),
            phasesVues: /** @type {number[]} */ ([]),
            tetrisVu: false,
            quasiVaincuVu: false,
            presentationEnCours: false,
            presentationRestantMs: 0,
        };
    }
    return store.histoire.boss._dialogues;
}

function _texteActif() {
    const d = _etatDialogues();
    return d.file.length > 0 || d.affichageRestantMs > 0;
}

export function dialogueBossActif() {
    return _texteActif();
}

/** @param {string} texte */
export function enqueueDialogueBoss(texte) {
    if (!modeHistoireEnCours() || !texte) return;
    const d = _etatDialogues();
    const maintenant = performance.now();

    if (_texteActif() && maintenant - d.dernierDeclenchementMs < DELAI_FUSION_FILE_MS) {
        d.file.push(texte);
        logger.debug('[boss-dialogues] file +1, taille', d.file.length);
        return;
    }

    if (_texteActif()) {
        d.file.push(texte);
        return;
    }

    _afficherTexteBossDirect(texte);
    d.affichageRestantMs = DUREE_AFFICHAGE_DIALOGUE_MS;
    d.dernierDeclenchementMs = maintenant;
}

function _afficherTexteBossDirect(texte) {
    if (typeof document === 'undefined') return;
    const el = document.getElementById('boss-attaque-label');
    if (el) el.textContent = texte;
}

function _viderTexteBoss() {
    if (typeof document === 'undefined') return;
    const el = document.getElementById('boss-attaque-label');
    if (el && !store.histoire.boss._dialogues?.presentationEnCours) {
        el.textContent = '';
    }
}

function _afficherOverlayPresentation(bossId, dialogues) {
    if (typeof document === 'undefined') return;
    const overlay = document.getElementById('overlay-boss-presentation');
    const elNom = document.getElementById('boss-presentation-nom');
    const elEp = document.getElementById('boss-presentation-epithete');
    const boss = store.histoire.boss.actif;
    if (!overlay || !elNom || !elEp) return;

    elNom.textContent = boss?.nom ?? bossId.toUpperCase();
    elNom.style.color = boss?.couleur ?? 'var(--rose)';
    elEp.textContent = dialogues.epithete ?? '';

    overlay.classList.remove('element-masque');
    void overlay.offsetWidth;
    overlay.classList.add('boss-presentation-visible');
}

function _masquerOverlayPresentation() {
    if (typeof document === 'undefined') return;
    const overlay = document.getElementById('overlay-boss-presentation');
    if (!overlay) return;
    overlay.classList.remove('boss-presentation-visible');
    overlay.classList.add('boss-presentation-sortie');
    setTimeout(() => {
        overlay.classList.remove('boss-presentation-sortie');
        overlay.classList.add('element-masque');
    }, 450);
}

/** @param {string} bossId */
export function demarrerPresentationBoss(bossId) {
    if (!modeHistoireEnCours()) return;
    const dialogues = _dialoguesBoss(bossId);
    if (!dialogues) return;

    const d = _etatDialogues();
    d.presentationEnCours = true;
    d.presentationRestantMs = DUREE_PRESENTATION_BOSS_MS;
    _afficherOverlayPresentation(bossId, dialogues);
    logger.debug('[boss-dialogues] presentation', bossId);
}

/** @param {string} bossId */
function _afficherDebutCombat(bossId) {
    const dialogues = _dialoguesBoss(bossId);
    if (dialogues?.debut) enqueueDialogueBoss(dialogues.debut);
}

/** @param {number} dt */
export function mettreAJourDialoguesBoss(dt) {
    if (!modeHistoireEnCours() || !store.histoire.boss.actif) return;
    const d = _etatDialogues();

    if (d.presentationEnCours) {
        d.presentationRestantMs -= dt;
        if (d.presentationRestantMs <= 0) {
            d.presentationEnCours = false;
            _masquerOverlayPresentation();
            _afficherDebutCombat(store.histoire.boss.actif.id);
        }
        return;
    }

    if (d.affichageRestantMs > 0) {
        d.affichageRestantMs -= dt;
        if (d.affichageRestantMs <= 0) {
            if (d.file.length > 0) {
                const suivant = d.file.shift();
                if (suivant) {
                    _afficherTexteBossDirect(suivant);
                    d.affichageRestantMs = DUREE_AFFICHAGE_DIALOGUE_MS;
                    d.dernierDeclenchementMs = performance.now();
                    return;
                }
            }
            _viderTexteBoss();
        }
    }
}

/** @param {number} phaseAvant @param {number} phaseApres */
export function notifierTransitionPhaseBoss(phaseAvant, phaseApres) {
    if (!modeHistoireEnCours() || phaseApres <= phaseAvant) return;
    const bossId = store.histoire.boss.actif?.id;
    const dialogues = bossId ? _dialoguesBoss(bossId) : undefined;
    if (!dialogues?.phases?.length) return;

    const d = _etatDialogues();
    const idx = phaseApres - 1;
    if (idx < 0 || idx >= dialogues.phases.length || d.phasesVues.includes(idx)) return;
    d.phasesVues.push(idx);
    enqueueDialogueBoss(dialogues.phases[idx]);
    logger.debug('[boss-dialogues] phase', phaseApres, 'idx', idx);
}

/** @param {number} pctRestant */
export function notifierSeuilsPvBoss(pctRestant) {
    if (!modeHistoireEnCours()) return;
    const bossId = store.histoire.boss.actif?.id;
    const dialogues = bossId ? _dialoguesBoss(bossId) : undefined;
    if (!dialogues?.phases?.length) return;

    const boss = store.histoire.boss.actif;
    if (boss?.phases?.length) {
        if (bossId === 'distorsion' && pctRestant <= SEUIL_DISTORSION_PHASE_3) {
            const d = _etatDialogues();
            const idx = 2;
            if (dialogues.phases[idx] && !d.phasesVues.includes(idx)) {
                d.phasesVues.push(idx);
                enqueueDialogueBoss(dialogues.phases[idx]);
            }
        }
        return;
    }

    const d = _etatDialogues();
    for (let i = 0; i < SEUILS_PHASE_CLASSIQUES.length; i++) {
        const seuil = SEUILS_PHASE_CLASSIQUES[i];
        if (pctRestant <= seuil && !d.seuilsPvVus.includes(seuil) && dialogues.phases[i]) {
            d.seuilsPvVus.push(seuil);
            enqueueDialogueBoss(dialogues.phases[i]);
        }
    }
}

export function notifierTetrisBoss() {
    if (!modeHistoireEnCours()) return;
    const bossId = store.histoire.boss.actif?.id;
    const dialogues = bossId ? _dialoguesBoss(bossId) : undefined;
    if (!dialogues?.reactionTetris) return;

    const d = _etatDialogues();
    if (d.tetrisVu) return;
    d.tetrisVu = true;
    enqueueDialogueBoss(dialogues.reactionTetris);
    logger.debug('[boss-dialogues] tetris', bossId);
}

/** @param {number} pctRestant */
export function notifierQuasiVaincuBoss(pctRestant) {
    if (!modeHistoireEnCours() || pctRestant > 15) return;
    const bossId = store.histoire.boss.actif?.id;
    const dialogues = bossId ? _dialoguesBoss(bossId) : undefined;
    if (!dialogues?.quasiVaincu) return;

    const d = _etatDialogues();
    if (d.quasiVaincuVu) return;
    d.quasiVaincuVu = true;
    enqueueDialogueBoss(dialogues.quasiVaincu);
    logger.debug('[boss-dialogues] quasi-vaincu', bossId);
}

/** @param {string | null | undefined} bossId */
export function obtenirRepliqueGameOverBoss(bossId) {
    if (!bossId) return '';
    try {
        return obtenirHistoireTextesSync().DIALOGUES_COMBAT_BOSS?.[bossId]?.gameOver ?? '';
    } catch {
        return '';
    }
}

/** @param {boolean} visible */
export function appliquerRepliqueGameOverBoss(visible, bossId) {
    if (typeof document === 'undefined') return;
    const el = document.getElementById('go-boss-replique');
    if (!el) return;
    const texte = visible ? obtenirRepliqueGameOverBoss(bossId) : '';
    el.textContent = texte;
    el.classList.toggle('element-masque', !texte);
}

export function reinitialiserDialoguesBoss() {
    store.histoire.boss._dialogues = null;
    if (typeof document === 'undefined') return;
    const overlay = document.getElementById('overlay-boss-presentation');
    overlay?.classList.add('element-masque');
    overlay?.classList.remove('boss-presentation-visible', 'boss-presentation-sortie');
}
