import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';

describe('versions alignees', () => {
    it('package.json, index, sw, README et CHANGELOG partagent la meme version', () => {
        const version = JSON.parse(readFileSync('package.json', 'utf8')).version;
        expect(readFileSync('index.html', 'utf8')).toContain(`js/main.js?v=${version}`);
        expect(readFileSync('sw.js', 'utf8')).toContain('VERSION_SHELL');
        expect(readFileSync('sw.js', 'utf8')).toContain('VERSION_MEDIAS');
        expect(readFileSync('README.md', 'utf8')).toContain(`**Version : ${version}**`);
        expect(readFileSync('CHANGELOG.md', 'utf8')).toContain(`## [${version}]`);
    });
});
