import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ETAT_HISTOIRE_VIDE } from '../js/histoire-donnees.js';
import { ETAT_HISTOIRE_BOSS_BRASIER } from './etats-histoire-base.mjs';
import { CLE_FRAGMENT_PAR_MONDE } from '../js/histoire-manager-post-monde.js';
import { FRAGMENTS_VERA_SIGNAL } from '../js/histoire-textes/journaux.js';

const { SEQUENCE_HISTOIRE } = JSON.parse(
    readFileSync(
        join(dirname(fileURLToPath(import.meta.url)), '../data/histoire-donnees.json'),
        'utf8'
    )
);

const INTERLUDES_PAR_MONDE = {
    monde_rouille: 'interlude_gardiens',
    monde_eclipse: 'interlude_elle',
    monde_vide: 'interlude_veille',
};

/** @param {string} texte */
function texteVersMarqueur(texte) {
    const extrait = texte.replace(/^>\s*/, '').slice(0, 40);
    const echappe = extrait.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp(echappe, 'i');
}

export const CAS_FRAGMENTS_VERA = Object.entries(CLE_FRAGMENT_PAR_MONDE).map(
    ([mondeId, cleFragment]) => {
        const fragment = FRAGMENTS_VERA_SIGNAL[cleFragment];
        const premiereLigne = fragment?.[0]?.texte ?? '';
        return {
            mondeId,
            cleFragment,
            marqueur: texteVersMarqueur(premiereLigne),
        };
    }
);

/**
 * État localStorage pour une première complétion (fragment VERA non vu).
 * @param {string} mondeId
 */
export function preparerEtatPremiereCompletionFragment(mondeId) {
    const sequence = SEQUENCE_HISTOIRE;
    const idx = sequence.findIndex((m) => m.id === mondeId);
    if (idx < 0) throw new Error(`Monde inconnu : ${mondeId}`);

    const prior = sequence.slice(0, idx);
    const mondesCompletes = prior.map((m) => m.id);
    const bossVaincus = [
        ...new Set(prior.filter((m) => m.estBoss && m.bossId).map((m) => m.bossId)),
    ];
    const fragmentsVusIds = prior.map((m) => CLE_FRAGMENT_PAR_MONDE[m.id]).filter(Boolean);
    const interludesVusIds = prior.map((m) => INTERLUDES_PAR_MONDE[m.id]).filter(Boolean);

    const base =
        mondeId === 'monde_prologue'
            ? { ...ETAT_HISTOIRE_VIDE }
            : { ...ETAT_HISTOIRE_BOSS_BRASIER };

    /** @type {Record<string, unknown>} */
    const etat = {
        ...base,
        mondesCompletes,
        bossVaincus,
        fragmentsVusIds,
        interludesVusIds,
        mondesDejaMontres: [...new Set([...mondesCompletes, mondeId])],
    };

    if (prior.some((m) => m.id === 'monde_cyber') || mondeId === 'monde_cyber') {
        etat.conditionsMiroir = { bossArchivisteVaincu: false, tetrisTriplesCyber: 3 };
        etat.laboDecouvert = true;
    }

    if (['monde_miroir', 'monde_trame', 'monde_paradoxe'].includes(mondeId)) {
        etat.mondesCachesDebloques = ['monde_miroir'];
        if (mondesCompletes.includes('monde_trame') || mondeId === 'monde_trame') {
            etat.mondesCachesDebloques.push('monde_trame');
        }
        if (mondeId === 'monde_trame') {
            etat.conditionsTrame = {
                miroirComplete: true,
                tousJournauxTrouves: true,
                tousBossSansContinue: true,
                actionDistorsionFaite: true,
            };
        }
        if (mondeId === 'monde_paradoxe') {
            etat.mondesCachesDebloques.push('monde_paradoxe');
            etat.conditionsParadoxe = { finSecreteObtenue: true, topsVolontairesPrologue: 3 };
        }
    }

    return etat;
}

/**
 * État pour tester un interlude (fragment du monde déjà vu).
 * @param {string} mondeId
 */
export function preparerEtatInterludePremiereCompletion(mondeId) {
    const cleFragment = CLE_FRAGMENT_PAR_MONDE[mondeId];
    const etat = preparerEtatPremiereCompletionFragment(mondeId);
    if (cleFragment && !etat.fragmentsVusIds.includes(cleFragment)) {
        etat.fragmentsVusIds = [...etat.fragmentsVusIds, cleFragment];
    }
    etat.interludesVusIds = (etat.interludesVusIds ?? []).filter(
        (id) => id !== INTERLUDES_PAR_MONDE[mondeId]
    );
    return etat;
}
