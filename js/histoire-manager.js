import { JOURNAUX_VERA, ETAT_HISTOIRE_VIDE, SEQUENCE_HISTOIRE } from './histoire-donnees.js';
import { PORTRAITS } from './histoire-textes.js';
import {
    obtenirCutsceneEntree,
    afficherVictoireBoss,
    afficherTransitionChapitre,
    afficherJournalVera,
    declencherFin,
    obtenirTransitionApresVictoire,
    obtenirTypeFin,
    typeFinVersCleBoss,
    afficherDecouverteLabo,
} from './histoire-narratif.js';
import { store } from './store-core.js';
import { definirBiomeActif } from './store-etat-partie.js';
import { obtenirEtatHistoirePersiste } from './histoire-etat.js';
import {
    sauvegarderBiomeActif,
    chargerEtatHistoire,
    sauvegarderEtatHistoire,
} from './progression.js';
import { obtenirActions } from './actions-jeu.js';
import { afficherEcran, cacherEcrans } from './navigation-ecrans.js';
import { ECRANS } from './ecrans-config.js';
import { logger } from './logger.js';
import { obtenirCanvas } from './dom-utils.js';
import { arreterBoss } from './boss-jeu.js';
import { statsGlobales, sauvegarderStats, verifierAchievements } from './achievements.js';
import { onMiroirComplete, verifierDeblocageTrame } from './conditions-secrets.js';
import { executerFin } from './fins-histoire.js';
import { paradoxeEstDebloque, demarrerParadoxe } from './monde-paradoxe.js';
import { arreterFondFin } from './fin-bg-rendu.js';
import { enregistrerPrecisionMiroir } from './achievements-histoire.js';

export const SEUILS_COMPLETION = {
    classique: 6,
    lave: 10,
    rouille: 8,
    ocean: 10,
    foret: 10,
    glace: 10,
    desert: 12,
    eclipse: 10,
    cyber: 12,
    fuochi: 12,
    cosmos: 12,
    vide: 8,
    miroir: 12,
    trame: 18,
};

/** @returns {typeof ETAT_HISTOIRE_VIDE} */
export function obtenirEtatHistoire() {
    return obtenirEtatHistoirePersiste();
}

export function rafraichirEtatHistoire() {
    store.histoire.etat = chargerEtatHistoire();
    return store.histoire.etat;
}

/**
 * @param {string} mondeId
 * @param {typeof ETAT_HISTOIRE_VIDE} [etatHist]
 * @returns {'verrouille'|'disponible'|'complete'}
 */
export function obtenirEtatMonde(mondeId, etatHist) {
    const etat = etatHist ?? obtenirEtatHistoire();
    if (etat.mondesCompletes.includes(mondeId)) return 'complete';
    if (mondePeutEtreJoue(mondeId, etat)) return 'disponible';
    return 'verrouille';
}

/**
 * @param {string} mondeId
 * @param {typeof ETAT_HISTOIRE_VIDE} [etatHist]
 * @returns {boolean}
 */
export function mondePeutEtreJoue(mondeId, etatHist) {
    const etat = etatHist ?? obtenirEtatHistoire();
    const monde = SEQUENCE_HISTOIRE.find((m) => m.id === mondeId);
    if (!monde) return false;

    if (monde.estCache) return mondeSecretEstDebloque(mondeId, etat);

    if (monde.ordreGlobal === 1) return true;

    const sequencePrincipale = SEQUENCE_HISTOIRE.filter((m) => !m.estCache);
    const indexMonde = sequencePrincipale.findIndex((m) => m.id === mondeId);
    if (indexMonde <= 0) return true;

    const mondePrecedent = sequencePrincipale[indexMonde - 1];
    return etat.mondesCompletes.includes(mondePrecedent.id);
}

