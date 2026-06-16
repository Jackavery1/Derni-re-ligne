import { SEQUENCE_HISTOIRE } from './histoire-donnees.js';
import { enchainementCampagneActif } from './preferences-campagne.js';
import { afficherNotificationTransitionCampagne } from './ui-notifications.js';
import { store } from './store-core.js';
import { definirBiomeActif } from './store-etat-partie.js';
import { sauvegarderBiomeActif, sauvegarderEtatHistoire } from './progression.js';
import { obtenirActions } from './actions-jeu.js';
import { ECRANS } from './ecrans-config.js';
import { logger } from './logger.js';
import { arreterBoss } from './boss-jeu.js';
import { paradoxeEstDebloque } from './monde-paradoxe-etat.js';
import { arreterFondFin } from './fin-bg-rendu.js';
import { afficherTutorielPrologueApresCutscene, afficherTutorielContextuel } from './tutoriel.js';
import { chargerHistoireTextes } from './charger-histoire-textes.js';
import {
    obtenirEtatHistoire,
    mondePeutEtreJoue,
    masquerPanneauDetails,
    obtenirProchainMondeCampagne,
} from './histoire-mondes.js';
import { modeDevActif } from './mode-dev-etat.js';
import { obtenirActionsHistoire, configurerActionsHistoire } from './histoire-actions.js';
import { arreterSuiviMonde, demarrerSuiviMonde } from './gestionnaire-difficulte.js';
import { fermerOverlaysFluxPartie } from './ui-panneau-objectifs.js';
import { activerModeHistoire, desactiverModeHistoire } from './mode-histoire.js';
import { cacherEcransDiffere, afficherEcranDiffere } from './navigation-lazy.js';
import { utiliserContinueGratuitDistorsion } from './histoire-boss-continue.js';

/** @param {string} mondeId */
export function demarrerMondeHistoire(mondeId) {
    void _demarrerMondeHistoireInterne(mondeId);
}

/** @param {string} mondeId */
async function _demarrerMondeHistoireInterne(mondeId) {
    await chargerHistoireTextes();
    if (mondeId === 'monde_paradoxe') {
        demarrerMondeHistoireCache(mondeId);
        return;
    }

    const monde = SEQUENCE_HISTOIRE.find((m) => m.id === mondeId);
    if (!monde) {
        logger.warn('Monde histoire introuvable:', mondeId);
        return;
    }

    const etat = obtenirEtatHistoire();
    if (!modeDevActif() && !mondePeutEtreJoue(mondeId, etat)) {
        logger.warn('Monde verrouille:', mondeId);
        return;
    }

    masquerPanneauDetails();
    const trame = document.getElementById('overlay-trame-conditions');
    if (trame) {
        trame.classList.remove('objectif-overlay-visible');
        trame.classList.add('element-masque');
    }

    const dejaJoue =
        etat.mondesCompletes.includes(mondeId) || (etat.mondesDejaMontres ?? []).includes(mondeId);

    const premierePresentation = !dejaJoue || mondeId === 'monde_finale';
    const cutscene = (await import('./histoire-narratif.js')).obtenirCutsceneEntree(
        mondeId,
        premierePresentation
    );
    const { afficherCutsceneHistoire } = await import('./histoire-manager-ui.js');
    if (cutscene) {
        if (!etat.mondesDejaMontres) etat.mondesDejaMontres = [];
        if (!etat.mondesDejaMontres.includes(mondeId)) {
            etat.mondesDejaMontres.push(mondeId);
            sauvegarderEtatHistoire(etat);
        }
        afficherCutsceneHistoire(cutscene, null, () => _apresPresentationMonde(monde));
    } else {
        _apresPresentationMonde(monde);
    }
}

/** @param {typeof SEQUENCE_HISTOIRE[number]} monde */
function _apresPresentationMonde(monde) {
    store.histoire.mondeActuel = monde.id;
    const lancer = () => _lancerPartieHistoire(monde);
    void import('./ui-panneau-objectifs.js')
        .then(({ proposerPanneauObjectifsAvantPartie }) => {
            if (monde.id === 'monde_prologue') {
                afficherTutorielPrologueApresCutscene(() =>
                    proposerPanneauObjectifsAvantPartie(monde, lancer)
                );
                return;
            }
            if (monde.id === 'monde_finale') {
                afficherTutorielContextuel('distorsion', () =>
                    proposerPanneauObjectifsAvantPartie(monde, lancer)
                );
                return;
            }
            proposerPanneauObjectifsAvantPartie(monde, lancer);
        })
        .catch((err) => {
            logger.error('[histoire] panneau objectifs:', err);
            lancer();
        });
}

/** @param {typeof SEQUENCE_HISTOIRE[number]} monde */
function _lancerPartieHistoire(monde) {
    obtenirActionsHistoire().arreterCarte?.();
    fermerOverlaysFluxPartie();
    cacherEcransDiffere();

    activerModeHistoire();
    store.histoire.mondeActuel = monde.id;

    definirBiomeActif(monde.biomeId);
    sauvegarderBiomeActif(monde.biomeId);

    document.body.classList.add('histoire-active');

    if (!store.histoire.difficulte?.actif) {
        demarrerSuiviMonde(monde.id);
    }

    const demarrerJeu = obtenirActions().demarrerJeu;
    if (!demarrerJeu) {
        logger.error('[histoire] demarrerJeu indisponible');
        return;
    }

    try {
        demarrerJeu();
    } catch (err) {
        logger.error('[histoire] demarrerJeu:', err);
    }
}

