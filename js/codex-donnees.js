import { CODEX_HISTOIRE } from './codex-histoire.js';
import { CODEX_MONDES } from './codex-donnees/mondes.js';
import { CODEX_RELIQUES } from './codex-donnees/reliques.js';
import { CODEX_CHRONIQUES } from './codex-donnees/chroniques.js';

export const CODEX = {
    ...CODEX_MONDES,
    ...CODEX_RELIQUES,
    ...CODEX_CHRONIQUES,
};

Object.assign(CODEX, CODEX_HISTOIRE);
