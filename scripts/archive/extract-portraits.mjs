import { readFileSync, writeFileSync } from 'fs';

const src = readFileSync('js/histoire-manager-ui.js', 'utf8');
const lines = src.split('\n');
const body = lines.slice(277, 939).join('\n');
const header = `import { dessinerRobo } from './rendu-robo.js';
import { logger } from './logger.js';

/** @type {'neutre'|'content'|'excite'|'triste'|'alerte'} */
let _humeurRoboCutscene = 'content';

export function definirHumeurRoboCutscene(humeur) {
    _humeurRoboCutscene = humeur;
}

`;
const footer = `
export function dessinerPortraitCutscene(ctx, w, h, personnageId, t) {
    try {
        _dessinerPortraitCutsceneInterne(ctx, w, h, personnageId, t);
    } catch (err) {
        logger.warn('[portraits-cutscene] erreur rendu :', err);
        ctx.clearRect(0, 0, w, h);
    }
}
`;
const renamed = body.replace(
    'function _dessinerPortraitCutscene',
    'function _dessinerPortraitCutsceneInterne'
);
writeFileSync('js/portraits-cutscene.js', header + renamed + footer);
console.log('OK');
