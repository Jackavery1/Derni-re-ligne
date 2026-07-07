import { describe, it, expect } from 'vitest';
import {
    appliquerTransformCamera,
    ecranVersMonde,
    mondeVersEcran,
} from '../js/histoire/histoire-map-camera.js';

describe('histoire-map-camera', () => {
    const cam = { y: 120, zoom: 1.6 };

    it('ecranVersMonde : centre ecran = centre monde sans decalage X', () => {
        const { mx, my } = ecranVersMonde(cam, 400, 300, 800, 600);
        expect(mx).toBeCloseTo(400, 5);
        expect(my).toBeCloseTo(300 + cam.y, 5);
    });

    it('ecranVersMonde : point haut ecran remonte dans le monde', () => {
        const centre = ecranVersMonde(cam, 400, 300, 800, 600);
        const haut = ecranVersMonde(cam, 400, 0, 800, 600);
        expect(haut.my).toBeLessThan(centre.my);
    });

    it('ecranVersMonde : zoom agrandit la zone monde visible', () => {
        const zoom1 = ecranVersMonde({ y: 0, zoom: 1 }, 800, 300, 800, 600);
        const zoom2 = ecranVersMonde({ y: 0, zoom: 2 }, 800, 300, 800, 600);
        expect(zoom2.mx - 400).toBeLessThan(zoom1.mx - 400);
    });

    it('mondeVersEcran : x monde proche du bord sort de l ecran avec zoom', () => {
        const { sx } = mondeVersEcran(cam, 12, 200, 800, 600);
        expect(sx).toBeLessThan(0);
    });

    it('mondeVersEcran et ecranVersMonde sont inverses', () => {
        const monde = { mx: 120, my: 480 };
        const { sx, sy } = mondeVersEcran(cam, monde.mx, monde.my, 800, 600);
        const retour = ecranVersMonde(cam, sx, sy, 800, 600);
        expect(retour.mx).toBeCloseTo(monde.mx, 4);
        expect(retour.my).toBeCloseTo(monde.my, 4);
    });

    it('appliquerTransformCamera ne lance pas d erreur', () => {
        const ctx = {
            save() {},
            restore() {},
            translate() {},
            scale() {},
        };
        expect(() => appliquerTransformCamera(cam, ctx, 800, 600)).not.toThrow();
    });
});
