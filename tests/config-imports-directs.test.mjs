import { describe, it, expect } from 'vitest';
import { existsSync } from 'fs';

describe('config — imports directs', () => {
    it('le barrel config/config.js est supprimé', () => {
        expect(existsSync('js/config/config.js')).toBe(false);
    });
});
