import { lireStockage, ecrireStockage, chargerBiomeActif } from '../io/progression.js';
import { haptiqueActif, definirHaptiqueActif } from '../audio/haptique.js';
import {
    enchainementCampagneActif,
    definirEnchainementCampagneActif,
} from '../histoire/preferences-campagne.js';
import {
    controlesTactilesActifs,
    definirControlesTactilesActifs,
    appliquerControlesTactilesDepuisStockage,
} from '../logique/controles-tactiles.js';
import {
    obtenirSupabaseUrl,
    obtenirSupabaseAnonKey,
    obtenirOuCreerSyncId,
} from '../config/config-sync.js';
import { obtenirMixBiome, persisterMixBiome } from '../audio/audio-mix-biome.js';
import { initialiserSyncCloudOptions, mettreAJourUiSyncCloud } from './options-sync-cloud-ui.js';
import { initialiserSauvegardeProgression } from './options-progression-ui.js';
import { AudioMoteur } from '../audio/audio.js';
import { mettreAJourBoutonsMute } from './options-mute-ui.js';
import { obtenirInput, obtenirBouton } from '../logique/dom-utils.js';
import {
    chargerAccessibiliteDepuisStockage,
    obtenirDaltonien,
    obtenirReduireEffetsAccessibilite,
    obtenirConstellationClicSeul,
    persisterDaltonien,
    persisterReduireEffets,
    persisterConstellationClicSeul,
} from './accessibilite.js';
import {
    appliquerContrasteDepuisStockage,
    mettreAJourBoutonContraste,
    mettreAJourBoutonDaltonien,
    mettreAJourBoutonReduireEffets,
    mettreAJourBoutonConstellationClic,
    mettreAJourBoutonHaptique,
    mettreAJourBoutonControlesTactiles,
    mettreAJourBoutonEnchainementCampagne,
} from './options-boutons-toggles.js';
import { initialiserControlesOptions } from './options-controles-rebind.js';

export {
    appliquerContrasteDepuisStockage,
    mettreAJourBoutonContraste,
    mettreAJourBoutonDaltonien,
    mettreAJourBoutonReduireEffets,
    mettreAJourBoutonConstellationClic,
    mettreAJourBoutonHaptique,
    mettreAJourBoutonControlesTactiles,
    mettreAJourBoutonEnchainementCampagne,
} from './options-boutons-toggles.js';

export { mettreAJourBoutonsMute } from './options-mute-ui.js';
export { afficherOngletOptions } from './options-controles-rebind.js';

function hydraterOptionsDepuisStockage() {
    const vol = lireStockage('derniereLigne_volume', '1');
    const volMus = lireStockage('derniereLigne_volumeMusique', '1');
    const muet = lireStockage('derniereLigne_muet', 'false') === 'true';
    AudioMoteur.volumeEffets = parseFloat(vol) || 1;
    AudioMoteur.volumeMusique = parseFloat(volMus) || 1;
    AudioMoteur.muet = muet;
    appliquerContrasteDepuisStockage();
    appliquerControlesTactilesDepuisStockage();
    chargerAccessibiliteDepuisStockage();
}

function lierEcouteursAudioOptions(slider, sliderMus, btnMute) {
    slider?.addEventListener('input', (e) => {
        const cible = /** @type {HTMLInputElement} */ (e.target);
        AudioMoteur.reglerVolumeEffets(parseInt(cible.value, 10) / 100);
        ecrireStockage('derniereLigne_volume', AudioMoteur.volumeEffets.toString());
        AudioMoteur.son('deplacement');
    });

    sliderMus?.addEventListener('input', (e) => {
        const cible = /** @type {HTMLInputElement} */ (e.target);
        AudioMoteur.reglerVolumeMusique(parseInt(cible.value, 10) / 100);
        ecrireStockage('derniereLigne_volumeMusique', AudioMoteur.volumeMusique.toString());
    });

    btnMute?.addEventListener('click', () => AudioMoteur.basculerMute());
}

function lierEcouteursAccessibiliteOptions({
    btnContraste,
    btnDaltonien,
    btnReduireEffets,
    btnConstellationClic,
    btnHaptique,
    btnControlesTactiles,
    btnEnchainementCampagne,
}) {
    btnContraste?.addEventListener('click', () => {
        const actif = document.body.classList.toggle('contraste-eleve');
        ecrireStockage('derniereLigne_contraste', actif.toString());
        mettreAJourBoutonContraste(btnContraste);
    });

    btnDaltonien?.addEventListener('click', () => {
        const actif = !obtenirDaltonien();
        persisterDaltonien(actif);
        mettreAJourBoutonDaltonien(btnDaltonien);
    });

    btnReduireEffets?.addEventListener('click', () => {
        const actif = !obtenirReduireEffetsAccessibilite();
        persisterReduireEffets(actif);
        mettreAJourBoutonReduireEffets(btnReduireEffets);
    });

    btnConstellationClic?.addEventListener('click', () => {
        const actif = !obtenirConstellationClicSeul();
        persisterConstellationClicSeul(actif);
        mettreAJourBoutonConstellationClic(btnConstellationClic);
    });

    btnHaptique?.addEventListener('click', () => {
        definirHaptiqueActif(!haptiqueActif());
        mettreAJourBoutonHaptique(btnHaptique);
    });

    btnControlesTactiles?.addEventListener('click', () => {
        definirControlesTactilesActifs(!controlesTactilesActifs());
        mettreAJourBoutonControlesTactiles(btnControlesTactiles);
    });

    btnEnchainementCampagne?.addEventListener('click', () => {
        definirEnchainementCampagneActif(!enchainementCampagneActif());
        mettreAJourBoutonEnchainementCampagne(btnEnchainementCampagne);
    });
}

