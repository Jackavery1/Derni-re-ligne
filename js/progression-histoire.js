/** État narratif persisté (localStorage) et règles de déblocage des modes. */
import { ETAT_HISTOIRE_VIDE, JOURNAUX_VERA } from './histoire-donnees.js';
import { modeDevActif } from './mode-dev-etat.js';
import { lireStockageJson, ecrireStockageJson } from './progression-stockage.js';

const TOUS_BOSS_HISTOIRE = ['brasier', 'sentinelle', 'archiviste', 'avantgarde', 'distorsion'];

const TOUS_BOSS_MONDES = [
    'monde_boss_1',
    'monde_boss_2',
    'monde_boss_3',
    'monde_boss_4',
    'monde_finale',
];

/** @param {typeof ETAT_HISTOIRE_VIDE} etat */
function _fusionnerLegacyHistoire(etat) {
    const clesLegacy = [
        'derniereLigne_histoireJournaux',
        'derniereLigne_histoireBoss',
        'derniereLigne_histoireFin',
        'tetrisNeo_histoireJournaux',
        'tetrisNeo_histoireBoss',
        'tetrisNeo_histoireFin',
    ];
    let fusionEffectuee = false;

    const journaux = lireStockageJson('derniereLigne_histoireJournaux', null);
    if (Array.isArray(journaux)) {
        for (const id of journaux) {
            if (typeof id === 'string' && !etat.journauxTrouves.includes(id)) {
                etat.journauxTrouves.push(id);
                fusionEffectuee = true;
            }
        }
    }

    const boss = lireStockageJson('derniereLigne_histoireBoss', null);
    if (Array.isArray(boss)) {
        for (const id of boss) {
            if (typeof id === 'string' && !etat.bossVaincus.includes(id)) {
                etat.bossVaincus.push(id);
                fusionEffectuee = true;
            }
        }
    }

    const fins = lireStockageJson('derniereLigne_histoireFin', null);
    if (Array.isArray(fins)) {
        for (const id of fins) {
            if (typeof id === 'string' && !etat.toutesFinObtenues.includes(id)) {
                etat.toutesFinObtenues.push(id);
                fusionEffectuee = true;
            }
        }
    }

    if (fusionEffectuee) {
        sauvegarderEtatHistoire(etat);
        for (const cle of clesLegacy) {
            try {
                localStorage.removeItem(cle);
            } catch {
                /* ignore */
            }
        }
    }
}

/** @param {import('./histoire-donnees.js').EtatHistoire} etat */
function _reconcilierFlagsHistoire(etat) {
    if (!Array.isArray(etat.bossVaincus)) etat.bossVaincus = [];
    if (!Array.isArray(etat.journauxTrouves)) etat.journauxTrouves = [];
    if (!Array.isArray(etat.mondesCompletes)) etat.mondesCompletes = [];
    if (!Array.isArray(etat.toutesFinObtenues)) etat.toutesFinObtenues = [];
    if (!Array.isArray(etat.mondesCachesDebloques)) etat.mondesCachesDebloques = [];
    if (!etat.etoilesParMonde) etat.etoilesParMonde = {};
    if (!etat.continuesParBoss) etat.continuesParBoss = {};
    if (!etat.conditionsMiroir) {
        etat.conditionsMiroir = { ...ETAT_HISTOIRE_VIDE.conditionsMiroir };
    }
    if (!etat.conditionsTrame) {
        etat.conditionsTrame = { ...ETAT_HISTOIRE_VIDE.conditionsTrame };
    }
    if (!etat.conditionsParadoxe) {
        etat.conditionsParadoxe = { ...ETAT_HISTOIRE_VIDE.conditionsParadoxe };
    }

    if (etat.bossVaincus.includes('archiviste')) {
        etat.conditionsMiroir.bossArchivisteVaincu = true;
    }
    if (etat.journauxTrouves.length >= JOURNAUX_VERA.length) {
        etat.conditionsTrame.tousJournauxTrouves = true;
    }
    if (etat.mondesCompletes.includes('monde_miroir')) {
        etat.conditionsTrame.miroirComplete = true;
    }

    const continuesBossTotal = TOUS_BOSS_MONDES.reduce(
        (sum, id) => sum + (etat.continuesParBoss[id] ?? 0),
        0
    );
    if (continuesBossTotal > 0 || (etat.nbContinuesUtilises ?? 0) > 0) {
        etat.conditionsTrame.tousBossSansContinue = false;
    } else if (TOUS_BOSS_HISTOIRE.every((id) => etat.bossVaincus.includes(id))) {
        etat.conditionsTrame.tousBossSansContinue = true;
    }
    if (etat.toutesFinObtenues.includes('fin_secrete')) {
        etat.conditionsParadoxe.finSecreteObtenue = true;
    }
    if (
        etat.conditionsMiroir.bossArchivisteVaincu &&
        (etat.conditionsMiroir.tetrisTriplesCyber ?? 0) >= 3 &&
        !etat.mondesCachesDebloques.includes('monde_miroir')
    ) {
        etat.mondesCachesDebloques.push('monde_miroir');
    }
}

