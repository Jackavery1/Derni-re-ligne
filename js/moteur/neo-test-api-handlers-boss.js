import { store } from '../etat/store-jeu.js';
import { endommagerBossCombat, verifierPhaseBoss } from '../logique/boss-combat.js';
import { obtenirExpressionBossCombat } from '../histoire/reactions-boss-portrait.js';
import { choisirAttaqueCombinaison } from '../logique/boss-attaques.js';

export function creerHandlersBoss() {
    return {
        obtenirExpressionBossCombat: () => obtenirExpressionBossCombat(),
        obtenirPvBossCombat: () => {
            const boss = store.histoire.boss.actif;
            if (!boss) return null;
            return {
                pv: store.histoire.boss.pv,
                pvMax: boss.pvMax,
                vaincu: store.histoire.boss.vaincu,
            };
        },
        endommagerBossTest: (nbLignes = 1) => {
            endommagerBossCombat(nbLignes);
            verifierPhaseBoss();
            return obtenirExpressionBossCombat();
        },
        simulerTiragesAttaqueCombinaison: (tirages = 50) => {
            const disponibles = ['rangee_braise', 'colonne_gelee', 'inverser_controles'];
            let derniere = null;
            let repetitionsConsecutives = 0;
            for (let i = 0; i < tirages; i++) {
                const type = choisirAttaqueCombinaison(disponibles, derniere);
                if (type === derniere) repetitionsConsecutives++;
                derniere = type;
            }
            return { repetitionsConsecutives, tirages };
        },
    };
}
