import { BIOMES, ORDRE_BIOMES_LIBRE } from './config.js';
import { obtenirConstellationClicSeul } from './accessibilite.js';
import { obtenirCanvas } from './dom-utils.js';
import { mettreAJourVisibiliteModesDebloques } from './deblocage-ui.js';
import { biomeEstDebloqueParHistoire } from './progression.js';
export { FONDS_BIOME, NOMS_MONDES_REQUIS } from './constellation-rendu.js';
import {
    dessinerFondBiome,
    dessinerLignesConstellation as dessinerLignesRendu,
    dessinerNoeudBiome as dessinerNoeudRendu,
} from './constellation-rendu.js';
import { obtenirDecalageCentreConstellation } from './constellation-zone.js';
import { abonnerBoucleMenuUnifiee, desabonnerBoucleMenuUnifiee } from './planificateur-raf.js';
import { proposerInfobulleOracleCoopExclusif } from './infobulles-contexte.js';
import {
    ouvrirPanneauBiomeConstellation,
    fermerPanneauBiomeConstellation,
    panneauBiomeConstellationOuvert,
    masquerBarreModesBiome,
} from './constellation-panneau.js';
import { initialiserPanneauDetail, abonnerFermeturePanneauDetail } from './ui-panneau-detail.js';

let abonnementFermeturePanneauOk = false;

let deps = {};

const constellationEtoiles = [];
const constellationNoeuds = [];
let biomeHover = null;
let biomeChoisi = null;
let offsetCamX = 0;
let offsetCamY = 0;
let panConstellationX = 0;
let panConstellationY = 0;
/** @type {{ x: number, y: number, panX: number, panY: number } | null} */
let glissadeConstellation = null;
let glissadeEnCours = false;
let sourisCX = 0;
let sourisCY = 0;
let canvasConst = null;
let ctxConst = null;
let evenementsOk = false;
let selectBiomesOk = false;
let evenementEscapeOk = false;

function panneauBiomeEstOuvert() {
    return panneauBiomeConstellationOuvert();
}

/** @param {number} base */
function parametresSpiraleConstellation(base) {
    const compact = base < 400;
    return {
        compact,
        rayonInit: base * (compact ? 0.05 : 0.12),
        croissance: base * (compact ? 0.022 : 0.06),
        angleIncr: compact ? 2.15 : 2.4,
    };
}

function obtenirDecalageZoneActuel() {
    return obtenirDecalageCentreConstellation(panneauBiomeEstOuvert(), window.innerWidth);
}

function bornesPanConstellation() {
    const max = window.innerWidth <= 768 ? 160 : 100;
    panConstellationX = Math.max(-max, Math.min(max, panConstellationX));
    panConstellationY = Math.max(-max, Math.min(max, panConstellationY));
}

/** @param {string} idBiome */
function centrerSurNoeud(idBiome) {
    const noeud = constellationNoeuds.find((n) => n.id === idBiome);
    if (!noeud || !canvasConst) return;
    const cx = canvasConst.width / 2 + obtenirDecalageZoneActuel();
    const cy = canvasConst.height / 2;
    panConstellationX = cx - noeud.x;
    panConstellationY = cy - noeud.y;
    bornesPanConstellation();
}

function reinitialiserPanConstellation() {
    panConstellationX = 0;
    panConstellationY = 0;
    glissadeConstellation = null;
    glissadeEnCours = false;
}

function depsPanneauBiome() {
    return {
        obtenirRecordBiome: deps.obtenirRecordBiome,
        obtenirRecordNiveauBiome: deps.obtenirRecordNiveauBiome,
        calculerEtoiles: deps.calculerEtoiles,
        formaterEtoiles: deps.formaterEtoiles,
        appliquerThemeBiome: deps.appliquerThemeBiome,
        lancerBiome: lancerBiomeSelectionne,
        ouvrirHistoireVersMonde: deps.ouvrirHistoireVersMonde,
    };
}

function repositionnerNoeudsConstellation() {
    if (!canvasConst || !constellationNoeuds.length) return;
    const w = canvasConst.width;
    const h = canvasConst.height;
    const centreX = w / 2 + obtenirDecalageZoneActuel();
    const centreY = h / 2;
    const base = Math.min(w, h);
    const { rayonInit, croissance, angleIncr } = parametresSpiraleConstellation(base);

    ORDRE_BIOMES_LIBRE.forEach((id, index) => {
        const noeud = constellationNoeuds.find((n) => n.id === id);
        if (!noeud) return;
        const angle = index * angleIncr;
        const rayonSpirale = rayonInit + index * croissance;
        noeud.x = centreX + Math.cos(angle) * rayonSpirale;
        noeud.y = centreY + Math.sin(angle) * rayonSpirale;
    });
}

function masquerInfoBiome() {
    fermerPanneauBiomeConstellation();
    masquerBarreModesBiome();
    repositionnerNoeudsConstellation();
}

