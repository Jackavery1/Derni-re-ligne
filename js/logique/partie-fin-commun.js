/** Pipeline partagé de fin de partie (solo et coop). */
import { finaliserStatsPartie } from '../achievements.js';
import { sauvegarderSnapshotProfil } from '../ui/profil-jeu.js';
import { obtenirTempsEcoule } from '../ui/ecrans-ui.js';
import { annoncer } from '../ui/annonces.js';

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
    void import('../codex.js').then((m) => m.planifierVerifierCodex());
    annoncer(victoire ? annonceVictoire : annonceDefaite);
}
