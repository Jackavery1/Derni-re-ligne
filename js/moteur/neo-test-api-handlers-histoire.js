import { activerModeHistoire } from '../etat/mode-histoire.js';
import { chargerHistoireTextes } from '../io/charger-histoire-textes.js';
import { obtenirEtatHistoirePersiste, persisterEtatHistoire } from '../histoire/histoire-etat.js';
import { store, etat } from '../etat/store-jeu.js';
import { emettre } from '../etat/bus-jeu.js';
import { menuAnimActif } from '../rendu/menu-fond.js';
import { obtenirActions } from '../logique/actions-jeu.js';

/**
 * @param {Awaited<ReturnType<import('./neo-test-api-deps-sync.js').chargerDepsCutsceneSync>>} depsSync
 */
export function creerHandlersHistoire(depsSync) {
    return {
        demarrerMondeHistoire: async (mondeId) => {
            activerModeHistoire();
            await chargerHistoireTextes();
            const { chargerDifficulteMondes } =
                await import('../io/difficulte-mondes-chargement.js');
            await chargerDifficulteMondes();
            const { demarrerMondeHistoire } = await import('../histoire/histoire-session.js');
            demarrerMondeHistoire(mondeId);
        },
        declencherFinHistoire: async (finId) => {
            activerModeHistoire();
            await chargerHistoireTextes();
            const { declencherFin } = await import('../histoire/histoire-narratif.js');
            declencherFin(finId);
        },
        declencherPostMondeNarratif: async (mondeId) => {
            activerModeHistoire();
            await chargerHistoireTextes();
            const { declencherNarratifPostMonde } =
                await import('../histoire/histoire-manager-post-monde.js');
            const { SEQUENCE_HISTOIRE } = await import('../histoire-donnees.js');
            const { rafraichirEtatHistoire } = await import('../histoire/histoire-mondes.js');
            const { assurerFragmentsPartie } = await import('../ui/charger-ecrans.js');
            const monde = SEQUENCE_HISTOIRE.find((m) => m.id === mondeId);
            if (!monde) return;
            await assurerFragmentsPartie();
            const etatHist = rafraichirEtatHistoire();
            const premiereCompletion = !etatHist.mondesCompletes?.includes(mondeId);
            declencherNarratifPostMonde(monde, etatHist, premiereCompletion, [
                premiereCompletion,
                false,
                false,
            ]);
        },
        simulerVictoireMondeHistoire: async (mondeId, lignes = 99, sansNarratif = false) => {
            activerModeHistoire();
            await chargerHistoireTextes();
            const { SEQUENCE_HISTOIRE } = await import('../histoire-donnees.js');
            const monde = SEQUENCE_HISTOIRE.find((m) => m.id === mondeId);
            if (!monde) return;
            store.histoire.mondeActuel = mondeId;
            const { chargerEtatHistoire } = await import('../io/progression.js');
            store.histoire.etat = chargerEtatHistoire();
            document.body.classList.add('histoire-active');
            const { assurerFragmentsPartie } = await import('../ui/charger-ecrans.js');
            await assurerFragmentsPartie();
            if (monde.estBoss && monde.bossId) {
                const { BOSS } = await import('../histoire-donnees.js');
                const boss = BOSS[monde.bossId];
                if (boss) {
                    store.histoire.boss.actif = boss;
                    store.histoire.boss.pv = 0;
                }
                store.histoire.boss.vaincu = true;
            }
            if (monde.biomeId === 'cyber') {
                store.histoire.mecaniques.cyberTetrisConsecutifs = Math.max(
                    3,
                    store.histoire.mecaniques.cyberTetrisConsecutifs ?? 0
                );
            }
            const { surFinDeMondeHistoire } =
                await import('../histoire/histoire-manager-completion.js');
            surFinDeMondeHistoire(lignes, 0, { sansNarratif });
        },
        simulerVictoireObjectifHistoire: async (mondeId, options = {}) => {
            const { immediat = true } = options;
            activerModeHistoire();
            await chargerHistoireTextes();
            const { SEQUENCE_HISTOIRE } = await import('../histoire-donnees.js');
            const monde = SEQUENCE_HISTOIRE.find((m) => m.id === mondeId);
            if (!monde || monde.estBoss) return;
            store.histoire.mondeActuel = mondeId;
            const { chargerEtatHistoire } = await import('../io/progression.js');
            store.histoire.etat = chargerEtatHistoire();
            document.body.classList.add('histoire-active');
            etat.estEnCours = true;
            etat.modeJeu = 'marathon';
            const { demarrerSuiviMonde } = await import('../logique/gestionnaire-difficulte.js');
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
            const { chargerEtatHistoire } = await import('../io/progression.js');
            const { obtenirTypeFin } = await import('../histoire/histoire-narratif.js');
            store.histoire.etat = chargerEtatHistoire();
            return obtenirTypeFin();
        },
        obtenirSceneCutsceneActive: depsSync.obtenirSceneCutsceneActive,
        typewriterEstActif: depsSync.typewriterEstActif,
        obtenirHumeurPortraitCutscene: depsSync.obtenirHumeurPortraitCutscene,
        simulerTopVolontairePrologue: async () => {
            activerModeHistoire();
            store.histoire.mondeActuel = 'monde_prologue';
            etat.lignes = 0;
            const { onGameOverHistoire } = await import('../histoire/mecaniques-histoire.js');
            onGameOverHistoire(0, 'monde_prologue');
        },
        emettreEvenementBusJeu: (evenement, payload) => emettre(evenement, payload),
        menuAnimActif: () => menuAnimActif,
        simulerGameOverBossDistorsion: async () => {
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
            const { assurerFragmentsPartie } = await import('../ui/charger-ecrans.js');
            await assurerFragmentsPartie();
            obtenirActions().terminerPartie?.(false, { immediat: true });
        },
    };
}
