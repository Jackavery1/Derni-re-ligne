import { demarrerConstellation, arreterConstellation } from './constellation.js';
import { AudioMoteur } from './audio.js';
import { ECRANS, etat, definirEcranActuel } from './store-jeu.js';
import { demarrerAnimationMenu, arreterAnimationMenu } from './menu-fond.js';
import { genererGalerieAchievements } from './achievements.js';
import { genererCodexComplet } from './codex.js';
import { cacherBanniereVivant } from './vivant.js';
import { mettreAJourAffichageRecord } from './hud-jeu.js';
import { annoncer } from './annonces.js';
import { demarrerCarteHistoire, arreterCarteHistoire } from './histoire-map.js';

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

export function afficherEcran(idEcran) {
    definirEcranActuel(idEcran);
    document.querySelectorAll('.ecran').forEach((el) => el.classList.remove('actif'));
    const ecran = document.getElementById(idEcran);
    ecran?.classList.add('actif');
    const focusable = ecran?.querySelector('button, [href], input');
    if (focusable instanceof HTMLElement) focusable.focus({ preventScroll: true });

    mettreAJourVisibilitePartie(idEcran);

    if (idEcran === ECRANS.TITRE) {
        AudioMoteur.arreterMusique(500);
        mettreAJourAffichageRecord();
        demarrerAnimationMenu();
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
    }

    if (idEcran === ECRANS.PROFIL) {
        import('./profil-jeu.js').then(({ chargerProfilDernier, afficherProfil }) => {
            chargerProfilDernier();
            afficherProfil();
        });
    }

    if (idEcran === ECRANS.CODEX) {
        void genererCodexComplet();
    }

    if (idEcran === ECRANS.HISTOIRE_MAP) {
        demarrerCarteHistoire();
    } else {
        arreterCarteHistoire();
    }

    if (idEcran === ECRANS.PAUSE) {
        const elS = document.getElementById('pause-score');
        const elL = document.getElementById('pause-lignes');
        const elN = document.getElementById('pause-niveau');
        if (elS) elS.textContent = etat.score.toLocaleString('fr-FR');
        if (elL) elL.textContent = String(etat.lignes);
        if (elN) elN.textContent = String(etat.niveau);
    }
}

export function cacherEcrans() {
    document.querySelectorAll('.ecran').forEach((el) => el.classList.remove('actif'));
}
