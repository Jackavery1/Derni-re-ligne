import { chargerEtatHistoire, sauvegarderEtatHistoire } from './io/progression.js';
import { store, obtenirBiomeActif } from './etat/store-jeu.js';
import { melodie } from './audio/melodie.js';
import { reinitialiserStatsAchievementsHistoire } from './achievements-histoire.js';
import { ACHIEVEMENTS } from './achievements-donnees.js';
import { modeHistoireEnCours } from './etat/mode-histoire.js';
import { fileAchievements, statsGlobales } from './achievements-stats-etat.js';
import { sauvegarderStats } from './achievements-stats-persistance.js';

export function initStatsPartie() {
    statsGlobales.biomesJoues.add(obtenirBiomeActif());
    statsGlobales.meteosPartieActuelle = new Set();
    statsGlobales.oracleDeviationsPartieActuelle = 0;
    if (modeHistoireEnCours()) {
        reinitialiserStatsAchievementsHistoire();
    }
}

export function majStatsLignesEffacees(nbSupprimees) {
    if (nbSupprimees <= 0) return;
    statsGlobales.lignesTotal += nbSupprimees;
    const biomeActif = obtenirBiomeActif();
    statsGlobales.lignesParBiome[biomeActif] =
        (statsGlobales.lignesParBiome[biomeActif] || 0) + nbSupprimees;
}

export function majStatsScorePartie(nbLignes, comboActuel) {
    if (nbLignes > statsGlobales.maxLignesUnCoup) {
        statsGlobales.maxLignesUnCoup = nbLignes;
    }
    if (nbLignes > 0 && comboActuel > statsGlobales.maxCombo) {
        statsGlobales.maxCombo = comboActuel;
    }
}

export function majStatsRelique(effet) {
    statsGlobales.reliquesUtilisees++;
    if (effet) statsGlobales.typesReliquesUtilises.add(effet);
}

export function majStatsMeteo(effet) {
    statsGlobales.meteosSubies++;
    if (effet) {
        statsGlobales.meteosPartieActuelle.add(effet);
        statsGlobales.meteosVues.add(effet);
    }
}

export function majStatsReactionRobo(humeur) {
    if (humeur !== 'neutre') statsGlobales.reactionsRobo++;
}

export function finaliserStatsPartie(score, tempsSecondes) {
    if (tempsSecondes > statsGlobales.meilleurTemps) {
        statsGlobales.meilleurTemps = tempsSecondes;
    }
    const biome = obtenirBiomeActif();
    if (tempsSecondes > (statsGlobales.meilleurTempsParBiome[biome] || 0)) {
        statsGlobales.meilleurTempsParBiome[biome] = tempsSecondes;
    }
    if (score > statsGlobales.meilleurScore) {
        statsGlobales.meilleurScore = score;
    }
    if (melodie.notes.length > statsGlobales.maxNotesComposition) {
        statsGlobales.maxNotesComposition = melodie.notes.length;
    }
    if (modeHistoireEnCours()) {
        const etatHist = store.histoire.etat ?? chargerEtatHistoire();
        if (etatHist?.finObtenue) {
            if (!etatHist.toutesFinObtenues) etatHist.toutesFinObtenues = [];
            if (!etatHist.toutesFinObtenues.includes(etatHist.finObtenue)) {
                etatHist.toutesFinObtenues.push(etatHist.finObtenue);
                sauvegarderEtatHistoire(etatHist);
                store.histoire.etat = etatHist;
                statsGlobales.toutesFinHistoire = [...etatHist.toutesFinObtenues];
            }
        }
    }
    verifierAchievements();
    sauvegarderStats();
}

export function verifierAchievements() {
    let nouveaux = 0;
    for (const [, ach] of Object.entries(ACHIEVEMENTS)) {
        if (statsGlobales.debloqués[ach.id]) continue;
        if (!ach.condition(statsGlobales)) continue;
        statsGlobales.debloqués[ach.id] = Date.now();
        statsGlobales.nbAchievementsDebloques++;
        if (!statsGlobales.decorationsActives.includes(ach.decoration)) {
            statsGlobales.decorationsActives.push(ach.decoration);
        }
        fileAchievements.ajouter(ach);
        nouveaux++;
    }
    if (nouveaux > 0) sauvegarderStats();
}
