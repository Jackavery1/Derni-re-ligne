import { BIOMES, ORDRE_BIOMES_LIBRE } from './config.js';
import { sansAccentsE } from './texte-jeu.js';
import { obtenirConstellationClicSeul } from './accessibilite.js';
import { obtenirCanvas } from './dom-utils.js';
import { mettreAJourVisibiliteModesDebloques } from './deblocage-ui.js';
import { biomeEstDebloqueParHistoire, obtenirRecordSprintBiome } from './progression.js';
import { modeSprintActif } from './mode-sprint.js';
import { formaterTemps } from './hud-jeu.js';
export { FONDS_BIOME, NOMS_MONDES_REQUIS } from './constellation-rendu.js';
import {
    dessinerFondBiome,
    dessinerLignesConstellation as dessinerLignesRendu,
    dessinerNoeudBiome as dessinerNoeudRendu,
    NOMS_MONDES_REQUIS,
} from './constellation-rendu.js';
import {
    obtenirDecalageCentreConstellation,
    SEUIL_PANNEAU_SEL_MOBILE,
} from './constellation-zone.js';
import { rendreIconeSurCanvas } from './icones-pixel.js';
import { obtenirIdIconeBiome } from './biome-icones-map.js';
import { abonnerBoucleMenuUnifiee, desabonnerBoucleMenuUnifiee } from './planificateur-raf.js';
import { proposerInfobulleOracleCoopExclusif } from './infobulles-contexte.js';

let deps = {};

const constellationEtoiles = [];
const constellationNoeuds = [];
let biomeHover = null;
let biomeChoisi = null;
let offsetCamX = 0;
let offsetCamY = 0;
let sourisCX = 0;
let sourisCY = 0;
let canvasConst = null;
let ctxConst = null;
let evenementsOk = false;
let selectBiomesOk = false;
let fermeturePanneauTimer = 0;
let evenementsPanneauOk = false;
let evenementEscapeOk = false;

function panneauBiomeEstOuvert() {
    const panneau = document.getElementById('sel-info-biome');
    return Boolean(panneau && !panneau.classList.contains('element-masque'));
}

function obtenirDecalageZoneActuel() {
    return obtenirDecalageCentreConstellation(panneauBiomeEstOuvert(), window.innerWidth);
}

function repositionnerNoeudsConstellation() {
    if (!canvasConst || !constellationNoeuds.length) return;
    const w = canvasConst.width;
    const h = canvasConst.height;
    const centreX = w / 2 + obtenirDecalageZoneActuel();
    const centreY = h / 2;
    const base = Math.min(w, h);
    const rayonInit = base * 0.12;
    const croissance = base * 0.06;
    const angleIncr = 2.4;

    ORDRE_BIOMES_LIBRE.forEach((id, index) => {
        const noeud = constellationNoeuds.find((n) => n.id === id);
        if (!noeud) return;
        const angle = index * angleIncr;
        const rayonSpirale = rayonInit + index * croissance;
        noeud.x = centreX + Math.cos(angle) * rayonSpirale;
        noeud.y = centreY + Math.sin(angle) * rayonSpirale;
    });
}

function afficherPanneauBiome() {
    const panneau = document.getElementById('sel-info-biome');
    const backdrop = document.getElementById('sel-panneau-backdrop');
    if (!panneau) return;

    const etaitVisible = panneau.classList.contains('sel-panneau--visible');
    if (fermeturePanneauTimer) {
        clearTimeout(fermeturePanneauTimer);
        fermeturePanneauTimer = 0;
    }

    panneau.classList.remove('element-masque');
    panneau.setAttribute('aria-hidden', 'false');

    if (window.innerWidth < SEUIL_PANNEAU_SEL_MOBILE && backdrop) {
        backdrop.classList.remove('element-masque');
        backdrop.setAttribute('aria-hidden', 'false');
    }

    if (!etaitVisible) {
        requestAnimationFrame(() => {
            panneau.classList.add('sel-panneau--visible');
            repositionnerNoeudsConstellation();
            document.getElementById('btn-sel-panneau-fermer')?.focus({ preventScroll: true });
        });
    }
}

function masquerInfoBiome() {
    const panneau = document.getElementById('sel-info-biome');
    const backdrop = document.getElementById('sel-panneau-backdrop');
    if (!panneau || panneau.classList.contains('element-masque')) return;

    panneau.classList.remove('sel-panneau--visible');
    backdrop?.classList.add('element-masque');
    backdrop?.setAttribute('aria-hidden', 'true');

    if (fermeturePanneauTimer) clearTimeout(fermeturePanneauTimer);
    fermeturePanneauTimer = setTimeout(() => {
        fermeturePanneauTimer = 0;
        panneau.classList.add('element-masque');
        panneau.setAttribute('aria-hidden', 'true');
        repositionnerNoeudsConstellation();
    }, 250);
}

