import { BIOMES } from '../config/biomes.js';
import { lireStockage } from '../io/progression.js';
import { afficherEcran } from '../ui/ecrans-ui.js';
import { ECRANS } from '../etat/store-jeu.js';
import { statsGlobales } from '../achievements.js';
import { obtenirTousNiveauxArchi } from './archi-generateur.js';
import { archi_calculerEtoiles } from './archi-logique.js';
import { modeDevActif } from './mode-dev-etat.js';
import { sansAccentsE } from './texte-jeu.js';
import { rendreIconeSurCanvas } from '../rendu/icones-pixel.js';
import { dessinerSilhouetteApercu } from '../rendu/archi-apercu-silhouette.js';
import { obtenirIdIconeBiomeArchi } from '../rendu/archi-icones-map.js';
import {
    ouvrirPanneauDetail,
    fermerPanneauDetail,
    obtenirPanneauDetailId,
    abonnerFermeturePanneauDetail,
    initialiserPanneauDetail,
} from '../ui/ui-panneau-detail.js';
import {
    appliquerFiltreDifficulteArchi,
    initialiserFiltreDifficulteArchi,
    reinitialiserFiltreDifficulteArchiParDefaut,
} from './archi-filtre-difficulte.js';
import { demarrerArchi } from './archi-partie.js';

let archiSelectionListenersInitialises = false;

/** @param {import('../archi-donnees/assembleur-niveaux.js').NiveauArchi} niv @param {string} accent */
function dessinerApercuCarteArchi(canvas, niv, accent) {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    if (niv.silhouette?.length) {
        dessinerSilhouetteApercu(canvas, ctx, niv.silhouette, accent, { tailleCelluleMax: 6 });
        return;
    }
    rendreIconeSurCanvas(canvas, obtenirIdIconeBiomeArchi(niv.biome));
}

/** @param {import('../archi-donnees/assembleur-niveaux.js').NiveauArchi} niv */
function obtenirDescriptionObjectifArchi(niv) {
    const inventaire = niv.pieces.map((p) => `${p.type}×${p.qte}`).join(', ');
    return [
        `Reconstituez la silhouette cible avec un minimum de ${niv.parPieces} pieces.`,
        `Inventaire : ${inventaire}.`,
    ];
}

/**
 * @param {import('../archi-donnees/assembleur-niveaux.js').NiveauArchi} niv
 * @param {{ debloque: boolean, fait: boolean, meilleur: number, etoiles: number }} etat
 */
function obtenirMetaDetailArchi(niv, etat) {
    const diffStr = '●'.repeat(niv.difficulte) + '○'.repeat(3 - niv.difficulte);
    const lignes = [];
    if (!etat.debloque) {
        lignes.push(`Verrouille — ${niv.deblocage} pts cumules`);
    } else if (etat.fait) {
        lignes.push('Statut : FAIT');
    } else {
        lignes.push('Statut : A FAIRE');
    }
    if (etat.meilleur > 0) {
        lignes.push(`${'★'.repeat(etat.etoiles)}${'☆'.repeat(3 - etat.etoiles)}`);
        lignes.push(`Record : ${etat.meilleur} pts`);
    }
    lignes.push(`Difficulte : ${diffStr}`);
    return lignes;
}

/** @param {import('../archi-donnees/assembleur-niveaux.js').NiveauArchi} niv */
export function ouvrirDetailNiveauArchi(niv) {
    initialiserPanneauDetail();
    const cle = `derniereLigne_archi_${niv.id}`;
    const meilleur = parseInt(lireStockage(cle, '0'), 10);
    const etoiles = archi_calculerEtoiles(meilleur);
    const debloque = modeDevActif() || (statsGlobales.archiScoreTotal || 0) >= niv.deblocage;
    const fait = statsGlobales.archiNiveauxCompletes?.has(niv.id) ?? false;
    const biome = BIOMES[niv.biome];
    const accent = biome?.lueurCoul ?? '#ffbb44';
    const diffStr = '●'.repeat(niv.difficulte) + '○'.repeat(3 - niv.difficulte);

    ouvrirPanneauDetail({
        id: niv.id,
        icone: {
            canvasPersonnalise: (canvas, ctx) => {
                if (niv.silhouette?.length) {
                    dessinerSilhouetteApercu(canvas, ctx, niv.silhouette, accent, {
                        tailleCelluleMax: 10,
                    });
                } else {
                    rendreIconeSurCanvas(canvas, obtenirIdIconeBiomeArchi(niv.biome));
                }
            },
        },
        accent,
        titre: niv.nom,
        sousTitre: `${biome?.nom ?? niv.biome} · ${diffStr}`,
        description: obtenirDescriptionObjectifArchi(niv),
        typoDescription: 'ui',
        lignesMeta: obtenirMetaDetailArchi(niv, { debloque, fait, meilleur, etoiles }),
        conditionTexte: debloque ? '' : `${niv.deblocage} pts cumules requis`,
        actionPrincipale: debloque
            ? {
                  libelle: '▶ JOUER',
                  onAction: () => {
                      fermerPanneauDetail();
                      void demarrerArchi(niv.id);
                  },
              }
            : undefined,
    });
    actualiserSelectionArchi();
}

