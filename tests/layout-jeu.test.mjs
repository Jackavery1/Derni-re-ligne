import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('../js/histoire/histoire-map.js', () => ({
    redimensionnerCarteHistoire: vi.fn(),
}));

vi.mock('../js/logique/constellation.js', () => ({
    redimensionnerConstellation: vi.fn(),
}));

vi.mock('../js/menu-fond.js', () => ({
    obtenirCanvasMenuFond: vi.fn(() => null),
    menuAnimActif: false,
}));

vi.mock('../js/rendu/rendu-fond-biome.js', () => ({
    demarrerFondBiome: vi.fn(),
    invaliderCacheFond: vi.fn(),
}));

vi.mock('../js/etat/store-jeu.js', () => ({
    etat: { estEnCours: false },
}));

vi.mock('../js/etat/registre-modes.js', () => ({
    modeArchiEnCours: vi.fn(() => false),
}));

vi.mock('../js/rendu/biome-fond.js', () => ({
    obtenirIdBiomeFond: vi.fn(() => 'classique'),
}));

import { calculerEchelleInterface } from '../js/rendu/layout-calcul.js';
import {
    obtenirHauteurInterface,
    obtenirHauteurInterfacePortrait,
    adapterInterface,
    adapterInterfaceArchi,
    adapterInterfaceCoop,
} from '../js/rendu/layout-jeu.js';

function creerElementStyle() {
    return {
        setProperty: vi.fn(),
    };
}

