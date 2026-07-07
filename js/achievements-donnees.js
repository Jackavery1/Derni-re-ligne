import {
    ACHIEVEMENTS_HISTOIRE,
    chargerAchievementsHistoire,
} from './achievements/achievements-histoire.js';
import { ACHIEVEMENTS_CONDITIONS } from './achievements/achievements-conditions-core.js';

export const ACHIEVEMENTS = {};

/** @type {Promise<void> | null} */
let _chargePromise = null;

export function achievementsDonneesChargees() {
    return Object.keys(ACHIEVEMENTS).length > 0;
}

/** @returns {Promise<void>} */
export async function chargerAchievementsDonnees() {
    if (achievementsDonneesChargees()) return;
    if (_chargePromise) return _chargePromise;
    _chargePromise = fetch('./data/achievements-core.json')
        .then((reponse) => {
            if (!reponse.ok) throw new Error(`achievements-core.json : ${reponse.status}`);
            return reponse.json();
        })
        .then(async (meta) => {
            for (const [id, ach] of Object.entries(meta)) {
                ACHIEVEMENTS[id] = {
                    ...ach,
                    condition: ACHIEVEMENTS_CONDITIONS[id],
                };
            }
            await chargerAchievementsHistoire();
            Object.assign(ACHIEVEMENTS, ACHIEVEMENTS_HISTOIRE);
        });
    return _chargePromise;
}
