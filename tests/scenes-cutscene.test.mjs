import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
    SCENES_CUTSCENE,
    obtenirScene,
    precharger,
    obtenirImageScenePrechargee,
    reinitialiserCacheScenes,
} from '../js/scenes-cutscene.js';

describe('scenes-cutscene', () => {
    beforeEach(() => {
        reinitialiserCacheScenes();
    });

    it('expose le registre des scènes image', () => {
        expect(obtenirScene('observatoire')?.type).toBe('image');
        expect(obtenirScene('labo_vera')?.src).toContain('scene_labo.png');
        expect(obtenirScene('inconnue')).toBeNull();
    });

    it('échoue sans exception si l’image est absente', async () => {
        const img = await precharger('observatoire');
        expect(img).toBeNull();
        expect(obtenirImageScenePrechargee('observatoire')).toBeNull();
    });

    it('met en cache une image chargée', async () => {
        class FakeImage {
            constructor() {
                this.onload = null;
                this.onerror = null;
                this.width = 960;
                this.height = 540;
            }
            set src(_v) {
                queueMicrotask(() => this.onload?.());
            }
        }
        vi.stubGlobal('Image', FakeImage);

        const img = await precharger('trame_primordiale');
        expect(img).toBeTruthy();
        expect(obtenirImageScenePrechargee('trame_primordiale')).toBe(img);
        expect(SCENES_CUTSCENE.trame_primordiale.kenBurns).toBe('zoom_lent');
    });
});
