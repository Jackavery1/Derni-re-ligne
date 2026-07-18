import { AudioMoteur } from '../audio/audio.js';
import { jouerSfxMortPartie, reinitialiserSfxMortPartie } from '../audio/sfx-mort-partie.js';
import { CONFIG } from '../config/config-jeu.js';
import { obtenirActions } from './actions-jeu.js';
import { ecouter } from '../etat/bus-jeu.js';
import { creerParticulesLigne } from '../etat/particules-spawn.js';
import { etat } from '../etat/store-jeu.js';
import {
    ajouterLignesEclipseBasse,
    ajouterLignesVide,
} from '../achievements/achievements-histoire.js';
import { obtenirLigneEclipse, biomeActuelMecanique } from '../histoire/mecaniques-histoire.js';
import {
    reagirRoboAuxLignes,
    flashGrimaceRobo,
    reagirRoboLevelUp,
    verifierPlateauCritiqueRobo,
    annoncer,
    rafraichirStats,
    afficherNotifNiveau,
} from '../ui/ecrans-ui.js';
import { evaluerDecisionOracle } from './oracle-jeu.js';
import { endommagerBoss, bossEstActif, bossEstVaincu, notifierTetrisBoss } from './boss-jeu.js';
import { mettreAJourIndicateurRelique } from './piece-jeu.js';
import { enregistrerProgression, suiviDifficulteActif } from './gestionnaire-difficulte.js';
import { modeHistoireEnCours } from '../etat/mode-histoire.js';
import { brancherBusReactionsMascotte } from '../ui/mascotte-robo.js';
import { reinitialiserTimerNiveau } from './timer-niveau.js';

let effetsInitialises = false;

function _endommagerBossTSpinSansLigne(result, nbLignes) {
    if (!modeHistoireEnCours() || !result.tSpin || nbLignes !== 0) return;
    if (!bossEstActif() || bossEstVaincu()) return;
    if (result.tSpin === 'full') endommagerBoss(1);
}

function _traiterLevelUpSolo(result) {
    if (!result.levelUp) return;
    if (modeHistoireEnCours() && suiviDifficulteActif()) return;
    reinitialiserTimerNiveau();
    afficherNotifNiveau();
    reagirRoboLevelUp();
    AudioMoteur.son('niveau');
    AudioMoteur.relancerIntervalleMusique();
    annoncer(`Niveau ${etat.niveau} atteint`);
}

function _traiterLevelUpTemps({ niveau }) {
    if (modeHistoireEnCours()) return;
    afficherNotifNiveau();
    reagirRoboLevelUp();
    AudioMoteur.son('niveau');
    AudioMoteur.relancerIntervalleMusique();
    annoncer(`Niveau ${niveau} — temps ecoule`);
    rafraichirStats();
}

export function initialiserEffetsPartie() {
    // Idempotence : une re-initialisation doublerait tous les ecouteurs du bus (sons, textes…).
    if (effetsInitialises) return;
    effetsInitialises = true;
    brancherBusReactionsMascotte(ecouter);
    ecouter('piece:son', ({ type }) => AudioMoteur.son(type));

    ecouter('fond-biome:demarrer', () => reinitialiserSfxMortPartie());

    ecouter('partie:topout', () => {
        jouerSfxMortPartie();
    });

    ecouter('difficulte:vague', ({ montee }) => {
        AudioMoteur.son(montee === false ? 'accalmie' : 'niveau');
        AudioMoteur.relancerIntervalleMusique();
    });

    ecouter('partie:stats', () => rafraichirStats());

    ecouter('partie:level-up-temps', _traiterLevelUpTemps);

    ecouter('partie:nouvelle-piece', () => {
        mettreAJourIndicateurRelique();
    });

    ecouter('lignes:effacees', ({ nbSupprimees, lignesEffacees }) => {
        if (bossEstActif() && !bossEstVaincu() && nbSupprimees > 0) {
            endommagerBoss(nbSupprimees);
        }
        // Condition Miroir (suivi tetris consecutifs CYBER) :
        // centralisee dans mecaniques-histoire.js via le bus — pas de duplication ici.
        for (const l of lignesEffacees ?? []) creerParticulesLigne(l);
        if (modeHistoireEnCours() && nbSupprimees > 0) {
            const mec = biomeActuelMecanique();
            if (mec === 'eclipse') {
                const lignesBasseCount = (lignesEffacees ?? []).filter(
                    (l) => l > obtenirLigneEclipse()
                ).length;
                if (lignesBasseCount > 0) {
                    ajouterLignesEclipseBasse(lignesBasseCount);
                }
            }
            if (mec === 'vide') {
                ajouterLignesVide(nbSupprimees);
            }
        }
        if (nbSupprimees >= 4) AudioMoteur.son('tetris');
        else if (nbSupprimees === 3) AudioMoteur.son('ligne_3');
        else if (nbSupprimees === 2) AudioMoteur.son('ligne_2');
        else if (nbSupprimees === 1) AudioMoteur.son('ligne_1');
    });

    ecouter('score:maj', ({ nbLignes, result }) => {
        if (modeHistoireEnCours() && nbLignes > 0) {
            enregistrerProgression({
                nbLignes,
                estTetris: !!result.tetris,
                combo: result.combo ?? etat.combo,
            });
        }
        if (nbLignes > 0) {
            reagirRoboAuxLignes(nbLignes, result.combo);
        } else {
            flashGrimaceRobo();
        }
        verifierPlateauCritiqueRobo();

        if (result.tSpin) {
            const label = result.tSpin === 'full' ? 'T-SPIN !' : 'T-SPIN MINI !';
            annoncer(label);
            AudioMoteur.son(result.tSpin === 'full' ? 'tspin' : 'tspin_mini');
        }

        if (nbLignes > 0) {
            if (result.tetris) {
                if (bossEstActif() && !bossEstVaincu()) notifierTetrisBoss();
                annoncer('Tetris ! Quatre lignes effacees');
                if (result.backToBack) {
                    annoncer('Back-to-back Tetris');
                    AudioMoteur.son('b2b');
                }
            }

            if (result.combo >= 2) {
                annoncer(`Combo ${result.combo}`);
                AudioMoteur.son('combo');
            }

            if (result.points > 0) {
                annoncer(
                    `${nbLignes} ligne${nbLignes > 1 ? 's' : ''} effacee${nbLignes > 1 ? 's' : ''}, plus ${result.points} points`
                );
            }
        }

        evaluerDecisionOracle(nbLignes);
        _endommagerBossTSpinSansLigne(result, nbLignes);
        _traiterLevelUpSolo(result);
        rafraichirStats();

        if (etat.modeJeu === 'sprint' && etat.lignes >= CONFIG.sprintLignes) {
            etat.victoireSprint = true;
            setTimeout(() => obtenirActions().terminerPartie?.(true), 400);
        }
    });
}
