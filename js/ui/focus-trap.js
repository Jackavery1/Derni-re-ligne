const SELECTEUR_FOCUSABLE =
    'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** @param {unknown} el */
function estFocusable(el) {
    return (
        !!el &&
        typeof el === 'object' &&
        'focus' in el &&
        typeof (/** @type {{ focus?: unknown }} */ (el).focus) === 'function'
    );
}

/** @param {ParentNode} conteneur */
export function collecterFocusables(conteneur) {
    return /** @type {HTMLElement[]} */ (
        [...conteneur.querySelectorAll(SELECTEUR_FOCUSABLE)].filter(
            (el) =>
                estFocusable(el) &&
                /** @type {{ offsetParent?: unknown }} */ (el).offsetParent !== null
        )
    );
}

/**
 * @param {HTMLElement} conteneur
 * @param {{ elements?: HTMLElement[], focusInitial?: HTMLElement | null, restaurerFocus?: boolean }} [options]
 * @returns {() => void}
 */
export function activerFocusTrap(conteneur, options = {}) {
    const focusables = options.elements ?? collecterFocusables(conteneur);
    if (focusables.length === 0) return () => {};

    const first = focusables[0];
    const precedent =
        options.restaurerFocus === false
            ? null
            : estFocusable(document.activeElement)
              ? document.activeElement
              : null;

    (options.focusInitial ?? first)?.focus();

    /** @param {KeyboardEvent} e */
    const surTab = (e) => {
        if (e.key !== 'Tab') return;
        const actif = document.activeElement;
        const index = focusables.indexOf(/** @type {HTMLElement} */ (actif));
        if (index < 0) return;
        e.preventDefault();
        const delta = e.shiftKey ? -1 : 1;
        focusables[(index + delta + focusables.length) % focusables.length]?.focus();
    };

    conteneur.addEventListener('keydown', surTab);
    return () => {
        conteneur.removeEventListener('keydown', surTab);
        if (
            precedent &&
            'isConnected' in precedent &&
            precedent.isConnected &&
            estFocusable(precedent)
        ) {
            /** @type {HTMLElement} */ (precedent).focus();
        }
    };
}
