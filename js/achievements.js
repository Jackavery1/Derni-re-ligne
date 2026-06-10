import { logger } from './logger.js';
import {
    lireStockageJson,
    ecrireStockageJson,
    chargerEtatHistoire,
    sauvegarderEtatHistoire,
} from './progression.js';
import { store } from './store-core.js';
import { obtenirBiomeActif } from './store-jeu.js';
import { melodie } from './melodie.js';
import { creerFileNotifications } from './notifications-file.js';
import { reinitialiserStatsAchievementsHistoire } from './achievements-histoire.js';
import { ACHIEVEMENTS } from './achievements-donnees.js';
import { sansAccentsE } from './texte-jeu.js';
import { modeHistoireEnCours } from './mode-histoire.js';
import { rendreIconeSurCanvas, rendreIconeGlitchSurCanvas } from './icones-pixel.js';
import {
    obtenirIdIconeAchievement,
    obtenirAccentCategorie,
    obtenirAccentFiltre,
    obtenirTexteVerrouille,
} from './achievements-icones-map.js';

export { ACHIEVEMENTS };

function creerStatsVides() {
    return {
        lignesTotal: 0,
        meilleurScore: 0,
        meilleurTemps: 0,
        maxLignesUnCoup: 0,
        maxCombo: 0,
        biomesJoues: new Set(),
        meilleurTempsParBiome: {},
        lignesParBiome: {},
        reliquesUtilisees: 0,
        typesReliquesUtilises: new Set(),
        meteosSubies: 0,
        meteosPartieActuelle: new Set(),
        meteosVues: new Set(),
        reactionsRobo: 0,
        maxNotesComposition: 0,
        nbAchievementsDebloques: 0,
        debloqués: {},
        decorationsActives: [],
        oraclePartiesJouees: 0,
        oracleMeilleuresMult: 1.0,
        oracleTotalDeviations: 0,
        oracleDeviationsPartieActuelle: 0,
        lignesCoopTotal: 0,
        coopMaxLignesUnCoup: 0,
        archiScoreTotal: 0,
        archiNiveauxCompletes: new Set(),
        archiEtoilesMax: 0,
        archiEtoilesParNiveau: {},
        archiPrecisionMax: 0,
        archiParAtteint: 0,
        evenementsVivantSubis: 0,
        maxEvenementsUnePartie: 0,
        biomesVivantSubis: new Set(),
        lignesPendantVivant: 0,
        bossHistoireVaincus: [],
        journauxHistoire: [],
        toutesFinHistoire: [],
        mondesHistoireCompletes: [],
        mondesCachesDebloques: [],
    };
}

export const statsGlobales = creerStatsVides();

const fileAchievements = creerFileNotifications({
    /** @param {{ icone: string, nom: string, description: string }} ach @param {() => void} terminer */
    afficher(ach, terminer) {
        const notif = document.getElementById('notif-achievement');
        if (!notif) return false;
        const icone = document.getElementById('ach-icone');
        const nom = document.getElementById('ach-nom');
        const desc = document.getElementById('ach-description');
        if (icone) icone.textContent = ach.icone;
        if (nom) nom.textContent = sansAccentsE(ach.nom);
        if (desc) desc.textContent = sansAccentsE(ach.description);
        notif.classList.add('visible');
        setTimeout(() => {
            notif.classList.remove('visible');
            setTimeout(terminer, 600);
        }, 3500);
    },
});

const CLE_STATS = 'derniereLigne_statsGlobales';

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
    // Recalculé depuis la source de vérité pour éviter toute désynchronisation.
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

/** @param {Record<string, any>} parsed @param {ReturnType<typeof creerStatsVides>} base */
function _restaurerStatsPersistees(parsed, base) {
    _restaurerStatsJeu(parsed, base);
    _restaurerStatsModes(parsed, base);
    _restaurerStatsHistoire(parsed);
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
        _restaurerStatsPersistees(parsed, creerStatsVides());
        _fusionnerProgressionHistoire();
    } catch (err) {
        logger.warn('Erreur chargement stats achievements:', err);
    }
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

export function genererGalerieAchievements() {
    if (typeof document === 'undefined') return;
    const grille = document.getElementById('ach-galerie-grille');
    if (!grille) return;
    grille.textContent = '';

    const nb = Object.keys(statsGlobales.debloqués).length;
    const total = Object.keys(ACHIEVEMENTS).length;
    const compteur = document.getElementById('ach-compteur');
    if (compteur) compteur.textContent = `${nb} / ${total} EXPLOITS GRAVES`;

    for (const [, ach] of Object.entries(ACHIEVEMENTS)) {
        const debloque = !!statsGlobales.debloqués[ach.id];
        const categorie = ach.categorie ?? 'general';
        const accent = obtenirAccentCategorie(categorie);
        const idIcone = obtenirIdIconeAchievement(ach.id, categorie);
        const carte = document.createElement('div');
        carte.className = `ach-carte panneau-meta ${debloque ? 'debloque' : 'verrouille'}`;
        carte.dataset.categorie = categorie;
        carte.dataset.id = ach.id;
        carte.style.setProperty('--accent-carte', accent);

        const iconeEl = document.createElement('canvas');
        iconeEl.className = 'ach-carte-icone';
        iconeEl.width = 64;
        iconeEl.height = 64;
        iconeEl.setAttribute('aria-hidden', 'true');
        if (debloque) {
            rendreIconeSurCanvas(iconeEl, idIcone);
        } else {
            rendreIconeGlitchSurCanvas(iconeEl, idIcone, { accent, seedId: ach.id });
        }

        const nomEl = document.createElement('div');
        nomEl.className = 'ach-carte-nom';
        nomEl.textContent = sansAccentsE(debloque ? ach.nom : '???');

        const descEl = document.createElement('div');
        descEl.className = 'ach-carte-desc';
        descEl.textContent = sansAccentsE(
            debloque ? ach.description : obtenirTexteVerrouille(categorie, ach.description)
        );

        carte.append(iconeEl, nomEl, descEl);

        if (debloque) {
            const d = new Date(statsGlobales.debloqués[ach.id]);
            const dateEl = document.createElement('div');
            dateEl.className = 'ach-carte-date';
            dateEl.textContent = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
            carte.appendChild(dateEl);
        }

        grille.appendChild(carte);
    }

    const btnsFiltres = document.querySelectorAll('.ach-filtre-btn');
    btnsFiltres.forEach((btn) => {
        if (!(btn instanceof HTMLElement) || btn.dataset.filtreInit === '1') return;
        btn.dataset.filtreInit = '1';
        const filtreDefaut = btn.dataset.filtre ?? 'tous';
        if (btn.classList.contains('actif')) {
            btn.style.setProperty('--accent-filtre', obtenirAccentFiltre(filtreDefaut));
        }
        btn.addEventListener('click', () => {
            btnsFiltres.forEach((b) => {
                b.classList.remove('actif');
                if (b instanceof HTMLElement) b.style.removeProperty('--accent-filtre');
            });
            btn.classList.add('actif');
            const filtre = btn.dataset.filtre ?? 'tous';
            btn.style.setProperty('--accent-filtre', obtenirAccentFiltre(filtre));
            document.querySelectorAll('.ach-carte').forEach((el) => {
                const carte = /** @type {HTMLElement} */ (el);
                const cat = carte.dataset.categorie ?? '';
                let visible = false;
                if (filtre === 'tous') visible = true;
                else if (filtre === 'histoire') visible = cat.startsWith('histoire');
                else visible = cat === filtre;
                carte.classList.toggle('ach-carte-filtre-masque', !visible);
            });
        });
    });
}
