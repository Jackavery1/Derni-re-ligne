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
        evaluerEquiteDemarragePrologue: async () => {
            const { CONFIG } = await import('../config/config-jeu.js');
            const { chargerDifficulteMondes, DIFFICULTE_MONDES, PALIERS_VITESSE_MS } =
                await import('../io/difficulte-mondes-chargement.js');
            const { COMPORTEMENTS_VIVANT } = await import('../logique/vivant-comportements.js');
            await chargerDifficulteMondes();

            const config = DIFFICULTE_MONDES.monde_prologue;
            const objectif = config?.objectifLignes ?? 10;
            const profil = config?.profilVitesse ?? [];
            const palierDebut = profil[0]?.palier ?? 1;
            const seuilMontee = profil.find((_, i) => i > 0)?.a ?? 0.55;
            const lignesAvantMontee = Math.ceil(objectif * seuilMontee);
            const vitessePalier1Ms = PALIERS_VITESSE_MS[palierDebut] ?? PALIERS_VITESSE_MS[1];
            const piecesMinimumTopOut = Math.ceil(CONFIG.lignes / 2);
            const chuteMoyenneLignes = CONFIG.lignes / 2;
            const tempsParPieceMs = chuteMoyenneLignes * vitessePalier1Ms + CONFIG.lockDelay;
            const tempsTopOutPassifEstimeMs = piecesMinimumTopOut * tempsParPieceMs;
            const seuilMortPrecoceMs = 30000;
            const vivantPrologue = COMPORTEMENTS_VIVANT.prologue ?? null;
            const framesAvantPremierPicDifficulte = Math.floor(
                ((lignesAvantMontee * tempsParPieceMs) / 1000) * 60
            );

            return {
                spawnGraceMs: CONFIG.spawnGraceMs,
                vitessePalier1Ms,
                lignesAvantMonteePalier2: lignesAvantMontee,
                tempsTopOutPassifEstimeMs,
                framesAvantPremierPicDifficulte,
                vivantActif: vivantPrologue != null,
                surviePassiveAuMoins30s: tempsTopOutPassifEstimeMs >= seuilMortPrecoceMs,
                equiteDemarrage:
                    tempsTopOutPassifEstimeMs >= seuilMortPrecoceMs &&
                    CONFIG.spawnGraceMs >= (24 * 1000) / 60 &&
                    vivantPrologue == null &&
                    framesAvantPremierPicDifficulte >= 120,
            };
        },
    };
}
