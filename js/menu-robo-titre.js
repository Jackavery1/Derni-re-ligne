import { abonnerBoucleMenuUnifiee } from './planificateur-raf.js';
import { dessinerRobo } from './rendu-robo.js';
import { obtenirCanvas } from './dom-utils.js';

/** @param {number} timestamp */
function boucleMenuRoboTitre(timestamp) {
    const ecranTitre = document.getElementById('ecran-titre');
    if (!ecranTitre?.classList.contains('actif')) return;

    const canvas = obtenirCanvas('canvas-menu-robo');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    dessinerRobo(ctx, canvas.width, canvas.height, 'content', timestamp / 1000);
}

export function initialiserMenuRoboTitre() {
    if (typeof window === 'undefined') return;
    abonnerBoucleMenuUnifiee(boucleMenuRoboTitre);
}
