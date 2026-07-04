import { CUTSCENES_POST_MONDE_PROLOGUE } from './cutscenes-post-monde-prologue.js';
import { CUTSCENES_POST_MONDE_OCEAN } from './cutscenes-post-monde-ocean.js';
import { CUTSCENES_POST_MONDE_DESERT } from './cutscenes-post-monde-desert.js';
import { CUTSCENES_POST_MONDE_COSMOS } from './cutscenes-post-monde-cosmos.js';
import { CUTSCENES_POST_MONDE_FINALE } from './cutscenes-post-monde-finale.js';

export const CUTSCENES_POST_MONDE = {
    ...CUTSCENES_POST_MONDE_PROLOGUE,
    ...CUTSCENES_POST_MONDE_OCEAN,
    ...CUTSCENES_POST_MONDE_DESERT,
    ...CUTSCENES_POST_MONDE_COSMOS,
    ...CUTSCENES_POST_MONDE_FINALE,
};
