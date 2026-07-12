import { describe, it, expect, vi } from 'vitest';
import { calculerPositionsNoeuds } from '../js/histoire/histoire-map-layout.js';
import { mettreAJourCameraCarte } from '../js/histoire/histoire-map-focus.js';

vi.mock('../js/histoire/histoire-mondes.js', () => ({
    obtenirEtatHistoire: () => ({}),
    mondePeutEtreJoue: () => true,
}));

vi.mock('../js/histoire/histoire-navigation.js', () => ({
    consommerMondeCibleCarte: () => null,
}));

describe('histoire-map-focus', () => {
    it('scrollMin descend sous le focus initial pour permettre de remonter', () => {
        const etatCarte = {
            camera: {
                y: 0,
                zoom: 1.6,
                cibleY: 0,
                cibleZoom: 1.6,
                vitesseLerp: 0.07,
                scrollMin: -60,
                scrollMax: 2500,
                initialise: false,
            },
            canvasCarte: { width: 800, height: 844 },
            positionsNoeuds: {},
            noeudSelectionne: null,
        };
        calculerPositionsNoeuds(etatCarte);
        mettreAJourCameraCarte(etatCarte, () => {});

        const initY = etatCarte.camera.cibleY;
        expect(initY).toBeLessThan(-60);
        expect(etatCarte.camera.scrollMin).toBeLessThanOrEqual(initY - 40);

        const cam = etatCarte.camera;
        cam.cibleY = Math.max(cam.scrollMin, Math.min(cam.scrollMax, cam.cibleY + 200));
        cam.cibleY = Math.max(cam.scrollMin, Math.min(cam.scrollMax, cam.cibleY - 200));
        expect(cam.cibleY).toBeCloseTo(initY, 0);
    });
});
