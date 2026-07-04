import { demarrerJeu } from './partie.js';
import { definirBiomeActif, etat } from './store-jeu.js';
import { sauvegarderBiomeActif } from './progression.js';
import { obtenirActions } from './actions-jeu.js';
import { activerModeHistoire } from './mode-histoire.js';
import { chargerHistoireTextes } from './charger-histoire-textes.js';
import { obtenirEtatHistoirePersiste, persisterEtatHistoire } from './histoire-etat.js';
import { store } from './store-jeu.js';
import { boucleSecondaireActive } from './planificateur-raf.js';
import { emettre } from './bus-jeu.js';
import { menuAnimActif } from './menu-fond.js';
import { CONFIG } from './config.js';
import { AudioMoteur } from './audio.js';

export function initialiserNeoTestApi() {
    /** @type {(() => string | null) | null} */
    let obtenirSceneCutsceneActiveSync = null;
    /** @type {(() => string) | null} */
    let obtenirHumeurRoboCutsceneSync = null;
    /** @type {((personnageId: string) => string | null) | null} */
    let obtenirHumeurPortraitCutsceneEtatSync = null;
    /** @type {((personnageId: string) => string | null) | null} */
    let obtenirDerniereHumeurParleeSync = null;
    /** @type {(() => boolean) | null} */
    let typewriterEstActifSync = null;
    const depsTestApi = Promise.all([
        import('./histoire-cutscene-fonds.js').then((mod) => {
            obtenirSceneCutsceneActiveSync = mod.obtenirSceneCutsceneActive;
        }),
        import('./portraits-cutscene-etat.js').then((mod) => {
            obtenirHumeurRoboCutsceneSync = mod.obtenirHumeurRoboCutscene;
            obtenirHumeurPortraitCutsceneEtatSync = mod.obtenirHumeurPortraitCutsceneEtat;
        }),
        import('./expressions-cutscene.js').then((mod) => {
            obtenirDerniereHumeurParleeSync = mod.obtenirDerniereHumeurParleePortrait;
        }),
        import('./histoire-cutscene-typewriter.js').then((mod) => {
            typewriterEstActifSync = mod.typewriterEstActif;
        }),
    ]);

    void import('./neo-test-api.js').then(async ({ exposerNeoTestApi, estNeoTestAutorise }) => {
        if (!estNeoTestAutorise()) return;
        await depsTestApi;
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
            simulerVictoireObjectifHistoire: async (mondeId, options = {}) => {
                const { immediat = true } = options;
                activerModeHistoire();
                await chargerHistoireTextes();
                const { SEQUENCE_HISTOIRE } = await import('./histoire-donnees.js');
                const monde = SEQUENCE_HISTOIRE.find((m) => m.id === mondeId);
                if (!monde || monde.estBoss) return;
                store.histoire.mondeActuel = mondeId;
                const { chargerEtatHistoire } = await import('./progression.js');
                store.histoire.etat = chargerEtatHistoire();
                document.body.classList.add('histoire-active');
                etat.estEnCours = true;
                etat.modeJeu = 'marathon';
                const { demarrerSuiviMonde } = await import('./gestionnaire-difficulte.js');
                demarrerSuiviMonde(mondeId);
                const d = store.histoire.difficulte;
                if (!d?.actif) return;
                d.lignesEffacees = d.lignesObjectif;
                d.victoireDeclenchee = true;
                emettre('monde:objectif-atteint', { mondeId });
                obtenirActions().terminerPartie?.(true, { immediat });
            },
            obtenirTypeFinHistoire: async () => {
                activerModeHistoire();
                const { chargerEtatHistoire } = await import('./progression.js');
                const { obtenirTypeFin } = await import('./histoire-narratif.js');
                store.histoire.etat = chargerEtatHistoire();
                return obtenirTypeFin();
            },
            obtenirSceneCutsceneActive: () => obtenirSceneCutsceneActiveSync?.() ?? null,
            typewriterEstActif: () => typewriterEstActifSync?.() ?? false,
            obtenirHumeurPortraitCutscene: (personnageId = 'robo') => {
                const depuisLigne = obtenirDerniereHumeurParleeSync?.(personnageId);
                if (depuisLigne) return depuisLigne;
                const depuisEtat = obtenirHumeurPortraitCutsceneEtatSync?.(personnageId);
                if (depuisEtat) return depuisEtat;
                if (!personnageId || personnageId === 'robo') {
                    return obtenirHumeurRoboCutsceneSync?.() ?? null;
                }
                return null;
            },
            simulerTopVolontairePrologue: async () => {
                activerModeHistoire();
                store.histoire.mondeActuel = 'monde_prologue';
                etat.lignes = 0;
                const { onGameOverHistoire } = await import('./mecaniques-histoire.js');
                onGameOverHistoire(0, 'monde_prologue');
            },
            emettreEvenementBusJeu: (evenement, payload) => emettre(evenement, payload),
            menuAnimActif: () => menuAnimActif,
            simulerGameOverBossDistorsion: () => {
                activerModeHistoire();
                store.histoire.mondeActuel = 'monde_finale';
                store.histoire.boss.actif = {
                    id: 'distorsion',
                    nom: 'LA DISTORSION',
                    couleur: '#ff2d78',
                    pvMax: 100,
                };
                store.histoire.boss.vaincu = false;
                document.body.classList.add('histoire-active');
                document.body.classList.add('partie-active');
                const etatHist = obtenirEtatHistoirePersiste();
                etatHist.continueGratuitDistorsionUtilise = false;
                delete etatHist.continuesParBoss?.monde_finale;
                etatHist.conditionsTrame.tousBossSansContinue = true;
                persisterEtatHistoire(etatHist);
                store.histoire.etat = etatHist;
                obtenirActions().terminerPartie?.(false, { immediat: true });
            },
            terminerPartieCoop: async () => {
                const { terminerCooperatif } = await import('./coop-jeu.js');
                terminerCooperatif('j1');
            },
            basculerPauseCoop: async () => {
                const { assurerInputCoop } = await import('./modes-input-lazy.js');
                await assurerInputCoop();
                const { basculerPauseCoop } = await import('./coop-jeu.js');
                basculerPauseCoop();
            },
        });
    });
}
