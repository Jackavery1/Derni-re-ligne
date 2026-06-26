import { AudioMoteur } from './audio.js';
import { ECRANS, etat, definirEcranActuel } from './store-jeu.js';
import { FRAGMENTS_REQUIS_PAR_ECRAN } from './ecrans-config.js';
import { assurerFragmentsEcran } from './charger-ecrans.js';
import { demarrerAnimationMenu, arreterAnimationMenu } from './menu-fond.js';
import { cacherBanniereVivant } from './vivant.js';
import { mettreAJourAffichageRecord } from './hud-jeu.js';
import { annoncer } from './annonces.js';
import { mettreAJourVisibiliteModesDebloques } from './deblocage-ui.js';
import { modeHistoireEnCours } from './mode-histoire.js';
import { modeArchiActif } from './registre-modes.js';
import { demarrerFondMeta, arreterFondMeta } from './fond-ecrans-meta.js';
import { adapterNotifsJeu } from './layout-jeu.js';

const FONDS_META = {
    [ECRANS.CODEX]: { canvasId: 'fond-meta-codex', teinte: '#ff2d78' },
    [ECRANS.PROFIL]: { canvasId: 'fond-meta-profil', teinte: '#00ddc8' },
    [ECRANS.ACHIEVEMENTS]: { canvasId: 'fond-meta-memorial', teinte: '#ffbb44' },
    [ECRANS.ARCHI_SELECTION]: { canvasId: 'fond-meta-architecte', teinte: '#ffbb44' },
};

let _optionsUiInitialise = false;

export { annoncer };

async function _demarrerConstellation() {
    const { demarrerConstellation } = await import('./constellation.js');
    demarrerConstellation();
}

async function _arreterConstellation() {
    const { arreterConstellation } = await import('./constellation.js');
    arreterConstellation();
}

export function mettreAJourVisibilitePartie(idEcran) {
    const ecransHorsPartie = [
        ECRANS.TITRE,
        ECRANS.SELECTION,
        ECRANS.OPTIONS,
        ECRANS.ACHIEVEMENTS,
        ECRANS.PROFIL,
        ECRANS.CODEX,
        ECRANS.ARCHI_SELECTION,
        ECRANS.ARCHI_RESULTAT,
        ECRANS.HISTOIRE_MAP,
        ECRANS.HISTOIRE_CUTSCENE,
        ECRANS.HISTOIRE_JOURNAL,
        ECRANS.HISTOIRE_FIN,
    ];
    if (ecransHorsPartie.includes(idEcran)) {
        document.body.classList.remove('partie-active');
        cacherBanniereVivant();
        adapterNotifsJeu();
    }
}

/**
 * Rend la zone de jeu (visible derriere les overlays comme la pause) inerte
 * pour que la navigation clavier ne puisse pas atteindre ses boutons.
 * @param {boolean} inerte
 */
function definirZoneJeuInerte(inerte) {
    for (const id of ['conteneur-principal', 'conteneur-principal-coop']) {
        const el = document.getElementById(id);
        if (el) el.inert = inerte;
    }
}

export function afficherEcran(idEcran) {
    void _afficherEcranAvecFragments(idEcran);
}

export function afficherEcranAsync(idEcran) {
    return _afficherEcranAvecFragments(idEcran);
}