/** @param {string} mondeId @param {typeof ETAT_HISTOIRE_VIDE} etat */
function mondeSecretEstDebloque(mondeId, etat) {
    switch (mondeId) {
        case 'monde_miroir':
            return (
                etat.conditionsMiroir.bossArchivisteVaincu &&
                etat.conditionsMiroir.tetrisTriplesCyber >= 3
            );
        case 'monde_trame':
            return (
                etat.conditionsTrame.miroirComplete &&
                etat.conditionsTrame.tousJournauxTrouves &&
                etat.conditionsTrame.tousBossSansContinue &&
                etat.conditionsTrame.actionDistorsionFaite
            );
        case 'monde_paradoxe':
            return (
                etat.conditionsParadoxe.finSecreteObtenue &&
                etat.conditionsParadoxe.topsVolontairesPrologue >= 3
            );
        default:
            return false;
    }
}

/** @param {string} mondeId */
export function demarrerMondeHistoire(mondeId) {
    if (mondeId === 'monde_paradoxe') {
        demarrerMondeHistoireCache(mondeId);
        return;
    }

    const monde = SEQUENCE_HISTOIRE.find((m) => m.id === mondeId);
    if (!monde) {
        logger.warn('Monde histoire introuvable:', mondeId);
        return;
    }

    const etat = obtenirEtatHistoire();
    if (!mondePeutEtreJoue(mondeId, etat)) {
        logger.warn('Monde verrouillé:', mondeId);
        return;
    }

    masquerPanneauDetails();

    const dejaJoue =
        etat.mondesCompletes.includes(mondeId) || (etat.mondesDejaMontres ?? []).includes(mondeId);

    const cutscene = obtenirCutsceneEntree(mondeId, !dejaJoue);
    if (cutscene) {
        if (!etat.mondesDejaMontres) etat.mondesDejaMontres = [];
        if (!etat.mondesDejaMontres.includes(mondeId)) {
            etat.mondesDejaMontres.push(mondeId);
            sauvegarderEtatHistoire(etat);
        }
        afficherCutsceneHistoire(cutscene.lignes, cutscene.personnages, () =>
            _lancerPartieHistoire(monde)
        );
    } else {
        _lancerPartieHistoire(monde);
    }
}

/** @param {typeof SEQUENCE_HISTOIRE[number]} monde */
function _lancerPartieHistoire(monde) {
    void import('./histoire-map.js').then(({ arreterCarteHistoire }) => arreterCarteHistoire());

    store.histoire.actif = true;
    store.histoire.mondeActuel = monde.id;

    definirBiomeActif(monde.biomeId);
    sauvegarderBiomeActif(monde.biomeId);

    cacherEcrans();
    document.body.classList.add('histoire-active');

    obtenirActions().demarrerJeu?.();
}

/**
 * @param {number} lignes
 * @param {number} score
 */
