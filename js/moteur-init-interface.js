import { chargerStats } from './achievements.js';
import { planifierBoucle } from './boucle-jeu.js';
import {
    afficherEcran,
    appliquerThemeBiome,
    mettreAJourAffichageRecord,
    chargerProgression,
} from './ecrans-ui.js';
import { initialiserInput } from './input-jeu.js';
import { adapterInterface, initialiserLayout } from './layout-jeu.js';
import { initPiecesFond } from './menu-fond.js';
import { demarrerBoucleRobo } from './rendu-robo.js';
import { demarrerJeu } from './partie.js';
import { ECRANS, obtenirBiomeActif, definirBiomeActif } from './store-jeu.js';
import { sauvegarderBiomeActif } from './progression.js';
import { initialiserBoutons } from './ui-init.js';
import { obtenirActions } from './actions-jeu.js';
import { activerModeHistoire } from './mode-histoire.js';
import { chargerHistoireTextes } from './charger-histoire-textes.js';
import { obtenirEtatHistoirePersiste } from './histoire-etat.js';
import { store } from './store-core.js';
import { boucleSecondaireActive } from './planificateur-raf.js';
import { CONFIG } from './config.js';
import { etat } from './store-jeu.js';
import { AudioMoteur } from './audio.js';

function initialiserModulesDifferees() {
    void import('./histoire-manager.js').then(({ rafraichirEtatHistoire }) =>
        rafraichirEtatHistoire()
    );
    void import('./ui-panneau-objectifs.js').then(({ initialiserUiObjectifs }) =>
        initialiserUiObjectifs()
    );
    void import('./mode-developpeur.js').then(({ initialiserModeDeveloppeur }) =>
        initialiserModeDeveloppeur()
    );
    void import('./tutoriel.js').then(({ initialiserTutoriel }) => initialiserTutoriel());
}

export function initialiserInterfaceMoteur() {
    chargerStats();
    adapterInterface();
    initialiserLayout();
    chargerProgression();
    appliquerThemeBiome(obtenirBiomeActif());
    mettreAJourAffichageRecord();
    initPiecesFond();
    void import('./menu-robo-titre.js').then(({ initialiserMenuRoboTitre }) =>
        initialiserMenuRoboTitre()
    );
    initialiserInput();
    initialiserBoutons();
    initialiserModulesDifferees();
    afficherEcran(ECRANS.TITRE);
    planifierBoucle();
    demarrerBoucleRobo();

    if (typeof window !== 'undefined') {
        document.body.dataset.neoTestReady = '1';
        void import('./neo-test-api.js').then(({ exposerNeoTestApi }) =>
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
                    const { rafraichirEtatHistoire } = await import('./histoire-mondes.js');
                    const monde = SEQUENCE_HISTOIRE.find((m) => m.id === mondeId);
                    if (!monde) return;
                    const etatHist = rafraichirEtatHistoire();
                    declencherNarratifPostMonde(monde, etatHist, true, [true, false, false]);
                },
                simulerVictoireMondeHistoire: async (mondeId, lignes = 99) => {
                    activerModeHistoire();
                    await chargerHistoireTextes();
                    const { SEQUENCE_HISTOIRE } = await import('./histoire-donnees.js');
                    const monde = SEQUENCE_HISTOIRE.find((m) => m.id === mondeId);
                    if (!monde) return;
                    store.histoire.mondeActuel = mondeId;
                    store.histoire.etat = obtenirEtatHistoirePersiste();
                    document.body.classList.add('histoire-active');
                    if (monde.estBoss) {
                        store.histoire.boss.actif = true;
                        store.histoire.boss.vaincu = true;
                    }
                    if (monde.biomeId === 'cyber') {
                        store.histoire.mecaniques.cyberTetrisConsecutifs = Math.max(
                            3,
                            store.histoire.mecaniques.cyberTetrisConsecutifs ?? 0
                        );
                    }
                    const { surFinDeMondeHistoire } =
                        await import('./histoire-manager-completion.js');
                    surFinDeMondeHistoire(lignes, 0);
                },
                obtenirTypeFinHistoire: async () => {
                    activerModeHistoire();
                    const { obtenirTypeFin } = await import('./histoire-narratif.js');
                    return obtenirTypeFin();
                },
            })
        );
    }
}
