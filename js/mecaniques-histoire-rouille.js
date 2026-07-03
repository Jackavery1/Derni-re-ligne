import { CONFIG, BIOMES } from './config.js';
import { store } from './store-jeu.js';
import { etat } from './store-jeu.js';
import { modeHistoireEnCours } from './mode-histoire.js';
import { ajouterBlocksRouillesEffaces } from './achievements-histoire.js';
import { biomeActuelMecanique } from './mecaniques-histoire-queries.js';

const _celluleActivesRouille = new Set();

const SEUIL_ROUILLE_MS = () => (BIOMES.rouille?.secondesAvantRouille ?? 18) * 1000;

export function reinitialiserCellulesRouilleActives() {
    _celluleActivesRouille.clear();
}

export function enregistrerTimestampCellules(cellules) {
    if (!modeHistoireEnCours()) return;
    if (biomeActuelMecanique() !== 'rouille') return;
    if (!store.histoire.mecaniques.plateauTimestamps) return;
    const now = performance.now();
    for (const { x, y } of cellules) {
        if (y >= 0 && y < CONFIG.lignes && x >= 0 && x < CONFIG.colonnes) {
            const idx = y * CONFIG.colonnes + x;
            store.histoire.mecaniques.plateauTimestamps[idx] = now;
            store.histoire.mecaniques.plateauRouille[idx] = 0;
            _celluleActivesRouille.add(idx);
        }
    }
}

export function tickRouille(timestamp) {
    if (!store.histoire.mecaniques.plateauTimestamps) return;
    if (_celluleActivesRouille.size === 0) return;
    const TS = store.histoire.mecaniques.plateauTimestamps;
    const RO = store.histoire.mecaniques.plateauRouille;
    const seuil = SEUIL_ROUILLE_MS();
    for (const idx of _celluleActivesRouille) {
        if (timestamp - TS[idx] >= seuil) {
            RO[idx] = 1;
            _celluleActivesRouille.delete(idx);
        }
    }
}

export function effondrerRouilleExpiree(timestamp) {
    const TS = store.histoire.mecaniques.plateauTimestamps;
    const RO = store.histoire.mecaniques.plateauRouille;
    if (!TS || !RO) return;
    const seuilEffondrement = SEUIL_ROUILLE_MS() * 2;
    const C = CONFIG.colonnes;
    let nb = 0;
    for (let idx = 0; idx < RO.length; idx++) {
        if (RO[idx] !== 1 || TS[idx] === 0) continue;
        if (timestamp - TS[idx] < seuilEffondrement) continue;
        const y = Math.floor(idx / C);
        const x = idx % C;
        if (y >= 0 && y < CONFIG.lignes) etat.plateau[y][x] = 0;
        TS[idx] = 0;
        RO[idx] = 0;
        nb++;
    }
    if (nb > 0) ajouterBlocksRouillesEffaces(nb);
}

export function reinitialiserMatricesRouille() {
    const TS = store.histoire.mecaniques.plateauTimestamps;
    const RO = store.histoire.mecaniques.plateauRouille;
    if (!TS || !RO) return;
    TS.fill(0);
    RO.fill(0);
    _celluleActivesRouille.clear();
}

export function decalerMatricesRouille(lignesEffacees) {
    if (!store.histoire.mecaniques.plateauTimestamps || !lignesEffacees?.length) return;
    const aRetirer = new Set(lignesEffacees);
    const TS = store.histoire.mecaniques.plateauTimestamps;
    const RO = store.histoire.mecaniques.plateauRouille;
    const C = CONFIG.colonnes;
    const L = CONFIG.lignes;

    let rustEffaces = 0;
    for (const lig of lignesEffacees) {
        for (let c = 0; c < C; c++) {
            if (RO[lig * C + c]) rustEffaces++;
        }
    }

    const newTS = new Float64Array(L * C);
    const newRO = new Uint8Array(L * C);
    let writeRow = L - 1;
    for (let readRow = L - 1; readRow >= 0; readRow--) {
        if (aRetirer.has(readRow)) continue;
        for (let c = 0; c < C; c++) {
            const dst = writeRow * C + c;
            const src = readRow * C + c;
            newTS[dst] = TS[src];
            newRO[dst] = RO[src];
        }
        writeRow--;
    }

    store.histoire.mecaniques.plateauTimestamps = newTS;
    store.histoire.mecaniques.plateauRouille = newRO;

    _celluleActivesRouille.clear();
    for (let i = 0; i < newTS.length; i++) {
        if (newTS[i] !== 0 && !newRO[i]) _celluleActivesRouille.add(i);
    }

    if (rustEffaces > 0) ajouterBlocksRouillesEffaces(rustEffaces);
}

export function celluleEstRouillee(x, y) {
    if (!modeHistoireEnCours() || !store.histoire.mecaniques.plateauRouille) return false;
    if (y < 0 || y >= CONFIG.lignes || x < 0 || x >= CONFIG.colonnes) return false;
    return store.histoire.mecaniques.plateauRouille[y * CONFIG.colonnes + x] === 1;
}
