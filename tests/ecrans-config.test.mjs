import { describe, it, expect } from 'vitest';
import {
    ECRANS_CHARGEMENT_IMMEDIAT,
    FRAGMENTS_PARTIE,
    ECRANS_CHARGEMENT_DIFFERE,
} from '../js/ui/ecrans-config.js';

describe('ecrans-config — chargement différé', () => {
    it('le boot immédiat ne charge que titre, sélection, options et overlays', () => {
        expect(ECRANS_CHARGEMENT_IMMEDIAT).toEqual([
            'ecran-titre',
            'ecran-selection',
            'ecran-options',
            'overlays',
        ]);
    });

    it('les fragments partie sont différés jusqu’au prefetch sélection / lancement', () => {
        expect(FRAGMENTS_PARTIE).toContain('interface-jeu');
        expect(FRAGMENTS_PARTIE).toContain('ecran-pause');
        expect(FRAGMENTS_PARTIE).toContain('ecran-game-over');
        expect(FRAGMENTS_PARTIE).toContain('controles');
        for (const fragment of FRAGMENTS_PARTIE) {
            expect(ECRANS_CHARGEMENT_DIFFERE).toContain(fragment);
        }
    });
});
