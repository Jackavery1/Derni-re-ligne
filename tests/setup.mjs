import { readFileSync } from 'fs';
import { beforeEach } from 'vitest';
import { reinitialiserBusJeu } from '../js/etat/bus-jeu.js';
import * as textesHistoire from '../js/histoire-textes.js';

/**
 * @param {string} chemin
 * @param {number} [essais]
 */
function lireJsonRobuste(chemin, essais = 8) {
    let dernierErreur = /** @type {unknown} */ (null);
    for (let i = 0; i < essais; i++) {
        try {
            const brut = readFileSync(chemin, 'utf8');
            if (!brut.trim()) {
                throw new SyntaxError(`Fichier JSON vide : ${chemin}`);
            }
            return JSON.parse(brut);
        } catch (err) {
            dernierErreur = err;
            const debut = Date.now();
            while (Date.now() - debut < 25 * (i + 1)) {
                /* attente courte — évite la course pretest/export vs workers Vitest */
            }
        }
    }
    throw dernierErreur;
}

const stockage = new Map();
const codexTextes = lireJsonRobuste('data/codex-textes.json');
const niveauxArchi = lireJsonRobuste('data/archi-niveaux.json');
const biomesJson = lireJsonRobuste('data/biomes.json');
const contenuJeuJson = lireJsonRobuste('data/contenu-jeu.json');
const difficulteJson = lireJsonRobuste('data/difficulte-mondes.json');
const achievementsCoreJson = lireJsonRobuste('data/achievements-core.json');
const histoireDonneesJson = lireJsonRobuste('data/histoire-donnees.json');
const achievementsHistoireJson = lireJsonRobuste('data/achievements-histoire.json');

import { chargerBiomesJeu } from '../js/config/biomes.js';
import { chargerContenuJeu } from '../js/config/contenu-jeu.js';
import { chargerDifficulteMondes } from '../js/io/difficulte-mondes-chargement.js';
import { chargerAchievementsDonnees } from '../js/achievements/achievements-donnees-chargement.js';
import { chargerHistoireDonneesMetier } from '../js/histoire/histoire-donnees-exports.js';

globalThis.fetch = async (url) => {
    const href = String(url);
    if (href.includes('histoire-textes.json')) {
        return { ok: true, json: async () => textesHistoire };
    }
    if (href.includes('codex-textes.json')) {
        return { ok: true, json: async () => codexTextes };
    }
    if (href.includes('archi-niveaux.json')) {
        return { ok: true, json: async () => niveauxArchi };
    }
    if (href.includes('biomes.json')) {
        return { ok: true, json: async () => biomesJson };
    }
    if (href.includes('contenu-jeu.json')) {
        return { ok: true, json: async () => contenuJeuJson };
    }
    if (href.includes('difficulte-mondes.json')) {
        return { ok: true, json: async () => difficulteJson };
    }
    if (href.includes('achievements-core.json')) {
        return { ok: true, json: async () => achievementsCoreJson };
    }
    if (href.includes('histoire-donnees.json')) {
        return { ok: true, json: async () => histoireDonneesJson };
    }
    if (href.includes('achievements-histoire.json')) {
        return { ok: true, json: async () => achievementsHistoireJson };
    }
    return { ok: false, status: 404, json: async () => ({}) };
};

await Promise.all([
    chargerBiomesJeu(),
    chargerContenuJeu(),
    chargerDifficulteMondes(),
    chargerAchievementsDonnees(),
    chargerHistoireDonneesMetier(),
]);

globalThis.localStorage = {
    get length() {
        return stockage.size;
    },
    key(index) {
        return [...stockage.keys()][index] ?? null;
    },
    getItem(cle) {
        return stockage.has(cle) ? stockage.get(cle) : null;
    },
    setItem(cle, valeur) {
        stockage.set(cle, String(valeur));
    },
    removeItem(cle) {
        stockage.delete(cle);
    },
    clear() {
        stockage.clear();
    },
};

beforeEach(() => {
    stockage.clear();
    reinitialiserBusJeu();
});

globalThis.window = globalThis.window ?? globalThis;
globalThis.document = globalThis.document ?? {
    body: { innerHTML: '', appendChild: () => {}, classList: { add: () => {}, remove: () => {} } },
    getElementById: () => null,
    querySelector: () => null,
    querySelectorAll: () => [],
    createElement: () => ({
        style: {},
        appendChild: () => {},
        setAttribute: () => {},
        classList: { add: () => {}, remove: () => {}, contains: () => false, toggle: () => {} },
        click: () => {},
    }),
};
globalThis.window.matchMedia =
    globalThis.window.matchMedia ??
    (() => ({
        matches: false,
        addEventListener: () => {},
        removeEventListener: () => {},
    }));

globalThis.requestAnimationFrame = globalThis.requestAnimationFrame ?? (() => 1);
globalThis.cancelAnimationFrame = globalThis.cancelAnimationFrame ?? (() => {});
