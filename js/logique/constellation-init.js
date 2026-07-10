import { BIOMES, ORDRE_BIOMES_LIBRE } from '../config/biomes.js';
import { obtenirDimensionsViewport } from './viewport-dimensions.js';
import { obtenirCanvas } from './dom-utils.js';
import { biomeEstDebloqueParHistoire } from '../io/progression.js';
import { panneauBiomeConstellationOuvert } from './constellation-panneau.js';
import {
    attacherEvenementEscapeSelection,
    attacherEvenementsConstellation,
} from './constellation-evenements.js';
import {
    constellationEtoiles,
    constellationNoeuds,
    definirBiomeChoisi,
    definirBiomeHover,
    definirCanvasConstellation,
    marquerSelectBiomesClavierOk,
    obtenirBiomeChoisi,
    reinitialiserPanConstellation,
    selectBiomesClavierEstOk,
} from './constellation-etat.js';
import {
    centrerSurNoeud,
    parametresSpiraleConstellation,
    repositionnerNoeudsConstellation,
} from './constellation-spirale.js';

let deps = {};

function panneauBiomeEstOuvert() {
    return panneauBiomeConstellationOuvert();
}

/** @param {object} configuration */
export function configurerConstellationInit(configuration) {
    deps = configuration;
}

function depsPanneauBiome(lancerBiome) {
    return {
        obtenirRecordBiome: deps.obtenirRecordBiome,
        obtenirRecordNiveauBiome: deps.obtenirRecordNiveauBiome,
        calculerEtoiles: deps.calculerEtoiles,
        formaterEtoiles: deps.formaterEtoiles,
        appliquerThemeBiome: deps.appliquerThemeBiome,
        lancerBiome,
        ouvrirHistoireVersMonde: deps.ouvrirHistoireVersMonde,
    };
}

export function masquerInfoBiome() {
    deps.fermerPanneauBiome?.();
    deps.masquerBarreModesBiome?.();
    const canvas = obtenirCanvas('canvas-constellation');
    if (canvas) repositionnerNoeudsConstellation(canvas, panneauBiomeEstOuvert);
}

/** @param {string} idBiome */
export function mettreAJourInfoBiome(idBiome) {
    deps.ouvrirPanneauBiome?.(idBiome, depsPanneauBiome(deps.lancerBiome));
    const canvas = obtenirCanvas('canvas-constellation');
    if (canvas) repositionnerNoeudsConstellation(canvas, panneauBiomeEstOuvert);
}

function compterBiomesDebloques() {
    let n = 0;
    for (const id of ORDRE_BIOMES_LIBRE) {
        if (biomeEstDebloqueParHistoire(id)) n++;
    }
    return n;
}

function mettreAJourEnteteSelection() {
    const titre = document.getElementById('sel-titre-jeu');
    const sousTitre = document.getElementById('sel-sous-titre');
    if (titre) titre.textContent = 'CHOISIR UN MONDE';
    if (sousTitre) {
        const nb = compterBiomesDebloques();
        sousTitre.textContent = `NIVEAU GLOBAL : ${deps.obtenirNiveauGlobal()} — ${nb}/${ORDRE_BIOMES_LIBRE.length} MONDES`;
    }
}

/** @param {(noeud: object, doubleTap?: boolean) => void} traiterSelectionNoeud */
function mettreAJourSelectBiomesClavier(traiterSelectionNoeud) {
    const select = /** @type {HTMLSelectElement | null} */ (
        document.getElementById('sel-biome-clavier')
    );
    if (!select) return;

    select.replaceChildren();
    const placeholder = document.createElement('option');
    placeholder.value = '';
    placeholder.textContent = 'Choisir un biome';
    select.appendChild(placeholder);

    for (const noeud of constellationNoeuds) {
        const opt = document.createElement('option');
        opt.value = noeud.id;
        opt.textContent = noeud.verrouille ? `${noeud.biome.nom} (verrouille)` : noeud.biome.nom;
        opt.disabled = noeud.verrouille;
        if (noeud.id === obtenirBiomeChoisi()) opt.selected = true;
        select.appendChild(opt);
    }

    if (!selectBiomesClavierEstOk()) {
        marquerSelectBiomesClavierOk();
        select.addEventListener('change', () => {
            const noeud = constellationNoeuds.find((n) => n.id === select.value);
            if (noeud) traiterSelectionNoeud(noeud, false);
        });
    }
}

/** @param {(noeud: object, doubleTap?: boolean) => void} traiterSelectionNoeud */
export function initConstellation(traiterSelectionNoeud) {
    const canvasConst = obtenirCanvas('canvas-constellation');
    if (!canvasConst) return;
    const ctxConst = canvasConst.getContext('2d');
    definirCanvasConstellation(canvasConst, ctxConst);

    const { largeur: w, hauteur: h } = obtenirDimensionsViewport();
    canvasConst.width = w;
    canvasConst.height = h;

    constellationEtoiles.length = 0;
    constellationNoeuds.length = 0;
    definirBiomeHover(null);
    definirBiomeChoisi(deps.obtenirBiomeActif());
    reinitialiserPanConstellation();

    for (let i = 0; i < 200; i++) {
        constellationEtoiles.push({
            x: Math.random() * w,
            y: Math.random() * h,
            rayon: 0.5 + Math.random() * 1.5,
            opaciteBase: 0.1 + Math.random() * 0.6,
            phase: Math.random() * Math.PI * 2,
            vitesseTwinkle: 0.002 + Math.random() * 0.006,
        });
    }

    const centreX = w / 2 + deps.obtenirDecalageZone(panneauBiomeEstOuvert);
    const centreY = h / 2;
    const base = Math.min(w, h);
    const { rayonInit, croissance, angleIncr, compact } = parametresSpiraleConstellation(base);

    ORDRE_BIOMES_LIBRE.forEach((id, index) => {
        const biome = BIOMES[id];
        const angle = index * angleIncr;
        const rayonSpirale = rayonInit + index * croissance;
        constellationNoeuds.push({
            id,
            biome,
            x: centreX + Math.cos(angle) * rayonSpirale,
            y: centreY + Math.sin(angle) * rayonSpirale,
            rayon: (compact ? 22 : 28) + index * (compact ? 1.5 : 2),
            pulsation: Math.random() * Math.PI * 2,
            vitessePuls: 0.02 + Math.random() * 0.01,
            verrouille: !biomeEstDebloqueParHistoire(id),
            flashRejet: 0,
        });
    });

    mettreAJourEnteteSelection();
    const biomeChoisi = obtenirBiomeChoisi();
    if (biomeChoisi && BIOMES[biomeChoisi]) {
        mettreAJourInfoBiome(biomeChoisi);
        centrerSurNoeud(biomeChoisi, canvasConst, panneauBiomeEstOuvert);
    } else {
        masquerInfoBiome();
    }

    attacherEvenementsConstellation();
    attacherEvenementEscapeSelection();
    mettreAJourSelectBiomesClavier(traiterSelectionNoeud);
}

/** @param {(noeud: object, doubleTap?: boolean) => void} traiterSelectionNoeud */
export function redimensionnerConstellationInit(traiterSelectionNoeud) {
    if (!document.getElementById('ecran-selection')?.classList.contains('actif')) return;
    const choix = obtenirBiomeChoisi();
    const panneauOuvert = panneauBiomeEstOuvert();
    initConstellation(traiterSelectionNoeud);
    if (choix && panneauOuvert && BIOMES[choix]) {
        definirBiomeChoisi(choix);
        mettreAJourInfoBiome(choix);
    }
}
