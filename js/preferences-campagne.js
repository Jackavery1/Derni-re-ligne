import { lireStockage, ecrireStockage } from './io/progression-stockage.js';

const CLE_ENCHAINEMENT_CAMPAGNE = 'derniereLigne_enchainementCampagne';

export function enchainementCampagneActif() {
    return lireStockage(CLE_ENCHAINEMENT_CAMPAGNE, 'true') !== 'false';
}

export function definirEnchainementCampagneActif(actif) {
    ecrireStockage(CLE_ENCHAINEMENT_CAMPAGNE, actif ? 'true' : 'false');
}
