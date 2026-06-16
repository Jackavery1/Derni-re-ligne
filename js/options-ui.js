import { lireStockage, ecrireStockage, chargerBiomeActif } from './progression.js';
import { haptiqueActif, definirHaptiqueActif } from './haptique.js';
import {
    enchainementCampagneActif,
    definirEnchainementCampagneActif,
} from './preferences-campagne.js';
import {
    controlesTactilesActifs,
    definirControlesTactilesActifs,
    appliquerControlesTactilesDepuisStockage,
} from './controles-tactiles.js';
import { obtenirSupabaseUrl, obtenirSupabaseAnonKey, obtenirOuCreerSyncId } from './config-sync.js';
import { obtenirMixBiome, persisterMixBiome } from './audio-mix-biome.js';
import { initialiserSyncCloudOptions, mettreAJourUiSyncCloud } from './options-sync-cloud-ui.js';
import { initialiserSauvegardeProgression } from './options-progression-ui.js';
import { AudioMoteur } from './audio.js';
import { obtenirInput, obtenirBouton } from './dom-utils.js';
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
    ACTIONS_TOUCHES,
    LIBELLES_ACTIONS,
    obtenirTouches,
    sauvegarderTouches,
    reinitialiserTouches,
    formaterCodeTouche,
} from './touches-config.js';

export function appliquerContrasteDepuisStockage() {
    const contraste = lireStockage('derniereLigne_contraste', 'false') === 'true';
    document.body?.classList.toggle('contraste-eleve', contraste);
}

export function mettreAJourBoutonContraste(btn) {
    const actif = document.body.classList.contains('contraste-eleve');
    btn.textContent = actif ? '◐ CONTRASTE ON' : '◐ CONTRASTE';
    btn.setAttribute('aria-pressed', actif ? 'true' : 'false');
    btn.classList.toggle('actif', actif);
}

export function mettreAJourBoutonDaltonien(btn) {
    const actif = obtenirDaltonien();
    btn.textContent = actif ? '◎ DALTONIEN ON' : '◎ DALTONIEN';
    btn.setAttribute('aria-pressed', actif ? 'true' : 'false');
    btn.classList.toggle('actif', actif);
}

export function mettreAJourBoutonReduireEffets(btn) {
    const actif = obtenirReduireEffetsAccessibilite();
    btn.textContent = actif ? '◇ EFFETS RÉDUITS ON' : '◇ RÉDUIRE EFFETS';
    btn.setAttribute('aria-pressed', actif ? 'true' : 'false');
    btn.classList.toggle('actif', actif);
}

export function mettreAJourBoutonConstellationClic(btn) {
    const actif = obtenirConstellationClicSeul();
    btn.textContent = actif ? '◎ CONSTELLATION AU CLIC ON' : '◎ CONSTELLATION AU CLIC';
    btn.setAttribute('aria-pressed', actif ? 'true' : 'false');
    btn.classList.toggle('actif', actif);
}

export function mettreAJourBoutonHaptique(btn) {
    const actif = haptiqueActif();
    btn.textContent = actif ? '📳 HAPTIQUE ON' : '📳 HAPTIQUE OFF';
    btn.setAttribute('aria-pressed', actif ? 'true' : 'false');
    btn.classList.toggle('actif', actif);
}

export function mettreAJourBoutonControlesTactiles(btn) {
    const actif = controlesTactilesActifs();
    btn.textContent = actif ? '👆 TOUCHES TACTILES ON' : '👆 TOUCHES TACTILES OFF';
    btn.setAttribute('aria-pressed', actif ? 'true' : 'false');
    btn.classList.toggle('actif', actif);
}

export function mettreAJourBoutonEnchainementCampagne(btn) {
    const actif = enchainementCampagneActif();
    btn.textContent = actif ? '▶ ENCHAINEMENT CAMPAGNE ON' : '▶ RETOUR CARTE APRES VICTOIRE';
    btn.setAttribute('aria-pressed', actif ? 'true' : 'false');
    btn.classList.toggle('actif', actif);
}

export function mettreAJourBoutonsMute() {
    const symbole = AudioMoteur.muet ? '🔇' : '🔊';
    const btnJeu = document.getElementById('btn-mute');
    const btnOpts = document.getElementById('btn-toggle-mute');
    if (btnJeu) {
        btnJeu.textContent = symbole;
        btnJeu.setAttribute('aria-pressed', AudioMoteur.muet ? 'true' : 'false');
    }
    if (btnOpts) {
        btnOpts.textContent = AudioMoteur.muet ? '🔇 SON OFF' : '🔊 SON ON';
        btnOpts.setAttribute('aria-pressed', AudioMoteur.muet ? 'true' : 'false');
        btnOpts.classList.toggle('actif', AudioMoteur.muet);
    }
}

export function afficherOngletOptions(onglet) {
    const estReglages = onglet === 'reglages';
    document.getElementById('tab-reglages')?.classList.toggle('actif', estReglages);
    document.getElementById('tab-controles')?.classList.toggle('actif', !estReglages);
    document
        .getElementById('tab-reglages')
        ?.setAttribute('aria-selected', estReglages ? 'true' : 'false');
    document
        .getElementById('tab-controles')
        ?.setAttribute('aria-selected', estReglages ? 'false' : 'true');
    const panneauReg = document.getElementById('panneau-reglages');
    const panneauCtrl = document.getElementById('panneau-controles');
    panneauReg?.classList.toggle('actif', estReglages);
    panneauCtrl?.classList.toggle('actif', !estReglages);
    if (panneauReg) panneauReg.hidden = !estReglages;
    if (panneauCtrl) panneauCtrl.hidden = estReglages;
    if (!estReglages) rafraichirPanneauControles();
}

/** @type {keyof ReturnType<typeof obtenirTouches> | null} */
let actionEnAttente = null;

function rafraichirPanneauControles() {
    const liste = document.getElementById('liste-controles-rebind');
    if (!liste) return;
    liste.replaceChildren();
    const touches = obtenirTouches();

    for (const action of ACTIONS_TOUCHES) {
        const row = document.createElement('div');
        row.className = 'controle-rebind-ligne';

        const label = document.createElement('span');
        label.className = 'controle-rebind-label';
        label.textContent = LIBELLES_ACTIONS[action];

        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'bouton discret controle-rebind-bouton';
        btn.dataset.action = action;
        btn.textContent =
            actionEnAttente === action
                ? 'Appuyez sur une touche…'
                : formaterCodeTouche(touches[action]);
        btn.setAttribute('aria-pressed', actionEnAttente === action ? 'true' : 'false');
        btn.addEventListener('click', () => {
            actionEnAttente = action;
            rafraichirPanneauControles();
        });

        row.appendChild(label);
        row.appendChild(btn);
        liste.appendChild(row);
    }
}

function initialiserRebindingControles() {
    document.getElementById('btn-controles-defaut')?.addEventListener('click', () => {
        reinitialiserTouches();
        actionEnAttente = null;
        rafraichirPanneauControles();
    });

    document.addEventListener('keydown', (e) => {
        if (!actionEnAttente) return;
        const panneau = document.getElementById('panneau-controles');
        if (!panneau?.classList.contains('actif')) return;
        e.preventDefault();
        e.stopPropagation();
        sauvegarderTouches({ [actionEnAttente]: e.code });
        actionEnAttente = null;
        rafraichirPanneauControles();
    });
}

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

    initialiserRebindingControles();
    rafraichirPanneauControles();
    initialiserSauvegardeProgression();
}
