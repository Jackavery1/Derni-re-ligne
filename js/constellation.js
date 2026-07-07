import { BIOMES } from './config/config.js';
import { mettreAJourVisibiliteModesDebloques } from './deblocage-ui.js';
import { biomeEstDebloqueParHistoire } from './io/progression.js';
export { NOMS_MONDES_REQUIS } from './constellation-rendu.js';
export { obtenirDecalageCentreConstellation } from './constellation-zone.js';
import { abonnerBoucleMenuUnifiee, desabonnerBoucleMenuUnifiee } from './planificateur-raf.js';
import {
    ouvrirPanneauBiomeConstellation,
    fermerPanneauBiomeConstellation,
    panneauBiomeConstellationOuvert,
    masquerBarreModesBiome,
} from './constellation-panneau.js';
import { initialiserPanneauDetail, abonnerFermeturePanneauDetail } from './ui/ui-panneau-detail.js';
import { afficherTutorielLibreAvantPartie } from './tutoriel.js';
import { initialiserConfigurationEvenementsConstellation } from './constellation-etat.js';
import {
    bornesPanConstellation,
    centrerSurNoeud,
    obtenirDecalageZoneActuel,
} from './constellation-spirale.js';
import { boucleConstellation } from './constellation-boucle.js';
import {
    configurerConstellationInit,
    initConstellation,
    masquerInfoBiome,
    mettreAJourInfoBiome,
    redimensionnerConstellationInit,
} from './constellation-init.js';
import {
    definirBiomeChoisi,
    definirBiomeHover,
    obtenirBiomeChoisi,
    obtenirCanvasConstellation,
} from './constellation-etat.js';

let abonnementFermeturePanneauOk = false;
let deps = {};

function panneauBiomeEstOuvert() {
    return panneauBiomeConstellationOuvert();
}

initialiserConfigurationEvenementsConstellation(
    panneauBiomeEstOuvert,
    masquerInfoBiome,
    mettreAJourInfoBiome,
    traiterSelectionNoeud,
    bornesPanConstellation
);

configurerConstellationInit({
    obtenirRecordBiome: () => deps.obtenirRecordBiome?.(),
    obtenirRecordNiveauBiome: () => deps.obtenirRecordNiveauBiome?.(),
    calculerEtoiles: (...args) => deps.calculerEtoiles?.(...args),
    formaterEtoiles: (...args) => deps.formaterEtoiles?.(...args),
    appliquerThemeBiome: (...args) => deps.appliquerThemeBiome?.(...args),
    ouvrirHistoireVersMonde: (...args) => deps.ouvrirHistoireVersMonde?.(...args),
    obtenirNiveauGlobal: () => deps.obtenirNiveauGlobal?.() ?? 0,
    obtenirBiomeActif: () => deps.obtenirBiomeActif?.(),
    lancerBiome: lancerBiomeSelectionne,
    ouvrirPanneauBiome: ouvrirPanneauBiomeConstellation,
    fermerPanneauBiome: fermerPanneauBiomeConstellation,
    masquerBarreModesBiome,
    obtenirDecalageZone: obtenirDecalageZoneActuel,
});

function traiterSelectionNoeud(noeud, _doubleTap = false) {
    if (!noeud) {
        definirBiomeHover(null);
        masquerInfoBiome();
        return;
    }

    if (noeud.verrouille) {
        noeud.flashRejet = performance.now();
        deps.sonMenu?.('menu_hover');
        mettreAJourInfoBiome(noeud.id);
        return;
    }

    definirBiomeChoisi(noeud.id);
    deps.definirBiomeActif(noeud.id);
    deps.sauvegarderBiomeActif(noeud.id);
    const canvas = obtenirCanvasConstellation();
    if (canvas) centrerSurNoeud(noeud.id, canvas, panneauBiomeEstOuvert);
    mettreAJourInfoBiome(noeud.id);
    const select = /** @type {HTMLSelectElement | null} */ (
        document.getElementById('sel-biome-clavier')
    );
    if (select && select.value !== noeud.id) select.value = noeud.id;
    deps.sonMenu?.('menu_hover');
}

export function configurerConstellation(configuration) {
    deps = configuration;
    configurerConstellationInit({
        obtenirRecordBiome: deps.obtenirRecordBiome,
        obtenirRecordNiveauBiome: deps.obtenirRecordNiveauBiome,
        calculerEtoiles: deps.calculerEtoiles,
        formaterEtoiles: deps.formaterEtoiles,
        appliquerThemeBiome: deps.appliquerThemeBiome,
        ouvrirHistoireVersMonde: deps.ouvrirHistoireVersMonde,
        obtenirNiveauGlobal: deps.obtenirNiveauGlobal,
        obtenirBiomeActif: deps.obtenirBiomeActif,
        lancerBiome: lancerBiomeSelectionne,
        ouvrirPanneauBiome: ouvrirPanneauBiomeConstellation,
        fermerPanneauBiome: fermerPanneauBiomeConstellation,
        masquerBarreModesBiome,
        obtenirDecalageZone: obtenirDecalageZoneActuel,
    });
}

export function demarrerConstellation() {
    arreterConstellation();
    initialiserPanneauDetail();
    if (!abonnementFermeturePanneauOk) {
        abonnementFermeturePanneauOk = true;
        abonnerFermeturePanneauDetail(() => {
            if (!panneauBiomeConstellationOuvert()) masquerBarreModesBiome();
        });
    }
    initConstellation(traiterSelectionNoeud);
    mettreAJourVisibiliteModesDebloques();
    void import('./ui/infobulles-contexte.js').then(({ proposerInfobulleOracleCoopExclusif }) =>
        proposerInfobulleOracleCoopExclusif()
    );
    void import('./mode-sprint.js').then(({ mettreAJourToggleSprint }) =>
        mettreAJourToggleSprint()
    );
    abonnerBoucleMenuUnifiee(boucleConstellation);
}

export function arreterConstellation() {
    desabonnerBoucleMenuUnifiee(boucleConstellation);
}

export function redimensionnerConstellation() {
    redimensionnerConstellationInit(traiterSelectionNoeud);
}

export function lancerBiomeSelectionne() {
    const biomeChoisi = obtenirBiomeChoisi();
    if (!biomeChoisi || !BIOMES[biomeChoisi]) return;
    if (!biomeEstDebloqueParHistoire(biomeChoisi)) return;
    deps.definirBiomeActif(biomeChoisi);
    deps.sauvegarderBiomeActif(biomeChoisi);
    if (deps.modeCoopEstActif?.()) {
        deps.demarrerCooperatif?.();
    } else {
        afficherTutorielLibreAvantPartie(() => deps.demarrerJeu());
    }
}
