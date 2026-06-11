import { describe, it, expect } from 'vitest';
import { mettreAJourOrdrePistes } from '../scripts/lib/eviction-pistes.mjs';

describe('FIFO eviction pistes musique SW', () => {
    it('ajoute une piste sans evincer sous le plafond', () => {
        const { ordre, evincees } = mettreAJourOrdrePistes([], 'https://x.test/a.ogg', 12);
        expect(ordre).toEqual(['https://x.test/a.ogg']);
        expect(evincees).toEqual([]);
    });

    it('remonte une piste deja presente', () => {
        const initial = ['https://x.test/a.ogg', 'https://x.test/b.ogg'];
        const { ordre } = mettreAJourOrdrePistes(initial, 'https://x.test/a.ogg', 12);
        expect(ordre).toEqual(['https://x.test/b.ogg', 'https://x.test/a.ogg']);
    });

    it('evince la plus ancienne au-dela de MAX', () => {
        const initial = Array.from({ length: 12 }, (_, i) => `https://x.test/p${i}.ogg`);
        const { ordre, evincees } = mettreAJourOrdrePistes(
            initial,
            'https://x.test/nouvelle.ogg',
            12
        );
        expect(evincees).toEqual(['https://x.test/p0.ogg']);
        expect(ordre).toHaveLength(12);
        expect(ordre.at(-1)).toBe('https://x.test/nouvelle.ogg');
    });
});
