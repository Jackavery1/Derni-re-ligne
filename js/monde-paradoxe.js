import { store } from './store-core.js';
import { logger } from './logger.js';
import { chargerEtatHistoire, sauvegarderEtatHistoire } from './progression.js';

const _NOM = 'monde_paradoxe';

export function paradoxeEstDebloque() {
    const e = store.histoire.etat ?? chargerEtatHistoire();
    return (
        e.conditionsParadoxe.finSecreteObtenue &&
        (e.conditionsParadoxe.topsVolontairesPrologue ?? 0) >= 3
    );
}

export function demarrerParadoxe() {
    if (!paradoxeEstDebloque()) return;
    logger.info('[paradoxe] entrée');

    store.histoire.actif = true;
    store.histoire.mondeActuel = _NOM;

    void Promise.all([import('./histoire-textes.js'), import('./histoire-manager.js')]).then(
        ([{ CUTSCENES_ENTREE }, { afficherCutsceneHistoire, retournerACarte }]) => {
            const lignes = CUTSCENES_ENTREE.monde_paradoxe ?? [];
            afficherCutsceneHistoire(
                lignes.map((l) => l.texte),
                lignes.map((l) => l.personnage),
                () => _surFinParadoxe(retournerACarte)
            );
        }
    );
}

function _surFinParadoxe(retournerACarte) {
    const etatHist = store.histoire.etat ?? chargerEtatHistoire();
    if (!etatHist.mondesCompletes.includes(_NOM)) {
        etatHist.mondesCompletes.push(_NOM);
        sauvegarderEtatHistoire(etatHist);
        store.histoire.etat = etatHist;
    }
    setTimeout(retournerACarte, 600);
}
