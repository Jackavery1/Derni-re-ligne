import { beforeEach } from 'vitest';
import { reinitialiserBusJeu } from '../js/bus-jeu.js';
import * as textesHistoire from '../js/histoire-textes.js';
import { CODEX } from '../js/codex-donnees.js';

const stockage = new Map();

globalThis.fetch = async (url) => {
    const href = String(url);
    if (href.includes('histoire-textes.json')) {
        return { ok: true, json: async () => textesHistoire };
    }
    if (href.includes('codex-donnees.json')) {
        return { ok: true, json: async () => ({ CODEX }) };
    }
    return { ok: false, status: 404, json: async () => ({}) };
};

globalThis.localStorage = {
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
