import { readFileSync, writeFileSync } from 'node:fs';

const SRC = 'scripts/histoire-manager-ui.original.js';
const lines = readFileSync(SRC, 'utf8').split(/\r?\n/);

writeFileSync(
    'js/histoire-cutscene-fonds.js',
    `/** Fonds animes canvas cutscene. */
import { CONFIG_FOND_CUTSCENE } from './histoire-cutscene-config.js';

let _canvasBgCutscene = null;
let _ctxBg = null;
let _rafBg = null;
let _fondActif = null;

export function lierCanvasFondCutscene(canvas) {
    _canvasBgCutscene = canvas;
    _ctxBg = canvas?.getContext('2d') ?? null;
}

${lines.slice(237, 381).join('\n')}

export function demarrerFondCutscene(personnageId) {
    if (!_ctxBg || !_canvasBgCutscene) return;
    _fondActif = CONFIG_FOND_CUTSCENE[personnageId] ?? CONFIG_FOND_CUTSCENE.narrateur;
    _canvasBgCutscene.width = window.innerWidth;
    _canvasBgCutscene.height = window.innerHeight;
    if (!_rafBg) _rafBg = requestAnimationFrame(_boucleFondCutscene);
}

export function stopFondCutscene() {
    if (_rafBg) {
        cancelAnimationFrame(_rafBg);
        _rafBg = null;
    }
    _fondActif = null;
    if (_ctxBg && _canvasBgCutscene) {
        _ctxBg.clearRect(0, 0, _canvasBgCutscene.width, _canvasBgCutscene.height);
    }
}

export function estFondCutsceneActif() {
    return _rafBg != null;
}
`
);

writeFileSync(
    'js/histoire-journal-ui.js',
    `/** Journal narratif histoire. */
import { definirExpressionVera } from './portraits-vera.js';
import { ECRANS } from './ecrans-config.js';
import { logger } from './logger.js';
import { obtenirCanvas } from './dom-utils.js';
import { afficherEcranHistoire, cacherEcransHistoire } from './histoire-cutscene-nav.js';

let journalCallbackFermer = null;

${lines
    .slice(688, 764)
    .join('\n')
    .replace(/\b_afficherEcran\b/g, 'afficherEcranHistoire')
    .replace(/\b_cacherEcrans\b/g, 'cacherEcransHistoire')}
`
);

const cutsceneBody = [
    ...lines.slice(82, 88),
    ...lines.slice(91, 102),
    ...lines.slice(104, 106),
    ...lines.slice(125, 218),
    ...lines.slice(382, 687),
    ...lines.slice(765, 773),
]
    .join('\n')
    .replace(/\b_demarrerFondCutscene\b/g, 'demarrerFondCutscene')
    .replace(/\b_stopFondCutscene\b/g, 'stopFondCutscene')
    .replace(/\b_idPortraitMeta\b/g, 'idPortraitMeta')
    .replace(/\b_idPortraitRendu\b/g, 'idPortraitRendu')
    .replace(/\b_afficherEcran\b/g, 'afficherEcranHistoire')
    .replace(/\b_cacherEcrans\b/g, 'cacherEcransHistoire')
    .replace(
        /if \(_canvasBgCutscene\) _ctxBg = _canvasBgCutscene\.getContext\('2d'\);/,
        'if (_canvasBgCutscene) lierCanvasFondCutscene(_canvasBgCutscene);'
    )
    .replace(
        /if \(fondPrecedent !== personnageId \|\| !_rafBg\)/,
        'if (fondPrecedent !== personnageId || !estFondCutsceneActif())'
    );

writeFileSync(
    'js/histoire-cutscene.js',
    `/** Cutscene histoire (orchestration). */
import { obtenirHistoireTextesSync } from './charger-histoire-textes.js';
import { store } from './store-core.js';
import { ECRANS } from './ecrans-config.js';
import { logger } from './logger.js';
import {
    definirHumeurRoboCutscene,
    dessinerPortraitCutscene,
} from './portraits-cutscene.js';
import { dessinerRobo } from './rendu-robo.js';
import { afficherEcranHistoire, cacherEcransHistoire } from './histoire-cutscene-nav.js';
import {
    POSITION_PERSONNAGE,
    COULEUR_PERSONNAGE,
    idPortraitMeta,
    idPortraitRendu,
} from './histoire-cutscene-config.js';
import {
    lierCanvasFondCutscene,
    demarrerFondCutscene,
    stopFondCutscene,
    estFondCutsceneActif,
} from './histoire-cutscene-fonds.js';

${cutsceneBody}
`
);

writeFileSync(
    'js/histoire-manager-ui.js',
    `/** Facade UI histoire (reexporte les modules decoupes). */
export {
    afficherCutsceneHistoire,
    passerCutscene,
    avancerCutscene,
    afficherFinHistoire,
    afficherBoutonCarteGameOver,
} from './histoire-cutscene.js';

export { afficherJournalHistoire, fermerJournalHistoire } from './histoire-journal-ui.js';
`
);

console.log('Split complete from', SRC);
