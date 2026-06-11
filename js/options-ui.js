import { lireStockage, ecrireStockage } from './progression.js';
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
    chargerAccentsUiDepuisStockage,
    obtenirAccentsUi,
    persisterAccentsUi,
} from './texte-jeu.js';
import {
    ACTIONS_TOUCHES,
    LIBELLES_ACTIONS,
    obtenirTouches,
    sauvegarderTouches,
    reinitialiserTouches,
    formaterCodeTouche,
} from './touches-config.js';

export function mettreAJourBoutonContraste(btn) {
    const actif = document.body.classList.contains('contraste-eleve');
    btn.textContent = actif ? '◐ CONTRASTE ON' : '◐ CONTRASTE';
    btn.setAttribute('aria-pressed', actif ? 'true' : 'false');
}

export function mettreAJourBoutonDaltonien(btn) {
    const actif = obtenirDaltonien();
    btn.textContent = actif ? '◎ DALTONIEN ON' : '◎ DALTONIEN';
    btn.setAttribute('aria-pressed', actif ? 'true' : 'false');
}

export function mettreAJourBoutonReduireEffets(btn) {
    const actif = obtenirReduireEffetsAccessibilite();
    btn.textContent = actif ? '◇ EFFETS RÉDUITS ON' : '◇ RÉDUIRE EFFETS';
    btn.setAttribute('aria-pressed', actif ? 'true' : 'false');
}

export function mettreAJourBoutonAccents(btn) {
    const actif = obtenirAccentsUi();
    btn.textContent = actif ? 'É ACCENTS ON' : 'É ACCENTS UI';
    btn.setAttribute('aria-pressed', actif ? 'true' : 'false');
}

export function mettreAJourBoutonConstellationClic(btn) {
    const actif = obtenirConstellationClicSeul();
    btn.textContent = actif ? '◎ CONSTELLATION AU CLIC ON' : '◎ CONSTELLATION AU CLIC';
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

export function initialiserOptions() {
    const vol = lireStockage('derniereLigne_volume', '1');
    const volMus = lireStockage('derniereLigne_volumeMusique', '1');
    const muet = lireStockage('derniereLigne_muet', 'false') === 'true';
    const contraste = lireStockage('derniereLigne_contraste', 'false') === 'true';
    AudioMoteur.volumeEffets = parseFloat(vol) || 1;
    AudioMoteur.volumeMusique = parseFloat(volMus) || 1;
    AudioMoteur.muet = muet;
    document.body.classList.toggle('contraste-eleve', contraste);
    chargerAccessibiliteDepuisStockage();
    chargerAccentsUiDepuisStockage();

    const slider = obtenirInput('slider-volume');
    const sliderMus = obtenirInput('slider-musique');
    const btnMute = obtenirBouton('btn-toggle-mute');
    const btnContraste = obtenirBouton('btn-toggle-contraste');
    const btnDaltonien = obtenirBouton('btn-toggle-daltonien');
    const btnReduireEffets = obtenirBouton('btn-toggle-reduire-effets');
    const btnAccents = obtenirBouton('btn-toggle-accents');
    const btnConstellationClic = obtenirBouton('btn-toggle-constellation-clic');
    if (slider) slider.value = String(Math.round(AudioMoteur.volumeEffets * 100));
    if (sliderMus) sliderMus.value = String(Math.round(AudioMoteur.volumeMusique * 100));
    mettreAJourBoutonsMute();
    if (btnContraste) mettreAJourBoutonContraste(btnContraste);
    if (btnDaltonien) mettreAJourBoutonDaltonien(btnDaltonien);
    if (btnReduireEffets) mettreAJourBoutonReduireEffets(btnReduireEffets);
    if (btnAccents) mettreAJourBoutonAccents(btnAccents);
    if (btnConstellationClic) mettreAJourBoutonConstellationClic(btnConstellationClic);

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

    btnAccents?.addEventListener('click', () => {
        const actif = !obtenirAccentsUi();
        persisterAccentsUi(actif);
        mettreAJourBoutonAccents(btnAccents);
    });

    btnConstellationClic?.addEventListener('click', () => {
        const actif = !obtenirConstellationClicSeul();
        persisterConstellationClicSeul(actif);
        mettreAJourBoutonConstellationClic(btnConstellationClic);
    });

    initialiserRebindingControles();
    rafraichirPanneauControles();
}