/** @returns {typeof ETAT_HISTOIRE_VIDE} */
export function chargerEtatHistoire() {
    const parsed = /** @type {Partial<typeof ETAT_HISTOIRE_VIDE> | null} */ (
        lireStockageJson('derniereLigne_histoire', null)
    );
    if (!parsed || typeof parsed !== 'object') {
        const etatVide = structuredClone(ETAT_HISTOIRE_VIDE);
        _fusionnerLegacyHistoire(etatVide);
        _reconcilierFlagsHistoire(etatVide);
        return etatVide;
    }
    const base = structuredClone(ETAT_HISTOIRE_VIDE);
    const etat = {
        ...base,
        ...parsed,
        fragmentsVusIds: parsed.fragmentsVusIds ?? [],
        interludesVusIds: parsed.interludesVusIds ?? [],
        outroVue: parsed.outroVue ?? false,
        etoilesParMonde: parsed.etoilesParMonde ?? {},
        continuesParBoss: parsed.continuesParBoss ?? {},
        conditionsMiroir: {
            ...base.conditionsMiroir,
            ...(parsed.conditionsMiroir ?? {}),
        },
        conditionsTrame: {
            ...base.conditionsTrame,
            ...(parsed.conditionsTrame ?? {}),
        },
        conditionsParadoxe: {
            ...base.conditionsParadoxe,
            ...(parsed.conditionsParadoxe ?? {}),
        },
        prouessesHistoire: {
            ...base.prouessesHistoire,
            ...(parsed.prouessesHistoire ?? {}),
        },
    };
    _fusionnerLegacyHistoire(etat);
    _reconcilierFlagsHistoire(etat);
    return etat;
}

/** @returns {{ codex: boolean, mondeLibre: boolean, profil: boolean, achievements: boolean, oracleCoop: boolean, architecte: boolean }} */
export function obtenirEtatDeblocage() {
    if (modeDevActif()) {
        return {
            codex: true,
            mondeLibre: true,
            profil: true,
            achievements: true,
            oracleCoop: true,
            architecte: true,
        };
    }

    let etat = null;
    try {
        etat = chargerEtatHistoire();
    } catch {
        /* pas encore d'historique */
    }
    if (!etat) {
        return {
            codex: false,
            mondeLibre: false,
            profil: false,
            achievements: false,
            oracleCoop: false,
            architecte: false,
        };
    }

    const bossVaincus = Array.isArray(etat.bossVaincus) ? etat.bossVaincus : [];
    const mondesCompletes = Array.isArray(etat.mondesCompletes) ? etat.mondesCompletes : [];

    return {
        codex: mondesCompletes.includes('monde_prologue'),
        mondeLibre: bossVaincus.includes('brasier'),
        profil: bossVaincus.includes('sentinelle'),
        achievements: bossVaincus.includes('archiviste'),
        oracleCoop: bossVaincus.includes('avantgarde'),
        architecte:
            bossVaincus.includes('distorsion') ||
            (etat.finObtenue !== null && etat.finObtenue !== undefined),
    };
}

/** @param {typeof ETAT_HISTOIRE_VIDE} etat */
export function sauvegarderEtatHistoire(etat) {
    ecrireStockageJson('derniereLigne_histoire', etat);
}
