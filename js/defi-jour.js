import { ORDRE_BIOMES_LIBRE } from './config/config.js';
import { biomeEstDebloqueParHistoire } from './io/progression-records.js';
import { lireStockage, ecrireStockage } from './io/progression.js';

const CLE_DEFI_JOUR = 'derniereLigne_defiJour';

function hashDate(isoDate) {
    let h = 0;
    for (let i = 0; i < isoDate.length; i++) {
        h = (h * 31 + isoDate.charCodeAt(i)) >>> 0;
    }
    return h;
}

/** @returns {{ date: string, biomeId: string, objectifLignes: number }} */
export function obtenirDefiDuJour(date = new Date()) {
    const iso = date.toISOString().slice(0, 10);
    const h = hashDate(iso);
    const debloques = ORDRE_BIOMES_LIBRE.filter((id) => biomeEstDebloqueParHistoire(id));
    const pool = debloques.length ? debloques : ['classique'];
    const biomeId = pool[h % pool.length];
    const objectifLignes = 15 + (h % 26);
    return { date: iso, biomeId, objectifLignes };
}

export function lireScoreDefiJour(dateIso) {
    const raw = lireStockage(CLE_DEFI_JOUR, '{}');
    try {
        const parsed = JSON.parse(raw);
        return typeof parsed[dateIso] === 'number' ? parsed[dateIso] : 0;
    } catch {
        return 0;
    }
}

/** @param {string} dateIso @param {number} score */
export function enregistrerScoreDefiJour(dateIso, score) {
    const raw = lireStockage(CLE_DEFI_JOUR, '{}');
    /** @type {Record<string, number>} */
    let parsed = {};
    try {
        parsed = JSON.parse(raw);
    } catch {
        parsed = {};
    }
    const precedent = parsed[dateIso] ?? 0;
    if (score > precedent) {
        parsed[dateIso] = score;
        ecrireStockage(CLE_DEFI_JOUR, JSON.stringify(parsed));
    }
}
