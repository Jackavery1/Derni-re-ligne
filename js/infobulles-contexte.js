import { BIOMES, RELIQUES } from './config.js';
import { INFOBULLES_MODES_JEU } from './contenu-jeu.js';
import { obtenirInfobulleAttaqueBoss } from './histoire-map-briefings-boss.js';
import { lireStockage, ecrireStockage } from './progression.js';
import { sansAccentsE } from './texte-jeu.js';

const CLE_STOCKAGE = 'derniereLigne_infobullesBiome';

/** @returns {Record<string, { vivant?: boolean, meteo?: boolean, relique?: boolean }>} */
function lireVu() {
    try {
        const raw = lireStockage(CLE_STOCKAGE, '{}');
        return JSON.parse(raw) || {};
    } catch {
        return {};
    }
}

function persisterVu(vu) {
    ecrireStockage(CLE_STOCKAGE, JSON.stringify(vu));
}

/** @param {string} biomeId @param {'vivant' | 'meteo' | 'relique'} type */
function dejaVu(biomeId, type) {
    return lireVu()[biomeId]?.[type] === true;
}

/** @param {string} biomeId @param {'vivant' | 'meteo' | 'relique'} type */
function marquerVu(biomeId, type) {
    const vu = lireVu();
    if (!vu[biomeId]) vu[biomeId] = {};
    vu[biomeId][type] = true;
    persisterVu(vu);
}

/** @param {{ titre: string, texte: string }} contenu */
let _timerInfobulle = null;

/** @param {{ titre: string, texte: string }} contenu @returns {boolean} */
function afficherInfobulle(contenu) {
    if (typeof document === 'undefined') return false;
    if (window.__NEO_SILENT_NOTIFS__) return false;
    const overlay = document.getElementById('overlay-infobulle-contexte');
    if (!overlay) return false;

    const titre = document.getElementById('infobulle-contexte-titre');
    const texte = document.getElementById('infobulle-contexte-texte');
    if (titre) titre.textContent = sansAccentsE(contenu.titre);
    if (texte) texte.textContent = sansAccentsE(contenu.texte);

    overlay.classList.remove('element-masque');
    const btn = document.getElementById('btn-infobulle-contexte-fermer');
    const fermer = () => overlay.classList.add('element-masque');
    if (btn) btn.onclick = fermer;
    clearTimeout(_timerInfobulle);
    _timerInfobulle = setTimeout(fermer, 12000);
    return true;
}

/**
 * @param {string} biomeId
 * @param {{ nom?: string, description?: string, icone?: string }} config
 */
export function proposerInfobulleVivant(biomeId, config) {
    if (!biomeId || dejaVu(biomeId, 'vivant')) return;
    marquerVu(biomeId, 'vivant');
    const biome = BIOMES[biomeId]?.nom ?? biomeId.toUpperCase();
    afficherInfobulle({
        titre: `${config.icone ?? '⚡'} ${config.nom ?? 'PLATEAU VIVANT'} — ${biome}`,
        texte:
            config.description ??
            'Ce biome possede un comportement vivant : observez l’alerte avant l’effet.',
    });
}

/**
 * @param {string} biomeId
 * @param {{ nom?: string, description?: string, icone?: string }} evenement
 */
export function proposerInfobulleMeteo(biomeId, evenement) {
    if (!biomeId || dejaVu(biomeId, 'meteo')) return;
    marquerVu(biomeId, 'meteo');
    const biome = BIOMES[biomeId]?.nom ?? biomeId.toUpperCase();
    afficherInfobulle({
        titre: `${evenement.icone ?? '🌦'} ${evenement.nom ?? 'METEO'} — ${biome}`,
        texte:
            evenement.description ??
            'La meteo modifie temporairement les regles : adaptez votre strategie.',
    });
}

/** @param {string} biomeId @param {{ nom?: string, description?: string, icone?: string }} relique */
export function proposerInfobulleRelique(biomeId, relique) {
    if (!biomeId || dejaVu(biomeId, 'relique')) return;
    marquerVu(biomeId, 'relique');
    const biome = BIOMES[biomeId]?.nom ?? biomeId.toUpperCase();
    const data = relique ?? RELIQUES[biomeId];
    if (!data) return;
    afficherInfobulle({
        titre: `${data.icone ?? '✦'} ${data.nom ?? 'RELIQUE'} — ${biome}`,
        texte:
            data.description ??
            'Declenchee au niveau 5 : effet unique a ce biome, une fois par partie.',
    });
}

const CLE_ORACLE_COOP = 'derniereLigne_infobulleOracleCoop';
const CLE_MODES_JEU = 'derniereLigne_infobullesModesJeu';
const CLE_ATTAQUES_BOSS = 'derniereLigne_infobullesBoss';

/** @param {'sansFin' | 'sprint' | 'oracle' | 'coop' | 'defiJour'} modeId */
export function proposerInfobulleModeJeu(modeId) {
    if (typeof window !== 'undefined' && window.__NEO_SILENT_NOTIFS__) return;
    const contenu = INFOBULLES_MODES_JEU[modeId];
    if (!contenu) return;

    let vu = {};
    try {
        vu = JSON.parse(lireStockage(CLE_MODES_JEU, '{}')) || {};
    } catch {
        vu = {};
    }
    if (vu[modeId]) return;
    if (!afficherInfobulle(contenu)) return;
    vu[modeId] = true;
    ecrireStockage(CLE_MODES_JEU, JSON.stringify(vu));
}

export function proposerInfobulleOracleCoopExclusif() {
    if (typeof window !== 'undefined' && window.__NEO_SILENT_NOTIFS__) return;
    if (lireStockage(CLE_ORACLE_COOP, '0') === '1') return;
    const wrapOracle = document.getElementById('toggle-oracle-wrap');
    if (!wrapOracle?.classList.contains('mode-debloque')) return;
    if (
        !afficherInfobulle({
            titre: 'ORACLE ET COOP',
            texte:
                "L'Oracle (solo) et le mode Coop ne peuvent pas etre actifs en meme temps. " +
                'Choisissez l’un des deux avant de lancer la partie.',
        })
    ) {
        return;
    }
    ecrireStockage(CLE_ORACLE_COOP, '1');
}

/** @param {string} typeAttaque */
export function proposerInfobulleAttaqueBoss(typeAttaque) {
    if (typeof window !== 'undefined' && window.__NEO_SILENT_NOTIFS__) return;
    const contenu = obtenirInfobulleAttaqueBoss(typeAttaque);
    if (!contenu) return;

    let vu = {};
    try {
        vu = JSON.parse(lireStockage(CLE_ATTAQUES_BOSS, '{}')) || {};
    } catch {
        vu = {};
    }
    if (vu[typeAttaque]) return;
    if (!afficherInfobulle(contenu)) return;
    vu[typeAttaque] = true;
    ecrireStockage(CLE_ATTAQUES_BOSS, JSON.stringify(vu));
}

export function _reinitialiserInfobullesContexte() {
    ecrireStockage(CLE_STOCKAGE, '{}');
    ecrireStockage(CLE_ORACLE_COOP, '0');
    ecrireStockage(CLE_MODES_JEU, '{}');
    ecrireStockage(CLE_ATTAQUES_BOSS, '{}');
}
