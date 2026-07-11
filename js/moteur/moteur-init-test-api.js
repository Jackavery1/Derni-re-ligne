import { chargerDepsCutsceneSync } from './neo-test-api-deps-sync.js';
import { creerHandlersPartie } from './neo-test-api-handlers-partie.js';
import { creerHandlersHistoire } from './neo-test-api-handlers-histoire.js';
import { creerHandlersCoop } from './neo-test-api-handlers-coop.js';
import {
    creerHandlersGameFeel,
    initialiserJournalSfxTest,
} from './neo-test-api-handlers-gamefeel.js';
import { creerHandlersDifficulte } from './neo-test-api-handlers-difficulte.js';

export function initialiserNeoTestApi() {
    void import('../neo-test-api.js').then(async ({ exposerNeoTestApi, estNeoTestAutorise }) => {
        if (!estNeoTestAutorise()) return;
        const depsSync = await chargerDepsCutsceneSync();
        initialiserJournalSfxTest();
        exposerNeoTestApi({
            ...creerHandlersPartie(),
            ...creerHandlersHistoire(depsSync),
            ...creerHandlersCoop(),
            ...creerHandlersGameFeel(),
            ...creerHandlersDifficulte(),
        });
    });
}
