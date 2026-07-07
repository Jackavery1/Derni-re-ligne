export {
    dessinerIllustRouille,
    dessinerIllustEclipse,
    dessinerIllustVide,
    dessinerIllustMiroir,
    dessinerIllustTrame,
} from '../codex-illustrations-histoire/mondes.js';
export {
    dessinerIllustVera,
    dessinerIllustDistorsion,
    dessinerIllustBrasier,
    dessinerIllustSentinelle,
    dessinerIllustArchiviste,
    dessinerIllustAvantgarde,
    dessinerIllustTroisFins,
} from '../codex-illustrations-histoire/boss-fins.js';

import * as mondes from '../codex-illustrations-histoire/mondes.js';
import * as bossFins from '../codex-illustrations-histoire/boss-fins.js';

export const ILLUSTRATIONS_CODEX_HISTOIRE = {
    ...mondes,
    ...bossFins,
};
