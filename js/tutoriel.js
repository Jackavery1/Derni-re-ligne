import { lireStockage, ecrireStockage } from './progression.js';
import { sansAccentsE } from './texte-jeu.js';

const CLES = {
    prologue: 'derniereLigne_tutorielHistoireVu',
    coop: 'derniereLigne_tutorielCoopVu',
    architecte: 'derniereLigne_tutorielArchitecteVu',
    oracle: 'derniereLigne_tutorielOracleVu',
    distorsion: 'derniereLigne_tutorielDistorsionVu',
};

/** @type {{ titre: string, lignes: string[], avecControles?: boolean }[]} */
const SLIDES_PROLOGUE = [
    {
        titre: 'BIENVENUE DANS DERNIÈRE LIGNE',
        lignes: [
            'Parcourez la carte des mondes (souris ou liste clavier) et suivez ROBO à travers l’histoire.',
            'Molette ou pincement pour zoomer, clic-glisser pour déplacer. Sur mobile : glissez un doigt.',
        ],
        avecControles: true,
    },
    {
        titre: 'OBJECTIFS, BOSS ET BIOMES',
        lignes: [
            'Chaque monde se termine après un quota de lignes ou un combat de boss — visez ★★★ pour les secrets.',
            'Les boss changent de phase quand leur jauge baisse ; le palier de vitesse monte en partie.',
            'Chaque biome modifie les règles (météo, cellules vivantes, reliques…) : lisez l’indicateur sous l’objectif.',
        ],
    },
    {
        titre: 'RELIQUES ET ORACLE',
        lignes: [
            'Les reliques apparaissent après un nombre de pièces — choisissez-en une à chaque palier.',
            "L'Oracle (débloqué plus tard) suggère un placement : suivez-le ou défiez-le pour multiplier le score.",
            'Amusez-vous — les modes Coop, Architecte et Oracle ont leur propre tutoriel au premier lancement.',
        ],
    },
];

export const NOMBRE_SLIDES_PROLOGUE = SLIDES_PROLOGUE.length;

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

/** @type {Record<'coop' | 'architecte' | 'oracle' | 'distorsion', { titre: string, lignes: string[] }>} */
const CONTENUS = {
    coop: {
        titre: 'MODE COOPÉRATIF',
        lignes: [
            'Deux joueurs partagent UN SEUL plateau : J1 colonnes 1–5 (gauche), J2 colonnes 6–10 (droite).',
            'Schema : [ J1 | J1 | J1 | J1 | J1 | J2 | J2 | J2 | J2 | J2 ] — une ligne ne s’efface que si les DEUX moities sont remplies.',
            'J1 : WASD deplacer, W/Q tourner, Shift gauche = chute rapide, E = reserve, R = passerelle.',
            'J2 : fleches deplacer, ↑ / Pave num. 8 tourner, Shift droit = chute rapide, Pave num. 7 = reserve, 9 = passerelle.',
            'La passerelle envoie votre prochaine piece à l’autre joueur (1 par niveau). Coordonnez-vous !',
        ],
    },
    architecte: {
        titre: 'MODE ARCHITECTE',
        lignes: [
            'Placez les pieces sans gravite automatique pour remplir l’objectif du puzzle.',
            'Backspace annule le dernier placement. Visez la precision et le nombre minimal de pieces pour les etoiles.',
        ],
    },
    oracle: {
        titre: 'MODE ORACLE',
        lignes: [
            'L’Oracle suggere un placement optimal pour la piece en cours (fantome cyan).',
            'Suivez la suggestion : bonus de score. Ignorez-la avec succes : multiplicateur jusqu’a ×5.0.',
            'Echouez en ignorant : le multiplicateur retombe a ×1.0. Ideal pour les joueurs avances !',
            'Disponible apres le boss Avant-Garde. Activez-le depuis le menu ou en partie.',
        ],
    },
    distorsion: {
        titre: 'ENTRAINEMENT — PUIS DISTORSION',
        lignes: [
            "L'Avant-Garde est un combat d'entrainement : PV reduits, attaques ralenties.",
            'La Distorsion a 3 phases : rangees de braise, glace + glitch, puis distorsion du plateau.',
            'Observez la jauge de vie et anticipez les changements de phase a 50 % et 25 % des PV.',
            "Validez l'entrainement avant d'affronter la finale.",
        ],
    },
};

function tutorielDejaVu(cle) {
    return lireStockage(cle, '0') === '1';
}

function marquerTutorielVu(cle) {
    ecrireStockage(cle, '1');
}

export function reinitialiserTutoriels() {
    for (const cle of Object.values(CLES)) {
        try {
            localStorage.removeItem(cle);
        } catch {
            /* ignore */
        }
    }
    try {
        localStorage.removeItem('derniereLigne_tutorielVu');
    } catch {
        /* ignore */
    }
}

