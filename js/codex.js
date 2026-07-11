import { statsGlobales } from './achievements.js';
import { lireStockageJson, ecrireStockageJson, estTableauIds } from './io/progression.js';
import { creerFileNotifications } from './ui/notifications-file.js';
import { logger } from './logger.js';
import { sansAccentsE } from './logique/texte-jeu.js';
import { rendreIconeSurCanvas } from './rendu/icones-pixel.js';
import { obtenirIdIcone, obtenirAccentEntree } from './codex/codex-icones-map.js';
import {
    ouvrirPanneauDetail,
    fermerPanneauDetail,
    obtenirPanneauDetailId,
    abonnerFermeturePanneauDetail,
    initialiserPanneauDetail,
} from './ui/ui-panneau-detail.js';

const CLE_CODEX = 'derniereLigne_codex';
const CLE_CODEX_VUS = 'derniereLigne_codexVus';

/** @type {import('./codex-donnees.js').CODEX | null} */
let codexDonnees = null;
/** @type {Promise<import('./codex-donnees.js').CODEX> | null} */
let promesseCodex = null;

export async function chargerDonneesCodex() {
    if (codexDonnees) return codexDonnees;
    if (!promesseCodex) {
        promesseCodex = import('./codex-donnees.js')
            .then((module) => module.chargerCodexComplet())
            .then((codex) => {
                codexDonnees = codex;
                return codex;
            })
            .catch((err) => {
                promesseCodex = null;
                throw err;
            });
    }
    return promesseCodex;
}

export let codexDebloque = chargerCodex();
export let codexVus = chargerCodexVus();
const fileCodexNotifs = creerFileNotifications({
    /** @param {{ id: string, titre: string, chapitre: string }} entree @param {() => void} terminer */
    afficher(entree, terminer) {
        const notif = document.getElementById('notif-codex');
        if (!notif) return false;
        const icone = document.getElementById('codex-notif-icone');
        const titre = document.getElementById('codex-notif-titre');
        const chapitre = document.getElementById('codex-notif-chapitre');
        if (icone instanceof HTMLCanvasElement) {
            rendreIconeSurCanvas(icone, obtenirIdIcone(entree.id));
        }
        if (titre) titre.textContent = sansAccentsE(entree.titre);
        if (chapitre) chapitre.textContent = sansAccentsE(entree.chapitre.toUpperCase());
        notif.classList.add('visible');
        setTimeout(() => {
            notif.classList.remove('visible');
            setTimeout(terminer, 500);
        }, 3800);
    },
});
let chapitreCodexActif = 'mondes';

export function chargerCodex() {
    const brut = /** @type {unknown} */ (lireStockageJson(CLE_CODEX, []));
    return estTableauIds(brut) ? new Set(/** @type {string[]} */ (brut)) : new Set();
}

export function rechargerCodex() {
    const debloques = chargerCodex();
    codexDebloque.clear();
    debloques.forEach((id) => codexDebloque.add(id));
    const vus = chargerCodexVus();
    codexVus.clear();
    vus.forEach((id) => codexVus.add(id));
}

export function viderCodexPersiste() {
    codexDebloque.clear();
    codexVus.clear();
    try {
        localStorage.removeItem(CLE_CODEX);
        localStorage.removeItem(CLE_CODEX_VUS);
    } catch {
        /* ignore */
    }
}

function chargerCodexVus() {
    const brut = /** @type {unknown} */ (lireStockageJson(CLE_CODEX_VUS, []));
    return estTableauIds(brut) ? new Set(/** @type {string[]} */ (brut)) : new Set();
}

export function sauvegarderCodex() {
    ecrireStockageJson(CLE_CODEX, [...codexDebloque]);
}

function sauvegarderCodexVus() {
    ecrireStockageJson(CLE_CODEX_VUS, [...codexVus]);
}

export async function verifierCodex() {
    try {
        const CODEX = await chargerDonneesCodex();
        let nouveaux = 0;
        for (const [, entree] of Object.entries(CODEX)) {
            if (codexDebloque.has(entree.id)) continue;
            if (!entree.condition(statsGlobales)) continue;
            codexDebloque.add(entree.id);
            fileCodexNotifs.ajouter(entree);
            nouveaux++;
        }
        if (nouveaux > 0) {
            sauvegarderCodex();
        }
    } catch (err) {
        logger.warn('[codex] verification impossible :', err);
    }
}

let verificationPlanifiee = false;

/** Vérifie les déblocages codex hors chemin critique (idle / timeout court). */
export function planifierVerifierCodex() {
    if (verificationPlanifiee) return;
    verificationPlanifiee = true;
    const lancer = () => {
        verificationPlanifiee = false;
        void verifierCodex();
    };
    if (typeof requestIdleCallback === 'function') {
        requestIdleCallback(lancer, { timeout: 2500 });
    } else {
        setTimeout(lancer, 80);
    }
}