export function surFinDeMondeHistoire(lignes, score) {
    if (!store.histoire.actif) return;

    const mondeId = store.histoire.mondeActuel;
    const monde = SEQUENCE_HISTOIRE.find((m) => m.id === mondeId);
    if (!monde) return;

    const etatHist = obtenirEtatHistoire();
    const seuil = SEUILS_COMPLETION[monde.biomeId] ?? 10;
    const estComplete = lignes >= seuil || (monde.estBoss && store.histoire.boss.vaincu);

    let journalDebloque = null;

    if (estComplete && !etatHist.mondesCompletes.includes(mondeId)) {
        etatHist.mondesCompletes.push(mondeId);

        if (monde.biomeId === 'cyber') {
            _verifierTetrisTriplesCyber(etatHist);
        }

        journalDebloque = _verifierJournalBiome(monde.biomeId, lignes, etatHist);
        if (journalDebloque) {
            etatHist.journauxTrouves.push(journalDebloque.id);
        }

        if (mondeId === 'monde_miroir') {
            onMiroirComplete(etatHist);
            const precision = Math.min(1, seuil / Math.max(lignes, 1));
            enregistrerPrecisionMiroir(precision);
        }
        if (mondeId === 'monde_trame') {
            verifierDeblocageTrame(etatHist);
        }
    }

    if (estComplete) {
        if (monde.estBoss && monde.bossId) {
            if (!etatHist.bossVaincus.includes(monde.bossId)) {
                etatHist.bossVaincus.push(monde.bossId);
            }
            if (monde.bossId === 'archiviste') {
                etatHist.conditionsMiroir.bossArchivisteVaincu = true;
            }
            const tousBoss = ['brasier', 'sentinelle', 'archiviste', 'avantgarde', 'distorsion'];
            const tousVaincus = tousBoss.every((id) => etatHist.bossVaincus.includes(id));
            if (tousVaincus && etatHist.nbContinuesUtilises === 0) {
                etatHist.conditionsTrame.tousBossSansContinue = true;
            }
            if (monde.bossId === 'sentinelle') {
                const j5 = JOURNAUX_VERA.find((j) => j.id === 'journal_5');
                if (j5 && !etatHist.journauxTrouves.includes(j5.id)) {
                    etatHist.journauxTrouves.push(j5.id);
                    store.histoire.dernierJournal = j5;
                }
            }
        }

        if (etatHist.journauxTrouves.length >= JOURNAUX_VERA.length) {
            etatHist.conditionsTrame.tousJournauxTrouves = true;
            verifierDeblocageTrame(etatHist);
        }

        sauvegarderEtatHistoire(etatHist);
        store.histoire.etat = etatHist;

        if (monde.biomeId === 'cyber') {
            etatHist.conditionsMiroir.tetrisTriplesCyber = Math.max(
                etatHist.conditionsMiroir.tetrisTriplesCyber ?? 0,
                store.histoire.mecaniques.cyberTetrisConsecutifs ?? 0
            );
            sauvegarderEtatHistoire(etatHist);
            store.histoire.etat = etatHist;
        }

        if (journalDebloque) {
            store.histoire.dernierJournal = journalDebloque;
        }
    }

    if (!estComplete && store.histoire.actif) {
        etatHist.nbContinuesUtilises = (etatHist.nbContinuesUtilises ?? 0) + 1;
        etatHist.conditionsTrame.tousBossSansContinue = false;
        sauvegarderEtatHistoire(etatHist);
        store.histoire.etat = etatHist;
    }

    if (estComplete && monde) {
        _mettreAJourStatsCodexHistoire(monde);
    }
    verifierAchievements();

    if (estComplete) {
        _declencherNarratifPostMonde(monde, etatHist);
    } else {
        _afficherBoutonCarteGameOver(true);
    }
}

/** @param {string} biomeId @param {number} lignes @param {typeof ETAT_HISTOIRE_VIDE} etatHist */
function _verifierJournalBiome(biomeId, lignes, etatHist) {
    const journal = JOURNAUX_VERA.find((j) => {
        if (j.biomeId !== biomeId) return false;
        if (etatHist.journauxTrouves.includes(j.id)) return false;
        if (j.condition === 'effacer_10_lignes_biome' && lignes < 10) return false;
        if (j.condition === 'effacer_8_lignes_biome' && lignes < 8) return false;
        if (j.condition === 'effacer_12_lignes_biome' && lignes < 12) return false;
        if (j.condition === 'debloquer_apres_boss_sentinelle') return false;
        if (j.condition === 'trouver_laboratoire_vera') return false;
        return true;
    });
    return journal ?? null;
}

/** @param {typeof SEQUENCE_HISTOIRE[number]} monde */
function _mettreAJourStatsCodexHistoire(monde) {
    if (monde.biomeId && !statsGlobales.biomesJoues.has(monde.biomeId)) {
        statsGlobales.biomesJoues.add(monde.biomeId);
    }
    if (monde.estBoss && monde.bossId) {
        if (!statsGlobales.bossHistoireVaincus) {
            statsGlobales.bossHistoireVaincus = [];
        }
        if (!statsGlobales.bossHistoireVaincus.includes(monde.bossId)) {
            statsGlobales.bossHistoireVaincus.push(monde.bossId);
        }
    }
    const etatHist = obtenirEtatHistoire();
    statsGlobales.journauxHistoire = etatHist.journauxTrouves ?? [];
    statsGlobales.toutesFinHistoire = etatHist.toutesFinObtenues ?? [];
    statsGlobales.mondesHistoireCompletes = [...(etatHist.mondesCompletes ?? [])];
    statsGlobales.mondesCachesDebloques = [...(etatHist.mondesCachesDebloques ?? [])];
    sauvegarderStats();
}

