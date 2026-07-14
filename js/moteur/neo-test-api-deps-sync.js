/** Charge les dépendances cutscene pour l’API test (getters sync après résolution). */
export async function chargerDepsCutsceneSync() {
    /** @type {(() => string | null) | null} */
    let obtenirSrcSceneCutsceneActiveSync = null;
    /** @type {(() => string | null) | null} */
    let obtenirSceneCutsceneActiveSync = null;
    /** @type {(() => string) | null} */
    let obtenirHumeurRoboCutsceneSync = null;
    /** @type {((personnageId: string) => string | null) | null} */
    let obtenirHumeurPortraitCutsceneEtatSync = null;
    /** @type {((personnageId: string) => string | null) | null} */
    let obtenirDerniereHumeurParleeSync = null;
    /** @type {(() => boolean) | null} */
    let typewriterEstActifSync = null;

    await Promise.all([
        import('../histoire/histoire-cutscene-fonds.js').then((mod) => {
            obtenirSceneCutsceneActiveSync = mod.obtenirSceneCutsceneActive;
            obtenirSrcSceneCutsceneActiveSync = mod.obtenirSrcSceneCutsceneActive;
        }),
        import('../rendu/portraits-cutscene-etat.js').then((mod) => {
            obtenirHumeurRoboCutsceneSync = mod.obtenirHumeurRoboCutscene;
            obtenirHumeurPortraitCutsceneEtatSync = mod.obtenirHumeurPortraitCutsceneEtat;
        }),
        import('../rendu/expressions-cutscene.js').then((mod) => {
            obtenirDerniereHumeurParleeSync = mod.obtenirDerniereHumeurParleePortrait;
        }),
        import('../histoire/histoire-cutscene-typewriter.js').then((mod) => {
            typewriterEstActifSync = mod.typewriterEstActif;
        }),
    ]);

    return {
        obtenirSceneCutsceneActive: () => obtenirSceneCutsceneActiveSync?.() ?? null,
        obtenirSrcSceneCutsceneActive: () => obtenirSrcSceneCutsceneActiveSync?.() ?? null,
        typewriterEstActif: () => typewriterEstActifSync?.() ?? false,
        obtenirHumeurPortraitCutscene: (personnageId = 'robo') => {
            const depuisLigne = obtenirDerniereHumeurParleeSync?.(personnageId);
            if (depuisLigne) return depuisLigne;
            const depuisEtat = obtenirHumeurPortraitCutsceneEtatSync?.(personnageId);
            if (depuisEtat) return depuisEtat;
            if (!personnageId || personnageId === 'robo') {
                return obtenirHumeurRoboCutsceneSync?.() ?? null;
            }
            return null;
        },
    };
}