function mettreAJourInfoBiome(idBiome) {
    ouvrirPanneauBiomeConstellation(idBiome, depsPanneauBiome());
    repositionnerNoeudsConstellation();
}

function attacherEvenementEscapeSelection() {
    if (evenementEscapeOk) return;
    evenementEscapeOk = true;
    document.addEventListener('keydown', (e) => {
        if (e.key !== 'Escape') return;
        if (!document.getElementById('ecran-selection')?.classList.contains('actif')) return;
        if (!panneauBiomeEstOuvert()) return;
        e.preventDefault();
        masquerInfoBiome();
    });
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

function noeudDepuisPointer(clientX, clientY) {
    const { x, y } = coordonneesCanvas(clientX, clientY);
    const w = canvasConst.width;
    const h = canvasConst.height;
    const parallax = window.innerWidth <= 768 ? 36 : 18;
    const offX = (x / w - 0.5) * parallax + panConstellationX;
    const offY = (y / h - 0.5) * parallax + panConstellationY;
    return noeudSousCurseur(x - offX, y - offY);
}

function noeudSousCurseur(cx, cy) {
    for (let i = constellationNoeuds.length - 1; i >= 0; i--) {
        const n = constellationNoeuds[i];
        const rayonHit = n.verrouille ? n.rayon * 0.75 + 4 : n.rayon + 8;
        const dx = cx - n.x;
        const dy = cy - n.y;
        if (dx * dx + dy * dy <= rayonHit * rayonHit) return n;
    }
    return null;
}

function initConstellation() {
    canvasConst = obtenirCanvas('canvas-constellation');
    if (!canvasConst) return;
    ctxConst = canvasConst.getContext('2d');

    const w = window.innerWidth;
    const h = window.innerHeight;
    canvasConst.width = w;
    canvasConst.height = h;

    constellationEtoiles.length = 0;
    constellationNoeuds.length = 0;
    biomeHover = null;
    biomeChoisi = deps.obtenirBiomeActif();
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

    const centreX = w / 2 + obtenirDecalageZoneActuel();
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
    if (biomeChoisi && BIOMES[biomeChoisi]) {
        mettreAJourInfoBiome(biomeChoisi);
        centrerSurNoeud(biomeChoisi);
    } else {
        masquerInfoBiome();
    }

    attacherEvenementsConstellation();
    attacherEvenementEscapeSelection();
    mettreAJourSelectBiomesClavier();
}

function mettreAJourSelectBiomesClavier() {
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
        if (noeud.id === biomeChoisi) opt.selected = true;
        select.appendChild(opt);
    }

    if (!selectBiomesOk) {
        selectBiomesOk = true;
        select.addEventListener('change', () => {
            const noeud = constellationNoeuds.find((n) => n.id === select.value);
            if (noeud) traiterSelectionNoeud(noeud, false);
        });
    }
}

function boucleConstellation(timestamp) {
    if (!ctxConst || !canvasConst) return;

    const w = canvasConst.width;
    const h = canvasConst.height;
    const parallax = window.innerWidth <= 768 ? 36 : 18;
    offsetCamX = (sourisCX / w - 0.5) * parallax + panConstellationX;
    offsetCamY = (sourisCY / h - 0.5) * parallax + panConstellationY;

    dessinerFondBiome(ctxConst, w, h, biomeChoisi ?? 'classique');

    ctxConst.save();
    ctxConst.translate(offsetCamX, offsetCamY);

    const t = timestamp / 1000;
    for (const etoile of constellationEtoiles) {
        const scintil = 0.5 + 0.5 * Math.sin(t * etoile.vitesseTwinkle * 60 + etoile.phase);
        ctxConst.fillStyle = `rgba(255,255,255,${etoile.opaciteBase * scintil})`;
        ctxConst.beginPath();
        ctxConst.arc(etoile.x, etoile.y, etoile.rayon, 0, Math.PI * 2);
        ctxConst.fill();
    }

    dessinerLignesRendu(ctxConst, constellationNoeuds);

    for (const noeud of constellationNoeuds) {
        dessinerNoeudRendu(ctxConst, noeud, timestamp, biomeHover, biomeChoisi);
    }

    ctxConst.restore();
}

function traiterSelectionNoeud(noeud, _doubleTap = false) {
    if (!noeud) {
        biomeHover = null;
        masquerInfoBiome();
        return;
    }

    if (noeud.verrouille) {
        noeud.flashRejet = performance.now();
        deps.sonMenu?.('menu_hover');
        mettreAJourInfoBiome(noeud.id);
        return;
    }

    biomeChoisi = noeud.id;
    deps.definirBiomeActif(noeud.id);
    deps.sauvegarderBiomeActif(noeud.id);
    centrerSurNoeud(noeud.id);
    mettreAJourInfoBiome(noeud.id);
    const select = /** @type {HTMLSelectElement | null} */ (
        document.getElementById('sel-biome-clavier')
    );
    if (select && select.value !== noeud.id) select.value = noeud.id;
    deps.sonMenu?.('menu_hover');
}

