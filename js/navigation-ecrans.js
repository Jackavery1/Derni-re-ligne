import { demarrerConstellation, arreterConstellation } from './constellation.js';
import { AudioMoteur } from './audio.js';
import { ECRANS, etat, definirEcranActuel } from './store-jeu.js';
import { demarrerAnimationMenu, arreterAnimationMenu } from './menu-fond.js';
import { genererGalerieAchievements } from './achievements.js';
import { genererCodexComplet } from './codex.js';
import { mettreAJourAffichageRecord } from './hud-jeu.js';
import { annoncer } from './annonces.js';

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
    ];
    if (ecransHorsPartie.includes(idEcran)) {
        document.body.classList.remove('partie-active');
    }
}

export function afficherEcran(idEcran) {
    definirEcranActuel(idEcran);
    document.querySelectorAll('.ecran').forEach((el) => el.classList.remove('actif'));
    const ecran = document.getElementById(idEcran);
    ecran?.classList.add('actif');
    ecran?.querySelector('button, [href], input')?.focus({ preventScroll: true });

    mettreAJourVisibilitePartie(idEcran);

    if (idEcran === ECRANS.TITRE) {
        AudioMoteur.arreterMusique();
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
        genererCodexComplet();
    }

    if (idEcran === ECRANS.PAUSE) {
        const elS = document.getElementById('pause-score');
        const elL = document.getElementById('pause-lignes');
        const elN = document.getElementById('pause-niveau');
        if (elS) elS.textContent = etat.score.toLocaleString('fr-FR');
        if (elL) elL.textContent = etat.lignes;
        if (elN) elN.textContent = etat.niveau;
    }
}

export function cacherEcrans() {
    document.querySelectorAll('.ecran').forEach((el) => el.classList.remove('actif'));
}
