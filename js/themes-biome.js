import { BIOMES } from './config.js';
import { obtenirBiomeActif, etat } from './store-jeu.js';
import { majStatsReactionRobo } from './achievements.js';

export function changerHumeur(humeur) {
    majStatsReactionRobo(humeur);
    etat.humeur = humeur;
    document.querySelectorAll('.expression').forEach((el) => el.classList.remove('active'));
    const expr = document.getElementById(`expr-${humeur}`);
    if (expr) expr.classList.add('active');
    const couleurLed = {
        neutre: '#ff006e',
        content: '#00ff88',
        excite: '#ffe600',
        triste: '#4488aa',
    };
    const led = document.getElementById('led-antenne');
    if (led) led.setAttribute('fill', couleurLed[humeur] ?? '#ff006e');
    if (humeur !== 'triste') setTimeout(() => changerHumeur('neutre'), 2500);
}

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

    const canvas = document.getElementById('canvas-plateau');
    if (canvas) {
        canvas.style.boxShadow = `0 0 15px ${ui.bordureCanvas}, 0 0 40px ${ui.bordureCanvas}44, inset 0 0 20px ${ui.bordureCanvas}0a`;
        canvas.style.borderColor = ui.bordureCanvas;
    }

    const sectionMascotte = document.getElementById('section-mascotte');
    if (sectionMascotte) {
        sectionMascotte.style.setProperty('--mascotte-lueur', ui.couleurPrimaire);
    }
}

export function appliquerTextesBiome(biomeId) {
    const biome = BIOMES[biomeId] ?? BIOMES.classique;
    const textes = biome.textes ?? BIOMES.classique.textes;

    for (const el of document.querySelectorAll('[data-label]')) {
        if (!(el instanceof HTMLElement)) continue;
        const cle = el.dataset.label;
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

export function appliquerThemeMascotte() {
    const biome = BIOMES[obtenirBiomeActif()] ?? BIOMES.classique;
    const lueur = biome.lueurCoul;
    const section = document.getElementById('section-mascotte');
    const mascotte = document.getElementById('mascotte');
    if (section) section.style.setProperty('--mascotte-lueur', lueur);
    if (mascotte) {
        mascotte.style.filter = `drop-shadow(0 0 6px ${lueur})`;
        mascotte.querySelectorAll('[stroke="#00f5ff"]').forEach((el) => {
            el.setAttribute('stroke', lueur);
        });
        mascotte.querySelectorAll('[fill="#00f5ff"]').forEach((el) => {
            if (el.closest('#expr-neutre')) el.setAttribute('fill', lueur);
        });
    }
}
