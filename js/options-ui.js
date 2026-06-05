import { lireStockage, ecrireStockage } from './progression.js';
import { AudioMoteur } from './audio.js';
import { obtenirInput, obtenirBouton } from './dom-utils.js';

export function mettreAJourBoutonContraste(btn) {
    const actif = document.body.classList.contains('contraste-eleve');
    btn.textContent = actif ? '◐ CONTRASTE ON' : '◐ CONTRASTE';
    btn.setAttribute('aria-pressed', actif ? 'true' : 'false');
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
}

export function initialiserOptions() {
    const vol = lireStockage('tetrisNeo_volume', '0.4');
    const volMus = lireStockage('tetrisNeo_volumeMusique', '0.25');
    const muet = lireStockage('tetrisNeo_muet', 'false') === 'true';
    const contraste = lireStockage('tetrisNeo_contraste', 'false') === 'true';
    AudioMoteur.volumeEffets = parseFloat(vol) || 0.4;
    AudioMoteur.volumeMusique = parseFloat(volMus) || 0.25;
    AudioMoteur.muet = muet;
    document.body.classList.toggle('contraste-eleve', contraste);

    const slider = obtenirInput('slider-volume');
    const sliderMus = obtenirInput('slider-musique');
    const btnMute = obtenirBouton('btn-toggle-mute');
    const btnContraste = obtenirBouton('btn-toggle-contraste');
    if (slider) slider.value = String(Math.round(AudioMoteur.volumeEffets * 100));
    if (sliderMus) sliderMus.value = String(Math.round(AudioMoteur.volumeMusique * 100));
    mettreAJourBoutonsMute();
    if (btnContraste) mettreAJourBoutonContraste(btnContraste);

    slider?.addEventListener('input', (e) => {
        const cible = /** @type {HTMLInputElement} */ (e.target);
        AudioMoteur.reglerVolumeEffets(parseInt(cible.value, 10) / 100);
        ecrireStockage('tetrisNeo_volume', AudioMoteur.volumeEffets.toString());
        AudioMoteur.son('deplacement');
    });

    sliderMus?.addEventListener('input', (e) => {
        const cible = /** @type {HTMLInputElement} */ (e.target);
        AudioMoteur.reglerVolumeMusique(parseInt(cible.value, 10) / 100);
        ecrireStockage('tetrisNeo_volumeMusique', AudioMoteur.volumeMusique.toString());
    });

    btnMute?.addEventListener('click', () => AudioMoteur.basculerMute());

    btnContraste?.addEventListener('click', () => {
        const actif = document.body.classList.toggle('contraste-eleve');
        ecrireStockage('tetrisNeo_contraste', actif.toString());
        mettreAJourBoutonContraste(btnContraste);
    });
}
