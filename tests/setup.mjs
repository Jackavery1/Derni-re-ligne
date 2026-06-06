const stockage = new Map();

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