describe('layout-jeu', () => {
    beforeEach(() => {
        vi.stubGlobal('window', {
            innerWidth: 800,
            innerHeight: 600,
            addEventListener: vi.fn(),
        });

        vi.stubGlobal('getComputedStyle', () => ({
            getPropertyValue: () => '0px',
        }));

        const elements = new Map([
            ['interface-echelle', { style: creerElementStyle() }],
            ['interface-jeu', { style: creerElementStyle() }],
            ['interface-echelle-archi', { style: creerElementStyle() }],
            ['interface-jeu-archi', { style: creerElementStyle() }],
            ['interface-echelle-coop', { style: creerElementStyle() }],
            ['interface-jeu-coop', { style: creerElementStyle() }],
        ]);

        vi.stubGlobal('document', {
            documentElement: {},
            getElementById: (id) => elements.get(id) ?? null,
        });
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('calculerEchelleInterface respecte le plafond', () => {
        const scale = calculerEchelleInterface(4000, 3000, 500, 800, { scaleMax: 2.2 });
        expect(scale).toBeLessThanOrEqual(2.2);
        expect(scale).toBeGreaterThan(0);
    });

    it('calculerEchelleInterface reduit l echelle sur petit ecran', () => {
        const grand = calculerEchelleInterface(1200, 900, 500, 800);
        const petit = calculerEchelleInterface(360, 640, 500, 800, { hauteurControles: 120 });
        expect(petit).toBeLessThan(grand);
    });

    it('obtenirHauteurInterface retourne une hauteur positive en paysage mobile', () => {
        window.innerHeight = 480;
        window.innerWidth = 900;
        expect(obtenirHauteurInterface()).toBeGreaterThan(0);
    });

    it('obtenirHauteurInterface retourne une hauteur positive en portrait', () => {
        window.innerHeight = 900;
        window.innerWidth = 480;
        expect(obtenirHauteurInterface()).toBeGreaterThan(0);
    });

    it('obtenirHauteurInterfacePortrait empile les trois bandes du layout colonne', () => {
        expect(obtenirHauteurInterfacePortrait()).toBeGreaterThan(obtenirHauteurInterface());
    });

    it('adapterInterface reduit l echelle en portrait mobile pour eviter un zoom excessif', () => {
        window.innerWidth = 390;
        window.innerHeight = 844;
        window.visualViewport = null;
        adapterInterface();
        const scalePortrait = Number(
            document
                .getElementById('interface-jeu')
                .style.setProperty.mock.calls.findLast((c) => c[0] === '--iface-scale')?.[1]
        );
        expect(scalePortrait).toBeLessThan(0.9);
    });

    it('adapterInterfaceCoop reduit l echelle en portrait mobile', () => {
        window.innerWidth = 390;
        window.innerHeight = 844;
        window.visualViewport = null;
        adapterInterfaceCoop();
        const scaleCoop = Number(
            document
                .getElementById('interface-jeu-coop')
                .style.setProperty.mock.calls.findLast((c) => c[0] === '--iface-scale')?.[1]
        );
        expect(scaleCoop).toBeLessThan(1);
    });

    it('adapterInterface applique les variables CSS d echelle', () => {
        adapterInterface();
        const echelle = document.getElementById('interface-echelle');
        const iface = document.getElementById('interface-jeu');
        expect(echelle.style.setProperty).toHaveBeenCalledWith(
            '--iface-echelle-w',
            expect.stringMatching(/px$/)
        );
        expect(iface.style.setProperty).toHaveBeenCalledWith('--iface-scale', expect.any(String));
    });

    it('adapterInterfaceArchi applique l echelle du mode architecte', () => {
        adapterInterfaceArchi();
        const echelle = document.getElementById('interface-echelle-archi');
        expect(echelle.style.setProperty).toHaveBeenCalledWith(
            '--iface-echelle-h',
            expect.stringMatching(/px$/)
        );
    });

    it('adapterInterfaceArchi ajuste l echelle en paysage compact', () => {
        window.innerWidth = 844;
        window.innerHeight = 390;
        adapterInterfaceArchi();
        const hPaysage = document
            .getElementById('interface-echelle-archi')
            .style.setProperty.mock.calls.find((c) => c[0] === '--iface-echelle-h')?.[1];

        window.innerWidth = 390;
        window.innerHeight = 844;
        adapterInterfaceArchi();
        const hPortrait = document
            .getElementById('interface-echelle-archi')
            .style.setProperty.mock.calls.findLast((c) => c[0] === '--iface-echelle-h')?.[1];

        expect(hPaysage).toBeTruthy();
        expect(hPortrait).toBeTruthy();
        expect(hPaysage).not.toBe(hPortrait);
    });

    it('exclut les laptops larges du mode paysage compact', () => {
        window.innerWidth = 1366;
        window.innerHeight = 768;
        adapterInterfaceArchi();
        const hLaptop = document
            .getElementById('interface-echelle-archi')
            .style.setProperty.mock.calls.find((c) => c[0] === '--iface-echelle-h')?.[1];

        window.innerWidth = 667;
        window.innerHeight = 375;
        adapterInterfaceArchi();
        const hMobile = document
            .getElementById('interface-echelle-archi')
            .style.setProperty.mock.calls.findLast((c) => c[0] === '--iface-echelle-h')?.[1];

        expect(hLaptop).toBeTruthy();
        expect(hMobile).toBeTruthy();
        expect(hLaptop).not.toBe(hMobile);
    });

    it('adapterInterface ne plante pas si le DOM est absent', () => {
        vi.stubGlobal('document', { getElementById: () => null });
        expect(() => adapterInterface()).not.toThrow();
    });

    it('adapterInterface tient compte de visualViewport', () => {
        window.innerWidth = 900;
        window.innerHeight = 800;
        window.visualViewport = {
            width: 360,
            height: 640,
            addEventListener: vi.fn(),
        };
        adapterInterface();
        const scaleCompact = document
            .getElementById('interface-jeu')
            .style.setProperty.mock.calls.find((c) => c[0] === '--iface-scale')?.[1];

        window.visualViewport = null;
        adapterInterface();
        const scaleLarge = document
            .getElementById('interface-jeu')
            .style.setProperty.mock.calls.findLast((c) => c[0] === '--iface-scale')?.[1];

        expect(Number(scaleCompact)).toBeLessThan(Number(scaleLarge));
    });

    it('adapterInterface reduit l echelle quand les insets safe-area sont actifs', () => {
        window.innerWidth = 390;
        window.innerHeight = 500;
        window.visualViewport = null;

        vi.stubGlobal('getComputedStyle', (el) => {
            if (el === document.documentElement) {
                return {
                    getPropertyValue: (cle) =>
                        ({
                            '--safe-top': '80px',
                            '--safe-right': '0px',
                            '--safe-bottom': '80px',
                            '--safe-left': '0px',
                        })[cle] ?? '0px',
                };
            }
            return { getPropertyValue: () => '0px' };
        });

        adapterInterface();
        const scaleAvecEncoche = Number(
            document
                .getElementById('interface-jeu')
                .style.setProperty.mock.calls.findLast((c) => c[0] === '--iface-scale')?.[1]
        );

        vi.stubGlobal('getComputedStyle', () => ({
            getPropertyValue: () => '0px',
        }));
        adapterInterface();
        const scaleSansEncoche = Number(
            document
                .getElementById('interface-jeu')
                .style.setProperty.mock.calls.findLast((c) => c[0] === '--iface-scale')?.[1]
        );

        expect(scaleAvecEncoche).toBeLessThan(scaleSansEncoche);
    });
});
