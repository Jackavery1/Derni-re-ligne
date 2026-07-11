/** Gestion du Service Worker en dev local (évite les fetch HTML interceptés). */

export function estHoteDevLocal() {
    if (typeof window === 'undefined') return false;
    const h = window.location.hostname;
    return h === 'localhost' || h === '127.0.0.1';
}

/** PWA active en prod ; en dev local uniquement avec ?pwa=1 */
export function swAutorise() {
    if (typeof window === 'undefined') return true;
    if (new URLSearchParams(window.location.search).has('pwa')) return true;
    return !estHoteDevLocal();
}

/** @returns {Promise<boolean>} true si un rechargement a été déclenché */
export async function libererSwEnDevLocal() {
    if (swAutorise() || !('serviceWorker' in navigator)) return false;

    const regs = await navigator.serviceWorker.getRegistrations();
    if (regs.length === 0 && !navigator.serviceWorker.controller) return false;

    await Promise.all(regs.map((reg) => reg.unregister()));

    const flag = 'dl_sw_dev_recharge';
    if (navigator.serviceWorker.controller && !sessionStorage.getItem(flag)) {
        sessionStorage.setItem(flag, '1');
        window.location.reload();
        return true;
    }
    sessionStorage.removeItem(flag);
    return false;
}
