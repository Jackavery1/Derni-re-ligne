import {
    chargerNiveauGlobal,
    chargerBiomeActif,
    obtenirRecordBiome,
    sauvegarderRecordBiome,
} from '../io/progression.js';
import {
    etat,
    obtenirBiomeActif,
    obtenirDerniereSecondeTemps,
    definirBiomeActif,
    definirNiveauGlobal,
    definirDerniereSecondeTemps,
} from '../etat/store-jeu.js';
import { CONFIG } from '../config/config-jeu.js';
import { annoncer } from '../ui/annonces.js';
import { afficherNotificationNiveau } from '../ui/ui-notifications.js';
import { modeHistoireEnCours } from '../etat/mode-histoire.js';
import { obtenirSuiviDifficulte } from '../logique/gestionnaire-difficulte.js';
import { obtenirScoreAffiche } from '../logique/oracle-jeu.js';
import { obtenirTempsEcoule } from '../logique/temps-partie.js';
import { formaterTemps } from '../logique/formatage.js';

export { obtenirTempsEcoule, formaterTemps };

export function chargerProgression() {
    definirNiveauGlobal(chargerNiveauGlobal());
    definirBiomeActif(chargerBiomeActif());
}

export function sauvegarderRecord(score) {
    return sauvegarderRecordBiome(obtenirBiomeActif(), score, etat.niveau);
}

export function mettreAJourAffichageRecord() {
    const el = document.getElementById('menu-record-val');
    if (el) el.textContent = obtenirRecordBiome(obtenirBiomeActif()).toLocaleString('fr-FR');
}

export function mettreAJourAffichageTemps() {
    const sec = Math.floor(obtenirTempsEcoule() / 1000);
    if (sec === obtenirDerniereSecondeTemps()) return;
    definirDerniereSecondeTemps(sec);
    const el = document.getElementById('affichage-temps');
    if (el) el.textContent = formaterTemps(obtenirTempsEcoule());
}

export function rafraichirStats() {
    const score = obtenirScoreAffiche();
    const suiviHistoire = modeHistoireEnCours() ? obtenirSuiviDifficulte() : null;
    const niveauAffiche = suiviHistoire?.actif
        ? `P${suiviHistoire.palierCourant}/14`
        : String(etat.niveau);
    const ids = {
        'affichage-score': score.toLocaleString('fr-FR'),
        'affichage-lignes': String(etat.lignes),
        'affichage-niveau': niveauAffiche,
    };
    for (const [id, valeur] of Object.entries(ids)) {
        const el = document.getElementById(id);
        if (!el) continue;
        el.textContent = valeur;
        if (id === 'affichage-niveau' && suiviHistoire?.actif) {
            el.title = 'Palier de vitesse de chute (1 = lent, 14 = rapide)';
        }
        el.classList.remove('anime');
        void el.offsetWidth;
        el.classList.add('anime');
        setTimeout(() => el.classList.remove('anime'), 150);
    }

    annoncer(
        suiviHistoire?.actif
            ? `Score ${score.toLocaleString('fr-FR')}, ${etat.lignes} lignes, vitesse palier ${suiviHistoire.palierCourant}`
            : `Score ${score.toLocaleString('fr-FR')}, ${etat.lignes} lignes, niveau ${etat.niveau}`
    );

    const lignesParNiveau = CONFIG.lignesParNiveau;
    const modNiveau = etat.lignes % lignesParNiveau;
    const lignesRestantes = modNiveau === 0 ? lignesParNiveau : lignesParNiveau - modNiveau;
    const elRestant = document.getElementById('affichage-restant');
    if (elRestant) {
        if (modeHistoireEnCours()) {
            elRestant.textContent = '';
        } else {
            elRestant.textContent = `${lignesRestantes} ▸ NIV.${etat.niveau + 1}`;
        }
    }

    const elBarre = document.getElementById('barre-progression-fill');
    if (elBarre) {
        if (modeHistoireEnCours()) {
            elBarre.style.setProperty('--barre-progression-pct', '0%');
        } else {
            elBarre.style.setProperty(
                '--barre-progression-pct',
                `${(modNiveau / lignesParNiveau) * 100}%`
            );
        }
    }

    if (modeHistoireEnCours()) {
        void import('../ui/ui-objectifs-hud.js').then(({ rafraichirHudObjectifsHistoire }) =>
            rafraichirHudObjectifsHistoire()
        );
    }
}

export function afficherNotifNiveau() {
    afficherNotificationNiveau(`NIVEAU ${etat.niveau} !`);
    annoncer(`Niveau ${etat.niveau} atteint`);
}
