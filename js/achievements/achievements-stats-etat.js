import { creerFileNotifications } from '../ui/notifications-file.js';
import { sansAccentsE } from '../logique/texte-jeu.js';
import { rendreIconeSurCanvas } from '../rendu/icones-pixel.js';
import { obtenirIdIconeAchievement } from '../achievements-icones-map.js';

export function creerStatsVides() {
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

export const fileAchievements = creerFileNotifications({
    /** @param {{ icone: string, nom: string, description: string }} ach @param {() => void} terminer */
    afficher(ach, terminer) {
        const notif = document.getElementById('notif-achievement');
        if (!notif) return false;
        const icone = document.getElementById('ach-notif-icone');
        const nom = document.getElementById('ach-nom');
        const desc = document.getElementById('ach-description');
        if (icone instanceof HTMLCanvasElement) {
            rendreIconeSurCanvas(icone, obtenirIdIconeAchievement(ach.id, ach.categorie));
        }
        if (nom) nom.textContent = sansAccentsE(ach.nom);
        if (desc) desc.textContent = sansAccentsE(ach.description);
        notif.classList.add('visible');
        setTimeout(() => {
            notif.classList.remove('visible');
            setTimeout(terminer, 600);
        }, 3500);
    },
});

export const CLE_STATS = 'derniereLigne_statsGlobales';
