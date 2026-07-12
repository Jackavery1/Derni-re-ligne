/** Utilitaires contraste WCAG pour les specs E2E (contexte navigateur). */

/** @param {import('@playwright/test').Page} page */
export async function mesurerContrasteCorps(page) {
    return page.evaluate(() => {
        function analyserRgb(couleur) {
            const m = couleur.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
            if (m) return [Number(m[1]), Number(m[2]), Number(m[3])];
            const court = couleur.match(/^#([0-9a-f]{3})$/i);
            if (court) {
                const [r, g, b] = court[1].split('');
                const etendu = r + r + g + g + b + b;
                const v = Number.parseInt(etendu, 16);
                return [(v >> 16) & 255, (v >> 8) & 255, v & 255];
            }
            const long = couleur.match(/^#([0-9a-f]{6})$/i);
            if (long) {
                const v = Number.parseInt(long[1], 16);
                return [(v >> 16) & 255, (v >> 8) & 255, v & 255];
            }
            return null;
        }
        function luminance([r, g, b]) {
            const [rs, gs, bs] = [r, g, b].map((c) => {
                const s = c / 255;
                return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
            });
            return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
        }
        function ratioDepuisCouleurs(couleurPremierPlan, couleurFond) {
            const fg = analyserRgb(couleurPremierPlan);
            const bg = analyserRgb(couleurFond);
            if (!fg || !bg) return 0;
            const l1 = luminance(fg);
            const l2 = luminance(bg);
            const lighter = Math.max(l1, l2);
            const darker = Math.min(l1, l2);
            return (lighter + 0.05) / (darker + 0.05);
        }
        return ratioDepuisCouleurs(
            getComputedStyle(document.body).color,
            getComputedStyle(document.body).backgroundColor
        );
    });
}

/** @param {import('@playwright/test').Page} page */
export async function mesurerContrasteTexteDiscret(page) {
    return page.evaluate(() => {
        function analyserRgb(couleur) {
            const m = couleur.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
            if (m) return [Number(m[1]), Number(m[2]), Number(m[3])];
            const court = couleur.match(/^#([0-9a-f]{3})$/i);
            if (court) {
                const [r, g, b] = court[1].split('');
                const etendu = r + r + g + g + b + b;
                const v = Number.parseInt(etendu, 16);
                return [(v >> 16) & 255, (v >> 8) & 255, v & 255];
            }
            const long = couleur.match(/^#([0-9a-f]{6})$/i);
            if (long) {
                const v = Number.parseInt(long[1], 16);
                return [(v >> 16) & 255, (v >> 8) & 255, v & 255];
            }
            return null;
        }
        function luminance([r, g, b]) {
            const [rs, gs, bs] = [r, g, b].map((c) => {
                const s = c / 255;
                return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
            });
            return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
        }
        function ratioDepuisCouleurs(couleurPremierPlan, couleurFond) {
            const fg = analyserRgb(couleurPremierPlan);
            const bg = analyserRgb(couleurFond);
            if (!fg || !bg) return 0;
            const l1 = luminance(fg);
            const l2 = luminance(bg);
            const lighter = Math.max(l1, l2);
            const darker = Math.min(l1, l2);
            return (lighter + 0.05) / (darker + 0.05);
        }
        const probe = document.createElement('span');
        probe.style.color = 'var(--texte-discret)';
        document.body.appendChild(probe);
        const fg = getComputedStyle(probe).color;
        document.body.removeChild(probe);
        const bg = getComputedStyle(document.body).backgroundColor;
        return ratioDepuisCouleurs(fg, bg);
    });
}
