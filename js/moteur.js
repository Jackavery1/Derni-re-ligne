import { configurerConstellation } from './constellation.js';
import { configurerMeteo } from './meteo.js';
import { configurerReliques } from './reliques.js';
import { AudioMoteur, configurerAudioMoteur } from './audio.js';
import {
    ecrireStockage,
    sauvegarderBiomeActif,
    obtenirRecordBiome,
    calculerEtoiles,
    formaterEtoiles,
    biomeEstDebloque,
    migrerClesLocalStorage,
} from './progression.js';
import { configurerActionsJeu } from './actions-jeu.js';
import {
    etat,
    definirBiomeActif,
    ECRANS,
    obtenirBiomeActif,
    obtenirNiveauGlobal,
    obtenirEcranActuel,
} from './store-jeu.js';
import { obtenirForme, lierCouleursTetrominos } from './piece-jeu.js';
import { creerParticulesExplosion } from './particules-jeu.js';
import { planifierBoucle } from './boucle-jeu.js';
import {
    afficherEcran,
    appliquerThemeBiome,
    appliquerThemeMascotte,
    mettreAJourAffichageRecord,
    chargerProgression,
} from './ecrans-ui.js';
import {
    demarrerJeu,
    basculerPause,
    terminerPartie,
    confirmerRecommencer,
    quitterVersMenu,
    initialiserCanvas,
} from './partie.js';
import {
    deplacerGauche,
    deplacerDroite,
    deplacerBas,
    chuteRapide,
    tourner,
    utiliserReserve,
} from './logique-partie.js';
import { initPiecesFond } from './menu-fond.js';
import { initialiserOptions, mettreAJourBoutonsMute } from './options-ui.js';
import { initialiserBoutons } from './ui-init.js';
import { initialiserInput } from './input-jeu.js';
import { adapterInterface, initialiserLayout } from './layout-jeu.js';
import { chargerStats } from './achievements.js';
import { demarrerCooperatif, modeCoopActif } from './coop-jeu.js';
import { initialiserInputCoop } from './coop-input.js';
import { initialiserInputArchi } from './archi-input.js';
import { rechargerCodex, initialiserCodexUI } from './codex.js';
import { initialiserEffetsPartie } from './effets-partie.js';
import { rafraichirEtatHistoire } from './histoire-manager.js';

export { obtenirEcranActuel as ecranActuel };

configurerActionsJeu({
    planifierBoucle,
    terminerPartie,
    demarrerJeu,
    basculerPause,
    confirmerRecommencer,
    quitterVersMenu,
    deplacerGauche,
    deplacerDroite,
    deplacerBas,
    chuteRapide,
    tourner,
    utiliserReserve,
});

/** Initialise le jeu : canvas, audio, constellation, UI et boucle principale. */
export function initialiserApplication() {
    migrerClesLocalStorage();
    initialiserEffetsPartie();
    configurerMeteo({
        obtenirEtat: () => etat,
        obtenirBiomeActif,
        creerParticulesExplosion,
    });
    configurerReliques({
        obtenirEtat: () => etat,
        obtenirBiomeActif,
        obtenirForme,
        creerParticulesExplosion,
    });

    document.getElementById('btn-recharger-erreur')?.addEventListener('click', () => {
        window.location.reload();
    });

    configurerAudioMoteur({
        obtenirBiomeActif,
        obtenirNiveau: () => etat.niveau,
        ecrireStockage,
        onMuteChange: mettreAJourBoutonsMute,
    });
    if (!initialiserCanvas()) return;
    chargerStats();
    rafraichirEtatHistoire();
    rechargerCodex();
    adapterInterface();
    initialiserLayout();
    lierCouleursTetrominos();
    chargerProgression();
    configurerConstellation({
        obtenirNiveauGlobal,
        obtenirBiomeActif,
        definirBiomeActif,
        sauvegarderBiomeActif,
        obtenirRecordBiome,
        calculerEtoiles,
        formaterEtoiles,
        biomeEstDebloque,
        appliquerThemeBiome,
        demarrerJeu,
        demarrerCooperatif,
        modeCoopEstActif: () => modeCoopActif,
        sonMenu: (type) => AudioMoteur.son(type),
    });
    appliquerThemeBiome(obtenirBiomeActif());
    appliquerThemeMascotte();
    mettreAJourAffichageRecord();
    initPiecesFond();
    initialiserOptions();
    initialiserInput();
    initialiserInputCoop();
    initialiserInputArchi();
    initialiserBoutons();
    initialiserCodexUI();
    afficherEcran(ECRANS.TITRE);
    planifierBoucle();
}
