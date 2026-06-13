import { CUTSCENES_ENTREE_PROLOGUE } from './cutscenes-entree-prologue.js';
import { CUTSCENES_ENTREE_OCEAN } from './cutscenes-entree-ocean.js';
import { CUTSCENES_ENTREE_DESERT } from './cutscenes-entree-desert.js';
import { CUTSCENES_ENTREE_COSMOS } from './cutscenes-entree-cosmos.js';
import { CUTSCENES_ENTREE_FINALE } from './cutscenes-entree-finale.js';

export const CUTSCENES_ENTREE = {
    ...CUTSCENES_ENTREE_PROLOGUE,
    ...CUTSCENES_ENTREE_OCEAN,
    ...CUTSCENES_ENTREE_DESERT,
    ...CUTSCENES_ENTREE_COSMOS,
    ...CUTSCENES_ENTREE_FINALE,
};
