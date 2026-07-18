import { ecouter } from '../etat/bus-jeu.js';
import { obtenirCtxReserve, obtenirCanvasReserve } from '../etat/store-jeu.js';
import {
    dessinerFileNext,
    dessinerPreview,
    afficherTexteFlottant,
    obtenirYHautTas,
    declencherSecousse,
    declencherFlashTopout,
} from './rendu-jeu.js';
import { notifierTetrisRobo } from './rendu-robo.js';

let effetsVisuelsInitialises = false;

export function initialiserEffetsVisuelsPartie() {
    if (effetsVisuelsInitialises) return;
    effetsVisuelsInitialises = true;

    ecouter('partie:topout', () => {
        declencherFlashTopout();
    });

    ecouter('partie:nouvelle-piece', () => {
        dessinerFileNext();
    });

    ecouter('partie:reserve-preview', ({ reserve }) => {
        dessinerPreview(obtenirCtxReserve(), obtenirCanvasReserve(), reserve);
    });

    ecouter('lignes:effacees', ({ nbSupprimees }) => {
        const intensitesSecousse = { 1: 2, 2: 3.5, 3: 5, 4: 8 };
        declencherSecousse(intensitesSecousse[nbSupprimees] ?? 8);
    });

    ecouter('score:maj', ({ nbLignes, result }) => {
        if (result.tSpin) {
            const label = result.tSpin === 'full' ? 'T-SPIN !' : 'T-SPIN MINI !';
            afficherTexteFlottant(label, '#b400ff', 14);
        }

        if (nbLignes > 0) {
            if (result.tetris) {
                notifierTetrisRobo();
                afficherTexteFlottant('TETRIS !', '#ffe600', 16);
                if (result.backToBack) {
                    afficherTexteFlottant('BACK-TO-BACK !', '#ff006e', 13);
                }
            } else {
                if (nbLignes === 3) afficherTexteFlottant('TRIPLE !', '#b400ff', 14);
                if (nbLignes === 2) afficherTexteFlottant('DOUBLE !', '#00f5ff', 12);
            }

            if (result.combo >= 2) {
                afficherTexteFlottant(`COMBO x${result.combo}`, '#00ff88', 11);
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
            }
        }
    });
}
