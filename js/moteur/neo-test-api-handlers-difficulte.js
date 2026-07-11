import { activerModeHistoire } from '../etat/mode-histoire.js';
import { store } from '../etat/store-jeu.js';

export function creerHandlersDifficulte() {
    return {
        evaluerPalierDifficultePrologue: async () => {
            const { chargerDifficulteMondes, PALIERS_VITESSE_MS } =
                await import('../io/difficulte-mondes-chargement.js');
            await chargerDifficulteMondes();
            const {
                demarrerSuiviMonde,
                enregistrerProgression,
                enregistrerPosePiece,
                vitesseHistoireMs,
            } = await import('../logique/gestionnaire-difficulte.js');
            activerModeHistoire();
            demarrerSuiviMonde('monde_prologue');
            const debut = vitesseHistoireMs();
            enregistrerProgression({ nbLignes: 6, estTetris: false, combo: 1 });
            enregistrerPosePiece();
            return {
                debut,
                apres: vitesseHistoireMs(),
                palier1: PALIERS_VITESSE_MS[1],
                palier2: PALIERS_VITESSE_MS[2],
                palierCourant: store.histoire.difficulte?.palierCourant ?? null,
            };
        },
        evaluerPalierDifficulteMonde: async (mondeId, lignes = 5) => {
            const { chargerDifficulteMondes } =
                await import('../io/difficulte-mondes-chargement.js');
            await chargerDifficulteMondes();
            const {
                demarrerSuiviMonde,
                enregistrerProgression,
                enregistrerPosePiece,
                vitesseHistoireMs,
            } = await import('../logique/gestionnaire-difficulte.js');
            activerModeHistoire();
            demarrerSuiviMonde(mondeId);
            const palierInitial = store.histoire.difficulte?.palierCourant ?? null;
            const vitesseInit = vitesseHistoireMs();
            enregistrerProgression({ nbLignes: lignes, estTetris: false, combo: 1 });
            enregistrerPosePiece();
            return {
                mondeId,
                palierInitial,
                palierApres: store.histoire.difficulte?.palierCourant ?? null,
                vitesseInit,
                vitesseApres: vitesseHistoireMs(),
            };
        },
        evaluerRespirationDifficulteMonde: async (mondeId) => {
            const { chargerDifficulteMondes, DIFFICULTE_MONDES } =
                await import('../io/difficulte-mondes-chargement.js');
            await chargerDifficulteMondes();
            const { demarrerSuiviMonde, enregistrerProgression, enregistrerPosePiece } =
                await import('../logique/gestionnaire-difficulte.js');
            activerModeHistoire();
            demarrerSuiviMonde(mondeId);
            const profil = DIFFICULTE_MONDES[mondeId]?.profilVitesse ?? [];
            const objectif = DIFFICULTE_MONDES[mondeId]?.objectifLignes ?? 12;

            const palierActuel = () => store.histoire.difficulte?.palierCourant ?? null;

            const avancerJusquaFraction = (fractionCible) => {
                const d = store.histoire.difficulte;
                if (!d) return;
                const cibleLignes = Math.min(objectif - 1, Math.ceil(objectif * fractionCible));
                const delta = cibleLignes - d.lignesEffacees;
                if (delta > 0) {
                    enregistrerProgression({ nbLignes: delta, estTetris: false, combo: 1 });
                    enregistrerPosePiece();
                }
            };

            /** @type {(number | null)[]} */
            const paliers = [palierActuel()];
            for (let i = 1; i < profil.length; i++) {
                avancerJusquaFraction(Math.min(0.99, profil[i].a + 0.02));
                paliers.push(palierActuel());
            }

            const numeriques = paliers.filter((p) => typeof p === 'number');
            const min = numeriques.length ? Math.min(...numeriques) : null;
            const max = numeriques.length ? Math.max(...numeriques) : null;

            return {
                mondeId,
                paliers,
                amplitude: min != null && max != null ? max - min : 0,
                respiration: min != null && max != null && max - min >= 2 && paliers.length >= 3,
            };
        },
    };
}
