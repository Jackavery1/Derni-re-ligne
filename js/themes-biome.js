import { BIOMES } from './config.js';
export {
    changerHumeur,
    reagirRoboAuxLignes,
    determinerHumeurLignes,
    appliquerHumeurMascotte,
    reinitialiserTimerMascotte,
    reinitialiserMascottePartie,
    flashGrimaceRobo,
    reagirRoboLevelUp,
    reagirRoboRelique,
    reagirRoboBossAttaque,
    reagirRoboBossDegats,
    reagirRoboBossVaincu,
    reagirRoboMeteoActive,
    reagirRoboNouveauRecord,
    reagirRoboGameOver,
    verifierPlateauCritiqueRobo,
} from './mascotte-robo.js';

export function appliquerThemeBiome(biomeId) {
    const biome = BIOMES[biomeId] ?? BIOMES.classique;
    const ui = biome.ui ?? BIOMES.classique.ui;
    const root = document.documentElement.style;
    root.setProperty('--theme-primaire', ui.couleurPrimaire);
    root.setProperty('--theme-score', ui.couleurScore);
    root.setProperty('--theme-accent', ui.couleurAccent);
    root.setProperty('--theme-fond', ui.fondPanneau);
    root.setProperty('--theme-bordure', ui.bordurePanneau);
    root.setProperty('--theme-canvas', ui.bordureCanvas);

    document.body.dataset.biome = biomeId;
    document.getElementById('conteneur-principal')?.setAttribute('data-biome', biomeId);

    const canvas = document.getElementById('canvas-plateau');
    if (canvas) {
        canvas.style.boxShadow = `0 0 15px ${ui.bordureCanvas}, 0 0 40px ${ui.bordureCanvas}44, inset 0 0 20px ${ui.bordureCanvas}0a`;
        canvas.style.borderColor = ui.bordureCanvas;
    }
}

export function appliquerTextesBiome(biomeId) {
    const biome = BIOMES[biomeId] ?? BIOMES.classique;
    const textes = biome.textes ?? BIOMES.classique.textes;

    for (const el of document.querySelectorAll('[data-label]')) {
        if (!(el instanceof HTMLElement)) continue;
        const cle = el.dataset.label;
        if (cle === 'robo') continue;
        const valeur = textes[cle];
        if (!valeur) continue;
        if (el.classList.contains('pause-titre')) {
            el.textContent = `⏸ ${valeur}`;
        } else if (el.classList.contains('menu-record-label')) {
            el.textContent = `★ ${valeur}`;
        } else {
            el.textContent = valeur;
        }
    }
}

export function appliquerThemeMascotte() {}