function lierEcouteursMixBiome(sliderMixMusBiome, sliderMixEffBiome) {
    sliderMixMusBiome?.addEventListener('input', (e) => {
        const cible = /** @type {HTMLInputElement} */ (e.target);
        const biomeId = chargerBiomeActif();
        persisterMixBiome(biomeId, { musique: parseInt(cible.value, 10) / 100 });
    });

    sliderMixEffBiome?.addEventListener('input', (e) => {
        const cible = /** @type {HTMLInputElement} */ (e.target);
        const biomeId = chargerBiomeActif();
        persisterMixBiome(biomeId, { effets: parseInt(cible.value, 10) / 100 });
        AudioMoteur.son('deplacement');
    });
}

export function initialiserOptions() {
    hydraterOptionsDepuisStockage();

    const slider = obtenirInput('slider-volume');
    const sliderMus = obtenirInput('slider-musique');
    const btnMute = obtenirBouton('btn-toggle-mute');
    const btnContraste = obtenirBouton('btn-toggle-contraste');
    const btnDaltonien = obtenirBouton('btn-toggle-daltonien');
    const btnReduireEffets = obtenirBouton('btn-toggle-reduire-effets');
    const btnHaptique = obtenirBouton('btn-toggle-haptique');
    const btnControlesTactiles = obtenirBouton('btn-toggle-controles-tactiles');
    const btnEnchainementCampagne = obtenirBouton('btn-toggle-enchainement-campagne');
    const btnSyncCloud = obtenirBouton('btn-toggle-sync-cloud');
    const btnSyncMaintenant = obtenirBouton('btn-sync-maintenant');
    const inputSupabaseUrl = obtenirInput('input-supabase-url');
    const inputSupabaseKey = obtenirInput('input-supabase-key');
    const inputSyncId = obtenirInput('input-sync-id');
    const btnCopierSyncId = obtenirBouton('btn-copier-sync-id');
    const sliderMixMusBiome = obtenirInput('slider-mix-musique-biome');
    const sliderMixEffBiome = obtenirInput('slider-mix-effets-biome');
    const btnConstellationClic = obtenirBouton('btn-toggle-constellation-clic');

    if (slider) slider.value = String(Math.round(AudioMoteur.volumeEffets * 100));
    if (sliderMus) sliderMus.value = String(Math.round(AudioMoteur.volumeMusique * 100));
    mettreAJourBoutonsMute();
    if (btnContraste) mettreAJourBoutonContraste(btnContraste);
    if (btnDaltonien) mettreAJourBoutonDaltonien(btnDaltonien);
    if (btnReduireEffets) mettreAJourBoutonReduireEffets(btnReduireEffets);
    if (btnConstellationClic) mettreAJourBoutonConstellationClic(btnConstellationClic);
    if (btnHaptique) mettreAJourBoutonHaptique(btnHaptique);
    if (btnControlesTactiles) mettreAJourBoutonControlesTactiles(btnControlesTactiles);
    if (btnEnchainementCampagne) mettreAJourBoutonEnchainementCampagne(btnEnchainementCampagne);
    if (inputSupabaseUrl) inputSupabaseUrl.value = obtenirSupabaseUrl();
    if (inputSupabaseKey) inputSupabaseKey.value = obtenirSupabaseAnonKey();
    if (inputSyncId) inputSyncId.value = obtenirOuCreerSyncId();
    mettreAJourUiSyncCloud();

    const biomeMix = chargerBiomeActif();
    const mix = obtenirMixBiome(biomeMix);
    if (sliderMixMusBiome) {
        sliderMixMusBiome.value = String(Math.round(mix.musique * 100));
    }
    if (sliderMixEffBiome) {
        sliderMixEffBiome.value = String(Math.round(mix.effets * 100));
    }

    lierEcouteursAudioOptions(slider, sliderMus, btnMute);
    lierEcouteursAccessibiliteOptions({
        btnContraste,
        btnDaltonien,
        btnReduireEffets,
        btnConstellationClic,
        btnHaptique,
        btnControlesTactiles,
        btnEnchainementCampagne,
    });

    initialiserSyncCloudOptions(
        btnSyncCloud,
        btnSyncMaintenant,
        inputSupabaseUrl,
        inputSupabaseKey,
        inputSyncId,
        btnCopierSyncId
    );

    lierEcouteursMixBiome(sliderMixMusBiome, sliderMixEffBiome);

    initialiserControlesOptions();
    initialiserSauvegardeProgression();
}
