import { describe, it, expect, vi, beforeEach } from 'vitest';

const { arreterConstellation, arreterFondMeta, arreterCarteHistoire } = vi.hoisted(() => ({
    arreterConstellation: vi.fn(),
    arreterFondMeta: vi.fn(),
    arreterCarteHistoire: vi.fn(),
}));

vi.mock('../js/constellation.js', () => ({
    demarrerConstellation: vi.fn(),
    arreterConstellation,
}));

vi.mock('../js/fond-ecrans-meta.js', () => ({
    demarrerFondMeta: vi.fn(),
    arreterFondMeta,
}));

vi.mock('../js/histoire-map.js', () => ({
    demarrerCarteHistoire: vi.fn(),
    arreterCarteHistoire,
}));

vi.mock('../js/menu-fond.js', () => ({
    demarrerAnimationMenu: vi.fn(),
    arreterAnimationMenu: vi.fn(),
}));

vi.mock('../js/audio.js', () => ({
    AudioMoteur: { arreterMusique: vi.fn() },
}));

vi.mock('../js/vivant.js', () => ({
    cacherBanniereVivant: vi.fn(),
}));

vi.mock('../js/hud-jeu.js', () => ({
    mettreAJourAffichageRecord: vi.fn(),
}));

vi.mock('../js/deblocage-ui.js', () => ({
    mettreAJourVisibiliteModesDebloques: vi.fn(),
}));

vi.mock('../js/mode-histoire.js', () => ({
    modeHistoireEnCours: vi.fn(() => false),
}));

vi.mock('../js/registre-modes.js', () => ({
    modeArchiActif: vi.fn(() => false),
}));

vi.mock('../js/codex.js', () => ({
    genererCodexComplet: vi.fn(() => Promise.resolve()),
}));

vi.mock('../js/achievements.js', () => ({
    genererGalerieAchievements: vi.fn(),
}));

vi.mock('../js/store-jeu.js', () => ({
    ECRANS: {
        TITRE: 'ecran-titre',
        SELECTION: 'ecran-selection',
        OPTIONS: 'ecran-options',
        CODEX: 'ecran-codex',
    },
    etat: { score: 0, lignes: 0, niveau: 1 },
    definirEcranActuel: vi.fn(),
}));

import { cacherEcrans } from '../js/navigation-ecrans.js';

describe('navigation-ecrans — boucles RAF menu', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        document.body.innerHTML =
            '<div id="conteneur-principal"></div><div id="conteneur-principal-coop"></div>';
    });

    it('cacherEcrans arrete constellation, fond meta et carte histoire', async () => {
        cacherEcrans();
        expect(arreterConstellation).toHaveBeenCalledTimes(1);
        expect(arreterFondMeta).toHaveBeenCalledTimes(1);
        await vi.waitFor(() => {
            expect(arreterCarteHistoire).toHaveBeenCalledTimes(1);
        });
    });
});