/** @param {typeof ETAT_HISTOIRE_VIDE} etatHist */
function _verifierTetrisTriplesCyber(etatHist) {
    const tetrisTriples = store.histoire.mecaniques.cyberTetrisConsecutifs ?? 0;
    if (tetrisTriples >= 3) {
        etatHist.conditionsMiroir.tetrisTriplesCyber = tetrisTriples;
    }
}

/** @param {boolean} afficher */
function _afficherBoutonCarteGameOver(afficher) {
    const btn = document.getElementById('btn-histoire-carte');
    if (btn) btn.style.display = afficher ? 'inline-block' : 'none';
}

export function retournerACarte() {
    store.histoire.actif = false;
    store.histoire.mondeActuel = null;
    store.histoire.etat = null;
    document.body.classList.remove('histoire-active');
    arreterBoss();
    arreterFondFin();
    _afficherBoutonCarteGameOver(false);

    if (store.histoire.dernierJournal) {
        const journal = store.histoire.dernierJournal;
        store.histoire.dernierJournal = null;
        afficherJournalVera(journal, () => afficherEcran(ECRANS.HISTOIRE_MAP));
    } else {
        afficherEcran(ECRANS.HISTOIRE_MAP);
    }
}

export function retournerAuMondeActuel() {
    const mondeId = store.histoire.mondeActuel;
    if (mondeId) {
        document.body.classList.remove('histoire-active');
        demarrerMondeHistoire(mondeId);
    } else {
        retournerACarte();
    }
}

let _cutsceneIndex = 0;
let _cutsceneLignes = [];
let _cutscenePersonnages = [];
let _cutsceneCallbackFin = null;
/** @type {(() => void) | null} */
let _journalCallbackFermer = null;

/** @param {string[]} textes @param {string[] | (() => void) | null} [personnages] @param {(() => void) | null} [onFin] */
export function afficherCutsceneHistoire(textes, personnages, onFin) {
    if (typeof personnages === 'function') {
        onFin = personnages;
        personnages = null;
    }
    _cutsceneLignes = textes;
    _cutscenePersonnages = /** @type {string[]} */ (personnages ?? []);
    _cutsceneIndex = 0;
    _cutsceneCallbackFin = onFin ?? null;
    store.histoire.cutscene.enCours = true;
    store.histoire.cutscene.onFin = onFin ?? null;

    const conteneur = document.getElementById('histoire-cutscene-lignes');
    if (conteneur) conteneur.textContent = '';

    _afficherProchaineLigneCutscene();
    afficherEcran(ECRANS.HISTOIRE_CUTSCENE);

    const elProgress = document.getElementById('histoire-cutscene-progress');
    if (elProgress && textes.length > 0) {
        elProgress.textContent = `1 / ${textes.length}`;
    }
}

export function passerCutscene() {
    _cutsceneIndex = _cutsceneLignes.length - 1;
    avancerCutscene();
}

export function avancerCutscene() {
    _cutsceneIndex++;
    const elProgress = document.getElementById('histoire-cutscene-progress');
    if (_cutsceneIndex >= _cutsceneLignes.length) {
        const el = document.getElementById('histoire-cutscene-lignes');
        if (el) el.textContent = '';
        if (elProgress) elProgress.textContent = '';
        cacherEcrans();
        const cb = _cutsceneCallbackFin;
        _cutsceneCallbackFin = null;
        store.histoire.cutscene.enCours = false;
        store.histoire.cutscene.onFin = null;
        cb?.();
        return;
    }
    if (elProgress && _cutsceneLignes.length > 0) {
        elProgress.textContent = `${_cutsceneIndex + 1} / ${_cutsceneLignes.length}`;
    }
    _afficherProchaineLigneCutscene();
}

