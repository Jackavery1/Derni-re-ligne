import { appliquerContenuPanneau } from './ui-panneau-detail-rendu.js';
import { activerFocusTrap } from './focus-trap.js';

/**
 * @typedef {object} ConfigIcone
 * @property {string} [id]
 * @property {number} [taillePixel]
 * @property {(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) => void} [canvasPersonnalise]
 * @property {boolean} [glitch]
 * @property {string} [seedId]
 */

/**
 * @typedef {object} ConfigPanneauDetail
 * @property {string} [id]
 * @property {ConfigIcone} [icone]
 * @property {string} accent
 * @property {string} titre
 * @property {string} [sousTitre]
 * @property {string | string[]} [description]
 * @property {'narratif' | 'ui'} [typoDescription]
 * @property {string[]} [lignesMeta]
 * @property {boolean} [verrouille]
 * @property {boolean} [afficherTeaserVerrouille]
 * @property {string} [conditionTexte]
 * @property {{ actuel: number, cible: number, formaterTexte?: (actuel: number, cible: number) => string }} [progression]
 * @property {{ libelle?: string, onAction: () => void }} [actionPrincipale]
 * @property {{ libelle?: string, onAction: () => void }} [actionSecondaire]
 */

/** @type {ConfigPanneauDetail | null} */
let configOuverte = null;
/** @type {HTMLElement | null} */
let declencheurFocus = null;
/** @type {(() => void) | null} */
let retirerFocusTrapPanneau = null;
let listenersInitialises = false;

/** @type {Set<() => void>} */
const ecouteursFermeture = new Set();

function effetsReduits() {
    return document.body.classList.contains('effets-reduits');
}

function obtenirRefs() {
    return {
        racine: document.getElementById('panneau-detail'),
        backdrop: document.getElementById('panneau-detail-backdrop'),
        corps: document.getElementById('panneau-detail-corps'),
        icone: document.getElementById('panneau-detail-icone'),
        iconeWrap: document.getElementById('panneau-detail-icone-wrap'),
        titre: document.getElementById('panneau-detail-titre'),
        sousTitre: document.getElementById('panneau-detail-sous-titre'),
        description: document.getElementById('panneau-detail-description'),
        meta: document.getElementById('panneau-detail-meta'),
        condition: document.getElementById('panneau-detail-condition'),
        progression: document.getElementById('panneau-detail-progression'),
        progressionFill: document.getElementById('panneau-detail-progression-fill'),
        progressionTexte: document.getElementById('panneau-detail-progression-texte'),
        btnFermer: document.getElementById('btn-panneau-detail-fermer'),
        btnJouer: document.getElementById('btn-panneau-detail-jouer'),
        btnSecondaire: document.getElementById('btn-panneau-detail-secondaire'),
    };
}

function retirerOuverture() {
    const { racine, corps } = obtenirRefs();
    retirerFocusTrapPanneau?.();
    retirerFocusTrapPanneau = null;
    racine?.classList.add('element-masque');
    corps?.classList.remove('panneau-detail-corps--ouvert');
    racine?.setAttribute('aria-hidden', 'true');
    racine?.setAttribute('aria-modal', 'false');
}

function afficherOuverture() {
    const { racine, corps, btnFermer } = obtenirRefs();
    racine?.classList.remove('element-masque');
    racine?.setAttribute('aria-hidden', 'false');
    racine?.setAttribute('aria-modal', 'true');

    requestAnimationFrame(() => {
        corps?.classList.add('panneau-detail-corps--ouvert');
        if (effetsReduits()) {
            corps?.classList.add('panneau-detail-corps--instant');
        } else {
            corps?.classList.remove('panneau-detail-corps--instant');
        }
    });

    if (corps && btnFermer) {
        retirerFocusTrapPanneau = activerFocusTrap(corps, {
            focusInitial: /** @type {HTMLElement} */ (btnFermer),
            restaurerFocus: false,
        });
    }
}

/** @param {MouseEvent} e */
function surClicDocument(e) {
    const cible = e.target;
    if (!cible || typeof cible !== 'object' || !('closest' in cible)) return;
    const el = /** @type {Element} */ (cible);

    if (el.closest('#btn-panneau-detail-jouer')) {
        const action = configOuverte?.actionPrincipale?.onAction;
        if (action) action();
        return;
    }
    if (el.closest('#btn-panneau-detail-secondaire')) {
        const action = configOuverte?.actionSecondaire?.onAction;
        if (action) action();
        return;
    }
    if (el.closest('#btn-panneau-detail-fermer')) {
        fermerPanneauDetail();
        return;
    }
    if (el.closest('#panneau-detail-backdrop')) {
        fermerPanneauDetail();
        return;
    }

    if (!configOuverte) return;
    const { corps, racine } = obtenirRefs();
    if (corps?.contains(el)) return;
    if (el.closest('.codex-item, .ach-carte, .carte-niveau-archi')) {
        return;
    }
    if (racine?.contains(el) && !corps?.contains(el)) {
        fermerPanneauDetail();
    }
}

/** @param {KeyboardEvent} e */
function surKeydown(e) {
    if (e.key === 'Escape' && configOuverte) {
        e.preventDefault();
        fermerPanneauDetail();
    }
}

export function panneauDetailEstOuvert() {
    return configOuverte !== null;
}

export function obtenirPanneauDetailId() {
    return configOuverte?.id ?? null;
}

/** @param {() => void} fn */
export function abonnerFermeturePanneauDetail(fn) {
    ecouteursFermeture.add(fn);
    return () => ecouteursFermeture.delete(fn);
}

export function fermerPanneauDetail() {
    if (!configOuverte) return;
    configOuverte = null;
    retirerOuverture();
    if (declencheurFocus && typeof declencheurFocus.focus === 'function') {
        declencheurFocus.focus({ preventScroll: true });
    }
    declencheurFocus = null;
    for (const fn of ecouteursFermeture) fn();
}

/**
 * @param {ConfigPanneauDetail} config
 * @param {{ basculerSiMemeId?: boolean }} [opts]
 */
export function ouvrirPanneauDetail(config, opts = {}) {
    initialiserPanneauDetail();

    if (config.id && configOuverte?.id === config.id) {
        if (opts.basculerSiMemeId !== false) {
            fermerPanneauDetail();
            return false;
        }
        configOuverte = config;
        appliquerContenuPanneau(obtenirRefs(), config);
        return true;
    }

    const actif = document.activeElement;
    if (actif && typeof (/** @type {HTMLElement} */ (actif).focus) === 'function') {
        declencheurFocus = /** @type {HTMLElement} */ (actif);
    }

    configOuverte = config;
    appliquerContenuPanneau(obtenirRefs(), config);
    afficherOuverture();
    return true;
}

export function initialiserPanneauDetail() {
    if (listenersInitialises) return;
    listenersInitialises = true;
    document.addEventListener('click', surClicDocument);
    document.addEventListener('keydown', surKeydown);
}