async function _afficherEcranAvecFragments(idEcran) {
    const fragments = FRAGMENTS_REQUIS_PAR_ECRAN[idEcran];
    if (fragments?.length) {
        await assurerFragmentsEcran(fragments);
        document.dispatchEvent(new CustomEvent('neo:fragments-injectes'));
    }
    definirEcranActuel(idEcran);
    document.querySelectorAll('.ecran').forEach((el) => el.classList.remove('actif'));
    const ecran = document.getElementById(idEcran);
    ecran?.classList.add('actif');
    definirZoneJeuInerte(true);
    const focusable = ecran?.querySelector('button, [href], input');
    if (focusable instanceof HTMLElement) focusable.focus({ preventScroll: true });

    mettreAJourVisibilitePartie(idEcran);

    if (idEcran === ECRANS.TITRE) {
        AudioMoteur.arreterMusique(500);
        mettreAJourAffichageRecord();
        demarrerAnimationMenu();
        mettreAJourVisibiliteModesDebloques();
    } else {
        arreterAnimationMenu();
    }

    if (idEcran === ECRANS.SELECTION) {
        void _demarrerConstellation();
    } else {
        void _arreterConstellation();
    }

    if (idEcran === ECRANS.ACHIEVEMENTS) {
        const { genererGalerieAchievements } = await import('./achievements-ui.js');
        genererGalerieAchievements();
        mettreAJourVisibiliteModesDebloques();
    }

    if (idEcran === ECRANS.PROFIL) {
        import('./profil-jeu.js').then(({ chargerProfilDernier, afficherProfil }) => {
            chargerProfilDernier();
            afficherProfil();
        });
        import('./options-progression-ui.js').then(({ initialiserSauvegardeProgression }) =>
            initialiserSauvegardeProgression()
        );
        mettreAJourVisibiliteModesDebloques();
    }

    if (idEcran === ECRANS.CODEX) {
        const codex = await import('./codex.js');
        codex.rechargerCodex();
        codex.initialiserCodexUI();
        void codex.verifierCodex().then(() => codex.genererCodexComplet());
    }

    if (idEcran === ECRANS.OPTIONS && !_optionsUiInitialise) {
        _optionsUiInitialise = true;
        const { initialiserOptions } = await import('./options-ui.js');
        initialiserOptions();
    }

    const fondMeta = FONDS_META[idEcran];
    if (fondMeta) {
        demarrerFondMeta(fondMeta.canvasId, { teinte: fondMeta.teinte });
    } else {
        arreterFondMeta();
    }

    if (idEcran === ECRANS.HISTOIRE_MAP) {
        void import('./histoire-map.js').then(({ demarrerCarteHistoire }) =>
            demarrerCarteHistoire()
        );
    } else {
        void import('./histoire-map.js').then(({ arreterCarteHistoire }) => arreterCarteHistoire());
    }

    if (idEcran === ECRANS.GAME_OVER || idEcran === ECRANS.GAME_OVER_COOP) {
        mettreAJourVisibiliteModesDebloques();
    }

    if (idEcran === ECRANS.PAUSE) {
        const elS = document.getElementById('pause-score');
        const elL = document.getElementById('pause-lignes');
        const elN = document.getElementById('pause-niveau');
        if (elS) elS.textContent = etat.score.toLocaleString('fr-FR');
        if (elL) elL.textContent = String(etat.lignes);
        if (elN) elN.textContent = String(etat.niveau);
        // Restaure les libelles solo (le mode Architecte les remplace par les siens).
        const labelLignes = document.querySelector('#ecran-pause [data-label="lignes"]');
        if (labelLignes) labelLignes.textContent = 'LIGNES';
        const labelNiveau = document.querySelector('#ecran-pause [data-label="niveau"]');
        if (labelNiveau) labelNiveau.textContent = 'NIVEAU';
        document
            .getElementById('btn-pause-carte')
            ?.classList.toggle('element-masque', !modeHistoireEnCours() || modeArchiActif());
    }
}

export function cacherEcrans() {
    document.querySelectorAll('.ecran').forEach((el) => el.classList.remove('actif'));
    definirZoneJeuInerte(false);
    arreterAnimationMenu();
    void _arreterConstellation();
    arreterFondMeta();
    void import('./histoire-map.js').then(({ arreterCarteHistoire }) => arreterCarteHistoire());
}

/** @param {() => void} [apresNavigation] */
export function retournerAuMenuTitre(apresNavigation) {
    cacherEcrans();
    afficherEcran(ECRANS.TITRE);
    apresNavigation?.();
}
