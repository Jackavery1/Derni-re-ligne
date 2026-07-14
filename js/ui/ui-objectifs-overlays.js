import { BOSS } from '../histoire/histoire-donnees-exports.js';

/** @typedef {import('../histoire/histoire-donnees-exports.js').SEQUENCE_HISTOIRE[number]} MondeHistoire */
import { store } from '../etat/store-jeu.js';
import { obtenirEtatHistoire } from '../histoire/histoire-mondes.js';
import { DIFFICULTE_MONDES } from '../io/difficulte-mondes-chargement.js';
import { logger } from '../io/logger.js';
import { sansAccentsE } from '../logique/texte-jeu.js';
import {
    demarrerSuiviMonde,
    obtenirEtoilesPersistees,
    libelleEtoile,
    libelleObjectifPrincipal,
} from '../logique/gestionnaire-difficulte.js';
import {
    elObjectif as _el,
    masquerObjectif as _masquer,
    afficherObjectif as _afficher,
    texteObjectif as _texte,
} from './ui-objectifs-dom.js';
import { activerFocusTrap } from './focus-trap.js';

const CHAPITRES_LABEL = {
    prologue: 'PROLOGUE',
    chapitre_1: 'CHAPITRE I',
    chapitre_2: 'CHAPITRE II',
    chapitre_3: 'CHAPITRE III',
    chapitre_4: 'CHAPITRE IV',
    finale: 'FINALE',
};

const IDS_OVERLAYS = ['overlay-objectifs-pre', 'overlay-recap-monde'];

/** @type {(() => void) | null} */
let _callbackPanneauPre = null;

/** @type {(() => void) | null} */
let _callbackRecap = null;

/** @type {number | null} */
let _timerRecap = null;

/** @type {((ev: KeyboardEvent) => void) | null} */
let _ecouteurEscape = null;

/** @type {(() => void) | null} */
let _desactiverFocusTrapPre = null;

/** @type {(() => void) | null} */
let _desactiverFocusTrapRecap = null;

function _definirAriaOverlay(id, visible) {
    const el = _el(id);
    if (!el) return;
    el.setAttribute('aria-hidden', visible ? 'false' : 'true');
}

function _activerFocusTrapOverlay(id, focusInitialId) {
    const overlay = _el(id);
    if (!overlay) return () => {};
    const focusInitial = focusInitialId ? _el(focusInitialId) : null;
    return activerFocusTrap(overlay, {
        focusInitial: focusInitial ?? undefined,
    });
}

export function ancrerOverlaysObjectifsAuBody() {
    for (const id of IDS_OVERLAYS) {
        const el = _el(id);
        if (el && el.parentElement !== document.body) {
            document.body.appendChild(el);
        }
    }
}

export function cacherEcransPourObjectifs() {
    document.querySelectorAll('.ecran').forEach((el) => el.classList.remove('actif'));
    for (const id of ['conteneur-principal', 'conteneur-principal-coop']) {
        const zone = document.getElementById(id);
        if (zone) zone.inert = false;
    }
}

function _retirerEcouteurEscape() {
    if (_ecouteurEscape) {
        document.removeEventListener('keydown', _ecouteurEscape);
        _ecouteurEscape = null;
    }
}

function _majEtoileSlot(id, obtenue, cachee, libelle) {
    const el = _el(id);
    if (!el) return;
    el.classList.toggle('objectif-etoile-obtenue', obtenue);
    el.classList.toggle('objectif-etoile-cachee', cachee && !obtenue);
    const lbl = el.querySelector('.objectif-etoile-libelle');
    if (lbl) lbl.textContent = sansAccentsE(cachee && !obtenue ? '???' : libelle);
}

/** @param {MondeHistoire} monde */
function _remplirPanneauPreMonde(monde) {
    const config = DIFFICULTE_MONDES[monde.id];
    if (!config) return;

    const etatHist = obtenirEtatHistoire();
    const etoilesSave = obtenirEtoilesPersistees(etatHist, monde.id);
    const chapitre = monde.chapitreId
        ? (CHAPITRES_LABEL[monde.chapitreId] ?? monde.chapitreId.toUpperCase())
        : 'MONDE SECRET';

    const bossInfo = monde.bossId ? BOSS[monde.bossId] : undefined;

    _texte('objectif-monde-nom', monde.nomAffiche ?? monde.id);
    _texte('objectif-monde-chapitre', chapitre);
    _texte('objectif-principal-texte', libelleObjectifPrincipal(config, bossInfo).toUpperCase());

    _majEtoileSlot('objectif-etoile-principale', etoilesSave[0], false, 'Objectif principal');
    _majEtoileSlot('objectif-etoile-2', etoilesSave[1], false, libelleEtoile(config.etoile2));
    _majEtoileSlot('objectif-etoile-3', etoilesSave[2], true, libelleEtoile(config.etoile3));

    if (!config.etoile2) _masquer('objectif-etoile-2');
    else _afficher('objectif-etoile-2');
    if (!config.etoile3) _masquer('objectif-etoile-3');
    else _afficher('objectif-etoile-3');
}

function _commencerDepuisPanneau() {
    const mondeId = store.histoire.mondeActuel;
    try {
        if (mondeId) {
            demarrerSuiviMonde(mondeId);
            store.multGraviteMusique = 1.0;
        }
    } catch (err) {
        logger.error('[objectifs] demarrerSuiviMonde:', err);
    } finally {
        const cb = _callbackPanneauPre;
        fermerOverlayObjectifsPre();
        cb?.();
    }
}

export function commencerDepuisPanneauObjectifs() {
    _commencerDepuisPanneau();
}