function actualiserSelectionArchi() {
    const selectionId = obtenirPanneauDetailId();
    document.querySelectorAll('.carte-niveau-archi').forEach((el) => {
        const carte = /** @type {HTMLElement} */ (el);
        carte.classList.toggle(
            'selectionnee',
            selectionId !== null && carte.dataset.id === selectionId
        );
    });
}

function initialiserSelectionArchiListeners() {
    if (archiSelectionListenersInitialises) return;
    archiSelectionListenersInitialises = true;
    abonnerFermeturePanneauDetail(actualiserSelectionArchi);
}

export async function archi_afficherSelection() {
    const grille = document.getElementById('archi-sel-grille');
    if (!grille) return;
    initialiserSelectionArchiListeners();
    reinitialiserFiltreDifficulteArchiParDefaut();
    initialiserFiltreDifficulteArchi();
    fermerPanneauDetail();
    grille.textContent = '';

    const niveaux = [...(await obtenirTousNiveauxArchi())].sort(
        (a, b) =>
            a.difficulte - b.difficulte || a.deblocage - b.deblocage || a.id.localeCompare(b.id)
    );
    const total = niveaux.length;
    const completes = statsGlobales.archiNiveauxCompletes?.size ?? 0;
    const elProg = document.getElementById('archi-sel-progression');
    if (elProg) elProg.textContent = `${completes} / ${total} NIVEAUX`;

    niveaux.forEach((niv) => {
        const cle = `derniereLigne_archi_${niv.id}`;
        const meilleur = parseInt(lireStockage(cle, '0'), 10);
        const etoiles = archi_calculerEtoiles(meilleur);
        const debloque = modeDevActif() || (statsGlobales.archiScoreTotal || 0) >= niv.deblocage;
        const fait = statsGlobales.archiNiveauxCompletes?.has(niv.id) ?? false;
        const biome = BIOMES[niv.biome];
        const accent = biome?.lueurCoul ?? '#ffbb44';
        const diffStr = '●'.repeat(niv.difficulte) + '○'.repeat(3 - niv.difficulte);

        const classes = ['carte-niveau-archi', 'panneau-meta'];
        if (!debloque) classes.push('verrouillee');
        else if (fait) classes.push('fait');
        else classes.push('a-faire');

        const carte = document.createElement('div');
        carte.className = classes.join(' ');
        carte.dataset.id = niv.id;
        carte.dataset.categorie = niv.biome;
        carte.dataset.difficulte = String(niv.difficulte);
        carte.style.setProperty('--accent-carte', accent);
        carte.setAttribute('role', 'button');
        carte.tabIndex = 0;

        const apercuEl = document.createElement('canvas');
        apercuEl.className = 'cna-apercu';
        apercuEl.width = 64;
        apercuEl.height = 64;
        apercuEl.setAttribute('aria-hidden', 'true');
        dessinerApercuCarteArchi(apercuEl, niv, accent);

        const biomeEl = document.createElement('div');
        biomeEl.className = 'cna-biome';
        biomeEl.textContent = sansAccentsE(`${biome?.icone ?? ''} ${biome?.nom ?? ''}`.trim());

        const nomEl = document.createElement('div');
        nomEl.className = 'cna-nom';
        nomEl.textContent = sansAccentsE(niv.nom);

        const diffEl = document.createElement('div');
        diffEl.className = `cna-difficulte cna-difficulte--${niv.difficulte}`;
        diffEl.textContent = diffStr;

        carte.append(apercuEl, biomeEl, nomEl, diffEl);

        if (meilleur > 0) {
            const etoilesEl = document.createElement('div');
            etoilesEl.className = 'cna-etoiles';
            etoilesEl.textContent = '★'.repeat(etoiles) + '☆'.repeat(3 - etoiles);
            carte.appendChild(etoilesEl);
        }

        const statutEl = document.createElement('div');
        statutEl.className = 'cna-statut';
        if (!debloque) {
            statutEl.classList.add('cna-statut--verrouille');
            statutEl.textContent = `🔒 ${niv.deblocage} pts`;
        } else if (fait) {
            statutEl.classList.add('cna-statut--fait');
            statutEl.textContent = meilleur > 0 ? `FAIT · ${meilleur} pts` : 'FAIT';
        } else {
            statutEl.classList.add('cna-statut--afaire');
            statutEl.textContent = 'A FAIRE';
        }
        carte.appendChild(statutEl);

        const ouvrir = () => ouvrirDetailNiveauArchi(niv);
        carte.addEventListener('click', ouvrir);
        carte.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                ouvrir();
            }
        });

        grille.appendChild(carte);
    });

    appliquerFiltreDifficulteArchi();
    afficherEcran(ECRANS.ARCHI_SELECTION);
}
