import { describe, it, expect, beforeEach, vi } from 'vitest';

const { definirVolumePauseMusique, afficherEcran, cacherEcrans } = vi.hoisted(() => ({
    definirVolumePauseMusique: vi.fn(),
    afficherEcran: vi.fn(),
    cacherEcrans: vi.fn(),
}));

vi.mock('../js/audio/audio.js', async (importOriginal) => {
    const actual = await importOriginal();
    return {
        ...actual,
        AudioMoteur: {
            ...actual.AudioMoteur,
            definirVolumePauseMusique,
        },
    };
});

vi.mock('../js/ui/ecrans-ui.js', async (importOriginal) => {
    const actual = await importOriginal();
    return {
        ...actual,
        afficherEcran,
        cacherEcrans,
    };
});

import { basculerPauseCoop } from '../js/coop-jeu.js';
import { coop } from '../js/logique/coop-logique.js';

describe('coop pause audio', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        coop.estEnCours = true;
        coop.estEnPause = false;
        coop.score = 1200;
        coop.niveau = 2;
        document.body.innerHTML =
            '<div id="coop-pause-score"></div><div id="coop-pause-niveau"></div>';
    });

    it('duck la musique à la pause et la restaure à la reprise', () => {
        basculerPauseCoop();
        expect(definirVolumePauseMusique).toHaveBeenCalledWith(true);

        basculerPauseCoop();
        expect(definirVolumePauseMusique).toHaveBeenCalledWith(false);
    });
});
