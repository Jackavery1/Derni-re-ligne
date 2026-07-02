import { store } from './store-core.js';
import { modeHistoireEnCours } from './mode-histoire.js';
import { obtenirBiomeActif } from './store-jeu.js';
import { obtenirLibelleModificateurBiomeHud } from './mecaniques-histoire.js';
import { obtenirEtatHistoire } from './histoire-mondes.js';
import { obtenirResumeConditionsTrame } from './conditions-secrets.js';
import { sansAccentsE } from './texte-jeu.js';
import { obtenirSuiviDifficulte, calculerEtoiles } from './gestionnaire-difficulte.js';
import {
    elObjectif,
    masquerObjectif,
    afficherObjectif,
    texteObjectif,
    partieHistoireEnCours,
} from './ui-objectifs-dom.js';

function rafraichirHudTrame() {
    const wrap = elObjectif('hud-trame-conditions');
    if (!wrap) return;

    const etat = obtenirEtatHistoire();
    const trameComplete = etat.mondesCompletes?.includes('monde_trame');
    const bandeau = elObjectif('bandeau-trame-run');
    if (!modeHistoireEnCours() || trameComplete || partieHistoireEnCours()) {
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
    texteObjectif('hud-trame-resume', resumeTexte);

    const remplirListe = (ulId) => {
        const ul = elObjectif(ulId);
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
        texteObjectif('bandeau-trame-resume', resumeTexte);
        remplirListe('bandeau-trame-detail');
    }
}

export function flashVagueObjectifs(montee) {
    const el = elObjectif('hud-flash-vitesse');
    if (!el) return;
    el.textContent = montee ? 'VITESSE +' : 'ACCALMIE −';
    el.classList.remove('hud-flash-vitesse-actif', 'hud-flash-vitesse-descente');
    if (!montee) el.classList.add('hud-flash-vitesse-descente');
    void el.offsetWidth;
    el.classList.add('hud-flash-vitesse-actif');
    setTimeout(() => el.classList.remove('hud-flash-vitesse-actif'), 2000);
}

export function rafraichirHudObjectifsHistoire() {
    if (!modeHistoireEnCours()) {
        masquerObjectif('section-objectifs-histoire');
        return;
    }

    const suivi = obtenirSuiviDifficulte();
    if (!suivi?.actif) {
        masquerObjectif('section-objectifs-histoire');
        return;
    }

    if (partieHistoireEnCours()) {
        masquerObjectif('section-objectifs-histoire');
        rafraichirHudTrame();
        return;
    }

    afficherObjectif('section-objectifs-histoire');
    const config = suivi.config;
    const etoiles = calculerEtoiles(suivi.mondeId ?? '');

    ['hud-etoile-0', 'hud-etoile-1', 'hud-etoile-2'].forEach((id, i) => {
        elObjectif(id)?.classList.toggle('objectif-hud-etoile-active', etoiles[i]);
    });

    if (config?.boss) {
        afficherObjectif('hud-objectif-boss');
        masquerObjectif('hud-objectif-lignes');
        texteObjectif('hud-boss-phase', `PHASE ${(store.histoire.boss.phase ?? 0) + 1}`);
    } else {
        masquerObjectif('hud-objectif-boss');
        afficherObjectif('hud-objectif-lignes');
        texteObjectif(
            'hud-objectif-lignes-val',
            `OBJECTIFS ${suivi.lignesEffacees}/${suivi.lignesObjectif}`
        );
    }

    texteObjectif('hud-palier-val', `PALIER ${suivi.palierCourant}/14`);
    const elPalier = elObjectif('hud-palier-val');
    if (elPalier) {
        elPalier.title = 'Vitesse de chute : palier 1 = lent, palier 14 = rapide';
    }

    const modificateur = obtenirLibelleModificateurBiomeHud();
    const elMod = elObjectif('hud-modificateur-biome');
    if (elMod) {
        elMod.textContent = modificateur;
        elMod.classList.toggle('element-masque', !modificateur);
    }

    elObjectif('hud-paradoxe-aide')?.classList.toggle(
        'element-masque',
        obtenirBiomeActif() !== 'paradoxe'
    );

    rafraichirHudTrame();
}
