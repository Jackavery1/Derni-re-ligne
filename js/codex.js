import { statsGlobales } from './achievements.js';
import { lireStockageJson, ecrireStockageJson, estTableauIds } from './progression.js';
import { creerFileNotifications } from './notifications-file.js';
import { obtenirCanvas } from './dom-utils.js';
import { logger } from './logger.js';

const CLE_CODEX = 'derniereLigne_codex';
const CLE_CODEX_VUS = 'derniereLigne_codexVus';

/** @type {import('./codex-donnees.js').CODEX | null} */
let codexDonnees = null;
/** @type {Promise<import('./codex-donnees.js').CODEX> | null} */
let promesseCodex = null;

export async function chargerDonneesCodex() {
    if (codexDonnees) return codexDonnees;
    if (!promesseCodex) {
        promesseCodex = fetch('./data/codex-donnees.json')
            .then(async (reponse) => {
                if (!reponse.ok) {
                    throw new Error('Impossible de charger data/codex-donnees.json');
                }
                const json = await reponse.json();
                codexDonnees = json.CODEX;
                return codexDonnees;
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
    /** @param {{ icone: string, titre: string, chapitre: string }} entree @param {() => void} terminer */
    afficher(entree, terminer) {
        const notif = document.getElementById('notif-codex');
        if (!notif) return false;
        const icone = document.getElementById('codex-notif-icone');
        const titre = document.getElementById('codex-notif-titre');
        const chapitre = document.getElementById('codex-notif-chapitre');
        if (icone) icone.textContent = entree.icone;
        if (titre) titre.textContent = entree.titre;
        if (chapitre) chapitre.textContent = entree.chapitre.toUpperCase();
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
        logger.warn('[codex] vérification impossible :', err);
    }
}

export async function changerChapitreCodex(chapitre, btn) {
    chapitreCodexActif = chapitre;
    document.querySelectorAll('.codex-onglet').forEach((b) => b.classList.remove('actif'));
    btn?.classList.add('actif');
    fermerLecteurCodex();
    await genererListeCodex(chapitre);
}

export async function genererListeCodex(chapitre) {
    const CODEX = await chargerDonneesCodex();
    const liste = document.getElementById('codex-liste');
    if (!liste) return;
    liste.textContent = '';

    const entrees = Object.values(CODEX).filter((e) => e.chapitre === chapitre);

    entrees.forEach((entree) => {
        const debloque = codexDebloque.has(entree.id);
        const estNouveau = debloque && !codexVus.has(entree.id);
        const item = document.createElement('div');
        item.className = `codex-item ${debloque ? 'debloque' : 'verrouille'} ${estNouveau ? 'nouveau' : ''}`;

        const iconeEl = document.createElement('div');
        iconeEl.className = 'codex-item-icone';
        iconeEl.textContent = debloque ? entree.icone : '🔒';

        const titreEl = document.createElement('div');
        titreEl.className = 'codex-item-titre';
        titreEl.textContent = debloque ? entree.titre : '???';

        const condEl = document.createElement('div');
        condEl.className = 'codex-item-cond';
        condEl.textContent = debloque ? '' : entree.conditionTexte;

        item.append(iconeEl, titreEl, condEl);

        if (debloque) {
            item.addEventListener('click', () => ouvrirEntreeCodex(entree));
        }

        liste.appendChild(item);
    });

    const nbTotal = entrees.length;
    const nbDebloques = entrees.filter((e) => codexDebloque.has(e.id)).length;
    const elProg = document.getElementById('codex-progression');
    if (elProg) {
        elProg.textContent = `${nbDebloques} / ${nbTotal} ENTRÉES DÉBLOQUÉES`;
    }
}

export function ouvrirEntreeCodex(entree) {
    const lecteur = document.getElementById('codex-lecteur');
    if (!lecteur) return;

    codexVus.add(entree.id);
    sauvegarderCodexVus();

    const iconeEl = document.getElementById('codex-entree-icone');
    const titreEl = document.getElementById('codex-entree-titre');
    const sousTitreEl = document.getElementById('codex-entree-sous-titre');
    const texteEl = document.getElementById('codex-entree-texte');

    if (iconeEl) iconeEl.textContent = entree.icone;
    if (titreEl) titreEl.textContent = entree.titre;
    if (sousTitreEl) sousTitreEl.textContent = entree.sousTitre;
    if (texteEl) {
        texteEl.textContent = '';
        entree.texte.forEach((p) => {
            const para = document.createElement('div');
            para.className = 'codex-para';
            para.textContent = p;
            texteEl.appendChild(para);
        });
    }

    const canvas = obtenirCanvas('canvas-illust-codex');
    if (canvas && entree.illustration) {
        const ctx2d = canvas.getContext('2d');
        ctx2d.clearRect(0, 0, canvas.width, canvas.height);
        import('./codex-illustrations.js').then(({ ILLUSTRATIONS_CODEX }) => {
            const fn = ILLUSTRATIONS_CODEX[entree.illustration];
            if (typeof fn === 'function') fn(ctx2d, canvas.width, canvas.height);
        });
    }

    lecteur.style.display = 'flex';
    lecteur.scrollIntoView({ behavior: 'smooth', block: 'start' });
    genererListeCodex(chapitreCodexActif);
}

export function fermerLecteurCodex() {
    const lecteur = document.getElementById('codex-lecteur');
    if (lecteur) lecteur.style.display = 'none';
}

export async function genererCodexComplet() {
    const CODEX = await chargerDonneesCodex();
    const total = Object.keys(CODEX).length;
    const debloques = codexDebloque.size;
    const elProg = document.getElementById('codex-progression');
    if (elProg) elProg.textContent = `${debloques} / ${total} ENTRÉES`;
    await genererListeCodex(chapitreCodexActif);
}

export function initialiserCodexUI() {
    document.querySelectorAll('.codex-onglet').forEach((btn) => {
        if (!(btn instanceof HTMLElement)) return;
        btn.addEventListener('click', () => {
            changerChapitreCodex(btn.dataset.chapitre, btn);
        });
    });
    document.getElementById('btn-codex-fermer')?.addEventListener('click', fermerLecteurCodex);
}

export { chargerDonneesCodex as obtenirCodex };
