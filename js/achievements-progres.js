import { chargerEtatHistoire } from './io/progression.js';
import { estCategorieIndiceMasque } from './achievements-icones-map.js';

const BOSS_PRINCIPAUX = ['brasier', 'sentinelle', 'archiviste', 'avantgarde', 'distorsion'];

/**
 * @typedef {object} ProgressionExploit
 * @property {number} actuel
 * @property {number} cible
 * @property {(actuel: number, cible: number) => string} [formaterTexte]
 */

/** @returns {import('./histoire-donnees.js').EtatHistoire} */
function etatHistoire() {
    return chargerEtatHistoire();
}

/** @param {keyof import('./histoire-donnees.js').ETAT_HISTOIRE_VIDE['prouessesHistoire']} champ */
function lireProuesse(champ) {
    return etatHistoire().prouessesHistoire?.[champ] ?? 0;
}

function compterBossVaincus() {
    const vaincus = etatHistoire().bossVaincus ?? [];
    return BOSS_PRINCIPAUX.filter((id) => vaincus.includes(id)).length;
}

/** @type {Record<string, (stats: object) => ProgressionExploit | null>} */
const LECTEURS_PROGRESSION = {
    premiere_ligne: (s) => ({ actuel: s.lignesTotal, cible: 1 }),
    premier_tetris: (s) => ({ actuel: s.maxLignesUnCoup, cible: 4 }),
    centenaire: (s) => ({ actuel: s.lignesTotal, cible: 100 }),
    millenaire: (s) => ({ actuel: s.lignesTotal, cible: 1000 }),
    score_10k: (s) => ({ actuel: s.meilleurScore, cible: 10000 }),
    score_50k: (s) => ({ actuel: s.meilleurScore, cible: 50000 }),
    score_100k: (s) => ({ actuel: s.meilleurScore, cible: 100000 }),
    survivant_3min: (s) => ({ actuel: s.meilleurTemps, cible: 180 }),
    survivant_10min: (s) => ({ actuel: s.meilleurTemps, cible: 600 }),
    explorateur: (s) => ({ actuel: s.biomesJoues.size, cible: 3 }),
    globe_trotter: (s) => ({ actuel: s.biomesJoues.size, cible: 9 }),
    inferno_survivor: (s) => ({
        actuel: s.meilleurTempsParBiome?.lave ?? 0,
        cible: 300,
    }),
    cosmos_master: (s) => ({
        actuel: s.lignesParBiome?.cosmos ?? 0,
        cible: 50,
    }),
    reliquaire: (s) => ({ actuel: s.reliquesUtilisees, cible: 10 }),
    collectionneur: (s) => ({ actuel: s.typesReliquesUtilises.size, cible: 9 }),
    meteorologue: (s) => ({ actuel: s.meteosSubies ?? 0, cible: 5 }),
    combo_fou: (s) => ({ actuel: s.maxCombo, cible: 5 }),
    robo_ami: (s) => ({ actuel: s.reactionsRobo ?? 0, cible: 20 }),
    compositeur: (s) => ({ actuel: s.maxNotesComposition ?? 0, cible: 15 }),
    grand_maitre: (s) => ({ actuel: s.nbAchievementsDebloques, cible: 10 }),
    oracle_maitre: (s) => ({
        actuel: s.oracleMeilleuresMult ?? 1,
        cible: 4,
        formaterTexte: (a, c) => `${a.toFixed(1)} / ${c.toFixed(1)}`,
    }),
    premiers_pas_coop: (s) => ({ actuel: s.lignesCoopTotal ?? 0, cible: 10 }),
    synchro_parfaite: (s) => ({ actuel: s.coopMaxLignesUnCoup ?? 0, cible: 4 }),
    archi_premier: (s) => ({
        actuel: s.archiNiveauxCompletes?.size ?? 0,
        cible: 1,
    }),
    archi_etoiles: (s) => ({ actuel: s.archiEtoilesMax ?? 0, cible: 15 }),
    archi_parfait: (s) => ({ actuel: s.archiPrecisionMax ?? 0, cible: 100 }),
    archi_econome: (s) => ({ actuel: s.archiParAtteint ?? 0, cible: 1 }),
    vivant_premier: (s) => ({ actuel: s.evenementsVivantSubis ?? 0, cible: 1 }),
    vivant_survivant: (s) => ({ actuel: s.maxEvenementsUnePartie ?? 0, cible: 10 }),
    vivant_tous_biomes: (s) => ({
        actuel: s.biomesVivantSubis?.size ?? 0,
        cible: 7,
    }),
    vivant_maitre: (s) => ({ actuel: s.lignesPendantVivant ?? 0, cible: 50 }),
    premier_boss: () => ({ actuel: compterBossVaincus(), cible: 1 }),
    tous_boss: () => ({ actuel: compterBossVaincus(), cible: 5 }),
    rouille_maitrise: () => ({ actuel: lireProuesse('blocksRouillesMax'), cible: 20 }),
    eclipse_equilibre: () => ({ actuel: lireProuesse('lignesEclipseBasseMax'), cible: 10 }),
    vide_survivant: () => ({ actuel: lireProuesse('lignesVideMax'), cible: 15 }),
    miroir_sans_erreur: () => {
        const pct = Math.floor((lireProuesse('precisionMiroirMax') || 0) * 100);
        return {
            actuel: pct,
            cible: 95,
            formaterTexte: (a, c) => `${a}% / ${c}%`,
        };
    },
};

/**
 * @param {string} achievementId
 * @param {string} categorie
 * @param {object} stats
 * @returns {ProgressionExploit | null}
 */
export function obtenirProgressionAchievement(achievementId, categorie, stats) {
    if (estCategorieIndiceMasque(categorie)) return null;
    const lire = LECTEURS_PROGRESSION[achievementId];
    if (!lire) return null;
    const brut = lire(stats);
    if (!brut || brut.cible <= 0) return null;
    const actuel = Math.max(0, Math.min(brut.actuel, brut.cible));
    return { ...brut, actuel };
}
