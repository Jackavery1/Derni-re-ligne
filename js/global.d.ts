export {};

declare global {
    /** Injecte par esbuild prod (`define: { __NEO_PROD__: 'true' }`). */
    var __NEO_PROD__: boolean | undefined;
    interface Window {
        __NEO_SILENT_NOTIFS__?: boolean;
        __NEO_SUPPRESS_MODE_INFOBULLE_AUTO__?: boolean;
        __NEO_VIBRATE_LOG__?: unknown[];
        __NEO_TEST__?: {
            terminerPartie?: (victoire: boolean, options?: { immediat?: boolean }) => void;
            demarrerPartieLibre?: (biomeId?: string) => void;
            boucleMenuUnifieActive?: () => boolean;
            simulerVictoireSprint?: () => void;
            obtenirColonnePieceActive?: () => number | null;
            obtenirMusiqueActive?: () => string | null;
            declencherFinHistoire?: (finId: string) => Promise<void>;
            declencherPostMondeNarratif?: (mondeId: string) => Promise<void>;
            simulerVictoireMondeHistoire?: (
                mondeId: string,
                lignes?: number,
                sansNarratif?: boolean
            ) => Promise<void>;
            simulerVictoireObjectifHistoire?: (
                mondeId: string,
                options?: { immediat?: boolean }
            ) => Promise<void>;
            obtenirTypeFinHistoire?: () => Promise<string>;
            obtenirSceneCutsceneActive?: () => string | null;
            typewriterEstActif?: () => boolean;
            obtenirHumeurPortraitCutscene?: (personnageId?: string) => string | null;
            simulerTopVolontairePrologue?: () => Promise<void>;
            emettreEvenementBusJeu?: (evenement: string, payload?: unknown) => void;
            menuAnimActif?: () => boolean;
            simulerGameOverBossDistorsion?: () => void | Promise<void>;
            terminerPartieCoop?: () => Promise<void>;
            basculerPauseCoop?: () => Promise<void>;
            obtenirGameFeel?: () => {
                areRestant: number;
                coyoteRestant: number;
                spawnGraceRestant: number;
                inputBuffer: string[];
            };
            bufferiserInputTest?: (
                action:
                    | 'tourner_cw'
                    | 'tourner_ccw'
                    | 'hold'
                    | 'gauche'
                    | 'droite'
                    | 'bas'
                    | 'chute'
            ) => void;
            tickGameFeel?: (deltaMs: number) => void;
            forcerAreTest?: () => void;
            pieceControlesActifsTest?: () => boolean;
            areActiveTest?: () => boolean;
            coyoteActifTest?: () => boolean;
            graceSpawnActiveTest?: () => boolean;
            activerPieceAuSolTest?: () => void;
            quitterSolPieceTest?: () => void;
            obtenirJournalSfxTest?: () => string[];
            viderJournalSfxTest?: () => void;
            evaluerPalierDifficultePrologue?: () => Promise<{
                debut: number;
                apres: number;
                palier1: number;
                palier2: number;
                palierCourant: number | null;
            }>;
        };
    }
}
