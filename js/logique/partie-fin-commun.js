/** Pipeline partagé de fin de partie (solo et coop) — sans dépendances UI. */
import { obtenirTempsEcoule } from './temps-partie.js';
import { emettre } from '../etat/bus-jeu.js';
import { finaliserStatsPartie } from '../achievements.js';

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
    finaliserStatsPartie(score, tempsPartie);
    void import('../codex.js').then((m) => m.planifierVerifierCodex());
    emettre('partie:finale-commune', {
        lignes,
        biomeId,
        victoire,
        annonce: victoire ? annonceVictoire : annonceDefaite,
    });
}
