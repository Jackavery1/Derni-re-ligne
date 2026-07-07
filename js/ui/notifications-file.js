/**
 * File d’affichage sequentielle pour notifications DOM (achievements, codex, etc.).
 * @param {{ afficher: (item: any, terminer: () => void) => boolean | void }} config
 */
export function creerFileNotifications({ afficher }) {
    /** @type {unknown[]} */
    const file = [];
    let enCours = false;

    function afficherProchaine() {
        if (typeof document === 'undefined') return;
        if (enCours || file.length === 0) return;
        enCours = true;
        const item = file.shift();
        const terminer = () => {
            enCours = false;
            afficherProchaine();
        };
        if (/** @type {any} */ (globalThis).__NEO_SILENT_NOTIFS__) {
            terminer();
            return;
        }
        const ok = afficher(item, terminer);
        if (ok === false) enCours = false;
    }

    return {
        /** @param {unknown} item */
        ajouter(item) {
            file.push(item);
            afficherProchaine();
        },
        vider() {
            file.length = 0;
        },
    };
}
