import { copierRapportErreurs } from './logger.js';
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
import { mettreAJourBoutonsMute } from './options-mute-ui.js';
import { coopEstPrefere } from './coop-preference.js';
import { appliquerThemeBiome } from './ecrans-ui.js';
import { initialiserHaptique } from './haptique.js';
import { appliquerControlesTactilesDepuisStockage } from './controles-tactiles.js';
import { enregistrerPlanificateurPushCloud } from './progression-stockage.js';

function initialiserSyncCloudDiffere() {
    void import('./progression-sync-cloud.js').then(
        ({ initialiserSyncCloud, synchroniserCloudAuDemarrage, planifierPushCloud }) => {
            enregistrerPlanificateurPushCloud(planifierPushCloud);
            initialiserSyncCloud();
            const lancerSyncCloud = () => void synchroniserCloudAuDemarrage();
            if (typeof requestIdleCallback === 'function') {
                requestIdleCallback(lancerSyncCloud, { timeout: 4000 });
            } else {
                setTimeout(lancerSyncCloud, 0);
            }
        }
    );
}

export function initialiserSystemesMoteur() {
    migrerClesLocalStorage();
    initialiserHaptique();
    appliquerControlesTactilesDepuisStockage();
    initialiserSyncCloudDiffere();
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

    void import('./constellation.js').then(({ configurerConstellation }) =>
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
            demarrerCooperatif: () => {
                void import('./coop-jeu.js').then(({ demarrerCooperatif }) => demarrerCooperatif());
            },
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
        })
    );

    return true;
}