function _afficherProchaineLigneCutscene() {
    const conteneur = document.getElementById('histoire-cutscene-lignes');
    if (!conteneur) return;

    const ligne = document.createElement('div');
    ligne.className = 'histoire-cutscene-ligne';
    ligne.textContent = _cutsceneLignes[_cutsceneIndex];
    conteneur.appendChild(ligne);
    conteneur.scrollTop = conteneur.scrollHeight;

    const personnageId = _cutscenePersonnages[_cutsceneIndex] ?? 'narrateur';
    _mettreAJourPortraitCutscene(personnageId);
}

function _mettreAJourPortraitCutscene(personnageId) {
    const p = PORTRAITS[personnageId] ?? PORTRAITS.narrateur;
    const el = document.getElementById('histoire-cutscene-portrait-icon');
    const nomEl = document.getElementById('histoire-cutscene-nom');
    if (el) {
        el.textContent = p.emoji;
        el.style.borderColor = p.couleur;
        el.style.boxShadow = `0 0 14px ${p.couleur}44`;
    }
    if (nomEl) {
        nomEl.textContent = p.nom;
        nomEl.style.color = p.couleur;
        nomEl.style.textShadow = `0 0 8px ${p.couleur}`;
    }
}

/** @param {{ numero: number, titre: string, sousTitre: string, texte: string[], estEndommage?: boolean, illustration?: string, _illustrerFn?: ((ctx: CanvasRenderingContext2D, w: number, h: number) => void) | null }} journal @param {(() => void) | null} [onFermer] */
export function afficherJournalHistoire(journal, onFermer) {
    const elTitre = document.getElementById('histoire-journal-titre');
    const elSsTitre = document.getElementById('histoire-journal-soustitre');
    const elTexte = document.getElementById('histoire-journal-texte');
    const elNum = document.getElementById('histoire-journal-numero');
    const canvas = obtenirCanvas('canvas-journal-illust');

    if (elNum) elNum.textContent = `TRANSMISSION ${String(journal.numero).padStart(2, '0')}`;
    if (elTitre) elTitre.textContent = journal.titre;
    if (elSsTitre) elSsTitre.textContent = journal.sousTitre;

    if (elTexte) {
        elTexte.textContent = '';
        journal.texte.forEach((para) => {
            const el = document.createElement('div');
            el.className = 'histoire-journal-para';
            if (journal.estEndommage && Math.random() < 0.3) {
                el.style.opacity = '0.5';
                el.style.filter = 'blur(0.5px)';
            }
            el.textContent = para;
            elTexte.appendChild(el);
        });
    }

    if (canvas) {
        const ctx2d = canvas.getContext('2d');
        if (ctx2d) {
            ctx2d.clearRect(0, 0, canvas.width, canvas.height);
            if (journal._illustrerFn) {
                try {
                    journal._illustrerFn(ctx2d, canvas.width, canvas.height);
                } catch (err) {
                    logger.warn('[journal] erreur illustration :', err);
                    _illustrationFallback(ctx2d, canvas.width, canvas.height);
                }
            } else if (journal.illustration) {
                void import('./codex-illustrations.js')
                    .then(({ ILLUSTRATIONS_CODEX }) => {
                        const fn = ILLUSTRATIONS_CODEX[journal.illustration];
                        if (typeof fn === 'function') fn(ctx2d, canvas.width, canvas.height);
                        else _illustrationFallback(ctx2d, canvas.width, canvas.height);
                    })
                    .catch(() => _illustrationFallback(ctx2d, canvas.width, canvas.height));
            } else {
                _illustrationFallback(ctx2d, canvas.width, canvas.height);
            }
        }
    }

    const elDommage = document.getElementById('histoire-journal-dommage');
    if (elDommage) {
        elDommage.style.display = journal.estEndommage ? 'block' : 'none';
    }

    _journalCallbackFermer = onFermer ?? null;

    afficherEcran(ECRANS.HISTOIRE_JOURNAL);
}

function _illustrationFallback(ctx2d, w, h) {
    ctx2d.fillStyle = '#04020a';
    ctx2d.fillRect(0, 0, w, h);
    ctx2d.fillStyle = 'rgba(255,0,110,0.15)';
    ctx2d.fillRect(0, 0, w, h);
}

