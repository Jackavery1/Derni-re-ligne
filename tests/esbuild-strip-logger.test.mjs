import { describe, it, expect } from 'vitest';
import { retirerAppelsLogger } from '../scripts/esbuild-strip-logger.mjs';

describe('esbuild-strip-logger', () => {
    it('retire logger.debug et logger.info en preservant le reste', () => {
        const source = `
logger.debug('a', 1);
const x = 1;
logger.info('b');
logger.warn('c');
logger.error('d');
`;
        const out = retirerAppelsLogger(retirerAppelsLogger(source, 'debug'), 'info');
        expect(out).not.toMatch(/logger\.debug/);
        expect(out).not.toMatch(/logger\.info/);
        expect(out).toMatch(/logger\.warn\('c'\)/);
        expect(out).toMatch(/logger\.error\('d'\)/);
        expect(out).toMatch(/const x = 1/);
    });

    it('gere les parentheses imbriquees dans les arguments', () => {
        const source = `logger.debug('x', foo(1, bar(2)));\nreste();`;
        const out = retirerAppelsLogger(source, 'debug');
        expect(out).toBe('\nreste();');
    });

    it('ignore les identifiants qui contiennent logger', () => {
        const source = `monlogger.debug('x');\n`;
        expect(retirerAppelsLogger(source, 'debug')).toBe(source);
    });
});
