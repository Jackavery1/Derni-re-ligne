import { TOUCHES_DEFAUT } from './config.js';
import { ECRANS } from './ecrans-config.js';

export { ECRANS };

export const MAX_PARTICULES = 280;
export const DUREE_TRANSITION = 400;
export const NB_PARTICULES_AMBIANCE = {
    classique: 0,
    lave: 30,
    ocean: 32,
    foret: 28,
    glace: 32,
    desert: 28,
    cyber: 30,
    fuochi: 30,
    cosmos: 32,
};
export const CARACTERES_HEX = '0123456789ABCDEF';
export const VERTS_FORET = ['#00cc44', '#55dd00', '#88ff00', '#66bb00', '#aaee44'];

export const store = {
    biomeActif: 'classique',
    niveauGlobal: 0,
    compteurPieces: 0,
    seuilProchRelique: 0,
    reliqueEnAttente: false,
    reliqueActive: null,
    ecranActuel: ECRANS.TITRE,
    transitionAlpha: 1,
    transitionDebut: 0,
    tempsAmbianceDecor: 0,
    couleurAmbRgb: [0, 245, 255],
    derniereSecondeTemps: -1,
    sacPieces: [],
    lockDelayRestant: 0,
    nbLockResets: 0,
    pieceAuSol: false,
    dasEtat: {
        [TOUCHES_DEFAUT.gauche]: { moment: 0, repete: false },
        [TOUCHES_DEFAUT.droite]: { moment: 0, repete: false },
        [TOUCHES_DEFAUT.bas]: { moment: 0, repete: false },
    },
    prefererMoinsAnimations:
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    fpsMoyen: 60,
    effetsReduits: false,
    idFrame: null,
    boucleActive: false,
    canvasPlateau: null,
    ctx: null,
    canvasPreview: null,
    ctxPreview: null,
    canvasReserve: null,
    ctxReserve: null,
    touchDepart: null,
    dernierTimestamp: 0,
    accumulateur: 0,
    etat: {
        plateau: [],
        pieceActuelle: null,
        filePieces: [],
        pieceEnReserve: null,
        reserveUtilisee: false,
        score: 0,
        lignes: 0,
        niveau: 1,
        estEnCours: false,
        estEnPause: false,
        humeur: 'neutre',
        combo: 0,
        dernierEtaitTetris: false,
        tempsDebut: null,
        tempsPauseAccumule: 0,
        tempsPauseDebut: null,
        modeJeu: 'marathon',
        victoireSprint: false,
    },
    particules: [],
    particulesAmbiance: [],
    textesFlottants: [],
    secousse: { timer: 0, intensite: 0, duree: 260 },
    flashVerrou: { cellules: [], timer: 0, duree: 75 },
    flashLignes: { lignes: [], timer: 0, duree: 160 },
    touchesActives: {},
    modeHistoireActif: false,
    etatHistoire: null,
    bossActif: null,
    pvBossActuels: 0,
    bossPhaseActuelle: 0,
    timerAttaqueBoss: 0,
    timerAttaqueActive: 0,
    mechaniquesBiomeActif: {
        colonnesGelees: [],
        timerDegelMs: 0,
        blocksRouilles: [],
        pieceInvisibleDepuis: null,
        bossControlesInverses: false,
        timerControlesInverses: 0,
        bossFauxFantome: false,
        timerFauxFantome: 0,
        decalageDistorsion: 0,
        timerDistorsion: 0,
    },
    timerPortraitBoss: 0,
    bossVaincu: false,
    timerBossVaincu: 0,
    tetrisConsecutifsCyber: 0,
    dernierJournalTrouve: null,
    mondeHistoireActuel: null,
    cutsceneEnCours: false,
    cutsceneOnFin: null,
    tetrisConsecutifsCyberBoss: 0,
    plateauTimestamps: null,
    plateauRouille: null,
    eclipseLigneActuelle: 10,
    eclipseDerniereMaj: 0,
    videPieceTimestamp: 0,
    videPieceInvisible: false,
    cyberTetrisConsecutifs: 0,
    cyberTetrisCumulPartie: 0,
    trameBiomeIndex: 0,
    trameTimerMorph: 0,
    trameAlphaMorph: 1.0,
    trameEnTransition: false,
    prologueTopsVolontaires: 0,
};

export const etat = store.etat;
export const particules = store.particules;
export const particulesAmbiance = store.particulesAmbiance;
export const textesFlottants = store.textesFlottants;
export const secousse = store.secousse;
export const flashVerrou = store.flashVerrou;
export const flashLignes = store.flashLignes;
export const touchesActives = store.touchesActives;
export const couleurAmbRgb = store.couleurAmbRgb;
export const dasEtat = store.dasEtat;
