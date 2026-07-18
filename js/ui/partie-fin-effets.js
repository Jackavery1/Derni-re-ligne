import { AudioMoteur } from '../audio/audio.js';
import { afficherMelodieGameOver } from '../audio/melodie.js';
import { vibrerFinPartie } from '../audio/haptique.js';
import { jouerSfxMortPartie } from '../audio/sfx-mort-partie.js';
import { ecouter } from '../etat/bus-jeu.js';
import { ECRANS } from '../etat/store-jeu.js';
import { planifierBoucle } from '../rendu/boucle-jeu.js';
import { DELAI_GAME_OVER_MS } from '../logique/partie-fin-constantes.js';
import { annoncer } from './annonces.js';
import { sauvegarderSnapshotProfil } from './profil-jeu.js';
import {
    appliquerHumeurMascotte,
    reagirRoboGameOver,
    afficherEcran,
    mettreAJourAffichageRecord,
} from './ecrans-ui.js';
import {
    appliquerStatsOracleFinPartie,
    remplirEcranGameOver,
    afficherActionsFinHistoire,
} from './partie-fin-ecran-go.js';

let _initialise = false;
/** @type {(() => void)[]} */
let _desabonnements = [];

/**
 * Branche les effets UI/audio de fin de partie sur le bus.
 * Appelé une fois au démarrage moteur.
 */
export function initialiserPartieFinEffets() {
    if (_initialise) return;
    _initialise = true;

    _desabonnements.push(
        ecouter('partie:finale-commune', (payload) => {
            const {
                lignes = 0,
                biomeId = 'classique',
                annonce = 'Partie terminee',
            } = payload ?? {};
            sauvegarderSnapshotProfil(lignes, biomeId);
            annoncer(annonce);
        })
    );

    _desabonnements.push(
        ecouter('partie:finie', (payload) => {
            const {
                victoire = false,
                immediat = false,
                titreGo = '',
                scoreFinal = 0,
                nouveauRecord = false,
            } = payload ?? {};

            AudioMoteur.arreterMusique(200);
            if (victoire) appliquerHumeurMascotte('excite');
            else reagirRoboGameOver();

            if (victoire) {
                setTimeout(() => AudioMoteur.son('niveau'), 250);
            } else {
                jouerSfxMortPartie();
            }
            vibrerFinPartie(victoire);

            const elTitre = document.querySelector('#ecran-game-over .go-titre');
            if (elTitre && titreGo) elTitre.textContent = titreGo;

            appliquerStatsOracleFinPartie(scoreFinal);
            mettreAJourAffichageRecord();
            remplirEcranGameOver(scoreFinal, nouveauRecord);
            afficherActionsFinHistoire(victoire);

            const montrerGameOver = () => {
                afficherEcran(ECRANS.GAME_OVER);
                planifierBoucle();
            };
            if (immediat) montrerGameOver();
            else setTimeout(montrerGameOver, DELAI_GAME_OVER_MS);

            setTimeout(() => afficherMelodieGameOver(), 400);
        })
    );
}

/** @internal tests */
export function _reinitialiserPartieFinEffetsPourTests() {
    for (const off of _desabonnements) off();
    _desabonnements = [];
    _initialise = false;
}
