import { coop } from './coop-logique.js';
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
import { coop_dessinerPreview } from './coop-rendu.js';

const TOUCHES_COOP = {
    j1: {
        gauche: ['KeyA'],
        droite: ['KeyD'],
        bas: ['KeyS'],
        rotation: ['KeyW', 'KeyQ'],
        drop: ['ShiftLeft'],
        hold: ['KeyE'],
        passerelle: ['KeyR'],
    },
    j2: {
        gauche: ['ArrowLeft'],
        droite: ['ArrowRight'],
        bas: ['ArrowDown'],
        rotation: ['ArrowUp', 'Numpad8'],
        drop: ['ShiftRight', 'Numpad0'],
        hold: ['Numpad7'],
        passerelle: ['Numpad9'],
    },
};

function attacherCoop(idBouton, action, avecRepetition = false) {
    const btn = document.getElementById(idBouton);
    if (!btn) return;
    let idInterval = null;
    const repeter = () => {
        if (!coop.actif || !coop.estEnCours || coop.estEnPause) return;
        action();
        if (avecRepetition) idInterval = setInterval(action, 110);
    };
    const fin = () => {
        if (idInterval) {
            clearInterval(idInterval);
            idInterval = null;
        }
    };
    btn.addEventListener(
        'touchstart',
        (e) => {
            e.preventDefault();
            repeter();
        },
        { passive: false }
    );
    btn.addEventListener('touchend', fin, { passive: false });
    btn.addEventListener('mousedown', repeter);
    btn.addEventListener('mouseup', fin);
    btn.addEventListener('mouseleave', fin);
}

export function initialiserInputCoop() {
    document.addEventListener('keydown', (e) => {
        if (!coop.actif || !coop.estEnCours || coop.estEnPause) return;

        for (const joueur of ['j1', 'j2']) {
            const t = TOUCHES_COOP[joueur];
            if (t.gauche.includes(e.code)) coop_deplacerGauche(joueur);
            if (t.droite.includes(e.code)) coop_deplacerDroite(joueur);
            if (t.bas.includes(e.code)) coop_deplacerBas(joueur);
            if (t.rotation.includes(e.code)) coop_tourner(joueur, 1);
            if (t.drop.includes(e.code)) {
                coop_chuteRapide(joueur);
                e.preventDefault();
            }
            if (t.hold.includes(e.code)) {
                coop_utiliserReserve(joueur);
                coop_dessinerPreview(joueur);
            }
            if (t.passerelle.includes(e.code)) {
                utiliserPasserelle(joueur);
                coop_dessinerPreview('j1');
                coop_dessinerPreview('j2');
            }
        }

        if (e.code === 'KeyP' || e.code === 'Escape') basculerPauseCoop();
    });

    attacherCoop('ccj1-gauche', () => coop_deplacerGauche('j1'), true);
    attacherCoop('ccj1-droite', () => coop_deplacerDroite('j1'), true);
    attacherCoop('ccj1-bas', () => coop_deplacerBas('j1'), true);
    attacherCoop('ccj1-rot', () => coop_tourner('j1', 1));
    attacherCoop('ccj1-drop', () => coop_chuteRapide('j1'));
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
    attacherCoop('ccj2-pass', () => {
        utiliserPasserelle('j2');
        coop_dessinerPreview('j1');
        coop_dessinerPreview('j2');
    });
}
