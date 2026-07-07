import { SEQUENCE_HISTOIRE } from '../histoire-donnees.js';
import {
    obtenirEtatHistoire,
    mondePeutEtreJoue,
    obtenirEtatMonde,
    masquerPanneauDetails,
} from './histoire-mondes.js';
import { modeDevActif } from '../mode-dev-etat.js';
import { definirTexteUi } from '../texte-jeu.js';
import { mettreAJourPanneauDetails } from './histoire-map-panneau-details.js';
import { precharger } from '../scenes-cutscene.js';

const MONDES_PRECHARGE_VIDE_ERRANCE = new Set(['monde_vide', 'monde_cosmos']);

function prechargerSceneLazyMonde(noeudId) {
    if (!noeudId || !MONDES_PRECHARGE_VIDE_ERRANCE.has(noeudId)) return;
    void precharger('vide_errance');
}

export function mettreAJourAriaCarteHistoire(etatCarte) {
    const canvas = etatCarte.canvasCarte;
    if (!canvas) return;

    const base =
        'Carte des mondes de la campagne. Utilisez la liste de selection pour choisir un monde au clavier.';
    const noeudId = etatCarte.noeudSurvole ?? etatCarte.noeudSelectionne;
    if (!noeudId) {
        canvas.setAttribute('aria-label', base);
        return;
    }

    const monde = SEQUENCE_HISTOIRE.find((m) => m.id === noeudId);
    if (!monde) {
        canvas.setAttribute('aria-label', base);
        return;
    }

    const etatMonde = obtenirEtatMonde(noeudId, obtenirEtatHistoire());
    const statut =
        etatMonde === 'complete'
            ? 'complete'
            : etatMonde === 'disponible'
              ? 'disponible'
              : 'verrouille';
    const interaction = etatCarte.noeudSurvole ? 'survole' : 'selectionne';
    canvas.setAttribute(
        'aria-label',
        `${base} Monde ${monde.nomAffiche}, ${statut}, ${interaction}.`
    );
}

export function mettreAJourSelectMondesClavier(etatCarte, traiterSelectionNoeud) {
    const select = /** @type {HTMLSelectElement | null} */ (
        document.getElementById('histoire-monde-clavier')
    );
    if (!select) return;

    select.replaceChildren();
    const placeholder = document.createElement('option');
    placeholder.value = '';
    placeholder.textContent = 'Choisir un monde';
    select.appendChild(placeholder);

    const etatHist = obtenirEtatHistoire();
    for (const monde of SEQUENCE_HISTOIRE) {
        const surCarte = Boolean(etatCarte.positionsNoeuds[monde.id]);
        if (monde.estCache && !surCarte && !modeDevActif()) continue;
        const etatMonde = obtenirEtatMonde(monde.id, etatHist);
        const opt = document.createElement('option');
        opt.value = monde.id;
        const labelAccents =
            etatMonde === 'verrouille' ? `${monde.nomAffiche} (verrouille)` : monde.nomAffiche;
        definirTexteUi(opt, labelAccents);
        opt.disabled = !modeDevActif() && etatMonde === 'verrouille';
        if (etatCarte.noeudSelectionne === monde.id) opt.selected = true;
        select.appendChild(opt);
    }

    if (!etatCarte.selectMondesOk) {
        etatCarte.selectMondesOk = true;
        select.addEventListener('change', () => {
            const monde = SEQUENCE_HISTOIRE.find((m) => m.id === select.value);
            if (!monde) return;
            const pos = etatCarte.positionsNoeuds[monde.id] ?? { x: 0, y: 0, rayon: 20 };
            traiterSelectionNoeud({ id: monde.id, monde, pos }, false);
        });
    }
}

export function attacherEvenementsCarteHistoire(
    etatCarte,
    coordsCanvas,
    noeudSousCurseur,
    traiterSelectionNoeud
) {
    const { canvasCarte } = etatCarte;
    if (!canvasCarte) return;

    canvasCarte.addEventListener('mousemove', (e) => {
        const { cx, cy } = coordsCanvas(e.clientX, e.clientY);
        const noeud = noeudSousCurseur(cx, cy);
        const precedent = etatCarte.noeudSurvole;
        etatCarte.noeudSurvole = noeud?.id ?? null;
        if (etatCarte.noeudSurvole !== precedent) {
            canvasCarte.style.cursor = noeud ? 'pointer' : 'default';
            mettreAJourAriaCarteHistoire(etatCarte);
            if (noeud?.id) prechargerSceneLazyMonde(noeud.id);
        }
    });

    canvasCarte.addEventListener('mouseleave', () => {
        etatCarte.noeudSurvole = null;
        canvasCarte.style.cursor = 'default';
        mettreAJourAriaCarteHistoire(etatCarte);
    });

    canvasCarte.addEventListener('click', (e) => {
        const { cx, cy } = coordsCanvas(e.clientX, e.clientY);
        traiterSelectionNoeud(noeudSousCurseur(cx, cy), false);
    });

    canvasCarte.addEventListener(
        'touchend',
        (e) => {
            e.preventDefault();
            const touch = e.changedTouches[0];
            if (!touch) return;
            const { cx, cy } = coordsCanvas(touch.clientX, touch.clientY);
            const noeud = noeudSousCurseur(cx, cy);
            const maintenant = Date.now();
            const doubleTap =
                !!noeud &&
                noeud.id === etatCarte.dernierTapNoeud &&
                maintenant - etatCarte.dernierTapTemps < 450;
            etatCarte.dernierTapNoeud = noeud?.id ?? null;
            etatCarte.dernierTapTemps = maintenant;
            traiterSelectionNoeud(noeud, doubleTap);
        },
        { passive: false }
    );
}

export function traiterSelectionNoeud(etatCarte, noeud, doubleTap, lancerMondeDepuisCarte) {
    if (!noeud) {
        etatCarte.noeudSelectionne = null;
        masquerPanneauDetails();
        mettreAJourAriaCarteHistoire(etatCarte);
        return;
    }

    etatCarte.noeudSelectionne = noeud.id;
    prechargerSceneLazyMonde(noeud.id);
    mettreAJourPanneauDetails(
        etatCarte,
        noeud.monde,
        obtenirEtatHistoire(),
        lancerMondeDepuisCarte
    );
    const select = /** @type {HTMLSelectElement | null} */ (
        document.getElementById('histoire-monde-clavier')
    );
    if (select && select.value !== noeud.id) select.value = noeud.id;
    mettreAJourAriaCarteHistoire(etatCarte);

    if (doubleTap && mondePeutEtreJoue(noeud.monde.id, obtenirEtatHistoire())) {
        lancerMondeDepuisCarte(noeud.monde);
    }
}
