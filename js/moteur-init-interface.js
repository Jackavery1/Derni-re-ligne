import { chargerStats } from './achievements.js';
import { rechargerCodex, initialiserCodexUI } from './codex.js';
import { initialiserInputArchi } from './archi-input.js';
import { initialiserInputCoop } from './coop-input.js';
import { planifierBoucle } from './boucle-jeu.js';
import {
    afficherEcran,
    appliquerThemeBiome,
    mettreAJourAffichageRecord,
    chargerProgression,
} from './ecrans-ui.js';
import { rafraichirEtatHistoire } from './histoire-manager.js';
import { initialiserInput } from './input-jeu.js';
import { adapterInterface, initialiserLayout } from './layout-jeu.js';
import { initialiserModeDeveloppeur } from './mode-developpeur.js';
import { initPiecesFond } from './menu-fond.js';
import { initialiserMenuRoboTitre } from './menu-robo-titre.js';
import { initialiserOptions } from './options-ui.js';
import { demarrerBoucleRobo } from './rendu-robo.js';
import { demarrerJeu } from './partie.js';
import { ECRANS, obtenirBiomeActif, definirBiomeActif } from './store-jeu.js';
import { sauvegarderBiomeActif } from './progression.js';
import { initialiserBoutons } from './ui-init.js';
import { initialiserUiObjectifs } from './ui-panneau-objectifs.js';
import { initialiserTutoriel } from './tutoriel.js';
import { obtenirActions } from './actions-jeu.js';
import { exposerNeoTestApi } from './neo-test-api.js';
import { activerModeHistoire } from './mode-histoire.js';
import { chargerHistoireTextes } from './charger-histoire-textes.js';
import { obtenirEtatHistoirePersiste } from './histoire-etat.js';
import { store } from './store-core.js';
import { boucleSecondaireActive } from './planificateur-raf.js';
import { CONFIG } from './config-jeu.js';
import { etat } from './store-jeu.js';
import { AudioMoteur } from './audio.js';

export function initialiserInterfaceMoteur() {
    chargerStats();
    rafraichirEtatHistoire();
    adapterInterface();
    initialiserLayout();
    chargerProgression();
    rechargerCodex();
    appliquerThemeBiome(obtenirBiomeActif());
    mettreAJourAffichageRecord();
    initPiecesFond();
    initialiserMenuRoboTitre();
    initialiserOptions();
    initialiserInput();
    initialiserInputCoop();
    initialiserInputArchi();
    initialiserBoutons();
    initialiserCodexUI();
    initialiserUiObjectifs();
    initialiserModeDeveloppeur();
    afficherEcran(ECRANS.TITRE);
    initialiserTutoriel();
    planifierBoucle();
    demarrerBoucleRobo();

    if (typeof window !== 'undefined') {
        document.body.dataset.neoTestReady = '1';
        exposerNeoTestApi({
            terminerPartie: (victoire, options) =>
                obtenirActions().terminerPartie?.(victoire, options),
            demarrerPartieLibre: (biomeId = 'classique') => {
                definirBiomeActif(biomeId);
                sauvegarderBiomeActif(biomeId);
                demarrerJeu();
            },
            boucleMenuUnifieActive: () => boucleSecondaireActive('menu-unifie'),
            simulerVictoireSprint: () => {
                etat.modeJeu = 'sprint';
                etat.lignes = CONFIG.sprintLignes;
                obtenirActions().terminerPartie?.(true, { immediat: true });
            },
            obtenirColonnePieceActive: () =>
                typeof etat.pieceActuelle?.x === 'number' ? etat.pieceActuelle.x : null,
            obtenirMusiqueActive: () => AudioMoteur.biomeMusique,
            declencherFinHistoire: async (finId) => {
                activerModeHistoire();
                await chargerHistoireTextes();
                const { declencherFin } = await import('./histoire-narratif.js');
                declencherFin(finId);
            },
            declencherPostMondeNarratif: async (mondeId) => {
                activerModeHistoire();
                await chargerHistoireTextes();
                const { declencherNarratifPostMonde } =
                    await import('./histoire-manager-post-monde.js');
                const { SEQUENCE_HISTOIRE } = await import('./histoire-donnees.js');
                const monde = SEQUENCE_HISTOIRE.find((m) => m.id === mondeId);
                if (!monde) return;
                const etatHist = obtenirEtatHistoirePersiste();
                store.histoire.etat = etatHist;
                declencherNarratifPostMonde(monde, etatHist, true, [true, false, false]);
            },
        });
    }
}
