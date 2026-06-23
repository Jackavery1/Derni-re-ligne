import { demarrerJeu } from './partie.js';
import { definirBiomeActif, etat } from './store-jeu.js';
import { sauvegarderBiomeActif } from './progression.js';
import { obtenirActions } from './actions-jeu.js';
import { activerModeHistoire } from './mode-histoire.js';
import { chargerHistoireTextes } from './charger-histoire-textes.js';
import { obtenirEtatHistoirePersiste, persisterEtatHistoire } from './histoire-etat.js';
import { store } from './store-core.js';
import { boucleSecondaireActive } from './planificateur-raf.js';
import { CONFIG } from './config.js';
import { AudioMoteur } from './audio.js';

export function initialiserNeoTestApi() {
    /** @type {(() => string | null) | null} */
    let obtenirSceneCutsceneActiveSync = null;
    void import('./histoire-cutscene-fonds.js').then((mod) => {
        obtenirSceneCutsceneActiveSync = mod.obtenirSceneCutsceneActive;
    });

    void import('./neo-test-api.js').then(({ exposerNeoTestApi, estNeoTestAutorise }) => {
        if (!estNeoTestAutorise()) return;
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
            simulerVictoireMondeHistoire: async (mondeId, lignes = 99, sansNarratif = false) => {
                activerModeHistoire();
                await chargerHistoireTextes();
                const { SEQUENCE_HISTOIRE } = await import('./histoire-donnees.js');
                const monde = SEQUENCE_HISTOIRE.find((m) => m.id === mondeId);
                if (!monde) return;
                store.histoire.mondeActuel = mondeId;
                const { chargerEtatHistoire } = await import('./progression.js');
                store.histoire.etat = chargerEtatHistoire();
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
                const { surFinDeMondeHistoire } = await import('./histoire-manager-completion.js');
                surFinDeMondeHistoire(lignes, 0, { sansNarratif });
            },
            obtenirTypeFinHistoire: async () => {
                activerModeHistoire();
                const { chargerEtatHistoire } = await import('./progression.js');
                const { obtenirTypeFin } = await import('./histoire-narratif.js');
                store.histoire.etat = chargerEtatHistoire();
                return obtenirTypeFin();
            },
            obtenirSceneCutsceneActive: () => obtenirSceneCutsceneActiveSync?.() ?? null,
            simulerTopVolontairePrologue: async () => {
                activerModeHistoire();
                store.histoire.mondeActuel = 'monde_prologue';
                etat.lignes = 0;
                const { onGameOverHistoire } = await import('./mecaniques-histoire.js');
                onGameOverHistoire(0, 'monde_prologue');
            },
            injecterConditionsTrameDistorsion: () => {
                activerModeHistoire();
                const etatHist = obtenirEtatHistoirePersiste();
                etatHist.conditionsTrame.miroirComplete = true;
                etatHist.conditionsTrame.tousJournauxTrouves = true;
                etatHist.conditionsTrame.tousBossSansContinue = true;
                etatHist.conditionsTrame.actionDistorsionFaite = true;
                const journauxRequis = [
                    'journal_1',
                    'journal_2',
                    'journal_3',
                    'journal_4',
                    'journal_5',
                    'journal_6',
                    'journal_7',
                    'journal_8',
                    'journal_9',
                ];
                for (const id of journauxRequis) {
                    if (!etatHist.journauxTrouves.includes(id)) {
                        etatHist.journauxTrouves.push(id);
                    }
                }
                if (!etatHist.mondesCachesDebloques.includes('monde_miroir')) {
                    etatHist.mondesCachesDebloques.push('monde_miroir');
                }
                if (!etatHist.mondesCachesDebloques.includes('monde_trame')) {
                    etatHist.mondesCachesDebloques.push('monde_trame');
                }
                persisterEtatHistoire(etatHist);
                store.histoire.etat = etatHist;
            },
        });
    });
}
