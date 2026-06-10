import { SEQUENCE_HISTOIRE, JOURNAUX_VERA } from './histoire-donnees.js';
import { BIOMES } from './config.js';
import {
    obtenirEtatHistoire,
    mondePeutEtreJoue,
    obtenirEtatMonde,
    masquerPanneauDetails,
    obtenirProgressionGlobale,
    SEUILS_COMPLETION,
} from './histoire-mondes.js';
import { obtenirActionsHistoire } from './histoire-actions.js';
import { modeDevActif } from './mode-dev-etat.js';
import { obtenirEtoilesPersistees } from './gestionnaire-difficulte.js';

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
        opt.textContent =
            etatMonde === 'verrouille' ? `${monde.nomAffiche} (verrouille)` : monde.nomAffiche;
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
        }
    });

    canvasCarte.addEventListener('mouseleave', () => {
        etatCarte.noeudSurvole = null;
        canvasCarte.style.cursor = 'default';
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
        return;
    }

    etatCarte.noeudSelectionne = noeud.id;
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

    if (doubleTap && mondePeutEtreJoue(noeud.monde.id, obtenirEtatHistoire())) {
        lancerMondeDepuisCarte(noeud.monde);
    }
}

function mettreAJourPanneauDetails(etatCarte, monde, etatHist, lancerMondeDepuisCarte) {
    void etatCarte;
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
            if (estBoss) {
                elStatut.textContent = 'OBJECTIF : VAINCRE LE BOSS';
            } else {
                const seuil = SEUILS_COMPLETION[monde.biomeId] ?? 10;
                elStatut.textContent = `OBJECTIF : ${seuil} LIGNES`;
            }
            elStatut.style.color = 'var(--texte-dim)';
        } else {
            elStatut.textContent = '🔒 VERROUILLÉ';
            elStatut.style.color = 'var(--texte-dim)';
        }
    }

    const elEtoiles = /** @type {HTMLElement | null} */ (
        panneau.querySelector('.histoire-detail-etoiles')
    );
    if (elEtoiles) {
        const etoiles = obtenirEtoilesPersistees(etatHist, monde.id);
        elEtoiles.textContent = '';
        etoiles.forEach((obtenue, i) => {
            const span = document.createElement('span');
            span.className = 'histoire-carte-etoile';
            span.textContent = '★';
            span.classList.toggle('histoire-carte-etoile-active', obtenue);
            span.setAttribute('aria-label', `Étoile ${i + 1}${obtenue ? ' obtenue' : ''}`);
            elEtoiles.appendChild(span);
        });
    }

    const elJournal = /** @type {HTMLElement | null} */ (
        panneau.querySelector('.histoire-detail-journal')
    );
    if (elJournal) {
        const journalDispo = JOURNAUX_VERA.find((j) => {
            if (j.biomeId !== monde.biomeId) return false;
            if (etatHist.journauxTrouves.includes(j.id)) return false;
            // N'indique la transmission que sur le monde où elle est reellement obtenable.
            if (j.condition === 'debloquer_apres_boss_sentinelle') {
                return monde.bossId === 'sentinelle';
            }
            if (j.condition === 'trouver_laboratoire_vera') return monde.id === 'monde_cyber';
            return true;
        });
        elJournal.textContent = journalDispo ? '📔 TRANSMISSION CACHÉE' : '';
    }

    const btnJouer = /** @type {HTMLButtonElement | null} */ (
        panneau.querySelector('.bouton-jouer-monde')
    );
    if (btnJouer) {
        const peutJouer = modeDevActif() || etatMonde !== 'verrouille';
        btnJouer.classList.toggle('element-masque', !peutJouer);
        btnJouer.textContent = etatMonde === 'complete' ? '↺ REJOUER' : '▶ JOUER';
        btnJouer.onclick = () => lancerMondeDepuisCarte(monde);
    }

    panneau.classList.remove('histoire-panneau-masque');
}

export function mettreAJourEnteteHistoire() {
    const prog = obtenirProgressionGlobale();
    const elMondes = document.getElementById('histoire-prog-mondes');
    const elJournaux = document.getElementById('histoire-prog-journaux');
    if (elMondes) elMondes.textContent = `${prog.nbCompletes}/${prog.nbTotal} MONDES`;
    if (elJournaux) {
        elJournaux.textContent = `${prog.nbJournaux}/${prog.nbJournauxTotal} TRANSMISSIONS`;
    }
}

export function lancerMondeDepuisCarte(monde) {
    const actions = obtenirActionsHistoire();
    if (['monde_miroir', 'monde_trame', 'monde_paradoxe'].includes(monde.id)) {
        actions.demarrerMondeCache?.(monde.id);
    } else {
        actions.demarrerMonde?.(monde.id);
    }
}
