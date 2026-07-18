import { particules } from '../etat/store-jeu.js';

export {
    pousserParticuleJeu,
    creerParticuleJeuStandard,
    creerParticulesExplosion,
    creerParticulesLigne,
} from '../etat/particules-spawn.js';

export function mettreAJourParticules(deltaTemps) {
    const facteur = deltaTemps / 16;
    for (let i = particules.length - 1; i >= 0; i--) {
        const p = particules[i];
        p.x += p.vx * facteur;
        p.y += p.vy * facteur;
        if (p.type !== 'eclair') p.vy += 0.18 * facteur;
        p.rotation += p.vRot * facteur;
        p.opacite -= (p.type === 'eclair' ? 0.04 : 0.022) * facteur;
        if (p.opacite <= 0) particules.splice(i, 1);
    }
}
