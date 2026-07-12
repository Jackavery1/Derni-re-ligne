import { logger } from '../io/logger.js';
import { lireStockageJson, ecrireStockageJson, chargerEtatHistoire } from '../io/progression.js';
import { CLE_STATS, creerStatsVides, statsGlobales } from './achievements-stats-etat.js';

/** @param {Record<string, any>} parsed @param {ReturnType<typeof creerStatsVides>} base */
function _restaurerStatsJeu(parsed, base) {
    statsGlobales.lignesTotal = parsed.lignesTotal ?? base.lignesTotal;
    statsGlobales.meilleurScore = parsed.meilleurScore ?? base.meilleurScore;
    statsGlobales.meilleurTemps = parsed.meilleurTemps ?? base.meilleurTemps;
    statsGlobales.maxLignesUnCoup = parsed.maxLignesUnCoup ?? base.maxLignesUnCoup;
    statsGlobales.maxCombo = parsed.maxCombo ?? base.maxCombo;
    statsGlobales.biomesJoues = new Set(parsed.biomesJoues || []);
    statsGlobales.meilleurTempsParBiome = parsed.meilleurTempsParBiome ?? {};
    statsGlobales.lignesParBiome = parsed.lignesParBiome ?? {};
    statsGlobales.reliquesUtilisees = parsed.reliquesUtilisees ?? 0;
    statsGlobales.typesReliquesUtilises = new Set(parsed.typesReliquesUtilises || []);
    statsGlobales.meteosSubies = parsed.meteosSubies ?? 0;
    statsGlobales.reactionsRobo = parsed.reactionsRobo ?? 0;
    statsGlobales.maxNotesComposition = parsed.maxNotesComposition ?? 0;
    statsGlobales.debloqués = parsed.debloqués ?? parsed.debloques ?? {};
    statsGlobales.nbAchievementsDebloques = Object.keys(statsGlobales.debloqués).length;
    statsGlobales.decorationsActives = parsed.decorationsActives ?? [];
    statsGlobales.meteosPartieActuelle = new Set();
    statsGlobales.meteosVues = new Set(parsed.meteosVues || []);
}

/** @param {Record<string, any>} parsed @param {ReturnType<typeof creerStatsVides>} base */
function _restaurerStatsModes(parsed, base) {
    statsGlobales.oraclePartiesJouees = parsed.oraclePartiesJouees ?? 0;
    statsGlobales.oracleMeilleuresMult = parsed.oracleMeilleuresMult ?? 1.0;
    statsGlobales.oracleTotalDeviations = parsed.oracleTotalDeviations ?? 0;
    statsGlobales.oracleDeviationsPartieActuelle = 0;
    statsGlobales.lignesCoopTotal = parsed.lignesCoopTotal ?? 0;
    statsGlobales.coopMaxLignesUnCoup = parsed.coopMaxLignesUnCoup ?? 0;
    statsGlobales.archiScoreTotal = parsed.archiScoreTotal ?? base.archiScoreTotal;
    statsGlobales.archiNiveauxCompletes = new Set(parsed.archiNiveauxCompletes || []);
    statsGlobales.archiEtoilesMax = parsed.archiEtoilesMax ?? base.archiEtoilesMax;
    statsGlobales.archiEtoilesParNiveau = parsed.archiEtoilesParNiveau ?? {};
    statsGlobales.archiPrecisionMax = parsed.archiPrecisionMax ?? base.archiPrecisionMax;
    statsGlobales.archiParAtteint = parsed.archiParAtteint ?? base.archiParAtteint;
    statsGlobales.evenementsVivantSubis =
        parsed.evenementsVivantSubis ?? base.evenementsVivantSubis;
    statsGlobales.maxEvenementsUnePartie =
        parsed.maxEvenementsUnePartie ?? base.maxEvenementsUnePartie;
    statsGlobales.biomesVivantSubis = new Set(parsed.biomesVivantSubis || []);
    statsGlobales.lignesPendantVivant = parsed.lignesPendantVivant ?? base.lignesPendantVivant;
}

/** @param {Record<string, any>} parsed */
function _restaurerStatsHistoire(parsed) {
    statsGlobales.bossHistoireVaincus = parsed.bossHistoireVaincus ?? [];
    statsGlobales.journauxHistoire = parsed.journauxHistoire ?? [];
    statsGlobales.toutesFinHistoire = parsed.toutesFinHistoire ?? [];
    statsGlobales.mondesHistoireCompletes = parsed.mondesHistoireCompletes ?? [];
    statsGlobales.mondesCachesDebloques = parsed.mondesCachesDebloques ?? [];
}

