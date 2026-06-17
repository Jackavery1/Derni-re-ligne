import { readFileSync } from 'fs';
import { beforeEach } from 'vitest';
import { reinitialiserBusJeu } from '../js/bus-jeu.js';
import * as textesHistoire from '../js/histoire-textes.js';

const stockage = new Map();
const codexTextes = JSON.parse(readFileSync('data/codex-textes.json', 'utf8'));
const niveauxArchi = JSON.parse(readFileSync('data/archi-niveaux.json', 'utf8'));
const biomesJson = JSON.parse(readFileSync('data/biomes.json', 'utf8'));
const contenuJeuJson = JSON.parse(readFileSync('data/contenu-jeu.json', 'utf8'));
const difficulteJson = JSON.parse(readFileSync('data/difficulte-mondes.json', 'utf8'));
const achievementsCoreJson = JSON.parse(readFileSync('data/achievements-core.json', 'utf8'));
const histoireDonneesJson = JSON.parse(readFileSync('data/histoire-donnees.json', 'utf8'));
const achievementsHistoireJson = JSON.parse(
    readFileSync('data/achievements-histoire.json', 'utf8')
);

import { chargerBiomesJeu } from '../js/biomes.js';
import { chargerContenuJeu } from '../js/contenu-jeu.js';
import { chargerDifficulteMondes } from '../js/difficulte-mondes-chargement.js';
import { chargerAchievementsDonnees } from '../js/achievements-donnees.js';
import { chargerHistoireDonneesMetier } from '../js/histoire-donnees.js';

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