function attacherEvenementsPanneauBiome() {
    if (evenementsPanneauOk) return;
    evenementsPanneauOk = true;

    document.getElementById('btn-sel-panneau-fermer')?.addEventListener('click', masquerInfoBiome);
    document.getElementById('sel-panneau-backdrop')?.addEventListener('click', masquerInfoBiome);
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

function mettreAJourInfoBiome(idBiome) {
    const panneau = document.getElementById('sel-info-biome');
    const elNom = document.getElementById('sel-biome-nom');
    const elRecord = document.getElementById('sel-biome-record');
    const elStatut = document.getElementById('sel-biome-statut');
    const biome = BIOMES[idBiome];
    if (!biome || !panneau) return;

    const verrouille = !biomeEstDebloqueParHistoire(idBiome);
    const record = deps.obtenirRecordBiome(idBiome);
    const niveauRecord = deps.obtenirRecordNiveauBiome(idBiome);
    const etoiles = deps.formaterEtoiles(deps.calculerEtoiles(record, niveauRecord));

    const accent = biome.lueurCoul ?? biome.ui?.couleurPrimaire ?? '#00f5ff';
    panneau.style.setProperty('--accent-carte', accent);

    const canvasIcone = /** @type {HTMLCanvasElement | null} */ (
        document.getElementById('sel-biome-icone')
    );
    if (canvasIcone?.getContext) {
        canvasIcone.width = 48;
        canvasIcone.height = 48;
        rendreIconeSurCanvas(canvasIcone, obtenirIdIconeBiome(idBiome), { taillePixel: 3 });
    }
    if (elNom) {
        elNom.textContent = sansAccentsE(biome.nom);
    }
    if (elRecord) {
        if (verrouille) {
            const nbVerrouilles = ORDRE_BIOMES_LIBRE.filter(
                (id) => !biomeEstDebloqueParHistoire(id)
            ).length;
            elRecord.textContent = sansAccentsE(
                nbVerrouilles > 0
                    ? `${nbVerrouilles} MONDE(S) A DEBLOQUER EN HISTOIRE`
                    : 'A DEBLOQUER EN MODE HISTOIRE'
            );
        } else if (modeSprintActif) {
            const ms = obtenirRecordSprintBiome(idBiome);
            elRecord.textContent = sansAccentsE(
                ms > 0 ? `MEILLEUR TEMPS : ${formaterTemps(ms)} (40L)` : 'SPRINT 40 LIGNES — CHRONO'
            );
        } else {
            elRecord.textContent = sansAccentsE(
                `RECORD : ${record.toLocaleString('fr-FR')} — ${etoiles}`
            );
        }
    }
    if (elStatut) {
        if (verrouille) {
            const requis = NOMS_MONDES_REQUIS[idBiome];
            elStatut.textContent = sansAccentsE(
                requis ? `Complete ${requis} en Mode Histoire pour debloquer` : 'MONDE VERROUILLE'
            );
        } else if (idBiome === 'cosmos' || idBiome === 'fuochi') {
            elStatut.textContent = sansAccentsE('MONDE EXIGEANT — rythme soutenu');
        } else {
            elStatut.textContent = sansAccentsE("PRET POUR L'AVENTURE");
        }
    }

    const btnHistoire = document.getElementById('sel-btn-histoire');
    const btnJouer = document.getElementById('sel-btn-jouer');
    const teaserHistoire = verrouille && !!NOMS_MONDES_REQUIS[idBiome];
    btnHistoire?.classList.toggle('element-masque', !teaserHistoire);
    btnJouer?.classList.toggle('element-masque', verrouille);

    afficherPanneauBiome();
    deps.appliquerThemeBiome(idBiome);
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
    const rayonInit = base * 0.12;
    const croissance = base * 0.06;
    const angleIncr = 2.4;

    ORDRE_BIOMES_LIBRE.forEach((id, index) => {
        const biome = BIOMES[id];
        const angle = index * angleIncr;
        const rayonSpirale = rayonInit + index * croissance;
        constellationNoeuds.push({
            id,
            biome,
            x: centreX + Math.cos(angle) * rayonSpirale,
            y: centreY + Math.sin(angle) * rayonSpirale,
            rayon: 28 + index * 2,
            pulsation: Math.random() * Math.PI * 2,
            vitessePuls: 0.02 + Math.random() * 0.01,
            verrouille: !biomeEstDebloqueParHistoire(id),
            flashRejet: 0,
        });
    });

    mettreAJourEnteteSelection();
    if (biomeChoisi && BIOMES[biomeChoisi]) {
        mettreAJourInfoBiome(biomeChoisi);
    } else {
        masquerInfoBiome();
    }

    attacherEvenementsConstellation();
    attacherEvenementsPanneauBiome();
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
    offsetCamX = (sourisCX / w - 0.5) * 18;
    offsetCamY = (sourisCY / h - 0.5) * 18;

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
        const { x, y } = coordonneesCanvas(e.clientX, e.clientY);
        const noeud = noeudSousCurseur(x, y);
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
        if (biomeChoisi && BIOMES[biomeChoisi]) {
            mettreAJourInfoBiome(biomeChoisi);
        } else if (!biomeChoisi) {
            masquerInfoBiome();
        }
    });

    canvasConst.addEventListener('click', (e) => {
        const { x, y } = coordonneesCanvas(e.clientX, e.clientY);
        traiterSelectionNoeud(noeudSousCurseur(x, y), false);
    });

    canvasConst.addEventListener(
        'touchmove',
        (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            if (!touch) return;
            sourisCX = touch.clientX;
            sourisCY = touch.clientY;
            const { x, y } = coordonneesCanvas(touch.clientX, touch.clientY);
            const noeud = noeudSousCurseur(x, y);
            biomeHover = noeud?.id ?? null;
        },
        { passive: false }
    );

    canvasConst.addEventListener(
        'touchend',
        (e) => {
            e.preventDefault();
            const touch = e.changedTouches[0];
            if (!touch) return;
            const { x, y } = coordonneesCanvas(touch.clientX, touch.clientY);
            const noeud = noeudSousCurseur(x, y);
            traiterSelectionNoeud(noeud, false);
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
