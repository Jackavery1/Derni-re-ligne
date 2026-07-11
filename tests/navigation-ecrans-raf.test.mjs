import { describe, it, expect, vi, beforeEach } from 'vitest';

const { arreterConstellation, demarrerConstellation } = vi.hoisted(() => ({
    arreterConstellation: vi.fn(),
    demarrerConstellation: vi.fn(),
}));

const { arreterAnimationMenu } = vi.hoisted(() => ({
    arreterAnimationMenu: vi.fn(),
}));

const { arreterFondMeta } = vi.hoisted(() => ({
    arreterFondMeta: vi.fn(),
}));

const { arreterCarteHistoire } = vi.hoisted(() => ({
    arreterCarteHistoire: vi.fn(),
}));

vi.mock('../js/logique/constellation.js', () => ({
    demarrerConstellation,
    arreterConstellation,
}));

vi.mock('../js/rendu/menu-fond.js', () => ({
    demarrerAnimationMenu: vi.fn(),
    arreterAnimationMenu,
}));

vi.mock('../js/rendu/fond-ecrans-meta.js', () => ({
    demarrerFondMeta: vi.fn(),
    arreterFondMeta,
}));

vi.mock('../js/histoire/histoire-map.js', () => ({
    demarrerCarteHistoire: vi.fn(),
    arreterCarteHistoire,
}));

vi.mock('../js/audio/audio.js', () => ({
    AudioMoteur: { arreterMusique: vi.fn() },
}));

vi.mock('../js/logique/vivant.js', () => ({
    cacherBanniereVivant: vi.fn(),
}));

vi.mock('../js/rendu/hud-jeu.js', () => ({
    mettreAJourAffichageRecord: vi.fn(),
}));

vi.mock('../js/ui/deblocage-ui.js', () => ({
    mettreAJourVisibiliteModesDebloques: vi.fn(),
}));

vi.mock('../js/etat/mode-histoire.js', () => ({
    modeHistoireEnCours: vi.fn(() => false),
}));

vi.mock('../js/etat/registre-modes.js', () => ({
    modeArchiActif: vi.fn(() => false),
}));

vi.mock('../js/codex.js', () => ({
    genererCodexComplet: vi.fn(() => Promise.resolve()),
}));

vi.mock('../js/achievements.js', () => ({
    genererGalerieAchievements: vi.fn(),
}));

vi.mock('../js/etat/store-jeu.js', () => ({
    ECRANS: {
        TITRE: 'ecran-titre',
        SELECTION: 'ecran-selection',
        OPTIONS: 'ecran-options',
        CODEX: 'ecran-codex',
    },
    etat: { score: 0, lignes: 0, niveau: 1 },
    definirEcranActuel: vi.fn(),
}));

import { cacherEcrans } from '../js/ui/navigation-ecrans.js';

describe('navigation-ecrans — boucles RAF menu', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        document.body.innerHTML =
            '<div id="conteneur-principal"></div><div id="conteneur-principal-coop"></div>';
    });

    it('cacherEcrans arrete constellation, fond meta, carte histoire et animation menu', async () => {
        cacherEcrans();
        expect(arreterAnimationMenu).toHaveBeenCalledTimes(1);
        expect(arreterFondMeta).toHaveBeenCalledTimes(1);
        await vi.waitFor(() => {
            expect(arreterConstellation).toHaveBeenCalledTimes(1);
            expect(arreterCarteHistoire).toHaveBeenCalledTimes(1);
        });
    });
});
