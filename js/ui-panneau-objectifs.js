import { BOSS } from './histoire-donnees.js';

/** @typedef {import('./histoire-donnees.js').SEQUENCE_HISTOIRE[number]} MondeHistoire */
import { store } from './store-core.js';
import { modeHistoireEnCours } from './mode-histoire.js';
import { obtenirBiomeActif } from './store-jeu.js';
import { obtenirLibelleModificateurBiomeHud } from './mecaniques-histoire.js';
import { obtenirEtatHistoire } from './histoire-mondes.js';
import { obtenirResumeConditionsTrame } from './conditions-secrets.js';
import { ecouter } from './bus-jeu.js';
import { DIFFICULTE_MONDES } from '../data/difficulte-mondes.js';
import { logger } from './logger.js';
import { sansAccentsE } from './texte-jeu.js';
import { afficherNotificationNiveau } from './ui-notifications.js';
import {
    demarrerSuiviMonde,
    obtenirEtoilesPersistees,
    libelleEtoile,
    libelleObjectifPrincipal,
    obtenirSuiviDifficulte,
    calculerEtoiles,
} from './gestionnaire-difficulte.js';

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

let _listenersAttaches = false;

/** @type {((ev: KeyboardEvent) => void) | null} */
let _ecouteurEscape = null;

function _el(id) {
    return document.getElementById(id);
}

function _masquer(id) {
    _el(id)?.classList.add('element-masque');
}

function _afficher(id) {
    _el(id)?.classList.remove('element-masque');
}

function _texte(id, txt) {
    const el = _el(id);
    if (el) el.textContent = sansAccentsE(txt);
}

function _partieHistoireEnCours() {
    return document.body.classList.contains('partie-active') && modeHistoireEnCours();
}

function _ancrerOverlaysAuBody() {
    for (const id of IDS_OVERLAYS) {
        const el = _el(id);
        if (el && el.parentElement !== document.body) {
            document.body.appendChild(el);
        }
    }
}

function _cacherEcransPourObjectifs() {
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
        _fermerPanneauPre();
    }
}

/**
 * @param {MondeHistoire} monde
 * @param {() => void} onCommencer
 */
export function afficherPanneauObjectifs(monde, onCommencer) {
    initialiserUiObjectifs();
    _ancrerOverlaysAuBody();
    _callbackPanneauPre = onCommencer;
    _remplirPanneauPreMonde(monde);

    _cacherEcransPourObjectifs();

    _afficher('overlay-objectifs-pre');
    _el('overlay-objectifs-pre')?.classList.add('objectif-overlay-visible');
    _el('btn-objectifs-commencer')?.focus({ preventScroll: true });

    _retirerEcouteurEscape();
    _ecouteurEscape = (ev) => {
        if (ev.key === 'Escape') {
            ev.preventDefault();
            _commencerDepuisPanneau();
        }
    };
    document.addEventListener('keydown', _ecouteurEscape);
}

export function fermerOverlayObjectifsPre() {
    _retirerEcouteurEscape();
    _el('overlay-objectifs-pre')?.classList.remove('objectif-overlay-visible');
    _masquer('overlay-objectifs-pre');
    _callbackPanneauPre = null;
}

/** Ferme les overlays narratifs qui peuvent masquer ou bloquer la zone de jeu. */
export function fermerOverlaysFluxPartie() {
    fermerOverlayObjectifsPre();
    _el('overlay-recap-monde')?.classList.remove('objectif-overlay-visible');
    _masquer('overlay-recap-monde');
    _callbackRecap = null;
    document.getElementById('overlay-tutoriel')?.classList.add('element-masque');
    const trame = document.getElementById('overlay-trame-conditions');
    if (trame) {
        trame.classList.remove('objectif-overlay-visible');
        trame.classList.add('element-masque');
    }
}

function _fermerPanneauPre() {
    _retirerEcouteurEscape();
    _el('overlay-objectifs-pre')?.classList.remove('objectif-overlay-visible');
    _masquer('overlay-objectifs-pre');
    const cb = _callbackPanneauPre;
    _callbackPanneauPre = null;
    cb?.();
}

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

    _ancrerOverlaysAuBody();
    _afficher('overlay-recap-monde');
    _el('overlay-recap-monde')?.classList.add('objectif-overlay-visible');

    if (_timerRecap) clearTimeout(_timerRecap);
    _timerRecap = null;
}

function _fermerRecap() {
    if (_timerRecap) {
        clearTimeout(_timerRecap);
        _timerRecap = null;
    }
    _el('overlay-recap-monde')?.classList.remove('objectif-overlay-visible');
    _masquer('overlay-recap-monde');
    _masquer('recap-etoile-3-libelle');
    const cb = _callbackRecap;
    _callbackRecap = null;
    cb?.();
}

/**
 * @param {MondeHistoire} monde
 * @param {[boolean, boolean, boolean]} etoiles
 * @param {() => void} onFin
 */
export function afficherRecapAvantNarratif(monde, etoiles, onFin) {
    _callbackRecap = onFin;
    _afficherRecap(etoiles, monde);
}