/**
 * @param {MondeHistoire} monde
 * @param {() => void} onCommencer
 * @param {() => void} avantAffichage
 */
export function afficherPanneauObjectifs(monde, onCommencer, avantAffichage) {
    const montrer = () => {
        avantAffichage();
        ancrerOverlaysObjectifsAuBody();
        _callbackPanneauPre = onCommencer;
        _remplirPanneauPreMonde(monde);

        cacherEcransPourObjectifs();

        _desactiverFocusTrapPre?.();
        _afficher('overlay-objectifs-pre');
        _definirAriaOverlay('overlay-objectifs-pre', true);
        _el('overlay-objectifs-pre')?.classList.add('objectif-overlay-visible');
        _desactiverFocusTrapPre = _activerFocusTrapOverlay(
            'overlay-objectifs-pre',
            'btn-objectifs-commencer'
        );

        _retirerEcouteurEscape();
        _ecouteurEscape = (ev) => {
            if (ev.key === 'Escape') {
                ev.preventDefault();
                _commencerDepuisPanneau();
            }
        };
        document.addEventListener('keydown', _ecouteurEscape);
    };

    if (!_el('overlay-objectifs-pre')) {
        void import('./charger-ecrans.js').then(async ({ assurerFragmentsPartie }) => {
            await assurerFragmentsPartie();
            montrer();
        });
        return;
    }

    montrer();
}

export function fermerOverlayObjectifsPre() {
    _retirerEcouteurEscape();
    _desactiverFocusTrapPre?.();
    _desactiverFocusTrapPre = null;
    _el('overlay-objectifs-pre')?.classList.remove('objectif-overlay-visible');
    _masquer('overlay-objectifs-pre');
    _definirAriaOverlay('overlay-objectifs-pre', false);
    _callbackPanneauPre = null;
}

export function fermerOverlayRecapMonde() {
    _retirerEcouteurEscape();
    if (_timerRecap) {
        clearTimeout(_timerRecap);
        _timerRecap = null;
    }
    _desactiverFocusTrapRecap?.();
    _desactiverFocusTrapRecap = null;
    _el('overlay-recap-monde')?.classList.remove('objectif-overlay-visible');
    _masquer('overlay-recap-monde');
    _definirAriaOverlay('overlay-recap-monde', false);
    _masquer('recap-etoile-3-libelle');
    _callbackRecap = null;
}

/** @param {[boolean, boolean, boolean]} etoiles @param {MondeHistoire} monde */
function _afficherRecap(etoiles, monde) {
    const config = DIFFICULTE_MONDES[monde.id];
    _texte('recap-monde-nom', monde.nomAffiche ?? monde.id);

    const slots = ['recap-etoile-0', 'recap-etoile-1', 'recap-etoile-2'];
    slots.forEach((id, i) => {
        const el = _el(id);
        if (!el) return;
        el.classList.remove('recap-etoile-remplie', 'recap-etoile-revelation');
        void el.offsetWidth;
        setTimeout(() => {
            if (etoiles[i]) {
                el.classList.add('recap-etoile-remplie');
                if (i === 2 && config?.etoile3) {
                    el.classList.add('recap-etoile-revelation');
                    const lbl = _el('recap-etoile-3-libelle');
                    if (lbl) lbl.textContent = libelleEtoile(config.etoile3);
                    _afficher('recap-etoile-3-libelle');
                }
            }
        }, 300 * i);
    });

    ancrerOverlaysObjectifsAuBody();
    _desactiverFocusTrapRecap?.();
    _afficher('overlay-recap-monde');
    _definirAriaOverlay('overlay-recap-monde', true);
    _el('overlay-recap-monde')?.classList.add('objectif-overlay-visible');
    _desactiverFocusTrapRecap = _activerFocusTrapOverlay(
        'overlay-recap-monde',
        'btn-recap-continuer'
    );

    _retirerEcouteurEscape();
    _ecouteurEscape = (ev) => {
        if (ev.key === 'Escape') {
            ev.preventDefault();
            fermerRecapAvecCallback();
        }
    };
    document.addEventListener('keydown', _ecouteurEscape);

    if (_timerRecap) clearTimeout(_timerRecap);
    _timerRecap = null;
}

/**
 * @param {MondeHistoire} monde
 * @param {[boolean, boolean, boolean]} etoiles
 * @param {() => void} onFin
 * @param {() => void} avantAffichage
 */
export function afficherRecapAvantNarratif(monde, etoiles, onFin, avantAffichage) {
    const montrer = () => {
        avantAffichage();
        _callbackRecap = onFin;
        _afficherRecap(etoiles, monde);
    };
    if (_el('overlay-recap-monde')) {
        montrer();
        return;
    }
    void import('./charger-ecrans.js').then(async ({ assurerFragmentsPartie }) => {
        await assurerFragmentsPartie();
        montrer();
    });
}

/** @param {() => void} onFerme */
export function fermerRecapAvecCallback(onFerme) {
    const cb = _callbackRecap ?? onFerme;
    fermerOverlayRecapMonde();
    cb?.();
}

export function attacherEcouteursRecapOverlay() {
    const recap = _el('overlay-recap-monde');
    const btnRecap = _el('btn-recap-continuer');
    if (recap && !recap.dataset.neoRecapListener) {
        recap.dataset.neoRecapListener = '1';
        recap.addEventListener('click', () => fermerRecapAvecCallback());
    }
    if (btnRecap && !btnRecap.dataset.neoRecapListener) {
        btnRecap.dataset.neoRecapListener = '1';
        btnRecap.addEventListener('click', (e) => {
            e.stopPropagation();
            fermerRecapAvecCallback();
        });
    }
}
