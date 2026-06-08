import { SEQUENCE_HISTOIRE } from './histoire-donnees.js';
import { store } from './store-core.js';
import { definirBiomeActif } from './store-etat-partie.js';
import { sauvegarderBiomeActif, sauvegarderEtatHistoire } from './progression.js';
import { obtenirActions } from './actions-jeu.js';
import { ECRANS } from './ecrans-config.js';
import { logger } from './logger.js';
import { arreterBoss } from './boss-jeu.js';
import { paradoxeEstDebloque } from './monde-paradoxe-etat.js';
import { arreterFondFin } from './fin-bg-rendu.js';
import { afficherTutorielPrologueApresCutscene } from './tutoriel.js';
import { chargerHistoireTextes } from './charger-histoire-textes.js';
import {
    obtenirEtatHistoire,
    mondePeutEtreJoue,
    masquerPanneauDetails,
} from './histoire-mondes.js';
import { obtenirActionsHistoire, configurerActionsHistoire } from './histoire-actions.js';

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
    if (!mondePeutEtreJoue(mondeId, etat)) {
        logger.warn('Monde verrouillé:', mondeId);
        return;
    }

    masquerPanneauDetails();

    const dejaJoue =
        etat.mondesCompletes.includes(mondeId) || (etat.mondesDejaMontres ?? []).includes(mondeId);

    const cutscene = (await import('./histoire-narratif.js')).obtenirCutsceneEntree(
        mondeId,
        !dejaJoue
    );
    const { afficherCutsceneHistoire } = await import('./histoire-manager-ui.js');
    if (cutscene) {
        if (!etat.mondesDejaMontres) etat.mondesDejaMontres = [];
        if (!etat.mondesDejaMontres.includes(mondeId)) {
            etat.mondesDejaMontres.push(mondeId);
            sauvegarderEtatHistoire(etat);
        }
        afficherCutsceneHistoire(cutscene.lignes, cutscene.personnages, () =>
            _apresPresentationMonde(monde)
        );
    } else {
        _apresPresentationMonde(monde);
    }
}

/** @param {typeof SEQUENCE_HISTOIRE[number]} monde */
function _apresPresentationMonde(monde) {
    if (monde.id === 'monde_prologue') {
        afficherTutorielPrologueApresCutscene(() => _lancerPartieHistoire(monde));
        return;
    }
    _lancerPartieHistoire(monde);
}

/** @param {typeof SEQUENCE_HISTOIRE[number]} monde */
function _lancerPartieHistoire(monde) {
    obtenirActionsHistoire().arreterCarte?.();

    store.histoire.actif = true;
    store.histoire.mondeActuel = monde.id;

    definirBiomeActif(monde.biomeId);
    sauvegarderBiomeActif(monde.biomeId);

    void import('./navigation-ecrans.js').then(({ cacherEcrans }) => cacherEcrans());
    document.body.classList.add('histoire-active');

    obtenirActions().demarrerJeu?.();
}

export async function retournerACarte() {
    store.histoire.actif = false;
    store.histoire.mondeActuel = null;
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
        afficherJournalVera(journal, () => afficherEcran(ECRANS.HISTOIRE_MAP));
    } else {
        afficherEcran(ECRANS.HISTOIRE_MAP);
    }
}

export function retournerAuMondeActuel() {
    const mondeId = store.histoire.mondeActuel;
    if (mondeId) {
        document.body.classList.remove('histoire-active');
        demarrerMondeHistoire(mondeId);
    } else {
        void retournerACarte();
    }
}

/** @param {string} mondeId */
export function demarrerMondeHistoireCache(mondeId) {
    if (mondeId === 'monde_paradoxe') {
        if (paradoxeEstDebloque()) demarrerParadoxe();
        return;
    }
    demarrerMondeHistoire(mondeId);
}

const _NOM_PARADOXE = 'monde_paradoxe';

export function demarrerParadoxe() {
    if (!paradoxeEstDebloque()) return;
    logger.info('[paradoxe] entrée');

    store.histoire.actif = true;
    store.histoire.mondeActuel = _NOM_PARADOXE;

    void Promise.all([chargerHistoireTextes(), import('./histoire-manager-ui.js')])
        .then(([textes, { afficherCutsceneHistoire }]) => {
            const lignes = textes.CUTSCENES_ENTREE.monde_paradoxe ?? [];
            afficherCutsceneHistoire(
                lignes.map((l) => l.texte),
                lignes.map((l) => l.personnage),
                () => _surFinParadoxe()
            );
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
});
