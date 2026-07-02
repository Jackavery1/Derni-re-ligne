import { ILLUSTRATIONS_CODEX_HISTOIRE } from './codex-illustrations-histoire.js';
import * as biomes from './codex-illustrations/biomes.js';
import * as reliques from './codex-illustrations/reliques.js';
import * as chroniques from './codex-illustrations/chroniques.js';

export const ILLUSTRATIONS_CODEX = {
    ...biomes,
    ...reliques,
    ...chroniques,
};

Object.assign(ILLUSTRATIONS_CODEX, ILLUSTRATIONS_CODEX_HISTOIRE);
