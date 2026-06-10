import { demarrerConstellation, arreterConstellation } from './constellation.js';
import { AudioMoteur } from './audio.js';
import { ECRANS, etat, definirEcranActuel } from './store-jeu.js';
import { demarrerAnimationMenu, arreterAnimationMenu } from './menu-fond.js';
import { genererGalerieAchievements } from './achievements.js';
import { genererCodexComplet } from './codex.js';
import { cacherBanniereVivant } from './vivant.js';
import { mettreAJourAffichageRecord } from './hud-jeu.js';
import { annoncer } from './annonces.js';
import { mettreAJourVisibiliteModesDebloques } from './deblocage-ui.js';
import { modeHistoireEnCours } from './mode-histoire.js';
import { modeArchiActif } from './registre-modes.js';

export { annoncer };

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
        demarrerConstellation();
    } else {
        arreterConstellation();
    }

    if (idEcran === ECRANS.ACHIEVEMENTS) {
        genererGalerieAchievements();
        mettreAJourVisibiliteModesDebloques();
    }

    if (idEcran === ECRANS.PROFIL) {
        import('./profil-jeu.js').then(({ chargerProfilDernier, afficherProfil }) => {
            chargerProfilDernier();
            afficherProfil();
        });
        mettreAJourVisibiliteModesDebloques();
    }

    if (idEcran === ECRANS.CODEX) {
        void genererCodexComplet();
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
}

/** @param {() => void} [apresNavigation] */
export function retournerAuMenuTitre(apresNavigation) {
    cacherEcrans();
    afficherEcran(ECRANS.TITRE);
    apresNavigation?.();
}