export function fermerJournalHistoire() {
    const cb = _journalCallbackFermer;
    _journalCallbackFermer = null;
    cacherEcrans();
    cb?.();
}

/** @param {string} finId */
export function afficherFinHistoire(finId) {
    executerFin(finId);
}

/** @param {string} mondeId */
export function demarrerMondeHistoireCache(mondeId) {
    if (mondeId === 'monde_paradoxe') {
        if (paradoxeEstDebloque()) demarrerParadoxe();
        return;
    }
    demarrerMondeHistoire(mondeId);
}

export function masquerPanneauDetails() {
    const panneau = document.getElementById('histoire-monde-details');
    panneau?.classList.add('histoire-panneau-masque');
}

export function obtenirProgressionGlobale() {
    const etat = obtenirEtatHistoire();
    const sequencePrincipale = SEQUENCE_HISTOIRE.filter((m) => !m.estCache);
    const nbTotal = sequencePrincipale.length;
    const nbCompletes = sequencePrincipale.filter((m) =>
        etat.mondesCompletes.includes(m.id)
    ).length;
    const nbJournaux = etat.journauxTrouves.length;
    const nbJournauxTotal = JOURNAUX_VERA.length;
    return { nbCompletes, nbTotal, nbJournaux, nbJournauxTotal };
}

/** @param {typeof ETAT_HISTOIRE_VIDE} etatHist */
export function sauvegarderEtatHistoireStore(etatHist) {
    sauvegarderEtatHistoire(etatHist);
    store.histoire.etat = etatHist;
}

/** @param {typeof SEQUENCE_HISTOIRE[number]} monde @param {typeof ETAT_HISTOIRE_VIDE} etatHist */
function _declencherNarratifPostMonde(monde, etatHist) {
    if (
        monde.biomeId === 'cyber' &&
        etatHist.conditionsMiroir.tetrisTriplesCyber >= 3 &&
        !etatHist.laboDecouvert
    ) {
        etatHist.laboDecouvert = true;
        sauvegarderEtatHistoire(etatHist);
        store.histoire.etat = etatHist;

        const j7 = _trouverJournal('journal_7');
        if (j7 && !etatHist.journauxTrouves.includes('journal_7')) {
            etatHist.journauxTrouves.push('journal_7');
            sauvegarderEtatHistoire(etatHist);
            store.histoire.etat = etatHist;
            store.histoire.dernierJournal = j7;
        }

        afficherDecouverteLabo(() => _suiteNarratifPostMonde(monde, etatHist));
        return;
    }

    if (monde.estBoss && monde.bossId) {
        if (monde.bossId === 'distorsion') {
            const typeFin = obtenirTypeFin();
            afficherVictoireBoss(monde.bossId, typeFinVersCleBoss(typeFin), () =>
                declencherFin(typeFin)
            );
            return;
        }
        afficherVictoireBoss(monde.bossId, 'normal', () =>
            _suiteNarratifPostMonde(monde, etatHist)
        );
        return;
    }

    _suiteNarratifPostMonde(monde, etatHist);
}

/** @param {typeof SEQUENCE_HISTOIRE[number]} monde */
function _suiteNarratifPostMonde(monde, etatHist) {
    void etatHist;
    const journal = store.histoire.dernierJournal;
    if (journal) {
        store.histoire.dernierJournal = null;
        afficherJournalVera(journal, () => _suiteTransitionChapitre(monde));
        return;
    }
    _suiteTransitionChapitre(monde);
}

/** @param {typeof SEQUENCE_HISTOIRE[number]} monde */
function _suiteTransitionChapitre(monde) {
    const cleTrans = obtenirTransitionApresVictoire(monde.id);
    if (cleTrans) {
        afficherTransitionChapitre(cleTrans, () => _afficherBoutonCarteGameOver(true));
        return;
    }
    _afficherBoutonCarteGameOver(true);
}

/** @param {string} id */
function _trouverJournal(id) {
    return JOURNAUX_VERA.find((j) => j.id === id) ?? null;
}
