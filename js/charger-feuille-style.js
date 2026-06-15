/** @type {Set<string>} */
const charges = new Set();

/**
 * @param {string} href
 * @returns {Promise<void>}
 */
export function assurerFeuilleStyle(href) {
    if (charges.has(href)) return Promise.resolve();
    charges.add(href);
    if (
        typeof document === 'undefined' ||
        typeof document.createElement !== 'function' ||
        !document.head
    ) {
        return Promise.resolve();
    }
    if (document.querySelector(`link[rel="stylesheet"][href="${href}"]`)) {
        return Promise.resolve();
    }
    return new Promise((resolve, reject) => {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = href;
        link.onload = () => resolve();
        link.onerror = () => reject(new Error(`Impossible de charger ${href}`));
        document.head.appendChild(link);
    });
}