export function rafraichirHudObjectifsHistoire() {
    if (!modeHistoireEnCours()) {
        _masquer('section-objectifs-histoire');
        return;
    }

    const suivi = obtenirSuiviDifficulte();
    if (!suivi?.actif) {
        _masquer('section-objectifs-histoire');
        return;
    }

    if (_partieHistoireEnCours()) {
        _masquer('section-objectifs-histoire');
        _rafraichirHudTrame();
        return;
    }

    _afficher('section-objectifs-histoire');
    const config = suivi.config;
    const etoiles = calculerEtoiles(suivi.mondeId ?? '');

    ['hud-etoile-0', 'hud-etoile-1', 'hud-etoile-2'].forEach((id, i) => {
        _el(id)?.classList.toggle('objectif-hud-etoile-active', etoiles[i]);
    });

    if (config?.boss) {
        _afficher('hud-objectif-boss');
        _masquer('hud-objectif-lignes');
        _texte('hud-boss-phase', `PHASE ${(store.histoire.boss.phase ?? 0) + 1}`);
    } else {
        _masquer('hud-objectif-boss');
        _afficher('hud-objectif-lignes');
        _texte(
            'hud-objectif-lignes-val',
            `OBJECTIF ${suivi.lignesEffacees}/${suivi.lignesObjectif}`
        );
    }

    _texte('hud-palier-val', `VITESSE P${suivi.palierCourant}`);

    const modificateur = obtenirLibelleModificateurBiomeHud();
    const elMod = _el('hud-modificateur-biome');
    if (elMod) {
        elMod.textContent = modificateur;
        elMod.classList.toggle('element-masque', !modificateur);
    }

    _el('hud-paradoxe-aide')?.classList.toggle(
        'element-masque',
        obtenirBiomeActif() !== 'paradoxe'
    );

    _rafraichirHudTrame();
}

function _rafraichirHudTrame() {
    const wrap = _el('hud-trame-conditions');
    if (!wrap) return;

    const etat = obtenirEtatHistoire();
    const trameComplete = etat.mondesCompletes?.includes('monde_trame');
    const bandeau = _el('bandeau-trame-run');
    if (!modeHistoireEnCours() || trameComplete || _partieHistoireEnCours()) {
        wrap?.classList.add('element-masque');
        bandeau?.classList.add('element-masque');
        return;
    }

    const resume = obtenirResumeConditionsTrame(etat);
    if (resume.validees >= resume.total) {
        wrap?.classList.add('element-masque');
        bandeau?.classList.add('element-masque');
        return;
    }

    wrap.classList.remove('element-masque');
    const resumeTexte = `TRAME ${resume.validees}/${resume.total}`;
    _texte('hud-trame-resume', resumeTexte);

    const remplirListe = (ulId) => {
        const ul = _el(ulId);
        if (!ul) return;
        ul.replaceChildren();
        for (const d of resume.details) {
            const li = document.createElement('li');
            li.textContent = sansAccentsE(`${d.ok ? '✓' : '○'} ${d.libelle}`);
            ul.appendChild(li);
        }
    };
    remplirListe('hud-trame-detail');

    if (bandeau) {
        bandeau.classList.remove('element-masque');
        _texte('bandeau-trame-resume', resumeTexte);
        remplirListe('bandeau-trame-detail');
    }
}

function _flashVague(montee) {
    const el = _el('hud-flash-vitesse');
    if (!el) return;
    el.textContent = montee ? 'VITESSE +' : 'ACCALMIE −';
    el.classList.remove('hud-flash-vitesse-actif', 'hud-flash-vitesse-descente');
    if (!montee) el.classList.add('hud-flash-vitesse-descente');
    void el.offsetWidth;
    el.classList.add('hud-flash-vitesse-actif');
    setTimeout(() => el.classList.remove('hud-flash-vitesse-actif'), 2000);
}

export function initialiserUiObjectifs() {
    if (_listenersAttaches) return;
    _ancrerOverlaysAuBody();
    const btn = _el('btn-objectifs-commencer');
    if (!btn) return;

    _listenersAttaches = true;

    btn.addEventListener('click', () => _commencerDepuisPanneau());

    btn.addEventListener('keydown', (ev) => {
        if (ev.key === 'Enter' || ev.key === ' ') {
            ev.preventDefault();
            _commencerDepuisPanneau();
        }
    });

    _el('overlay-recap-monde')?.addEventListener('click', () => _fermerRecap());
    _el('btn-recap-continuer')?.addEventListener('click', (e) => {
        e.stopPropagation();
        _fermerRecap();
    });

    ecouter('difficulte:vague', ({ montee, palierApres }) => {
        _flashVague(montee);
        if (montee && palierApres != null) {
            afficherNotificationNiveau(`PALIER P${palierApres}`);
        }
        rafraichirHudObjectifsHistoire();
    });

    ecouter('boss:phase', () => rafraichirHudObjectifsHistoire());

    ecouter('partie:stats', () => {
        if (modeHistoireEnCours()) rafraichirHudObjectifsHistoire();
    });

    ecouter('lignes:effacees', () => {
        if (modeHistoireEnCours()) rafraichirHudObjectifsHistoire();
    });
}

/** @param {MondeHistoire} monde @param {() => void} onCommencer */
export function proposerPanneauObjectifsAvantPartie(monde, onCommencer) {
    if (!DIFFICULTE_MONDES[monde.id]) {
        demarrerSuiviMonde(monde.id);
        onCommencer();
        return;
    }

    const etatHist = obtenirEtatHistoire();
    if (etatHist.mondesCompletes.includes(monde.id)) {
        demarrerSuiviMonde(monde.id);
        _cacherEcransPourObjectifs();
        fermerOverlaysFluxPartie();
        onCommencer();
        return;
    }

    afficherPanneauObjectifs(monde, onCommencer);
}
