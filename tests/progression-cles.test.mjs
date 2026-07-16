import { describe, it, expect } from 'vitest';
import {
    CLES_PREFERENCES,
    CLES_STOCKAGE,
    MOTIFS_CLES_PROGRESSION,
    PREFIXE_STOCKAGE,
} from '../js/io/progression-cles.js';
import { estCleProgression, estClePreference } from '../js/io/progression-stockage.js';

describe('progression-cles', () => {
    it('CLES_PREFERENCES est un sous-ensemble hors progression', () => {
        for (const cle of CLES_PREFERENCES) {
            expect(estClePreference(cle)).toBe(true);
            expect(estCleProgression(cle)).toBe(false);
        }
    });

    it('MOTIFS_CLES_PROGRESSION matchent records et archi', () => {
        const exemples = [
            'derniereLigne_record_lave',
            'derniereLigne_recniv_glace',
            'derniereLigne_recordcoop_cyber',
            'derniereLigne_sprint_ocean',
            'derniereLigne_archi_niveau_un',
            'derniereLigne_monde_histoire_prologue',
            'tetrisNeo_record_lave',
            'tetrisNeo_archi_niveau_deux',
        ];
        for (const cle of exemples) {
            expect(MOTIFS_CLES_PROGRESSION.some((re) => re.test(cle))).toBe(true);
            expect(estCleProgression(cle)).toBe(true);
        }
    });

    it('rejette volume et cles inventees', () => {
        expect(estCleProgression('derniereLigne_volume')).toBe(false);
        expect(estCleProgression(`${PREFIXE_STOCKAGE}inventee_xyz`)).toBe(false);
        expect(estCleProgression('autre_cle')).toBe(false);
    });

    it('CLES_STOCKAGE non-preference compte comme progression', () => {
        expect(CLES_STOCKAGE.has('derniereLigne_histoire')).toBe(true);
        expect(estCleProgression('derniereLigne_histoire')).toBe(true);
    });
});
