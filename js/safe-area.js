/** Insets encoche iPhone / safe-area (via variables CSS --safe-*). */

/** @returns {{ top: number, right: number, bottom: number, left: number }} */
export function lireInsetsSafeArea() {
    if (typeof document === 'undefined') {
        return { top: 0, right: 0, bottom: 0, left: 0 };
    }
    const style = getComputedStyle(document.documentElement);
    const px = (/** @type {string} */ cle) => parseFloat(style.getPropertyValue(cle)) || 0;
    return {
        top: px('--safe-top'),
        right: px('--safe-right'),
        bottom: px('--safe-bottom'),
        left: px('--safe-left'),
    };
}
