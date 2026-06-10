import { AudioMoteur } from './audio.js';
import { CONFIG } from './config.js';
import { store } from './store-core.js';
import { obtenirActions } from './actions-jeu.js';
import { ecouter } from './bus-jeu.js';
import { creerParticulesLigne } from './particules-jeu.js';
import { obtenirCtxReserve, obtenirCanvasReserve, etat } from './store-jeu.js';
import { ajouterLignesEclipseBasse, ajouterLignesVide } from './achievements-histoire.js';
import { obtenirLigneEclipse, biomeActuelMecanique } from './mecaniques-histoire.js';
import {
    dessinerFileNext,
    dessinerPreview,
    afficherTexteFlottant,
    obtenirYHautTas,
    declencherSecousse,
} from './rendu-jeu.js';
import {
    reagirRoboAuxLignes,
    flashGrimaceRobo,
    reagirRoboLevelUp,
    verifierPlateauCritiqueRobo,
    annoncer,
    rafraichirStats,
    afficherNotifNiveau,
} from './ecrans-ui.js';
import { evaluerDecisionOracle } from './oracle-jeu.js';
import { endommagerBoss, bossEstActif, bossEstVaincu } from './boss-jeu.js';
import { mettreAJourIndicateurRelique } from './piece-jeu.js';
import { enregistrerProgression } from './gestionnaire-difficulte.js';

let effetsInitialises = false;

export function initialiserEffetsPartie() {
    // Idempotence : une re-initialisation doublerait tous les ecouteurs du bus (sons, textes…).
    if (effetsInitialises) return;
    effetsInitialises = true;
    ecouter('piece:son', ({ type }) => AudioMoteur.son(type));

    ecouter('partie:stats', () => rafraichirStats());

    ecouter('partie:nouvelle-piece', () => {
        dessinerFileNext();
        mettreAJourIndicateurRelique();
    });

    ecouter('partie:reserve-preview', ({ reserve }) => {
        dessinerPreview(obtenirCtxReserve(), obtenirCanvasReserve(), reserve);
    });

    ecouter('lignes:effacees', ({ nbSupprimees, lignesEffacees }) => {
        if (bossEstActif() && !bossEstVaincu() && nbSupprimees > 0) {
            endommagerBoss(nbSupprimees);
        }
        // Condition Miroir (suivi tetris consecutifs CYBER) :
        // centralisee dans mecaniques-histoire.js via le bus — pas de duplication ici.
        for (const l of lignesEffacees) creerParticulesLigne(l);
        const intensitesSecousse = { 1: 2, 2: 3.5, 3: 5, 4: 8 };
        declencherSecousse(intensitesSecousse[nbSupprimees] ?? 8);
        if (store.histoire.actif && nbSupprimees > 0) {
            const mec = biomeActuelMecanique();
            if (mec === 'eclipse') {
                const lignesBasseCount = lignesEffacees.filter(
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
        if (store.histoire.actif && nbLignes > 0) {
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

        if (nbLignes > 0) {
            if (result.tetris) {
                afficherTexteFlottant('TETRIS !', '#ffe600', 16);
                annoncer('Tetris ! Quatre lignes effacees');
                if (result.backToBack) {
                    afficherTexteFlottant('BACK-TO-BACK !', '#ff006e', 13);
                    annoncer('Back-to-back Tetris');
                }
            } else {
                if (nbLignes === 3) afficherTexteFlottant('TRIPLE !', '#b400ff', 14);
                if (nbLignes === 2) afficherTexteFlottant('DOUBLE !', '#00f5ff', 12);
            }

            if (result.combo >= 2) {
                afficherTexteFlottant(`COMBO x${result.combo}`, '#00ff88', 11);
                annoncer(`Combo ${result.combo}`);
            }

            if (result.points > 0) {
                const estGros = nbLignes >= 4 || result.points >= 500;
                afficherTexteFlottant(
                    `+${result.points}`,
                    estGros ? null : '#ffe600',
                    estGros ? 12 : 10,
                    {
                        y: obtenirYHautTas() - 10,
                        arcEnCiel: estGros,
                    }
                );
                annoncer(
                    `${nbLignes} ligne${nbLignes > 1 ? 's' : ''} effacee${nbLignes > 1 ? 's' : ''}, plus ${result.points} points`
                );
            }
        }

        evaluerDecisionOracle(nbLignes);
        if (result.levelUp) {
            afficherNotifNiveau();
            reagirRoboLevelUp();
            AudioMoteur.son('niveau');
            AudioMoteur.relancerIntervalleMusique();
            annoncer(`Niveau ${etat.niveau} atteint`);
        }
        rafraichirStats();

        if (etat.modeJeu === 'sprint' && etat.lignes >= CONFIG.sprintLignes) {
            etat.victoireSprint = true;
            setTimeout(() => obtenirActions().terminerPartie?.(true), 400);
        }
    });
}