function coordonneesCanvas(clientX, clientY) {
    const rect = canvasConst.getBoundingClientRect();
    const scaleX = canvasConst.width / rect.width;
    const scaleY = canvasConst.height / rect.height;
    return {
        x: (clientX - rect.left) * scaleX,
        y: (clientY - rect.top) * scaleY,
    };
}

function attacherEvenementsConstellation() {
    if (!canvasConst || evenementsOk) return;
    evenementsOk = true;

    canvasConst.addEventListener('mousemove', (e) => {
        sourisCX = e.clientX;
        sourisCY = e.clientY;
        const noeud = noeudDepuisPointer(e.clientX, e.clientY);
        if (noeud?.id !== biomeHover) {
            biomeHover = noeud?.id ?? null;
            if (!obtenirConstellationClicSeul()) {
                if (noeud && !noeud.verrouille) {
                    mettreAJourInfoBiome(noeud.id);
                } else if (!noeud && !biomeChoisi) {
                    masquerInfoBiome();
                }
            }
        }
        canvasConst.style.cursor = noeud ? 'pointer' : 'default';
    });

    canvasConst.addEventListener('mouseleave', () => {
        biomeHover = null;
        canvasConst.style.cursor = 'default';
    });

    canvasConst.addEventListener('click', (e) => {
        const noeud = noeudDepuisPointer(e.clientX, e.clientY);
        if (noeud && noeud.id === biomeChoisi && panneauBiomeEstOuvert()) {
            masquerInfoBiome();
            return;
        }
        traiterSelectionNoeud(noeud, false);
    });

    canvasConst.addEventListener(
        'touchstart',
        (e) => {
            const touch = e.touches[0];
            if (!touch) return;
            glissadeEnCours = false;
            glissadeConstellation = {
                x: touch.clientX,
                y: touch.clientY,
                panX: panConstellationX,
                panY: panConstellationY,
            };
            sourisCX = touch.clientX;
            sourisCY = touch.clientY;
        },
        { passive: true }
    );

    canvasConst.addEventListener(
        'touchmove',
        (e) => {
            const touch = e.touches[0];
            if (!touch || !glissadeConstellation) return;
            const dx = touch.clientX - glissadeConstellation.x;
            const dy = touch.clientY - glissadeConstellation.y;
            if (Math.abs(dx) > 10 || Math.abs(dy) > 10) {
                glissadeEnCours = true;
                panConstellationX = glissadeConstellation.panX + dx * 0.85;
                panConstellationY = glissadeConstellation.panY + dy * 0.85;
                bornesPanConstellation();
            }
            sourisCX = touch.clientX;
            sourisCY = touch.clientY;
            if (glissadeEnCours) e.preventDefault();
        },
        { passive: false }
    );

    canvasConst.addEventListener(
        'touchend',
        (e) => {
            e.preventDefault();
            if (glissadeEnCours) {
                glissadeConstellation = null;
                glissadeEnCours = false;
                return;
            }
            const touch = e.changedTouches[0];
            if (!touch) return;
            const noeud = noeudDepuisPointer(touch.clientX, touch.clientY);
            traiterSelectionNoeud(noeud, false);
            glissadeConstellation = null;
        },
        { passive: false }
    );
}

export function configurerConstellation(configuration) {
    deps = configuration;
}

function masquerOracleCoopSiNecessaire() {
    mettreAJourVisibiliteModesDebloques();
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
    initConstellation();
    masquerOracleCoopSiNecessaire();
    proposerInfobulleOracleCoopExclusif();
    import('./mode-sprint.js').then(({ mettreAJourToggleSprint }) => mettreAJourToggleSprint());
    abonnerBoucleMenuUnifiee(boucleConstellation);
}

export function arreterConstellation() {
    desabonnerBoucleMenuUnifiee(boucleConstellation);
}

export function redimensionnerConstellation() {
    if (!canvasConst || !document.getElementById('ecran-selection')?.classList.contains('actif'))
        return;
    const choix = biomeChoisi;
    const panneauOuvert = panneauBiomeEstOuvert();
    initConstellation();
    if (choix && panneauOuvert && BIOMES[choix]) {
        biomeChoisi = choix;
        mettreAJourInfoBiome(choix);
    }
}

export { obtenirDecalageCentreConstellation } from './constellation-zone.js';

export function lancerBiomeSelectionne() {
    if (!biomeChoisi || !BIOMES[biomeChoisi]) return;
    // Même critère que les nœuds de la carte : déblocage par le Mode Histoire.
    if (!biomeEstDebloqueParHistoire(biomeChoisi)) return;
    deps.definirBiomeActif(biomeChoisi);
    deps.sauvegarderBiomeActif(biomeChoisi);
    if (deps.modeCoopEstActif?.()) {
        deps.demarrerCooperatif?.();
    } else {
        deps.demarrerJeu();
    }
}
