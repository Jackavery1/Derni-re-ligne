import { CONFIG, BIOMES } from './config.js';
import { store } from './store-core.js';
import { etat, obtenirBiomeActif } from './store-jeu.js';
import { ecouter } from './bus-jeu.js';
import { logger } from './logger.js';
import { obtenirEtatHistoire, sauvegarderEtatHistoireStore } from './histoire-manager.js';
import { verifierConditionMiroir, verifierConditionC3 } from './conditions-secrets.js';
import { ajouterBlocksRouillesEffaces } from './achievements-histoire.js';

export function biomeActuelMecanique() {
    if (!store.modeHistoireActif) return null;
    return BIOMES[obtenirBiomeActif()]?.mecaniqueSpeciale ?? null;
}

export function biomeActuelEstMiroir() {
    return biomeActuelMecanique() === 'miroir';
}

export function biomeActuelEstVide() {
    return biomeActuelMecanique() === 'vide';
}

let _desinscriptions = [];

export function initialiserMecaniquesHistoire() {
    if (!store.modeHistoireActif) return;

    const mec = biomeActuelMecanique();
    if (!mec) return;

    const N = CONFIG.lignes * CONFIG.colonnes;
    store.plateauTimestamps = new Float64Array(N).fill(0);
    store.plateauRouille = new Uint8Array(N).fill(0);

    store.eclipseLigneActuelle = BIOMES.eclipse?.ligneEclipseBase ?? 10;
    store.eclipseDerniereMaj = performance.now();

    store.videPieceTimestamp = performance.now();
    store.videPieceInvisible = false;

    store.cyberTetrisConsecutifs = 0;
    store.cyberTetrisCumulPartie = 0;

    store.trameBiomeIndex = 0;
    store.trameTimerMorph = 0;
    store.trameAlphaMorph = 1.0;
    store.trameEnTransition = false;

    if (mec === 'miroir') _appliquerCSSMiroir(true);

    const off1 = ecouter('partie:nouvelle-piece', _surNouvellepiece);
    const off2 = ecouter('lignes:effacees', _surLignesEffacees);
    _desinscriptions = [off1, off2];

    logger.info('[mecHistoire] initialisé :', mec);
}

export function arreterMecaniquesHistoire() {
    _appliquerCSSMiroir(false);
    const canvasPlat = document.getElementById('canvas-plateau');
    canvasPlat?.classList.remove('biome-miroir');

    _desinscriptions.forEach((fn) => fn?.());
    _desinscriptions = [];

    store.plateauTimestamps = null;
    store.plateauRouille = null;
    store.videPieceInvisible = false;

    logger.info('[mecHistoire] arrêté');
}

export function mettreAJourMecaniquesHistoire(dt, timestamp) {
    if (!store.modeHistoireActif || etat.estEnPause) return;
    const mec = biomeActuelMecanique();
    if (!mec) return;

    switch (mec) {
        case 'rouille':
            _tickRouille(timestamp);
            break;
        case 'eclipse':
            _tickEclipse(dt, timestamp);
            break;
        case 'vide':
            _tickVide(timestamp);
            break;
        case 'trame':
            _tickTrame(dt, timestamp);
            break;
    }
}

function _surNouvellepiece() {
    if (!store.modeHistoireActif) return;
    if (biomeActuelEstVide()) {
        store.videPieceTimestamp = performance.now();
        store.videPieceInvisible = false;
    }
}

function _surLignesEffacees({ nbSupprimees, lignesEffacees }) {
    if (!store.modeHistoireActif) return;
    const mec = biomeActuelMecanique();

    if (mec === 'rouille' && store.plateauTimestamps) {
        _decalerMatricesRouille(lignesEffacees);
    }

    if (obtenirBiomeActif() === 'cyber') {
        _trackerTetrisCyber(nbSupprimees);
    }
}

const SEUIL_ROUILLE_MS = () => (BIOMES.rouille?.secondesAvantRouille ?? 18) * 1000;
const ECLIPSE_VITESSE_HAUT_FACTEUR = 1.5;
const ECLIPSE_VITESSE_BAS_FACTEUR = 0.65;
const ECLIPSE_MONTEE_INTERVALLE_MS = () => BIOMES.eclipse?.monteeIntervalleMs ?? 30000;
const ECLIPSE_LIGNE_MIN = () => BIOMES.eclipse?.ligneEclipseMin ?? 6;
const VIDE_SEUIL_INVISIBILITE_MS = () => (BIOMES.vide?.secondesAvantInvisibilite ?? 3) * 1000;
const TRAME_INTERVALLE_MORPH_MS = () => BIOMES.trame?.intervalleMorphMs ?? 35000;
const TRAME_DUREE_FADE_MS = () => BIOMES.trame?.dureeFadeMs ?? 1200;

export function enregistrerTimestampCellules(cellules) {
    if (!store.modeHistoireActif) return;
    if (biomeActuelMecanique() !== 'rouille') return;
    if (!store.plateauTimestamps) return;
    const now = performance.now();
    for (const { x, y } of cellules) {
        if (y >= 0 && y < CONFIG.lignes && x >= 0 && x < CONFIG.colonnes) {
            store.plateauTimestamps[y * CONFIG.colonnes + x] = now;
            store.plateauRouille[y * CONFIG.colonnes + x] = 0;
        }
    }
}

function _tickRouille(timestamp) {
    if (!store.plateauTimestamps) return;
    for (let i = 0; i < CONFIG.lignes * CONFIG.colonnes; i++) {
        const ts = store.plateauTimestamps[i];
        if (ts === 0) continue;
        if (store.plateauRouille[i]) continue;
        if (timestamp - ts >= SEUIL_ROUILLE_MS()) {
            store.plateauRouille[i] = 1;
        }
    }
}

