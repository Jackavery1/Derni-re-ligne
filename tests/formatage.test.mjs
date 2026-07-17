import { describe, it, expect } from 'vitest';
import { formaterTemps } from '../js/logique/formatage.js';

describe('formatage', () => {
    it('formate mm:ss', () => {
        expect(formaterTemps(0)).toBe('00:00');
        expect(formaterTemps(65_000)).toBe('01:05');
        expect(formaterTemps(-100)).toBe('00:00');
    });
});
