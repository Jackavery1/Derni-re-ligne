import { copierRapportErreurs } from './logger.js';
import { configurerConstellation } from './constellation.js';
import { configurerMeteo } from './meteo.js';
import { configurerReliques } from './reliques.js';
import { AudioMoteur, configurerAudioMoteur } from './audio.js';
import {
    ecrireStockage,
    sauvegarderBiomeActif,
    obtenirRecordBiome,
    obtenirRecordNiveauBiome,
    calculerEtoiles,
    formaterEtoiles,
    biomeEstDebloque,
    migrerClesLocalStorage,
} from './progression.js';
import { etat, definirBiomeActif, obtenirBiomeActif, obtenirNiveauGlobal } from './store-jeu.js';
import { obtenirForme, lierCouleursTetrominos } from './piece-jeu.js';
import { creerParticulesExplosion } from './particules-jeu.js';
import { initialiserCanvas, demarrerJeu } from './partie.js';
import { initialiserEffetsPartie } from './effets-partie.js';
import { mettreAJourBoutonsMute } from './options-ui.js';
import { demarrerCooperatif } from './coop-jeu.js';
import { coopEstPrefere } from './coop-logique.js';
import { appliquerThemeBiome } from './ecrans-ui.js';

export function initialiserSystemesMoteur() {
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

    document.getElementById('btn-copier-rapport-erreur')?.addEventListener('click', async () => {
        const btn = document.getElementById('btn-copier-rapport-erreur');
        try {
            const ok = await copierRapportErreurs();
            if (ok && btn) {
                btn.textContent = 'COPIE !';
                setTimeout(() => {
                    btn.textContent = 'COPIER RAPPORT';
                }, 2000);
            }
        } catch {
            /* clipboard refusé ou indisponible */
        }
    });

    configurerAudioMoteur({
        obtenirBiomeActif,
        obtenirNiveau: () => etat.niveau,
        ecrireStockage,
        onMuteChange: mettreAJourBoutonsMute,
    });

    if (!initialiserCanvas()) return false;

    lierCouleursTetrominos();

    configurerConstellation({
        obtenirNiveauGlobal,
        obtenirBiomeActif,
        definirBiomeActif,
        sauvegarderBiomeActif,
        obtenirRecordBiome,
        obtenirRecordNiveauBiome,
        calculerEtoiles,
        formaterEtoiles,
        biomeEstDebloque,
        appliquerThemeBiome,
        demarrerJeu,
        demarrerCooperatif,
        modeCoopEstActif: coopEstPrefere,
        sonMenu: (type) => AudioMoteur.son(type),
        ouvrirHistoireVersMonde: (mondeId) => {
            void import('./histoire-navigation.js').then(({ definirMondeCibleCarte }) => {
                definirMondeCibleCarte(mondeId);
                void import('./histoire-intro.js').then(({ ouvrirModeHistoireDepuisMenu }) =>
                    ouvrirModeHistoireDepuisMenu()
                );
            });
        },
    });

    return true;
}
