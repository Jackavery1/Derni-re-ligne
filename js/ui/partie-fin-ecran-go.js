import { CONFIG } from '../config/config-jeu.js';
import { etat, obtenirBiomeActif } from '../etat/store-jeu.js';
import { reagirRoboNouveauRecord, formaterTemps, obtenirTempsEcoule } from './ecrans-ui.js';
import { modeHistoireEnCours } from '../etat/mode-histoire.js';
import { obtenirRecordBiome } from '../io/progression.js';
import { obtenirEtatHistoire } from '../histoire/histoire-mondes.js';
import { peutContinuerBossGratuit } from '../histoire/histoire-boss-continue.js';
import { sansAccentsE } from '../logique/texte-jeu.js';
import { arreterSuiviMonde } from '../logique/gestionnaire-difficulte.js';
import { oracle } from '../logique/oracle-jeu.js';
import { statsGlobales } from '../achievements.js';

/** @param {number} scoreFinal */
export function appliquerStatsOracleFinPartie(scoreFinal) {
    void scoreFinal;
    if (!oracle.actif) return;
    statsGlobales.oraclePartiesJouees++;
    statsGlobales.oracleTotalDeviations += oracle.piecesIgnorees;
    statsGlobales.oracleDeviationsPartieActuelle = oracle.piecesIgnorees;
    if (oracle.multiplicateur > statsGlobales.oracleMeilleuresMult) {
        statsGlobales.oracleMeilleuresMult = oracle.multiplicateur;
    }
    if (oracle.scoreBonus > 0) {
        const elBonus = document.getElementById('oracle-bonus-go');
        if (elBonus) {
            elBonus.textContent = `+${oracle.scoreBonus.toLocaleString('fr-FR')}`;
            document.getElementById('oracle-bonus-go-wrap')?.classList.remove('element-masque');
        }
    }
}

/** @param {number} scoreFinal @param {boolean} nouveauRecord */
export function remplirEcranGameOver(scoreFinal, nouveauRecord) {
    const scoreEl = document.getElementById('score-final');
    const lignesEl = document.getElementById('lignes-finales');
    const niveauEl = document.getElementById('niveau-final');
    const recordEl = document.getElementById('record-final');
    const tempsEl = document.getElementById('temps-final');
    if (!scoreEl || !lignesEl || !niveauEl || !recordEl || !tempsEl) return;

    scoreEl.textContent = scoreFinal.toLocaleString('fr-FR');
    lignesEl.textContent = String(etat.lignes);
    niveauEl.textContent = String(etat.niveau);
    recordEl.textContent = obtenirRecordBiome(obtenirBiomeActif()).toLocaleString('fr-FR');
    tempsEl.textContent = formaterTemps(obtenirTempsEcoule());

    const badge = document.getElementById('badge-record');
    badge?.classList.toggle('element-masque', !nouveauRecord);
    if (nouveauRecord) reagirRoboNouveauRecord();
}

function afficherContinuesCampagneGameOver() {
    const el = document.getElementById('go-continues-campagne');
    if (!el) return;

    if (!modeHistoireEnCours()) {
        el.classList.add('element-masque');
        return;
    }

    const nb = obtenirEtatHistoire()?.nbContinuesUtilises ?? 0;
    if (nb <= 0) {
        el.classList.add('element-masque');
        return;
    }

    el.textContent = sansAccentsE(
        `Continues campagne utilises : ${nb} — peut affecter la fin Trame.`
    );
    el.classList.remove('element-masque');
}

function afficherAvertissementTrameGameOver(continueGratuit) {
    const el = document.getElementById('go-avertissement-trame');
    if (!el) return;

    if (continueGratuit) {
        el.textContent = sansAccentsE(
            'Continue gratuit disponible — sans impact sur la fin Trame (condition 3/4).'
        );
        el.classList.remove('element-masque');
        return;
    }

    const etatHist = obtenirEtatHistoire();
    if (etatHist.conditionsTrame?.tousBossSansContinue === false) {
        el.textContent = sansAccentsE(
            "Un Continue empeche la fin Trame. La condition « Tous les boss sans continue » n'est plus remplie."
        );
        el.classList.remove('element-masque');
        return;
    }

    el.classList.add('element-masque');
}

/** @param {boolean} [victoire] */
export function afficherActionsFinHistoire(victoire = false) {
    const btnContinue = document.getElementById('btn-continue-boss');
    const btnCarte = document.getElementById('btn-histoire-carte');
    if (!modeHistoireEnCours()) {
        btnCarte?.classList.add('element-masque');
        btnContinue?.classList.add('element-masque');
        document.getElementById('go-avertissement-trame')?.classList.add('element-masque');
        document.getElementById('go-continues-campagne')?.classList.add('element-masque');
        arreterSuiviMonde();
    } else {
        const lancerFinMonde = () => {
            void import('../histoire/histoire-manager-completion.js').then(
                ({ surFinDeMondeHistoire }) => surFinDeMondeHistoire(etat.lignes, etat.score)
            );
        };
        if (victoire) {
            setTimeout(lancerFinMonde, CONFIG.delaiNarratifVictoireHistoireMs);
        } else {
            lancerFinMonde();
        }
        const continueGratuit = peutContinuerBossGratuit();
        btnContinue?.classList.toggle('element-masque', !continueGratuit);
        if (continueGratuit) btnCarte?.classList.add('element-masque');
        afficherAvertissementTrameGameOver(continueGratuit);
        afficherContinuesCampagneGameOver();
    }
}