function _fusionnerProgressionHistoire() {
    const etatHist = chargerEtatHistoire();
    statsGlobales.mondesHistoireCompletes = [
        ...new Set([...statsGlobales.mondesHistoireCompletes, ...(etatHist.mondesCompletes ?? [])]),
    ];
    statsGlobales.mondesCachesDebloques = [
        ...new Set([
            ...statsGlobales.mondesCachesDebloques,
            ...(etatHist.mondesCachesDebloques ?? []),
        ]),
    ];
}

export function chargerStats() {
    try {
        /** @type {Record<string, any> | null} */
        const parsed = lireStockageJson(CLE_STATS, null);
        if (!parsed || typeof parsed !== 'object') return;
        _restaurerStatsJeu(parsed, creerStatsVides());
        _restaurerStatsModes(parsed, creerStatsVides());
        _restaurerStatsHistoire(parsed);
        _fusionnerProgressionHistoire();
    } catch (err) {
        logger.warn('Erreur chargement stats achievements:', err);
    }
}

export function reinitialiserStatsGlobales() {
    const vide = creerStatsVides();
    for (const [cle, valeur] of Object.entries(vide)) {
        if (valeur instanceof Set) {
            statsGlobales[cle] = new Set();
        } else if (Array.isArray(valeur)) {
            statsGlobales[cle] = [...valeur];
        } else if (typeof valeur === 'object' && valeur !== null) {
            statsGlobales[cle] = structuredClone(valeur);
        } else {
            statsGlobales[cle] = valeur;
        }
    }
    try {
        localStorage.removeItem(CLE_STATS);
    } catch {
        /* ignore */
    }
    sauvegarderStats();
}

export function sauvegarderStats() {
    try {
        const toSave = {
            lignesTotal: statsGlobales.lignesTotal,
            meilleurScore: statsGlobales.meilleurScore,
            meilleurTemps: statsGlobales.meilleurTemps,
            maxLignesUnCoup: statsGlobales.maxLignesUnCoup,
            maxCombo: statsGlobales.maxCombo,
            biomesJoues: [...statsGlobales.biomesJoues],
            meilleurTempsParBiome: statsGlobales.meilleurTempsParBiome,
            lignesParBiome: statsGlobales.lignesParBiome,
            reliquesUtilisees: statsGlobales.reliquesUtilisees,
            typesReliquesUtilises: [...statsGlobales.typesReliquesUtilises],
            meteosSubies: statsGlobales.meteosSubies,
            meteosVues: [...statsGlobales.meteosVues],
            reactionsRobo: statsGlobales.reactionsRobo,
            maxNotesComposition: statsGlobales.maxNotesComposition,
            nbAchievementsDebloques: statsGlobales.nbAchievementsDebloques,
            debloqués: statsGlobales.debloqués,
            decorationsActives: statsGlobales.decorationsActives,
            oraclePartiesJouees: statsGlobales.oraclePartiesJouees,
            oracleMeilleuresMult: statsGlobales.oracleMeilleuresMult,
            oracleTotalDeviations: statsGlobales.oracleTotalDeviations,
            lignesCoopTotal: statsGlobales.lignesCoopTotal,
            coopMaxLignesUnCoup: statsGlobales.coopMaxLignesUnCoup,
            archiScoreTotal: statsGlobales.archiScoreTotal,
            archiNiveauxCompletes: [...statsGlobales.archiNiveauxCompletes],
            archiEtoilesMax: statsGlobales.archiEtoilesMax,
            archiEtoilesParNiveau: statsGlobales.archiEtoilesParNiveau,
            archiPrecisionMax: statsGlobales.archiPrecisionMax,
            archiParAtteint: statsGlobales.archiParAtteint,
            evenementsVivantSubis: statsGlobales.evenementsVivantSubis,
            maxEvenementsUnePartie: statsGlobales.maxEvenementsUnePartie,
            biomesVivantSubis: [...statsGlobales.biomesVivantSubis],
            lignesPendantVivant: statsGlobales.lignesPendantVivant,
            bossHistoireVaincus: statsGlobales.bossHistoireVaincus,
            journauxHistoire: statsGlobales.journauxHistoire,
            toutesFinHistoire: statsGlobales.toutesFinHistoire,
            mondesHistoireCompletes: statsGlobales.mondesHistoireCompletes,
            mondesCachesDebloques: statsGlobales.mondesCachesDebloques,
        };
        ecrireStockageJson(CLE_STATS, toSave);
    } catch (err) {
        logger.warn('Erreur sauvegarde stats achievements:', err);
    }
}
