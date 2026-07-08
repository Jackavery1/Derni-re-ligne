/** Profils safe-area iPhone pour simulation CI (audit C14). */

/** @typedef {{ safeTop: number, safeBottom: number, safeLeft: number, safeRight: number, label: string }} ProfilSafeAreaIphone */

/** @type {Record<string, ProfilSafeAreaIphone>} */
export const PROFILS_IPHONE_SAFE_AREA = {
    'iPhone 14': {
        label: 'iPhone 14 — Dynamic Island portrait',
        safeTop: 47,
        safeBottom: 34,
        safeLeft: 0,
        safeRight: 0,
    },
    'iPhone 15 Pro': {
        label: 'iPhone 15 Pro — Dynamic Island portrait (59px)',
        safeTop: 59,
        safeBottom: 34,
        safeLeft: 0,
        safeRight: 0,
    },
    'iPhone SE': {
        label: 'iPhone SE — barre de statut classique',
        safeTop: 20,
        safeBottom: 0,
        safeLeft: 0,
        safeRight: 0,
    },
    'iPhone 14 landscape': {
        label: 'iPhone 14 paysage — encoches latérales',
        safeTop: 0,
        safeBottom: 21,
        safeLeft: 47,
        safeRight: 47,
    },
};

/**
 * @param {import('@playwright/test').Page} page
 * @param {keyof typeof PROFILS_IPHONE_SAFE_AREA | ProfilSafeAreaIphone} [profil]
 */
export async function appliquerSafeAreaIphone(page, profil = 'iPhone 14') {
    const insets = typeof profil === 'string' ? PROFILS_IPHONE_SAFE_AREA[profil] : profil;
    if (!insets) {
        throw new Error(`Profil safe-area inconnu: ${String(profil)}`);
    }
    await page.evaluate((p) => {
        const root = document.documentElement;
        root.style.setProperty('--safe-top', `${p.safeTop}px`);
        root.style.setProperty('--safe-bottom', `${p.safeBottom}px`);
        root.style.setProperty('--safe-left', `${p.safeLeft}px`);
        root.style.setProperty('--safe-right', `${p.safeRight}px`);
    }, insets);
}

/** @deprecated Utiliser appliquerSafeAreaIphone — conservé pour les specs existantes. */
export async function appliquerEncocheSimulee(page) {
    await appliquerSafeAreaIphone(page, 'iPhone 14');
}
