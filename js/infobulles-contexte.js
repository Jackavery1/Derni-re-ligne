import { BIOMES, RELIQUES } from './config.js';
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
function afficherInfobulle(contenu) {
    if (typeof document === 'undefined') return;
    const overlay = document.getElementById('overlay-infobulle-contexte');
    if (!overlay) return;

    const titre = document.getElementById('infobulle-contexte-titre');
    const texte = document.getElementById('infobulle-contexte-texte');
    if (titre) titre.textContent = sansAccentsE(contenu.titre);
    if (texte) texte.textContent = sansAccentsE(contenu.texte);

    overlay.classList.remove('element-masque');
    const btn = document.getElementById('btn-infobulle-contexte-fermer');
    if (btn) {
        btn.onclick = () => overlay.classList.add('element-masque');
    }
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

export function proposerInfobulleOracleCoopExclusif() {
    if (lireStockage(CLE_ORACLE_COOP, '0') === '1') return;
    const wrapOracle = document.getElementById('toggle-oracle-wrap');
    if (!wrapOracle?.classList.contains('mode-debloque')) return;
    ecrireStockage(CLE_ORACLE_COOP, '1');
    afficherInfobulle({
        titre: 'ORACLE ET COOP',
        texte:
            "L'Oracle (solo) et le mode Coop ne peuvent pas etre actifs en meme temps. " +
            'Choisissez l’un des deux avant de lancer la partie.',
    });
}

export function _reinitialiserInfobullesContexte() {
    ecrireStockage(CLE_STOCKAGE, '{}');
    ecrireStockage(CLE_ORACLE_COOP, '0');
}
