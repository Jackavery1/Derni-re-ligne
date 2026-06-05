import { BIOMES } from './config.js';
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
} from './progression.js';
import { Registre } from './registre-jeu.js';
import {
    etat,
    biomeActif,
    niveauGlobal,
    definirBiomeActif,
    ECRANS,
    ecranActuel,
} from './contexte-jeu.js';
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

export { ecranActuel };

Registre.planifierBoucle = planifierBoucle;
Registre.terminerPartie = terminerPartie;
Registre.demarrerJeu = demarrerJeu;
Registre.basculerPause = basculerPause;
Registre.confirmerRecommencer = confirmerRecommencer;
Registre.quitterVersMenu = quitterVersMenu;
Registre.deplacerGauche = deplacerGauche;
Registre.deplacerDroite = deplacerDroite;
Registre.deplacerBas = deplacerBas;
Registre.chuteRapide = chuteRapide;
Registre.tourner = tourner;
Registre.utiliserReserve = utiliserReserve;

/** Initialise le jeu : canvas, audio, constellation, UI et boucle principale. */
export function initialiserApplication() {
    configurerMeteo({
        obtenirEtat: () => etat,
        obtenirBiomeActif: () => biomeActif,
        creerParticulesExplosion,
    });
    configurerReliques({
        obtenirEtat: () => etat,
        obtenirBiomeActif: () => biomeActif,
        obtenirForme,
        creerParticulesExplosion,
    });

    document.getElementById('btn-recharger-erreur')?.addEventListener('click', () => {
        window.location.reload();
    });

    configurerAudioMoteur({
        obtenirTempo: () => {
            const base = BIOMES[biomeActif]?.musique?.tempo ?? 120;
            return base + (etat.niveau - 1) * 4;
        },
        ecrireStockage,
        onMuteChange: mettreAJourBoutonsMute,
    });
    if (!initialiserCanvas()) return;
    adapterInterface();
    initialiserLayout();
    lierCouleursTetrominos();
    chargerProgression();
    configurerConstellation({
        obtenirNiveauGlobal: () => niveauGlobal,
        obtenirBiomeActif: () => biomeActif,
        definirBiomeActif: (id) => {
            definirBiomeActif(id);
        },
        sauvegarderBiomeActif,
        obtenirRecordBiome,
        calculerEtoiles,
        formaterEtoiles,
        biomeEstDebloque,
        appliquerThemeBiome,
        demarrerJeu,
        sonMenu: (type) => AudioMoteur.son(type),
    });
    appliquerThemeBiome(biomeActif);
    appliquerThemeMascotte();
    mettreAJourAffichageRecord();
    initPiecesFond();
    initialiserOptions();
    initialiserInput();
    initialiserBoutons();
    afficherEcran(ECRANS.TITRE);
    planifierBoucle();
}
