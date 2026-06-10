/** Pipeline partagé de fin de partie (solo et coop). */
import { finaliserStatsPartie } from './achievements.js';
import { verifierCodex } from './codex.js';
import { sauvegarderSnapshotProfil } from './profil-jeu.js';
import { obtenirTempsEcoule } from './ecrans-ui.js';
import { annoncer } from './annonces.js';

/**
 * @param {{ score: number, lignes: number, biomeId: string, victoire?: boolean, annonceVictoire?: string, annonceDefaite?: string }} opts
 */
export function finaliserPartieCommune(opts) {
    const {
        score,
        lignes,
        biomeId,
        victoire = false,
        annonceVictoire = 'Victoire',
        annonceDefaite = 'Partie terminee',
    } = opts;
    const tempsPartie = Math.floor(obtenirTempsEcoule() / 1000);
    sauvegarderSnapshotProfil(lignes, biomeId);
    finaliserStatsPartie(score, tempsPartie);
    void verifierCodex();
    annoncer(victoire ? annonceVictoire : annonceDefaite);
}
