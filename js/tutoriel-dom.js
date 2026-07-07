import { lireStockage, ecrireStockage } from './io/progression.js';
import { sansAccentsE } from './texte-jeu.js';
import {
    CLES,
    SLIDES_PROLOGUE,
    SLIDES_LIBRE,
    CONTROLES_CLAVIER,
    CONTENUS,
} from './tutoriel-contenus.js';

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

/** @type {number} */
let indexSlideLibre = 0;

/** @type {(() => void) | null} */
let callbackPrologue = null;

/** @type {(() => void) | null} */
let callbackLibre = null;

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
    indexSlideLibre = 0;
    callbackPrologue = null;
    callbackLibre = null;
    document.getElementById('overlay-tutoriel')?.classList.add('element-masque');
    onFermer?.();
}

function afficherSlide(slides, index) {
    const slide = slides[index];
    if (!slide) return;
    remplirContenu(slide, !!slide.avecControles);

    const indicateur = document.getElementById('tutoriel-indicateur');
    if (indicateur) {
        indicateur.textContent = sansAccentsE(`${index + 1} / ${slides.length}`);
    }

    const btnFermer = document.getElementById('btn-tutoriel-fermer');
    if (btnFermer) {
        btnFermer.textContent = index < slides.length - 1 ? 'SUIVANT' : 'COMPRIS — JOUER';
    }
}

function afficherSlidePrologue(index) {
    afficherSlide(SLIDES_PROLOGUE, index);
}

function afficherSlideLibre(index) {
    afficherSlide(SLIDES_LIBRE, index);
}

function avancerSlidePrologue() {
    if (indexSlidePrologue < SLIDES_PROLOGUE.length - 1) {
        indexSlidePrologue++;
        afficherSlidePrologue(indexSlidePrologue);
        return;
    }
    fermerTutoriel(CLES.prologue, callbackPrologue ?? undefined);
}

function avancerSlideLibre() {
    if (indexSlideLibre < SLIDES_LIBRE.length - 1) {
        indexSlideLibre++;
        afficherSlideLibre(indexSlideLibre);
        return;
    }
    fermerTutoriel(CLES.libre, callbackLibre ?? undefined);
}

/**
 * Tutoriel d’accueil mode libre : avant la première partie constellation.
 * @param {() => void} [onCompris]
 */
export function afficherTutorielLibreAvantPartie(onCompris) {
    const cle = CLES.libre;
    if (tutorielDejaVu(cle)) {
        onCompris?.();
        return;
    }

    indexSlideLibre = 0;
    callbackLibre = onCompris ?? null;

    const overlay = document.getElementById('overlay-tutoriel');
    if (!overlay) {
        onCompris?.();
        return;
    }

    afficherSlideLibre(0);
    overlay.classList.remove('element-masque');
    activerFocusTrap(overlay);

    const btnFermer = document.getElementById('btn-tutoriel-fermer');
    if (btnFermer) {
        btnFermer.onclick = () => avancerSlideLibre();
    }
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
