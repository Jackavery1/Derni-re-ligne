export {};

declare global {
    interface Window {
        __NEO_SILENT_NOTIFS__?: boolean;
        __NEO_TEST__?: {
            terminerPartie?: (victoire: boolean, options?: { immediat?: boolean }) => void;
            demarrerPartieLibre?: (biomeId?: string) => void;
            boucleMenuUnifieActive?: () => boolean;
            simulerVictoireSprint?: () => void;
        };
    }
}
