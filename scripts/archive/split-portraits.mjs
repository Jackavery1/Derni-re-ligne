import { readFileSync, writeFileSync } from 'node:fs';

const lines = readFileSync('js/portraits-cutscene.js', 'utf8').split(/\r?\n/);

writeFileSync(
    'js/portraits-cutscene-utils.js',
    `/** Utilitaires canvas portraits cutscene. */
${lines
    .slice(10, 36)
    .join('\n')
    .replace(/^function _rectArrondiPortrait/, 'export function rectArrondiPortrait')
    .replace(/^function _interpolerCouleurPortrait/, 'export function interpolerCouleurPortrait')}
`
);

const personnagesBody = lines
    .slice(37, 672)
    .join('\n')
    .replace(/\b_rectArrondiPortrait\b/g, 'rectArrondiPortrait')
    .replace(/\b_interpolerCouleurPortrait\b/g, 'interpolerCouleurPortrait');

writeFileSync(
    'js/portraits-cutscene-personnages.js',
    `/** Dessins canvas des personnages cutscene. */
import { rectArrondiPortrait, interpolerCouleurPortrait } from '../../js/portraits-cutscene-utils.js';

${personnagesBody}
`
);

writeFileSync(
    'js/portraits-cutscene.js',
    `${lines.slice(0, 9).join('\n')}
import { logger } from '../../js/logger.js';
import { dessinerPortraitCutsceneInterne } from '../../js/portraits-cutscene-personnages.js';

export function dessinerPortraitCutscene(ctx, w, h, personnageId, t) {
    try {
        dessinerPortraitCutsceneInterne(ctx, w, h, personnageId, t);
    } catch (err) {
        logger.warn('[portraits-cutscene] erreur rendu :', err);
        ctx.clearRect(0, 0, w, h);
    }
}
`
);

console.log('portraits split done');
