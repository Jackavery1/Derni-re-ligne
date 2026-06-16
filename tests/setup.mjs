import { readFileSync } from 'fs';
import { beforeEach } from 'vitest';
import { reinitialiserBusJeu } from '../js/bus-jeu.js';
import * as textesHistoire from '../js/histoire-textes.js';

const stockage = new Map();
const codexTextes = JSON.parse(readFileSync('data/codex-textes.json', 'utf8'));
const niveauxArchi = JSON.parse(readFileSync('data/archi-niveaux.json', 'utf8'));

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
    return { ok: false, status: 404, json: async () => ({}) };
};

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
