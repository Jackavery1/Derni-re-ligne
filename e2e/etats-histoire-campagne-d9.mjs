import { ETAT_AVANT_BOSS_SENTINELLE } from './etats-histoire-base.mjs';
import { ETAT_AVANT_FIN_NORMALE } from './etats-histoire-fins.mjs';

/** Jalon D9 après mondes 1–8 (reprise serial si cache absent). */
export const ETAT_D9_PARTIE1 = {
    ...ETAT_AVANT_BOSS_SENTINELLE,
    bossVaincus: ['brasier', 'sentinelle'],
    interludesVusIds: ['interlude_gardiens'],
    fragmentsVusIds: ['apres_prologue', 'apres_lave', 'apres_rouille'],
    laboDecouvert: true,
    mondesDejaMontres: [
        'monde_prologue',
        'monde_lave',
        'monde_rouille',
        'monde_boss_1',
        'monde_ocean',
        'monde_foret',
        'monde_glace',
        'monde_boss_2',
    ],
};

/** Jalon D9 après mondes 9–16 (reprise serial si cache absent). */
export const ETAT_D9_PARTIE2 = {
    ...ETAT_AVANT_FIN_NORMALE,
    interludesVusIds: ['interlude_gardiens', 'interlude_elle', 'interlude_veille'],
};
