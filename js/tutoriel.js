import { lireStockage, ecrireStockage } from './progression.js';

const CLES = {
    prologue: 'derniereLigne_tutorielHistoireVu',
    coop: 'derniereLigne_tutorielCoopVu',
    architecte: 'derniereLigne_tutorielArchitecteVu',
};

/** @type {{ titre: string, lignes: string[] }} */
const CONTENU_PROLOGUE = {
    titre: 'BIENVENUE DANS DERNIÈRE LIGNE',
    lignes: [
        'Parcourez la carte des mondes au clavier via la liste de selection ou à la souris sur la carte.',
        "Suivez l'histoire de ROBO contre son ennemi jure à travers les differents mondes où ils s'affronteront.",
        'Aidez-le à atteindre son objectif et surtout… Amusez-vous !',
    ],
};

/** @type {{ touche: string, action: string }[]} */
const CONTROLES_CLAVIER = [
    { touche: '← →', action: 'Deplacer' },
    { touche: '↑ / Z', action: 'Tourner (horaire)' },
    { touche: 'X', action: 'Tourner (anti-horaire)' },
    { touche: '↓', action: 'Chute lente' },
    { touche: 'ESPACE', action: 'Chute rapide' },
    { touche: 'C / ⇧', action: 'Reserve (hold)' },
    { touche: 'P / Échap', action: 'Pause' },
];

/** @type {Record<'coop' | 'architecte', { titre: string, lignes: string[] }>} */
const CONTENUS = {
    coop: {
        titre: 'MODE COOPÉRATIF',
        lignes: [
            'Deux joueurs partagent un plateau : J1 colonnes 1–5, J2 colonnes 6–10. Une ligne ne s’efface que si les deux moities sont remplies !',
            'J1 : WASD deplacer, W/Q tourner, Shift gauche = chute rapide, E = reserve, R = passerelle.',
            'J2 : fleches deplacer, ↑ / Pave num. 8 tourner, Shift droit = chute rapide, Pave num. 7 = reserve, 9 = passerelle.',
            'La passerelle envoie votre prochaine piece à l’autre joueur (1 par niveau).',
        ],
    },
    architecte: {
        titre: 'MODE ARCHITECTE',
        lignes: [
            'Placez les pieces sans gravite automatique pour remplir l’objectif du puzzle.',
            'Backspace annule le dernier placement. Visez la precision et le nombre minimal de pieces pour les etoiles.',
        ],
    },
};

function tutorielDejaVu(cle) {
    return lireStockage(cle, '0') === '1';
}

function marquerTutorielVu(cle) {
    ecrireStockage(cle, '1');
}

/** @param {{ titre: string, lignes: string[] }} contenu @param {boolean} [avecControles] */
function remplirContenu(contenu, avecControles = false) {
    const titre = document.getElementById('tutoriel-titre');
    const corps = document.getElementById('tutoriel-corps');
    const blocControles = document.getElementById('tutoriel-controles');

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

    if (blocControles) {
        blocControles.replaceChildren();
        if (avecControles) {
            blocControles.classList.remove('element-masque');
            const intro = document.createElement('p');
            intro.className = 'tutoriel-controles-intro';
            intro.textContent = 'CONTRÔLES';
            blocControles.appendChild(intro);

            const dl = document.createElement('dl');
            dl.className = 'guide guide-options tutoriel-guide';
            for (const { touche, action } of CONTROLES_CLAVIER) {
                const dt = document.createElement('dt');
                dt.textContent = touche;
                const dd = document.createElement('dd');
                dd.textContent = action;
                dl.appendChild(dt);
                dl.appendChild(dd);
            }
            blocControles.appendChild(dl);

            const mobile = document.createElement('p');
            mobile.className = 'tutoriel-controles-mobile';
            mobile.textContent =
                'Sur mobile : boutons tactiles en bas de l’ecran et swipe sur le plateau.';
            blocControles.appendChild(mobile);
        } else {
            blocControles.classList.add('element-masque');
        }
    }
}

/** @type {(() => void) | null} */
let desactiverFocusTrap = null;

/** @param {HTMLElement} overlay */
function activerFocusTrap(overlay) {
    if (!overlay?.querySelectorAll) return;
    desactiverFocusTrap?.();
    const selecteur =
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
    const focusables = /** @type {HTMLElement[]} */ (
        [...overlay.querySelectorAll(selecteur)].filter(
            (el) => el instanceof HTMLElement && el.offsetParent !== null
        )
    );
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    const precedent = document.activeElement;

    first?.focus();

    /** @param {KeyboardEvent} e */
    function surTab(e) {
        if (e.key !== 'Tab' || focusables.length === 0) return;
        if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first?.focus();
        }
    }

    overlay.addEventListener('keydown', surTab);
    desactiverFocusTrap = () => {
        overlay.removeEventListener('keydown', surTab);
        if (precedent instanceof HTMLElement) precedent.focus();
        desactiverFocusTrap = null;
    };
}

function fermerTutoriel(cleStockage, onFermer) {
    marquerTutorielVu(cleStockage);
    desactiverFocusTrap?.();
    document.getElementById('overlay-tutoriel')?.classList.add('element-masque');
    onFermer?.();
}

/**
 * Tutoriel d’accueil histoire : apres la premiere cutscene du prologue, avant la partie.
 * @param {() => void} [onCompris]
 */
export function afficherTutorielPrologueApresCutscene(onCompris) {
    const cle = CLES.prologue;
    if (tutorielDejaVu(cle)) {
        onCompris?.();
        return;
    }

    const overlay = document.getElementById('overlay-tutoriel');
    if (!overlay) {
        onCompris?.();
        return;
    }

    remplirContenu(CONTENU_PROLOGUE, true);
    overlay.classList.remove('element-masque');
    activerFocusTrap(overlay);

    const btnFermer = document.getElementById('btn-tutoriel-fermer');
    if (btnFermer) {
        btnFermer.textContent = 'COMPRIS — COMMENCER';
        btnFermer.onclick = () => fermerTutoriel(cle, onCompris);
    }
}

/**
 * @param {'coop' | 'architecte'} contexte
 */
export function afficherTutorielContextuel(contexte) {
    const cle = CLES[contexte];
    const contenu = CONTENUS[contexte];
    if (!cle || !contenu || tutorielDejaVu(cle)) return;

    const overlay = document.getElementById('overlay-tutoriel');
    if (!overlay) return;

    remplirContenu(contenu, false);
    overlay.classList.remove('element-masque');
    activerFocusTrap(overlay);

    const btnFermer = document.getElementById('btn-tutoriel-fermer');
    if (btnFermer) {
        btnFermer.textContent = 'COMPRIS';
        btnFermer.onclick = () => fermerTutoriel(cle);
    }
}

export function initialiserTutoriel() {}
