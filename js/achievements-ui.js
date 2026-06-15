import { ACHIEVEMENTS } from './achievements-donnees.js';
import { sansAccentsE } from './texte-jeu.js';
import { statsGlobales } from './achievements-stats.js';
import { rendreIconeSurCanvas, rendreIconeGlitchSurCanvas } from './icones-pixel.js';
import {
    obtenirIdIconeAchievement,
    obtenirAccentCategorie,
    obtenirAccentFiltre,
    obtenirLibelleCategorieFiltre,
    obtenirTexteVerrouille,
    obtenirTexteVerrouillePanneau,
} from './achievements-icones-map.js';
import { obtenirProgressionAchievement } from './achievements-progres.js';
import {
    ouvrirPanneauDetail,
    fermerPanneauDetail,
    obtenirPanneauDetailId,
    abonnerFermeturePanneauDetail,
    initialiserPanneauDetail,
} from './ui-panneau-detail.js';

let memorialListenersInitialises = false;

function formaterDateGravure(timestamp) {
    const d = new Date(timestamp);
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
}

/** @param {import('./achievements-donnees.js').ACHIEVEMENTS[string]} ach */
export function ouvrirExploitMemorial(ach) {
    initialiserPanneauDetail();
    const debloque = !!statsGlobales.debloqués[ach.id];
    const categorie = ach.categorie ?? 'general';
    const accent = obtenirAccentCategorie(categorie);
    const idIcone = obtenirIdIconeAchievement(ach.id, categorie);
    const progression = debloque
        ? null
        : obtenirProgressionAchievement(ach.id, categorie, statsGlobales);

    ouvrirPanneauDetail({
        id: ach.id,
        icone: {
            id: idIcone,
            taillePixel: 10,
            glitch: !debloque,
            seedId: ach.id,
        },
        accent,
        titre: ach.nom,
        sousTitre: obtenirLibelleCategorieFiltre(categorie),
        description: debloque ? ach.description : '',
        typoDescription: 'ui',
        lignesMeta: debloque
            ? [`Grave le ${formaterDateGravure(statsGlobales.debloqués[ach.id])}`]
            : undefined,
        verrouille: !debloque,
        conditionTexte: debloque ? '' : obtenirTexteVerrouillePanneau(categorie, ach.description),
        progression: progression ?? undefined,
    });
    actualiserSelectionMemorial();
}

function actualiserSelectionMemorial() {
    const selectionId = obtenirPanneauDetailId();
    document.querySelectorAll('.ach-carte').forEach((el) => {
        const carte = /** @type {HTMLElement} */ (el);
        carte.classList.toggle(
            'selectionnee',
            selectionId !== null && carte.dataset.id === selectionId
        );
    });
}

function initialiserMemorialListeners() {
    if (memorialListenersInitialises) return;
    memorialListenersInitialises = true;
    abonnerFermeturePanneauDetail(actualiserSelectionMemorial);
}

export function genererGalerieAchievements() {
    if (typeof document === 'undefined') return;
    const grille = document.getElementById('ach-galerie-grille');
    if (!grille) return;
    initialiserMemorialListeners();
    fermerPanneauDetail();
    grille.textContent = '';

    const nb = Object.keys(statsGlobales.debloqués).length;
    const total = Object.keys(ACHIEVEMENTS).length;
    const compteur = document.getElementById('ach-compteur');
    if (compteur) compteur.textContent = `${nb} / ${total} EXPLOITS GRAVES`;

    for (const [, ach] of Object.entries(ACHIEVEMENTS)) {
        const debloque = !!statsGlobales.debloqués[ach.id];
        const categorie = ach.categorie ?? 'general';
        const accent = obtenirAccentCategorie(categorie);
        const idIcone = obtenirIdIconeAchievement(ach.id, categorie);
        const carte = document.createElement('div');
        carte.className = `ach-carte panneau-meta ${debloque ? 'debloque' : 'verrouille'}`;
        carte.dataset.categorie = categorie;
        carte.dataset.id = ach.id;
        carte.style.setProperty('--accent-carte', accent);
        carte.setAttribute('role', 'button');
        carte.tabIndex = 0;

        const iconeEl = document.createElement('canvas');
        iconeEl.className = 'ach-carte-icone';
        iconeEl.width = 64;
        iconeEl.height = 64;
        iconeEl.setAttribute('aria-hidden', 'true');
        if (debloque) {
            rendreIconeSurCanvas(iconeEl, idIcone);
        } else {
            rendreIconeGlitchSurCanvas(iconeEl, idIcone, { accent, seedId: ach.id });
        }

        const nomEl = document.createElement('div');
        nomEl.className = 'ach-carte-nom';
        nomEl.textContent = sansAccentsE(debloque ? ach.nom : '???');

        const descEl = document.createElement('div');
        descEl.className = 'ach-carte-desc';
        descEl.textContent = sansAccentsE(
            debloque ? ach.description : obtenirTexteVerrouille(categorie, ach.description)
        );

        carte.append(iconeEl, nomEl, descEl);

        if (debloque) {
            const dateEl = document.createElement('div');
            dateEl.className = 'ach-carte-date';
            dateEl.textContent = formaterDateGravure(statsGlobales.debloqués[ach.id]);
            carte.appendChild(dateEl);
        }

        carte.addEventListener('click', () => ouvrirExploitMemorial(ach));
        carte.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                ouvrirExploitMemorial(ach);
            }
        });

        grille.appendChild(carte);
    }

    const btnsFiltres = document.querySelectorAll('.ach-filtre-btn');
    btnsFiltres.forEach((btn) => {
        if (!(btn instanceof HTMLElement) || btn.dataset.filtreInit === '1') return;
        btn.dataset.filtreInit = '1';
        const filtreDefaut = btn.dataset.filtre ?? 'tous';
        if (btn.classList.contains('actif')) {
            btn.style.setProperty('--accent-filtre', obtenirAccentFiltre(filtreDefaut));
        }
        btn.addEventListener('click', () => {
            fermerPanneauDetail();
            btnsFiltres.forEach((b) => {
                b.classList.remove('actif');
                if (b instanceof HTMLElement) b.style.removeProperty('--accent-filtre');
            });
            btn.classList.add('actif');
            const filtre = btn.dataset.filtre ?? 'tous';
            btn.style.setProperty('--accent-filtre', obtenirAccentFiltre(filtre));
            document.querySelectorAll('.ach-carte').forEach((el) => {
                const carte = /** @type {HTMLElement} */ (el);
                const cat = carte.dataset.categorie ?? '';
                let visible = false;
                if (filtre === 'tous') visible = true;
                else if (filtre === 'histoire') visible = cat.startsWith('histoire');
                else visible = cat === filtre;
                carte.classList.toggle('ach-carte-filtre-masque', !visible);
            });
        });
    });
}