export async function changerChapitreCodex(chapitre, btn) {
    chapitreCodexActif = chapitre;
    document.querySelectorAll('.codex-onglet').forEach((b) => {
        b.classList.remove('actif');
        b.setAttribute('aria-selected', 'false');
    });
    btn?.classList.add('actif');
    btn?.setAttribute('aria-selected', 'true');
    fermerPanneauDetail();
    await genererListeCodex(chapitre);
}

/**
 * @param {import('./codex-donnees.js').CODEX[string]} entree
 * @param {boolean} debloque
 */
export function ouvrirEntreeCodex(entree, debloque) {
    if (debloque) {
        codexVus.add(entree.id);
        sauvegarderCodexVus();
    }

    ouvrirPanneauDetail({
        id: entree.id,
        icone: { id: obtenirIdIcone(entree.id), taillePixel: 10 },
        accent: obtenirAccentEntree(entree.id),
        titre: entree.titre,
        sousTitre: entree.sousTitre,
        description: debloque ? entree.texte : '',
        typoDescription: entree.chapitre === 'chroniques' ? 'narratif' : 'ui',
        verrouille: !debloque,
        conditionTexte: entree.conditionTexte,
    });
    void genererListeCodex(chapitreCodexActif);
}

export function fermerLecteurCodex() {
    fermerPanneauDetail();
}

export async function genererListeCodex(chapitre) {
    const CODEX = await chargerDonneesCodex();
    const liste = document.getElementById('codex-liste');
    if (!liste) return;
    liste.textContent = '';

    const entrees = Object.values(CODEX).filter((e) => e.chapitre === chapitre);
    const selectionId = obtenirPanneauDetailId();

    entrees.forEach((entree) => {
        const debloque = codexDebloque.has(entree.id);
        const estNouveau = debloque && !codexVus.has(entree.id);
        const accent = obtenirAccentEntree(entree.id);
        const idIcone = obtenirIdIcone(entree.id);
        const item = document.createElement('div');
        item.className = `codex-item panneau-meta ${debloque ? 'debloque' : 'verrouille'} ${estNouveau ? 'nouveau' : ''} ${selectionId === entree.id ? 'selectionnee' : ''}`;
        item.dataset.id = entree.id;
        item.style.setProperty('--accent-carte', accent);
        item.setAttribute('role', 'button');
        item.tabIndex = 0;

        const iconeEl = document.createElement('canvas');
        iconeEl.className = 'icone-carte-codex';
        iconeEl.width = 64;
        iconeEl.height = 64;
        iconeEl.setAttribute('aria-hidden', 'true');
        rendreIconeSurCanvas(iconeEl, idIcone, debloque ? {} : { silhouette: true, accent });

        const titreEl = document.createElement('div');
        titreEl.className = 'codex-item-titre';
        titreEl.textContent = sansAccentsE(debloque ? entree.titre : '???');

        const condEl = document.createElement('div');
        condEl.className = 'codex-item-cond';
        condEl.textContent = sansAccentsE(debloque ? '' : entree.conditionTexte);

        item.append(iconeEl, titreEl, condEl);

        const activer = () => ouvrirEntreeCodex(entree, debloque);
        item.addEventListener('click', activer);
        item.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                activer();
            }
        });

        liste.appendChild(item);
    });

    const nbTotal = entrees.length;
    const nbDebloques = entrees.filter((e) => codexDebloque.has(e.id)).length;
    const elProg = document.getElementById('codex-progression');
    if (elProg) {
        elProg.textContent = `${nbDebloques} / ${nbTotal} ENTREES DEBLOQUEES`;
    }
}

export async function genererCodexComplet() {
    const CODEX = await chargerDonneesCodex();
    const total = Object.keys(CODEX).length;
    const debloques = codexDebloque.size;
    const elProg = document.getElementById('codex-progression');
    if (elProg) elProg.textContent = `${debloques} / ${total} ENTREES`;
    await genererListeCodex(chapitreCodexActif);
}

let _codexUiInitialise = false;

export function initialiserCodexUI() {
    if (_codexUiInitialise) return;
    _codexUiInitialise = true;
    initialiserPanneauDetail();
    abonnerFermeturePanneauDetail(() => {
        void genererListeCodex(chapitreCodexActif);
    });

    document.querySelectorAll('.codex-onglet').forEach((btn) => {
        if (!(btn instanceof HTMLElement)) return;
        btn.addEventListener('click', () => {
            changerChapitreCodex(btn.dataset.chapitre, btn);
        });
    });
}