function _decalerMatricesRouille(lignesEffacees) {
    if (!store.plateauTimestamps || !lignesEffacees?.length) return;
    const sorted = [...lignesEffacees].sort((a, b) => b - a);
    const TS = store.plateauTimestamps;
    const RO = store.plateauRouille;
    const C = CONFIG.colonnes;

    for (const lig of sorted) {
        for (let l = lig; l > 0; l--) {
            for (let c = 0; c < C; c++) {
                TS[l * C + c] = TS[(l - 1) * C + c];
                RO[l * C + c] = RO[(l - 1) * C + c];
            }
        }
        for (let c = 0; c < C; c++) {
            TS[c] = 0;
            RO[c] = 0;
        }
    }
    ajouterBlocksRouillesEffaces(sorted.length);
}

export function celluleEstRouillee(x, y) {
    if (!store.modeHistoireActif || !store.plateauRouille) return false;
    if (y < 0 || y >= CONFIG.lignes || x < 0 || x >= CONFIG.colonnes) return false;
    return store.plateauRouille[y * CONFIG.colonnes + x] === 1;
}

function _tickEclipse(dt, timestamp) {
    void dt;
    if (timestamp - store.eclipseDerniereMaj >= ECLIPSE_MONTEE_INTERVALLE_MS()) {
        store.eclipseLigneActuelle = Math.max(ECLIPSE_LIGNE_MIN(), store.eclipseLigneActuelle - 1);
        store.eclipseDerniereMaj = timestamp;
    }
}

export function obtenirVitesseChuteModifiee(vitesseBase) {
    if (!store.modeHistoireActif) return vitesseBase;
    if (biomeActuelMecanique() !== 'eclipse') return vitesseBase;
    if (!etat.pieceActuelle) return vitesseBase;

    const pieceY = etat.pieceActuelle.y;
    if (pieceY < store.eclipseLigneActuelle) {
        return Math.min(vitesseBase * ECLIPSE_VITESSE_HAUT_FACTEUR, CONFIG.vitesseBase * 2);
    }
    return Math.max(vitesseBase * ECLIPSE_VITESSE_BAS_FACTEUR, CONFIG.vitesseMin);
}

export function obtenirLigneEclipse() {
    return store.eclipseLigneActuelle;
}

function _tickVide(timestamp) {
    if (store.videPieceInvisible) return;
    if (!etat.pieceActuelle) return;
    const ecoule = timestamp - store.videPieceTimestamp;
    if (ecoule >= VIDE_SEUIL_INVISIBILITE_MS()) {
        store.videPieceInvisible = true;
    }
}

export function pieceEstInvisible() {
    if (!store.modeHistoireActif) return false;
    return biomeActuelEstVide() && store.videPieceInvisible;
}

export function ghostEstDesactive() {
    if (!store.modeHistoireActif) return false;
    return biomeActuelEstVide();
}

function _appliquerCSSMiroir(actif) {
    const canvas = document.getElementById('canvas-plateau');
    if (!canvas) return;
    if (actif) {
        canvas.classList.add('biome-miroir');
    } else {
        canvas.classList.remove('biome-miroir');
    }
}

export function actionMiroir(actionDemandee) {
    if (!store.modeHistoireActif) return actionDemandee;
    if (!biomeActuelEstMiroir()) return actionDemandee;
    if (actionDemandee === 'bas') return 'chute';
    if (actionDemandee === 'chute') return 'bas';
    return actionDemandee;
}

const TRAME_BIOMES_CYCLE = [
    'classique',
    'lave',
    'ocean',
    'foret',
    'glace',
    'desert',
    'cyber',
    'fuochi',
    'cosmos',
];
function _tickTrame(dt, timestamp) {
    void timestamp;
    store.trameTimerMorph += dt;
    if (!store.trameEnTransition && store.trameTimerMorph >= TRAME_INTERVALLE_MORPH_MS()) {
        store.trameEnTransition = true;
        store.trameAlphaMorph = 1.0;
    }
    if (store.trameEnTransition) {
        store.trameAlphaMorph -= dt / TRAME_DUREE_FADE_MS();
        if (store.trameAlphaMorph <= 0) {
            store.trameBiomeIndex = (store.trameBiomeIndex + 1) % TRAME_BIOMES_CYCLE.length;
            store.trameAlphaMorph = 1.0;
            store.trameEnTransition = false;
            store.trameTimerMorph = 0;
        }
    }
}

export function obtenirFondTrame() {
    const biomeId = TRAME_BIOMES_CYCLE[store.trameBiomeIndex];
    const alpha = Math.max(0, Math.min(1, store.trameAlphaMorph));
    return { biomeId, alpha };
}

function _trackerTetrisCyber(nbLignes) {
    const etatHist = obtenirEtatHistoire();
    if (!etatHist) return;
    verifierConditionMiroir(nbLignes, etatHist);
}

export function onGameOverHistoire(lignes, mondeId) {
    if (!store.modeHistoireActif) return;
    if (mondeId !== 'monde_prologue') return;
    if (lignes > 0) return;

    const etatHist = obtenirEtatHistoire();
    if (!etatHist) return;

    etatHist.conditionsParadoxe.topsVolontairesPrologue =
        (etatHist.conditionsParadoxe.topsVolontairesPrologue ?? 0) + 1;
    store.prologueTopsVolontaires = etatHist.conditionsParadoxe.topsVolontairesPrologue;

    logger.info(
        '[mecHistoire] top prologue n°',
        etatHist.conditionsParadoxe.topsVolontairesPrologue
    );
    sauvegarderEtatHistoireStore(etatHist);

    verifierConditionC3(etatHist.conditionsParadoxe.topsVolontairesPrologue ?? 0, etatHist);
}
