import { lireStockage, ecrireStockage } from './progression.js';
import { sansAccentsE } from './texte-jeu.js';

const CLES = {
    prologue: 'derniereLigne_tutorielHistoireVu',
    coop: 'derniereLigne_tutorielCoopVu',
    architecte: 'derniereLigne_tutorielArchitecteVu',
    oracle: 'derniereLigne_tutorielOracleVu',
};

/** @type {{ titre: string, lignes: string[], avecControles?: boolean }[]} */
const SLIDES_PROLOGUE = [
    {
        titre: 'BIENVENUE DANS DERNIÈRE LIGNE',
        lignes: [
            'Parcourez la carte des mondes au clavier via la liste de selection ou à la souris sur la carte.',
            "Suivez l'histoire de ROBO contre son ennemi juré à travers les mondes où ils s'affronteront.",
            'Aidez-le à atteindre son objectif et surtout… Amusez-vous !',
        ],
        avecControles: true,
    },
    {
        titre: 'OBJECTIFS ET ÉTOILES',
        lignes: [
            'Chaque monde se termine après un nombre de lignes ou un combat de boss.',
            'Les étoiles récompensent vitesse et performance — visez ★★★ pour les secrets.',
            'Le palier de vitesse monte au fil de la partie : surveillez le HUD.',
        ],
    },
    {
        titre: 'COMBATS DE BOSS',
        lignes: [
            'Les boss ont plusieurs phases : leurs attaques changent quand leur jauge baisse.',
            'Observez la barre de vie et adaptez-vous aux mécaniques du biome.',
        ],
    },
    {
        titre: 'MÉCANIQUES DES BIOMES',
        lignes: [
            'Chaque biome modifie les règles : météo, cellules vivantes, reliques temporaires…',
            "Lisez l'indicateur sous l'objectif — une info-bulle s'affiche à la première occurrence.",
        ],
    },
    {
        titre: 'RELIQUES, ORACLE ET MÉTÉO',
        lignes: [
            'Les reliques apparaissent après un nombre de pièces — choisissez-en une à chaque palier.',
            "L'Oracle (débloqué en histoire) suggère un placement : suivez-le ou défiez-le pour multiplier le score.",
            'La météo et la mélodie du biome influencent le rythme — consultez le HUD en partie.',
        ],
    },
    {
        titre: 'NAVIGUER SUR LA CARTE',
        lignes: [
            'Molette ou pincement pour zoomer, clic-glisser pour déplacer la vue.',
            'Sur mobile : glissez avec un doigt. Au clavier : utilisez la liste de sélection des mondes.',
            'Survolez un monde pour voir les conditions de déblocage et les objectifs.',
        ],
    },
];

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

/** @type {Record<'coop' | 'architecte' | 'oracle', { titre: string, lignes: string[] }>} */
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
 * @param {'coop' | 'architecte' | 'oracle'} contexte
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
