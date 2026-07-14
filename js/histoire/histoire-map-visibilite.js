import { SEQUENCE_HISTOIRE } from '../histoire/histoire-donnees-exports.js';
import { obtenirEtatHistoirePersiste } from './histoire-etat.js';
import { mondePeutEtreJoue } from './histoire-mondes.js';

/** @param {{ mondesVisibles: Set<string>, mondesFantomes: Set<string>, mondeActuel: string | null, positionsNoeuds: Record<string, unknown> }} etatCarte */
export function mettreAJourVisibiliteCarte(etatCarte) {
    const etatHist = obtenirEtatHistoirePersiste();
    const sequenceP = SEQUENCE_HISTOIRE.filter((m) => !m.estCache);

    etatCarte.mondesVisibles.clear();
    etatCarte.mondesFantomes.clear();
    etatCarte.mondeActuel = null;

    let dernierCompletIdx = -1;
    let premierDispoIdx = -1;

    for (let i = 0; i < sequenceP.length; i++) {
        const m = sequenceP[i];
        if (etatHist.mondesCompletes.includes(m.id)) {
            etatCarte.mondesVisibles.add(m.id);
            dernierCompletIdx = i;
        } else if (mondePeutEtreJoue(m.id, etatHist) && premierDispoIdx === -1) {
            etatCarte.mondesVisibles.add(m.id);
            premierDispoIdx = i;
            etatCarte.mondeActuel = m.id;
        }
    }

    if (premierDispoIdx === -1 && sequenceP.length > 0) {
        etatCarte.mondesVisibles.add(sequenceP[0].id);
        etatCarte.mondeActuel = sequenceP[0].id;
        premierDispoIdx = 0;
    }

    for (let j = premierDispoIdx + 1; j <= premierDispoIdx + 2 && j < sequenceP.length; j++) {
        if (!etatCarte.mondesVisibles.has(sequenceP[j].id)) {
            etatCarte.mondesFantomes.add(sequenceP[j].id);
        }
    }

    for (const m of SEQUENCE_HISTOIRE.filter((mc) => mc.estCache)) {
        if (mondePeutEtreJoue(m.id, etatHist) && etatCarte.positionsNoeuds[m.id]) {
            etatCarte.mondesVisibles.add(m.id);
        }
    }

    if (!etatCarte.mondeActuel && dernierCompletIdx >= 0) {
        etatCarte.mondeActuel = sequenceP[dernierCompletIdx].id;
    }
}
