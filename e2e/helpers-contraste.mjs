/** Utilitaires contraste WCAG pour les specs E2E (contexte navigateur). */

/** @param {import('@playwright/test').Page} page @param {string} selecteur */
export async function mesurerContrasteSelecteur(page, selecteur) {
    return page.evaluate((sel) => {
        /** @param {string} couleur */
        function analyserCouleur(couleur) {
            const rgba = couleur.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
            if (rgba) {
                return {
                    rgb: [Number(rgba[1]), Number(rgba[2]), Number(rgba[3])],
                    alpha: rgba[4] != null ? Number(rgba[4]) : 1,
                };
            }
            const court = couleur.match(/^#([0-9a-f]{3})$/i);
            if (court) {
                const [r, g, b] = court[1].split('');
                const etendu = r + r + g + g + b + b;
                const v = Number.parseInt(etendu, 16);
                return { rgb: [(v >> 16) & 255, (v >> 8) & 255, v & 255], alpha: 1 };
            }
            const long = couleur.match(/^#([0-9a-f]{6})$/i);
            if (long) {
                const v = Number.parseInt(long[1], 16);
                return { rgb: [(v >> 16) & 255, (v >> 8) & 255, v & 255], alpha: 1 };
            }
            return null;
        }
        /** @param {number[]} fg @param {number} alpha @param {number[]} bg */
        function melangerRgb(fg, alpha, bg) {
            return fg.map((c, i) => Math.round(c * alpha + bg[i] * (1 - alpha)));
        }
        /** @param {number[]} rgb */
        function luminance(rgb) {
            const [rs, gs, bs] = rgb.map((c) => {
                const s = c / 255;
                return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
            });
            return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
        }
        /** @param {string} couleurPremierPlan @param {string} couleurFond */
        function ratioDepuisCouleurs(couleurPremierPlan, couleurFond) {
            const fg = analyserCouleur(couleurPremierPlan);
            const bg = analyserCouleur(couleurFond);
            if (!fg || !bg) return 0;
            const rgbEffectif = melangerRgb(fg.rgb, fg.alpha, bg.rgb);
            const l1 = luminance(rgbEffectif);
            const l2 = luminance(bg.rgb);
            const lighter = Math.max(l1, l2);
            const darker = Math.min(l1, l2);
            return (lighter + 0.05) / (darker + 0.05);
        }
        const el = document.querySelector(sel);
        if (!el) return 0;
        const style = getComputedStyle(el);
        const bg =
            style.backgroundColor !== 'rgba(0, 0, 0, 0)' && style.backgroundColor !== 'transparent'
                ? style.backgroundColor
                : getComputedStyle(document.body).backgroundColor;
        return ratioDepuisCouleurs(style.color, bg);
    }, selecteur);
}

/** @param {import('@playwright/test').Page} page */
export async function mesurerContrasteCorps(page) {
    return page.evaluate(() => {
        /** @param {string} couleur */
        function analyserCouleur(couleur) {
            const rgba = couleur.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
            if (rgba) {
                return {
                    rgb: [Number(rgba[1]), Number(rgba[2]), Number(rgba[3])],
                    alpha: rgba[4] != null ? Number(rgba[4]) : 1,
                };
            }
            const court = couleur.match(/^#([0-9a-f]{3})$/i);
            if (court) {
                const [r, g, b] = court[1].split('');
                const etendu = r + r + g + g + b + b;
                const v = Number.parseInt(etendu, 16);
                return { rgb: [(v >> 16) & 255, (v >> 8) & 255, v & 255], alpha: 1 };
            }
            const long = couleur.match(/^#([0-9a-f]{6})$/i);
            if (long) {
                const v = Number.parseInt(long[1], 16);
                return { rgb: [(v >> 16) & 255, (v >> 8) & 255, v & 255], alpha: 1 };
            }
            return null;
        }
        /** @param {number[]} fg @param {number} alpha @param {number[]} bg */
        function melangerRgb(fg, alpha, bg) {
            return fg.map((c, i) => Math.round(c * alpha + bg[i] * (1 - alpha)));
        }
        /** @param {number[]} rgb */
        function luminance(rgb) {
            const [rs, gs, bs] = rgb.map((c) => {
                const s = c / 255;
                return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
            });
            return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
        }
        /** @param {string} couleurPremierPlan @param {string} couleurFond */
        function ratioDepuisCouleurs(couleurPremierPlan, couleurFond) {
            const fg = analyserCouleur(couleurPremierPlan);
            const bg = analyserCouleur(couleurFond);
            if (!fg || !bg) return 0;
            const rgbEffectif = melangerRgb(fg.rgb, fg.alpha, bg.rgb);
            const l1 = luminance(rgbEffectif);
            const l2 = luminance(bg.rgb);
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
        /** @param {string} couleur */
        function analyserCouleur(couleur) {
            const rgba = couleur.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
            if (rgba) {
                return {
                    rgb: [Number(rgba[1]), Number(rgba[2]), Number(rgba[3])],
                    alpha: rgba[4] != null ? Number(rgba[4]) : 1,
                };
            }
            const court = couleur.match(/^#([0-9a-f]{3})$/i);
            if (court) {
                const [r, g, b] = court[1].split('');
                const etendu = r + r + g + g + b + b;
                const v = Number.parseInt(etendu, 16);
                return { rgb: [(v >> 16) & 255, (v >> 8) & 255, v & 255], alpha: 1 };
            }
            const long = couleur.match(/^#([0-9a-f]{6})$/i);
            if (long) {
                const v = Number.parseInt(long[1], 16);
                return { rgb: [(v >> 16) & 255, (v >> 8) & 255, v & 255], alpha: 1 };
            }
            return null;
        }
        /** @param {number[]} fg @param {number} alpha @param {number[]} bg */
        function melangerRgb(fg, alpha, bg) {
            return fg.map((c, i) => Math.round(c * alpha + bg[i] * (1 - alpha)));
        }
        /** @param {number[]} rgb */
        function luminance(rgb) {
            const [rs, gs, bs] = rgb.map((c) => {
                const s = c / 255;
                return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
            });
            return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
        }
        /** @param {string} couleurPremierPlan @param {string} couleurFond */
        function ratioDepuisCouleurs(couleurPremierPlan, couleurFond) {
            const fg = analyserCouleur(couleurPremierPlan);
            const bg = analyserCouleur(couleurFond);
            if (!fg || !bg) return 0;
            const rgbEffectif = melangerRgb(fg.rgb, fg.alpha, bg.rgb);
            const l1 = luminance(rgbEffectif);
            const l2 = luminance(bg.rgb);
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

/**
 * Ratio contraste d'une variable CSS de couleur vs fond body.
 * @param {import('@playwright/test').Page} page
 * @param {string} nomVariable ex. '--gris-texte-dim'
 */
export async function mesurerContrasteVariable(page, nomVariable) {
    return page.evaluate((nom) => {
        /** @param {string} couleur */
        function analyserCouleur(couleur) {
            const rgba = couleur.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
            if (rgba) {
                return {
                    rgb: [Number(rgba[1]), Number(rgba[2]), Number(rgba[3])],
                    alpha: rgba[4] != null ? Number(rgba[4]) : 1,
                };
            }
            const court = couleur.match(/^#([0-9a-f]{3})$/i);
            if (court) {
                const [r, g, b] = court[1].split('');
                const etendu = r + r + g + g + b + b;
                const v = Number.parseInt(etendu, 16);
                return { rgb: [(v >> 16) & 255, (v >> 8) & 255, v & 255], alpha: 1 };
            }
            const long = couleur.match(/^#([0-9a-f]{6})$/i);
            if (long) {
                const v = Number.parseInt(long[1], 16);
                return { rgb: [(v >> 16) & 255, (v >> 8) & 255, v & 255], alpha: 1 };
            }
            return null;
        }
        /** @param {number[]} fg @param {number} alpha @param {number[]} bg */
        function melangerRgb(fg, alpha, bg) {
            return fg.map((c, i) => Math.round(c * alpha + bg[i] * (1 - alpha)));
        }
        /** @param {number[]} rgb */
        function luminance(rgb) {
            const [rs, gs, bs] = rgb.map((c) => {
                const s = c / 255;
                return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
            });
            return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
        }
        /** @param {string} couleurPremierPlan @param {string} couleurFond */
        function ratioDepuisCouleurs(couleurPremierPlan, couleurFond) {
            const fg = analyserCouleur(couleurPremierPlan);
            const bg = analyserCouleur(couleurFond);
            if (!fg || !bg) return 0;
            const rgbEffectif = melangerRgb(fg.rgb, fg.alpha, bg.rgb);
            const l1 = luminance(rgbEffectif);
            const l2 = luminance(bg.rgb);
            const lighter = Math.max(l1, l2);
            const darker = Math.min(l1, l2);
            return (lighter + 0.05) / (darker + 0.05);
        }
        const probe = document.createElement('span');
        probe.style.color = `var(${nom})`;
        document.body.appendChild(probe);
        const fg = getComputedStyle(probe).color;
        document.body.removeChild(probe);
        const bg = getComputedStyle(document.body).backgroundColor;
        return ratioDepuisCouleurs(fg, bg);
    }, nomVariable);
}

/**
 * Ratios contraste de sondes classe/id (styles globaux vs fond body).
 * @param {import('@playwright/test').Page} page
 * @returns {Promise<{ palier: number, vide: number, finHint: number, videTitre: number, cutsceneProgress: number, passer: number, achNomVerrouille: number }>}
 */
export async function mesurerContrasteSondesUi(page) {
    return page.evaluate(() => {
        /** @param {string} couleur */
        function analyserCouleur(couleur) {
            const rgba = couleur.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
            if (rgba) {
                return {
                    rgb: [Number(rgba[1]), Number(rgba[2]), Number(rgba[3])],
                    alpha: rgba[4] != null ? Number(rgba[4]) : 1,
                };
            }
            return null;
        }
        /** @param {number[]} fg @param {number} alpha @param {number[]} bg */
        function melangerRgb(fg, alpha, bg) {
            return fg.map((c, i) => Math.round(c * alpha + bg[i] * (1 - alpha)));
        }
        /** @param {number[]} rgb */
        function luminance(rgb) {
            const [rs, gs, bs] = rgb.map((c) => {
                const s = c / 255;
                return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
            });
            return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
        }
        /** @param {string} fg @param {string} bg */
        function ratioDepuisCouleurs(fg, bg) {
            const a = analyserCouleur(fg);
            const b = analyserCouleur(bg);
            if (!a || !b) return 0;
            const rgb = melangerRgb(a.rgb, a.alpha, b.rgb);
            const l1 = luminance(rgb);
            const l2 = luminance(b.rgb);
            return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
        }
        const bg = getComputedStyle(document.body).backgroundColor;
        /** @param {{ classe?: string, id?: string }} opts */
        function sonde(opts) {
            const el = document.createElement('div');
            if (opts.id) el.id = opts.id;
            if (opts.classe) el.className = opts.classe;
            el.textContent = 'probe';
            document.body.appendChild(el);
            const ratio = ratioDepuisCouleurs(getComputedStyle(el).color, bg);
            el.remove();
            return ratio;
        }
        return {
            palier: sonde({ classe: 'objectif-hud-palier' }),
            vide: sonde({ id: 'indicateur-vide-actif' }),
            finHint: sonde({ classe: 'histoire-fin-hint' }),
            videTitre: sonde({ classe: 'section-vide-titre' }),
            cutsceneProgress: sonde({ classe: 'cutscene-progress' }),
            passer: sonde({ classe: 'btn-cutscene-passer' }),
            achNomVerrouille: (() => {
                const carte = document.createElement('div');
                carte.className = 'ach-carte verrouille';
                const nom = document.createElement('div');
                nom.className = 'ach-carte-nom';
                nom.textContent = 'probe';
                carte.appendChild(nom);
                document.body.appendChild(carte);
                const ratio = ratioDepuisCouleurs(getComputedStyle(nom).color, bg);
                carte.remove();
                return ratio;
            })(),
        };
    });
}
