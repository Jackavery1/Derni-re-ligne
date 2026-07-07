import { coop } from './coop-logique.js';
import { modeArchiEnCours, modeCoopEnCours } from '../etat/registre-modes.js';
import { attacherRepetitionBouton } from './input-repetition.js';
import { coopActiverTouche, coopDesactiverTouche } from './coop-das.js';
import {
    coop_deplacerGauche,
    coop_deplacerDroite,
    coop_deplacerBas,
    coop_tourner,
    coop_chuteRapide,
    coop_utiliserReserve,
    utiliserPasserelle,
    basculerPauseCoop,
} from './coop-jeu.js';
import { coop_dessinerPreview } from '../rendu/coop-rendu.js';

/** @type {readonly ('j1' | 'j2')[]} */
const JOUEURS_COOP = ['j1', 'j2'];

const TOUCHES_COOP = {
    j1: {
        gauche: ['KeyA'],
        droite: ['KeyD'],
        bas: ['KeyS'],
        rotation: ['KeyW'],
        rotationAnti: ['KeyQ'],
        drop: ['ShiftLeft'],
        hold: ['KeyE'],
        passerelle: ['KeyR'],
    },
    j2: {
        gauche: ['ArrowLeft'],
        droite: ['ArrowRight'],
        bas: ['ArrowDown'],
        rotation: ['ArrowUp'],
        rotationAnti: ['Numpad8'],
        drop: ['ShiftRight', 'Numpad0'],
        hold: ['Numpad7'],
        passerelle: ['Numpad9'],
    },
};

function attacherCoop(idBouton, action, avecRepetition = false) {
    attacherRepetitionBouton(
        document.getElementById(idBouton),
        () => {
            if (!modeCoopEnCours() || !coop.estEnCours || coop.estEnPause) return;
            action();
        },
        avecRepetition
    );
}

const coopTouchesActives = { j1: {}, j2: {} };

const TOUS_CODES_MOUVEMENT_COOP = new Set([
    ...TOUCHES_COOP.j1.gauche,
    ...TOUCHES_COOP.j1.droite,
    ...TOUCHES_COOP.j1.bas,
    ...TOUCHES_COOP.j2.gauche,
    ...TOUCHES_COOP.j2.droite,
    ...TOUCHES_COOP.j2.bas,
]);

/** @param {'j1' | 'j2'} joueur @param {string} code @param {() => void} action */
function activerMouvementCoop(joueur, code, action) {
    if (coopTouchesActives[joueur][code]) return;
    coopTouchesActives[joueur][code] = true;
    coopActiverTouche(joueur, code);
    action();
}

let inputCoopInitialise = false;

export function initialiserInputCoop() {
    if (inputCoopInitialise) return;
    inputCoopInitialise = true;
    document.addEventListener('keydown', (e) => {
        if (modeArchiEnCours() || !modeCoopEnCours() || !coop.estEnCours || coop.estEnPause) return;

        let touchePrise = false;
        for (const joueur of JOUEURS_COOP) {
            const t = TOUCHES_COOP[joueur];
            if (t.gauche.includes(e.code)) {
                activerMouvementCoop(joueur, e.code, () => coop_deplacerGauche(joueur));
                touchePrise = true;
            }
            if (t.droite.includes(e.code)) {
                activerMouvementCoop(joueur, e.code, () => coop_deplacerDroite(joueur));
                touchePrise = true;
            }
            if (t.bas.includes(e.code)) {
                activerMouvementCoop(joueur, e.code, () => coop_deplacerBas(joueur));
                touchePrise = true;
            }
            if (t.rotation.includes(e.code)) {
                coop_tourner(joueur, 1);
                touchePrise = true;
            }
            if (t.rotationAnti.includes(e.code)) {
                coop_tourner(joueur, -1);
                touchePrise = true;
            }
            if (t.drop.includes(e.code)) {
                coop_chuteRapide(joueur);
                touchePrise = true;
            }
            if (t.hold.includes(e.code)) {
                coop_utiliserReserve(joueur);
                coop_dessinerPreview(joueur);
                touchePrise = true;
            }
            if (t.passerelle.includes(e.code)) {
                utiliserPasserelle(joueur);
                coop_dessinerPreview('j1');
                coop_dessinerPreview('j2');
                touchePrise = true;
            }
        }
        // Empêche le defilement de la page (fleches, espace) pendant la partie.
        if (touchePrise) e.preventDefault();

        if (e.code === 'KeyP' || e.code === 'Escape') basculerPauseCoop();
    });

    document.addEventListener('keyup', (e) => {
        if (!modeCoopEnCours()) return;
        if (!TOUS_CODES_MOUVEMENT_COOP.has(e.code)) return;
        for (const joueur of JOUEURS_COOP) {
            delete coopTouchesActives[joueur][e.code];
            coopDesactiverTouche(joueur, e.code);
        }
    });

    attacherCoop('ccj1-gauche', () => coop_deplacerGauche('j1'), true);
    attacherCoop('ccj1-droite', () => coop_deplacerDroite('j1'), true);
    attacherCoop('ccj1-bas', () => coop_deplacerBas('j1'), true);
    attacherCoop('ccj1-rot', () => coop_tourner('j1', 1));
    attacherCoop('ccj1-drop', () => coop_chuteRapide('j1'));
    attacherCoop('ccj1-hold', () => {
        coop_utiliserReserve('j1');
        coop_dessinerPreview('j1');
    });
    attacherCoop('ccj1-pass', () => {
        utiliserPasserelle('j1');
        coop_dessinerPreview('j1');
        coop_dessinerPreview('j2');
    });

    attacherCoop('ccj2-gauche', () => coop_deplacerGauche('j2'), true);
    attacherCoop('ccj2-droite', () => coop_deplacerDroite('j2'), true);
    attacherCoop('ccj2-bas', () => coop_deplacerBas('j2'), true);
    attacherCoop('ccj2-rot', () => coop_tourner('j2', 1));
    attacherCoop('ccj2-drop', () => coop_chuteRapide('j2'));
    attacherCoop('ccj2-hold', () => {
        coop_utiliserReserve('j2');
        coop_dessinerPreview('j2');
    });
    attacherCoop('ccj2-pass', () => {
        utiliserPasserelle('j2');
        coop_dessinerPreview('j1');
        coop_dessinerPreview('j2');
    });
}
