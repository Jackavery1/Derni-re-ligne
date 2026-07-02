export {};

declare global {
    interface Window {
        __NEO_SILENT_NOTIFS__?: boolean;
        __NEO_SUPPRESS_MODE_INFOBULLE_AUTO__?: boolean;
        __NEO_TEST__?: {
            terminerPartie?: (victoire: boolean, options?: { immediat?: boolean }) => void;
            demarrerPartieLibre?: (biomeId?: string) => void;
            boucleMenuUnifieActive?: () => boolean;
            simulerVictoireSprint?: () => void;
            obtenirColonnePieceActive?: () => number | null;
            obtenirMusiqueActive?: () => string | null;
            declencherFinHistoire?: (finId: string) => Promise<void>;
            declencherPostMondeNarratif?: (mondeId: string) => Promise<void>;
            simulerVictoireMondeHistoire?: (mondeId: string, lignes?: number) => Promise<void>;
        };
    }
}
