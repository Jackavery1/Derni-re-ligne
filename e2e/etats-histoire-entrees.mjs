import { ETAT_HISTOIRE_VIDE } from '../js/histoire-donnees.js';
import { MONDES_CAMPAGNE_PRINCIPALE } from './etats-histoire-base.mjs';

const BOSS_PAR_MONDE = {
    monde_boss_1: 'brasier',
    monde_boss_2: 'sentinelle',
    monde_boss_3: 'archiviste',
    monde_boss_4: 'avantgarde',
};

/** État première visite d'un monde de la campagne principale (cutscene d'entrée). */
/** @param {string} mondeId */
export function preparerEtatPremiereEntree(mondeId) {
    const index = MONDES_CAMPAGNE_PRINCIPALE.indexOf(mondeId);
    if (index < 0) {
        throw new Error(`Monde campagne inconnu : ${mondeId}`);
    }

    const predecesseurs = MONDES_CAMPAGNE_PRINCIPALE.slice(0, index);
    const bossVaincus = [];
    for (const id of predecesseurs) {
        const boss = BOSS_PAR_MONDE[id];
        if (boss) bossVaincus.push(boss);
    }

    return {
        ...ETAT_HISTOIRE_VIDE,
        mondesCompletes: [...predecesseurs],
        bossVaincus,
        mondesDejaMontres: [...predecesseurs],
    };
}