/** @param {{ titre: string, lignes: string[] }} contenu @param {boolean} [avecControles] */
function remplirContenu(contenu, avecControles = false) {
    const titre = document.getElementById('tutoriel-titre');
    const corps = document.getElementById('tutoriel-corps');
    const blocControles = document.getElementById('tutoriel-controles');

    if (titre) titre.textContent = sansAccentsE(contenu.titre);
    if (corps) {
        corps.replaceChildren();
        for (const ligne of contenu.lignes) {
            const p = document.createElement('p');
            p.className = 'tutoriel-texte';
            p.textContent = sansAccentsE(ligne);
            corps.appendChild(p);
        }
    }

    if (blocControles) {
        blocControles.replaceChildren();
        if (avecControles) {
            blocControles.classList.remove('element-masque');
            const intro = document.createElement('p');
            intro.className = 'tutoriel-controles-intro';
            intro.textContent = 'CONTROLES';
            blocControles.appendChild(intro);

            const dl = document.createElement('dl');
            dl.className = 'guide guide-options tutoriel-guide';
            for (const { touche, action } of CONTROLES_CLAVIER) {
                const dt = document.createElement('dt');
                dt.textContent = sansAccentsE(touche);
                const dd = document.createElement('dd');
                dd.textContent = sansAccentsE(action);
                dl.appendChild(dt);
                dl.appendChild(dd);
            }
            blocControles.appendChild(dl);

            const mobile = document.createElement('p');
            mobile.className = 'tutoriel-controles-mobile';
            mobile.textContent = sansAccentsE(
                'Sur mobile : boutons tactiles en bas de l’ecran et swipe sur le plateau.'
            );
            blocControles.appendChild(mobile);
        } else {
            blocControles.classList.add('element-masque');
        }
    }
}

/** @type {(() => void) | null} */
let desactiverFocusTrap = null;

/** @type {number} */
let indexSlidePrologue = 0;

/** @type {(() => void) | null} */
let callbackPrologue = null;

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
    indexSlidePrologue = 0;
    callbackPrologue = null;
    document.getElementById('overlay-tutoriel')?.classList.add('element-masque');
    onFermer?.();
}

function afficherSlidePrologue(index) {
    const slide = SLIDES_PROLOGUE[index];
    if (!slide) return;
    remplirContenu(slide, !!slide.avecControles);

    const indicateur = document.getElementById('tutoriel-indicateur');
    if (indicateur) {
        indicateur.textContent = sansAccentsE(`${index + 1} / ${SLIDES_PROLOGUE.length}`);
    }

    const btnFermer = document.getElementById('btn-tutoriel-fermer');
    if (btnFermer) {
        btnFermer.textContent =
            index < SLIDES_PROLOGUE.length - 1 ? 'SUIVANT' : 'COMPRIS — COMMENCER';
    }
}

function avancerSlidePrologue() {
    if (indexSlidePrologue < SLIDES_PROLOGUE.length - 1) {
        indexSlidePrologue++;
        afficherSlidePrologue(indexSlidePrologue);
        return;
    }
    fermerTutoriel(CLES.prologue, callbackPrologue ?? undefined);
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

    indexSlidePrologue = 0;
    callbackPrologue = onCompris ?? null;

    const overlay = document.getElementById('overlay-tutoriel');
    if (!overlay) {
        onCompris?.();
        return;
    }

    afficherSlidePrologue(0);
    overlay.classList.remove('element-masque');
    activerFocusTrap(overlay);

    const btnFermer = document.getElementById('btn-tutoriel-fermer');
    if (btnFermer) {
        btnFermer.onclick = () => avancerSlidePrologue();
    }
}

/**
 * @param {'coop' | 'architecte' | 'oracle' | 'distorsion'} contexte
 * @param {(() => void) | null} [onFerme]
 */
export function afficherTutorielContextuel(contexte, onFerme = null) {
    const cle = CLES[contexte];
    const contenu = CONTENUS[contexte];
    if (!cle || !contenu || tutorielDejaVu(cle)) {
        onFerme?.();
        return;
    }

    const overlay = document.getElementById('overlay-tutoriel');
    if (!overlay) return;

    remplirContenu(contenu, false);
    overlay.classList.remove('element-masque');
    activerFocusTrap(overlay);

    const btnFermer = document.getElementById('btn-tutoriel-fermer');
    if (btnFermer) {
        btnFermer.textContent = 'COMPRIS';
        btnFermer.onclick = () => {
            fermerTutoriel(cle);
            onFerme?.();
        };
    }
}

export function initialiserTutoriel() {}
