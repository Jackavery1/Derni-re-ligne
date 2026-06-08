import {
    chargerNiveauGlobal,
    chargerBiomeActif,
    obtenirRecordBiome,
    sauvegarderRecordBiome,
} from './progression.js';
import {
    etat,
    obtenirBiomeActif,
    obtenirDerniereSecondeTemps,
    definirBiomeActif,
    definirNiveauGlobal,
    definirDerniereSecondeTemps,
} from './store-jeu.js';
import { obtenirScoreAffiche } from './oracle-jeu.js';
import { annoncer } from './annonces.js';
import { afficherNotificationNiveau } from './ui-notifications.js';

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

export function formaterTemps(ms) {
    const sec = Math.max(0, Math.floor(ms / 1000));
    const mm = Math.floor(sec / 60);
    const ss = sec % 60;
    return `${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`;
}

export function obtenirTempsEcoule() {
    if (!etat.tempsDebut) return 0;
    let total = Date.now() - etat.tempsDebut - etat.tempsPauseAccumule;
    if (etat.estEnPause && etat.tempsPauseDebut) {
        total -= Date.now() - etat.tempsPauseDebut;
    }
    return Math.max(0, total);
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
    const ids = {
        'affichage-score': score.toLocaleString('fr-FR'),
        'affichage-lignes': String(etat.lignes),
        'affichage-niveau': String(etat.niveau),
    };
    for (const [id, valeur] of Object.entries(ids)) {
        const el = document.getElementById(id);
        if (!el) continue;
        el.textContent = valeur;
        el.classList.remove('anime');
        void el.offsetWidth;
        el.classList.add('anime');
        setTimeout(() => el.classList.remove('anime'), 150);
    }

    annoncer(
        `Score ${score.toLocaleString('fr-FR')}, ${etat.lignes} lignes, niveau ${etat.niveau}`
    );

    const modNiveau = etat.lignes % 10;
    const lignesRestantes = modNiveau === 0 ? 10 : 10 - modNiveau;
    const elRestant = document.getElementById('affichage-restant');
    if (elRestant) elRestant.textContent = `${lignesRestantes} ▸ NIV.${etat.niveau + 1}`;

    const elBarre = document.getElementById('barre-progression-fill');
    if (elBarre) elBarre.style.width = `${modNiveau * 10}%`;
}

export function afficherNotifNiveau() {
    afficherNotificationNiveau(`NIVEAU ${etat.niveau} !`);
    annoncer(`Niveau ${etat.niveau} atteint`);
}