/**
 * Enchaîne la campagne après victoire : lance le monde suivant ou affiche le game over.
 * @param {string} [mondeId]
 * @returns {Promise<boolean>} true si un monde suivant a été lancé
 */
export async function enchainerCampagneApresMonde(mondeId) {
    const id = mondeId ?? store.histoire.mondeActuel;
    arreterSuiviMonde();
    document.body.classList.remove('partie-active');

    const suivantId = id ? obtenirProchainMondeCampagne(id) : null;
    const [{ afficherBoutonCarteGameOver }, { cacherEcrans, afficherEcran }] = await Promise.all([
        import('./histoire-manager-ui.js'),
        import('./navigation-ecrans.js'),
    ]);

    if (suivantId && enchainementCampagneActif()) {
        afficherBoutonCarteGameOver(false);
        fermerOverlaysFluxPartie();
        cacherEcrans();
        const mondeSuivant = SEQUENCE_HISTOIRE.find((m) => m.id === suivantId);
        if (mondeSuivant) {
            afficherNotificationTransitionCampagne(mondeSuivant.nomAffiche ?? mondeSuivant.id);
        }
        demarrerMondeHistoire(suivantId);
        return true;
    }

    afficherBoutonCarteGameOver(true);
    afficherEcran(ECRANS.GAME_OVER);
    return false;
}

export async function retournerACarte() {
    store.histoire.mondeActuel = null;
    arreterSuiviMonde();
    store.histoire.etat = null;
    document.body.classList.remove('histoire-active');
    arreterBoss();
    arreterFondFin();
    const [{ afficherBoutonCarteGameOver }, { afficherEcran }] = await Promise.all([
        import('./histoire-manager-ui.js'),
        import('./navigation-ecrans.js'),
    ]);
    afficherBoutonCarteGameOver(false);

    if (store.histoire.dernierJournal) {
        const journal = store.histoire.dernierJournal;
        store.histoire.dernierJournal = null;
        const { afficherJournalVera } = await import('./histoire-narratif.js');
        afficherJournalVera(journal, () => {
            activerModeHistoire();
            afficherEcran(ECRANS.HISTOIRE_MAP);
        });
    } else {
        activerModeHistoire();
        afficherEcran(ECRANS.HISTOIRE_MAP);
    }
}

export function relancerMondeActuel() {
    const mondeId = store.histoire.mondeActuel;
    if (!mondeId) {
        void retournerACarte();
        return;
    }

    if (mondeId === 'monde_paradoxe') {
        void retournerACarte();
        return;
    }

    const monde = SEQUENCE_HISTOIRE.find((m) => m.id === mondeId);
    if (!monde) {
        void retournerACarte();
        return;
    }

    fermerOverlaysFluxPartie();
    document.body.classList.remove('partie-active');
    obtenirActionsHistoire().arreterCarte?.();
    activerModeHistoire();
    store.histoire.mondeActuel = mondeId;

    definirBiomeActif(monde.biomeId);
    sauvegarderBiomeActif(monde.biomeId);

    cacherEcransDiffere();
    document.body.classList.add('histoire-active');

    demarrerSuiviMonde(mondeId);
    const demarrerJeu = obtenirActions().demarrerJeu;
    if (demarrerJeu) demarrerJeu();
}

export function retournerAuMondeActuel() {
    relancerMondeActuel();
}

/** @param {string} mondeId */
export function demarrerMondeHistoireCache(mondeId) {
    if (mondeId === 'monde_paradoxe') {
        if (modeDevActif() || paradoxeEstDebloque()) demarrerParadoxe();
        return;
    }
    demarrerMondeHistoire(mondeId);
}

const _NOM_PARADOXE = 'monde_paradoxe';

export function demarrerParadoxe() {
    if (!modeDevActif() && !paradoxeEstDebloque()) return;
    logger.info('[paradoxe] entree');

    activerModeHistoire();
    store.histoire.mondeActuel = _NOM_PARADOXE;

    void Promise.all([chargerHistoireTextes(), import('./histoire-manager-ui.js')])
        .then(([textes, { afficherCutsceneHistoire }]) => {
            const entree = textes.CUTSCENES_ENTREE.monde_paradoxe ?? [];
            afficherCutsceneHistoire(entree, null, () => _surFinParadoxe());
        })
        .catch((err) => logger.warn('[paradoxe] chargement cutscene :', err));
}

function _surFinParadoxe() {
    const etatHist = obtenirEtatHistoire();
    if (!etatHist.mondesCompletes.includes(_NOM_PARADOXE)) {
        etatHist.mondesCompletes.push(_NOM_PARADOXE);
        sauvegarderEtatHistoire(etatHist);
        store.histoire.etat = etatHist;
    }
    setTimeout(() => {
        void retournerACarte();
    }, 600);
}

configurerActionsHistoire({
    demarrerMonde: demarrerMondeHistoire,
    demarrerMondeCache: demarrerMondeHistoireCache,
    retourCarte: () => {
        void retournerACarte();
    },
    retourTitreDepuisCarte: () => {
        desactiverModeHistoire();
        document.body.classList.remove('histoire-active');
        afficherEcranDiffere(ECRANS.TITRE);
    },
    continuerBossDistorsion: () => {
        utiliserContinueGratuitDistorsion();
        document.getElementById('btn-continue-boss')?.classList.add('element-masque');
        document.getElementById('btn-histoire-carte')?.classList.remove('element-masque');
        relancerMondeActuel();
        obtenirActions().demarrerJeu?.();
    },
});
