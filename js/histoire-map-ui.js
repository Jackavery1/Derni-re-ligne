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
import { annulerPrechargementMedias } from './prechargement-medias.js';
import { modeDevActif } from './mode-dev-etat.js';
import { obtenirEtoilesPersistees } from './gestionnaire-difficulte.js';
import { definirTexteUi, sansAccentsE } from './texte-jeu.js';
import { obtenirResumeConditionsTrame, obtenirGuideMondeSecret } from './conditions-secrets.js';

const MARQUEUR_BOUTON = 'data-neo-histoire-lie';
let _boutonsCarteOk = false;

function _lierBoutonCarte(id, handler) {
    const el = document.getElementById(id);
    if (!el || el.hasAttribute(MARQUEUR_BOUTON) || typeof el.addEventListener !== 'function')
        return;
    el.setAttribute(MARQUEUR_BOUTON, '1');
    el.addEventListener('click', () => {
        void handler();
    });
}

export function lierBoutonsCarteHistoire() {
    if (_boutonsCarteOk) return;
    _boutonsCarteOk = true;

    _lierBoutonCarte('btn-histoire-retour', () => {
        obtenirActionsHistoire().retourTitreDepuisCarte?.();
    });

    _lierBoutonCarte('btn-histoire-carte', () => {
        obtenirActionsHistoire().retourCarte?.();
    });

    _lierBoutonCarte('btn-continue-boss', () => {
        void obtenirActionsHistoire().continuerBossDistorsion?.();
    });
}

let _modalTrameAttache = false;

function _ouvrirModalTrame() {
    const overlay = document.getElementById('overlay-trame-conditions');
    if (!overlay) return;
    overlay.classList.remove('element-masque');
    overlay.classList.add('objectif-overlay-visible');
}

export function fermerModalTrameCarte() {
    const overlay = document.getElementById('overlay-trame-conditions');
    if (!overlay) return;
    overlay.classList.remove('objectif-overlay-visible');
    overlay.classList.add('element-masque');
}

function _fermerModalTrame() {
    fermerModalTrameCarte();
}

