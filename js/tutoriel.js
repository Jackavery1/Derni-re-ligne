import { lireStockage, ecrireStockage } from './progression.js';
import { afficherEcran } from './ecrans-ui.js';
import { ECRANS } from './ecrans-config.js';

const CLES = {
    accueil: 'derniereLigne_tutorielVu',
    histoire: 'derniereLigne_tutorielHistoireVu',
    coop: 'derniereLigne_tutorielCoopVu',
    architecte: 'derniereLigne_tutorielArchitecteVu',
};

/** @type {Record<string, { titre: string, lignes: string[] }>} */
const CONTENUS = {
    accueil: {
        titre: 'BIENVENUE DANS DERNIÈRE LIGNE',
        lignes: [
            'Déplacez les pièces avec les flèches, tournez avec Z/X, chute rapide avec Espace, hold avec C ou Maj. Pause : P ou Échap.',
            'Choisissez Marathon ou Sprint, explorez les biomes, ou lancez le Mode Histoire depuis le menu.',
        ],
    },
    histoire: {
        titre: 'MODE HISTOIRE',
        lignes: [
            'Parcourez la carte des mondes au clavier via la liste de sélection ou à la souris sur la carte.',
            'Atteignez l’objectif de lignes indiqué pour compléter un monde et débloquer la suite de la campagne.',
        ],
    },
    coop: {
        titre: 'MODE COOPÉRATIF',
        lignes: [
            'Deux joueurs partagent un plateau : J1 colonnes 1–5 (WASD + Shift), J2 colonnes 6–10 (flèches + Shift droit).',
            'Utilisez les passerelles pour envoyer une pièce à l’autre joueur quand elles sont disponibles.',
        ],
    },
    architecte: {
        titre: 'MODE ARCHITECTE',
        lignes: [
            'Placez les pièces sans gravité automatique pour remplir l’objectif du puzzle.',
            'Backspace annule le dernier placement. Visez la précision et le nombre minimal de pièces pour les étoiles.',
        ],
    },
};

function tutorielDejaVu(cle) {
    return lireStockage(cle, '0') === '1';
}

function marquerTutorielVu(cle) {
    ecrireStockage(cle, '1');
}

function remplirContenu(contenu) {
    const titre = document.getElementById('tutoriel-titre');
    const corps = document.getElementById('tutoriel-corps');
    if (titre) titre.textContent = contenu.titre;
    if (corps) {
        corps.replaceChildren();
        for (const ligne of contenu.lignes) {
            const p = document.createElement('p');
            p.className = 'tutoriel-texte';
            p.textContent = ligne;
            corps.appendChild(p);
        }
    }
}

function fermerTutoriel(cleStockage) {
    marquerTutorielVu(cleStockage);
    document.getElementById('overlay-tutoriel')?.classList.add('element-masque');
}

/**
 * @param {'accueil' | 'histoire' | 'coop' | 'architecte'} contexte
 */
export function afficherTutorielContextuel(contexte) {
    const cle = CLES[contexte];
    const contenu = CONTENUS[contexte];
    if (!cle || !contenu || tutorielDejaVu(cle)) return;

    const overlay = document.getElementById('overlay-tutoriel');
    if (!overlay) return;

    remplirContenu(contenu);
    overlay.classList.remove('element-masque');

    const btnFermer = document.getElementById('btn-tutoriel-fermer');
    const btnOptions = document.getElementById('btn-tutoriel-options');
    if (btnFermer) {
        btnFermer.onclick = () => fermerTutoriel(cle);
    }
    if (btnOptions) {
        btnOptions.onclick = () => {
            fermerTutoriel(cle);
            afficherEcran(ECRANS.OPTIONS);
            document.getElementById('tab-controles')?.click();
        };
    }
}

export function initialiserTutoriel() {
    afficherTutorielContextuel('accueil');
}
