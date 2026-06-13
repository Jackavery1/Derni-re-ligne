import { rendreIconeSurCanvas, rendreIconeGlitchSurCanvas } from './icones-pixel.js';
import { sansAccentsE } from './texte-jeu.js';

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

/** @param {HTMLElement | null} el @returns {el is HTMLCanvasElement} */
function estCanvas(el) {
    if (!el) return false;
    if (typeof HTMLCanvasElement !== 'undefined' && el instanceof HTMLCanvasElement) return true;
    return typeof (/** @type {HTMLCanvasElement} */ (el).getContext) === 'function';
}

function rendreIcone(config) {
    const { icone } = obtenirRefs();
    if (!estCanvas(icone) || !config.icone) return;

    const taillePixel = config.icone.taillePixel ?? 10;
    const px = 16 * taillePixel;
    icone.width = px;
    icone.height = px;
    icone.style.width = `${px}px`;
    icone.style.height = `${px}px`;

    const ctx = icone.getContext('2d');
    if (!ctx) return;

    if (typeof config.icone.canvasPersonnalise === 'function') {
        ctx.clearRect(0, 0, px, px);
        config.icone.canvasPersonnalise(icone, ctx);
        return;
    }

    if (config.icone.id) {
        if (config.verrouille && config.icone.glitch) {
            rendreIconeGlitchSurCanvas(icone, config.icone.id, {
                accent: config.accent,
                seedId: config.icone.seedId ?? config.id,
            });
        } else {
            rendreIconeSurCanvas(icone, config.icone.id, {
                silhouette: !!config.verrouille,
                accent: config.accent,
            });
        }
    }
}

function remplirDescription(el, description, typo) {
    if (!el) return;
    el.replaceChildren();
    el.classList.toggle('panneau-detail-description--narratif', typo === 'narratif');
    el.classList.toggle('panneau-detail-description--ui', typo !== 'narratif');

    if (!description) return;

    const blocs = Array.isArray(description) ? description : [description];
    for (const bloc of blocs) {
        const parties = String(bloc).split(/\n\n+/);
        for (const partie of parties) {
            if (!partie.trim()) continue;
            const p = document.createElement('p');
            p.className = 'panneau-detail-para';
            p.textContent = sansAccentsE(partie.trim());
            el.appendChild(p);
        }
    }
}

function remplirProgression(refs, progression) {
    if (!refs.progression) return;
    if (!progression || progression.cible <= 0) {
        refs.progression.classList.add('element-masque');
        return;
    }
    refs.progression.classList.remove('element-masque');
    const ratio = Math.min(1, Math.max(0, progression.actuel / progression.cible));
    const pct = `${Math.round(ratio * 100)}%`;
    refs.progressionFill?.style.setProperty('--panneau-progression-pct', pct);
    const texte = progression.formaterTexte
        ? progression.formaterTexte(progression.actuel, progression.cible)
        : `${progression.actuel} / ${progression.cible}`;
    if (refs.progressionTexte) refs.progressionTexte.textContent = sansAccentsE(texte);
}

function remplirMeta(el, lignes) {
    if (!el) return;
    el.replaceChildren();
    if (!lignes?.length) {
        el.classList.add('element-masque');
        return;
    }
    el.classList.remove('element-masque');
    for (const ligne of lignes) {
        const li = document.createElement('li');
        li.textContent = sansAccentsE(ligne);
        el.appendChild(li);
    }
}

function appliquerContenu(config) {
    const refs = obtenirRefs();
    if (!refs.racine || !refs.corps) return;

    refs.racine.style.setProperty('--accent-carte', config.accent);
    refs.corps.style.setProperty('--accent-carte', config.accent);
    if (refs.iconeWrap) {
        refs.iconeWrap.style.setProperty('--accent-carte', config.accent);
    }

    rendreIcone(config);

    const masquerSpoiler = config.verrouille && !config.afficherTeaserVerrouille;

    if (refs.titre) {
        refs.titre.textContent = sansAccentsE(masquerSpoiler ? '???' : config.titre);
    }
    if (refs.sousTitre) {
        const st = masquerSpoiler ? '' : (config.sousTitre ?? '');
        refs.sousTitre.textContent = sansAccentsE(st);
        refs.sousTitre.classList.toggle('element-masque', !st);
    }

    remplirDescription(
        refs.description,
        masquerSpoiler ? '' : config.description,
        config.typoDescription ?? 'ui'
    );

    remplirMeta(refs.meta, config.lignesMeta);
    remplirProgression(refs, config.verrouille ? config.progression : null);

    if (refs.condition) {
        const cond = config.conditionTexte ?? '';
        refs.condition.textContent = sansAccentsE(cond);
        refs.condition.classList.toggle('element-masque', !cond);
    }

    refs.racine.classList.toggle('panneau-detail--verrouille', !!config.verrouille);

    if (refs.btnJouer) {
        const action = config.actionPrincipale;
        const visible = Boolean(action?.onAction) && !config.verrouille;
        refs.btnJouer.classList.toggle('element-masque', !visible);
        if (visible) {
            refs.btnJouer.textContent = sansAccentsE(action?.libelle ?? '▶ JOUER');
        }
    }

    if (refs.btnSecondaire) {
        const action = config.actionSecondaire;
        const visible = Boolean(action?.onAction);
        refs.btnSecondaire.classList.toggle('element-masque', !visible);
        if (visible) {
            refs.btnSecondaire.textContent = sansAccentsE(action?.libelle ?? 'ACTION');
        }
    }
}

function retirerOuverture() {
    const { racine, corps } = obtenirRefs();
    racine?.classList.add('element-masque');
    corps?.classList.remove('panneau-detail-corps--ouvert');
    racine?.setAttribute('aria-hidden', 'true');
}

function afficherOuverture() {
    const { racine, corps, btnFermer } = obtenirRefs();
    racine?.classList.remove('element-masque');
    racine?.setAttribute('aria-hidden', 'false');

    requestAnimationFrame(() => {
        corps?.classList.add('panneau-detail-corps--ouvert');
        if (effetsReduits()) {
            corps?.classList.add('panneau-detail-corps--instant');
        } else {
            corps?.classList.remove('panneau-detail-corps--instant');
        }
    });

    if (btnFermer && typeof (/** @type {HTMLElement} */ (btnFermer).focus) === 'function') {
        /** @type {HTMLElement} */ (btnFermer).focus({ preventScroll: true });
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
        appliquerContenu(config);
        return true;
    }

    const actif = document.activeElement;
    if (actif && typeof (/** @type {HTMLElement} */ (actif).focus) === 'function') {
        declencheurFocus = /** @type {HTMLElement} */ (actif);
    }

    configOuverte = config;
    appliquerContenu(config);
    afficherOuverture();
    return true;
}

export function initialiserPanneauDetail() {
    if (listenersInitialises) return;
    listenersInitialises = true;
    document.addEventListener('click', surClicDocument);
    document.addEventListener('keydown', surKeydown);
}