export function initialiserModalTrameCarte() {
    lierBoutonsCarteHistoire();
    if (_modalTrameAttache) return;
    _modalTrameAttache = true;

    document.getElementById('btn-histoire-trame')?.addEventListener('click', (e) => {
        e.stopPropagation();
        _ouvrirModalTrame();
    });

    const overlay = document.getElementById('overlay-trame-conditions');
    const panneau = overlay?.querySelector('.histoire-trame-panneau');
    document
        .getElementById('btn-trame-fermer')
        ?.addEventListener('click', () => _fermerModalTrame());
    panneau?.addEventListener('click', (e) => e.stopPropagation());
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

function _mettreAJourGuideEtAvertissement(monde, etatMonde, estBoss) {
    const elGuide = document.getElementById('histoire-detail-guide');
    const guideSecret = obtenirGuideMondeSecret(monde.id);
    if (elGuide) {
        if (guideSecret && (etatMonde !== 'complete' || monde.estCache)) {
            elGuide.textContent = sansAccentsE(guideSecret);
            elGuide.classList.remove('element-masque');
        } else {
            elGuide.textContent = '';
            elGuide.classList.add('element-masque');
        }
    }

    const elAvert = document.getElementById('histoire-detail-avert');
    const mondesDifficiles = [
        'monde_miroir',
        'monde_trame',
        'monde_vide',
        'monde_eclipse',
        'monde_finale',
    ];
    if (elAvert) {
        const afficherAvert =
            etatMonde === 'disponible' && mondesDifficiles.includes(monde.id) && !estBoss;
        if (afficherAvert) {
            elAvert.textContent = sansAccentsE(
                'Monde exigeant — prenez le temps de lire les objectifs et les mécaniques du biome.'
            );
            elAvert.classList.remove('element-masque');
        } else {
            elAvert.textContent = '';
            elAvert.classList.add('element-masque');
        }
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
        definirTexteUi(elNom, monde.nomAffiche);
        elNom.style.setProperty('--detail-couleur', biome.lueurCoul);
    }

    const elType = /** @type {HTMLElement | null} */ (
        panneau.querySelector('.histoire-detail-type')
    );
    if (elType) {
        definirTexteUi(elType, estBoss ? '⚔ COMBAT DE BOSS' : `${biome.icone} ${biome.nom}`);
        elType.style.setProperty('--detail-couleur', estBoss ? 'var(--rose)' : biome.lueurCoul);
    }

    const elStatut = /** @type {HTMLElement | null} */ (
        panneau.querySelector('.histoire-detail-statut')
    );
    if (elStatut) {
        if (etatMonde === 'complete') {
            elStatut.textContent = '✓ COMPLETE';
            elStatut.classList.add('histoire-detail-statut-complete');
            elStatut.classList.remove('histoire-detail-statut-dim');
        } else if (etatMonde === 'disponible') {
            if (estBoss) {
                elStatut.textContent = 'OBJECTIF : VAINCRE LE BOSS';
            } else {
                const seuil = SEUILS_COMPLETION[monde.biomeId] ?? 10;
                elStatut.textContent = `OBJECTIF : ${seuil} LIGNES`;
            }
            elStatut.classList.remove('histoire-detail-statut-complete');
            elStatut.classList.add('histoire-detail-statut-dim');
        } else {
            elStatut.textContent = '🔒 VERROUILLE';
            elStatut.classList.remove('histoire-detail-statut-complete');
            elStatut.classList.add('histoire-detail-statut-dim');
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
            span.setAttribute('aria-label', `Etoile ${i + 1}${obtenue ? ' obtenue' : ''}`);
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
        elJournal.textContent = journalDispo ? '📔 TRANSMISSION CACHEE' : '';
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

    _mettreAJourGuideEtAvertissement(monde, etatMonde, estBoss);

    panneau.classList.remove('histoire-panneau-masque');
}

export function mettreAJourEnteteHistoire() {
    const prog = obtenirProgressionGlobale();
    const elMondes = document.getElementById('histoire-prog-mondes');
    const elJournaux = document.getElementById('histoire-prog-journaux');
    const elTrame = document.getElementById('histoire-prog-trame');
    const btnTrame = document.getElementById('btn-histoire-trame');
    if (elMondes) elMondes.textContent = `${prog.nbCompletes}/${prog.nbTotal} MONDES`;
    if (elJournaux) {
        elJournaux.textContent = `${prog.nbJournaux}/${prog.nbJournauxTotal} TRANSMISSIONS`;
    }

    const etatHist = obtenirEtatHistoire();
    const resumeTrame = obtenirResumeConditionsTrame(etatHist);
    const trameDebloquee = etatHist.mondesCompletes?.includes('monde_trame');
    const elListe = document.getElementById('histoire-trame-detail-liste');
    if (elTrame && btnTrame) {
        if (trameDebloquee) {
            btnTrame.classList.add('element-masque');
            elListe?.replaceChildren();
        } else {
            btnTrame.classList.remove('element-masque');
            btnTrame.classList.toggle(
                'histoire-prog-trame--en-cours',
                resumeTrame.validees < resumeTrame.total
            );
            elTrame.textContent = `TRAME ${resumeTrame.validees}/${resumeTrame.total}`;
            const detail = resumeTrame.details
                .map((d) => `${d.ok ? '✓' : '○'} ${d.libelle}`)
                .join(' · ');
            btnTrame.title = detail;
            if (elListe) {
                elListe.replaceChildren();
                for (const d of resumeTrame.details) {
                    const li = document.createElement('li');
                    li.classList.toggle('histoire-trame-condition-ok', d.ok);
                    li.textContent = sansAccentsE(`${d.ok ? '✓' : '○'} ${d.libelle}`);
                    elListe.appendChild(li);
                }
            }
        }
    }
}

export function lancerMondeDepuisCarte(monde) {
    annulerPrechargementMedias();
    fermerModalTrameCarte();
    const actions = obtenirActionsHistoire();
    if (['monde_miroir', 'monde_trame', 'monde_paradoxe'].includes(monde.id)) {
        actions.demarrerMondeCache?.(monde.id);
    } else {
        actions.demarrerMonde?.(monde.id);
    }
}
