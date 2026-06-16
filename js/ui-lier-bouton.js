const MARQUEUR = 'data-neo-btn-lie';

/**
 * Attache un handler click une seule fois (safe apres lazy-load de fragments HTML).
 * @param {string} id
 * @param {EventListener} handler
 */
export function lierBouton(id, handler) {
    const el = document.getElementById(id);
    if (!el || el.hasAttribute(MARQUEUR) || typeof el.addEventListener !== 'function') return;
    el.setAttribute(MARQUEUR, '1');
    el.addEventListener('click', handler);
}

/**
 * @param {Element} el
 * @param {EventListener} handler
 */
export function lierBoutonElement(el, handler) {
    if (!(el instanceof HTMLElement)) return;
    if (el.hasAttribute(MARQUEUR) || typeof el.addEventListener !== 'function') return;
    el.setAttribute(MARQUEUR, '1');
    el.addEventListener('click', handler);
}

/**
 * @param {string} selecteur
 * @param {(el: HTMLElement) => void} pourChaque
 */
export function lierBoutonsSelecteur(selecteur, pourChaque) {
    document.querySelectorAll(selecteur).forEach((el) => {
        if (!(el instanceof HTMLElement)) return;
        lierBoutonElement(el, () => pourChaque(el));
    });
}
