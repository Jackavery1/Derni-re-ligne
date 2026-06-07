import { BIOMES, ORDRE_BIOMES } from './config.js';
import { eclaircir, assombrir } from './rendu-blocs-utils.js';
import { obtenirCanvas } from './dom-utils.js';
import { mettreAJourVisibiliteModesDebloques } from './deblocage-ui.js';

let deps = {};

const constellationEtoiles = [];
const constellationNoeuds = [];
let biomeHover = null;
let biomeChoisi = null;
let idFrameConst = null;
let offsetCamX = 0;
let offsetCamY = 0;
let sourisCX = 0;
let sourisCY = 0;
let canvasConst = null;
let ctxConst = null;
let evenementsOk = false;
let selectBiomesOk = false;
let dernierTapBiome = null;
let dernierTapTemps = 0;

function compterBiomesDebloques() {
    let n = 0;
    for (const id of ORDRE_BIOMES) {
        if (deps.biomeEstDebloque(deps.obtenirNiveauGlobal(), BIOMES[id].niveauDeblocage)) n++;
    }
    return n;
}

function mettreAJourEnteteSelection() {
    const titre = document.getElementById('sel-titre-jeu');
    const sousTitre = document.getElementById('sel-sous-titre');
    if (titre) titre.textContent = 'CHOISIR UN MONDE';
    if (sousTitre) {
        const nb = compterBiomesDebloques();
        sousTitre.textContent = `NIVEAU GLOBAL : ${deps.obtenirNiveauGlobal()} — ${nb}/9 MONDES`;
    }
}

function mettreAJourInfoBiome(idBiome) {
    const panneau = document.getElementById('sel-info-biome');
    const elNom = document.getElementById('sel-biome-nom');
    const elRecord = document.getElementById('sel-biome-record');
    const elStatut = document.getElementById('sel-biome-statut');
    const biome = BIOMES[idBiome];
    if (!biome || !panneau) return;

    const verrouille = !deps.biomeEstDebloque(deps.obtenirNiveauGlobal(), biome.niveauDeblocage);
    const record = deps.obtenirRecordBiome(idBiome);
    const niveauRecord = deps.obtenirRecordNiveauBiome(idBiome);
    const etoiles = deps.formaterEtoiles(deps.calculerEtoiles(record, niveauRecord));

    if (elNom) {
        elNom.textContent = `${biome.icone} ${biome.nom}`;
        elNom.style.color = biome.ui?.couleurPrimaire ?? biome.lueurCoul;
    }
    if (elRecord) {
        elRecord.textContent = verrouille
            ? `PROGRESSION ${biome.niveauDeblocage} REQUISE`
            : `RECORD : ${record.toLocaleString('fr-FR')} — ${etoiles}`;
    }
    if (elStatut) {
        elStatut.textContent = verrouille ? '🔒 MONDE VERROUILLÉ' : "PRÊT POUR L'AVENTURE";
    }

    panneau.style.display = 'flex';
    deps.appliquerThemeBiome(idBiome);
}

function masquerInfoBiome() {
    const panneau = document.getElementById('sel-info-biome');
    if (panneau) panneau.style.display = 'none';
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

    const centreX = w / 2;
    const centreY = h / 2;
    const base = Math.min(w, h);
    const rayonInit = base * 0.12;
    const croissance = base * 0.06;
    const angleIncr = 2.4;

    ORDRE_BIOMES.forEach((id, index) => {
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
            verrouille: !deps.biomeEstDebloque(deps.obtenirNiveauGlobal(), biome.niveauDeblocage),
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
        opt.textContent = noeud.verrouille ? `${noeud.biome.nom} (verrouillé)` : noeud.biome.nom;
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

function dessinerLignesConstellation() {
    for (let i = 0; i < constellationNoeuds.length; i++) {
        for (let j = i + 1; j < constellationNoeuds.length; j++) {
            const a = constellationNoeuds[i];
            const b = constellationNoeuds[j];
            const dx = a.x - b.x;
            const dy = a.y - b.y;
            const dist = Math.hypot(dx, dy);
            if (dist >= 220) continue;
            const debloque = !a.verrouille && !b.verrouille;
            ctxConst.strokeStyle = debloque ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.06)';
            ctxConst.lineWidth = 0.8;
            ctxConst.beginPath();
            ctxConst.moveTo(a.x, a.y);
            ctxConst.lineTo(b.x, b.y);
            ctxConst.stroke();
        }
    }
}

function dessinerNoeudBiome(noeud, timestamp) {
    const t = timestamp / 1000;
    noeud.pulsation += noeud.vitessePuls;
    const pulse = Math.sin(noeud.pulsation);
    const couleur = noeud.biome.lueurCoul;
    const estHover = biomeHover === noeud.id;
    const estChoisi = biomeChoisi === noeud.id;
    const rayon = noeud.verrouille ? noeud.rayon * 0.72 : noeud.rayon;

    if (noeud.flashRejet && timestamp - noeud.flashRejet < 400) {
        ctxConst.save();
        ctxConst.fillStyle = 'rgba(255,40,40,0.35)';
        ctxConst.beginPath();
        ctxConst.arc(noeud.x, noeud.y, rayon + 10, 0, Math.PI * 2);
        ctxConst.fill();
        ctxConst.restore();
    }

    if (noeud.verrouille) {
        ctxConst.save();
        ctxConst.fillStyle = 'rgba(60,60,80,0.85)';
        ctxConst.beginPath();
        ctxConst.arc(noeud.x, noeud.y, rayon, 0, Math.PI * 2);
        ctxConst.fill();
        ctxConst.fillStyle = 'rgba(255,255,255,0.5)';
        ctxConst.font = '18px serif';
        ctxConst.textAlign = 'center';
        ctxConst.textBaseline = 'middle';
        ctxConst.fillText('🔒', noeud.x, noeud.y - 2);
        ctxConst.font = '7px "Press Start 2P", monospace';
        ctxConst.fillStyle = 'rgba(180,180,200,0.6)';
        ctxConst.fillText(noeud.biome.nom, noeud.x, noeud.y + rayon + 14);
        ctxConst.restore();
        return;
    }

    ctxConst.save();

    if (estChoisi) {
        ctxConst.shadowColor = couleur;
        ctxConst.shadowBlur = 35;
        ctxConst.strokeStyle = couleur;
        ctxConst.lineWidth = 3;
        ctxConst.beginPath();
        ctxConst.arc(noeud.x, noeud.y, rayon + 10, 0, Math.PI * 2);
        ctxConst.stroke();
    }

    if (estHover) {
        ctxConst.shadowColor = couleur;
        ctxConst.shadowBlur = 25;
        ctxConst.save();
        ctxConst.translate(noeud.x, noeud.y);
        ctxConst.rotate(t * 1.2);
        ctxConst.strokeStyle = couleur;
        ctxConst.lineWidth = 2;
        ctxConst.setLineDash([6, 5]);
        ctxConst.beginPath();
        ctxConst.arc(0, 0, rayon + 14, 0, Math.PI * 2);
        ctxConst.stroke();
        ctxConst.restore();
    }

    ctxConst.strokeStyle = couleur + '33';
    ctxConst.lineWidth = 1;
    ctxConst.shadowBlur = 0;
    ctxConst.beginPath();
    ctxConst.arc(noeud.x, noeud.y, rayon + 8 + pulse * 4, 0, Math.PI * 2);
    ctxConst.stroke();

    ctxConst.strokeStyle = couleur + '55';
    ctxConst.beginPath();
    ctxConst.arc(noeud.x, noeud.y, rayon + 4, 0, Math.PI * 2);
    ctxConst.stroke();

    const grad = ctxConst.createRadialGradient(
        noeud.x - rayon * 0.2,
        noeud.y - rayon * 0.2,
        0,
        noeud.x,
        noeud.y,
        rayon
    );
    grad.addColorStop(0, eclaircir(couleur, 1.35));
    grad.addColorStop(0.55, couleur);
    grad.addColorStop(1, assombrir(couleur, 0.45));
    ctxConst.fillStyle = grad;
    ctxConst.shadowColor = couleur;
    ctxConst.shadowBlur = estHover || estChoisi ? 0 : 12;
    ctxConst.beginPath();
    ctxConst.arc(noeud.x, noeud.y, rayon, 0, Math.PI * 2);
    ctxConst.fill();

    ctxConst.shadowBlur = 0;
    ctxConst.font = '20px serif';
    ctxConst.textAlign = 'center';
    ctxConst.textBaseline = 'middle';
    ctxConst.fillText(noeud.biome.icone, noeud.x, noeud.y);

    ctxConst.font = '7px "Press Start 2P", monospace';
    ctxConst.fillStyle = couleur + '99';
    ctxConst.fillText(noeud.biome.nom, noeud.x, noeud.y + rayon + 14);

    ctxConst.restore();
}

function boucleConstellation(timestamp) {
    if (!ctxConst || !canvasConst) return;

    const w = canvasConst.width;
    const h = canvasConst.height;
    offsetCamX = (sourisCX / w - 0.5) * 18;
    offsetCamY = (sourisCY / h - 0.5) * 18;

    const gradFond = ctxConst.createRadialGradient(
        w / 2,
        h / 2,
        0,
        w / 2,
        h / 2,
        Math.max(w, h) * 0.75
    );
    gradFond.addColorStop(0, '#020210');
    gradFond.addColorStop(0.5, '#060818');
    gradFond.addColorStop(1, '#000004');
    ctxConst.fillStyle = gradFond;
    ctxConst.fillRect(0, 0, w, h);

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

    dessinerLignesConstellation();

    for (const noeud of constellationNoeuds) {
        dessinerNoeudBiome(noeud, timestamp);
    }

    ctxConst.restore();

    idFrameConst = requestAnimationFrame(boucleConstellation);
}

function traiterSelectionNoeud(noeud, doubleTap = false) {
    if (!noeud) {
        biomeHover = null;
        masquerInfoBiome();
        return;
    }

    if (noeud.verrouille) {
        noeud.flashRejet = performance.now();
        deps.sonMenu?.('menu_hover');
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

    if (doubleTap) {
        lancerBiomeSelectionne();
    }
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
            if (noeud && !noeud.verrouille) {
                mettreAJourInfoBiome(noeud.id);
            } else if (!noeud && !biomeChoisi) {
                masquerInfoBiome();
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
            const maintenant = Date.now();
            const doubleTap =
                noeud && noeud.id === dernierTapBiome && maintenant - dernierTapTemps < 450;
            dernierTapBiome = noeud?.id ?? null;
            dernierTapTemps = maintenant;
            traiterSelectionNoeud(noeud, doubleTap);
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
    idFrameConst = requestAnimationFrame(boucleConstellation);
}

export function arreterConstellation() {
    if (idFrameConst) {
        cancelAnimationFrame(idFrameConst);
        idFrameConst = null;
    }
}

export function redimensionnerConstellation() {
    if (!canvasConst || !document.getElementById('ecran-selection')?.classList.contains('actif'))
        return;
    initConstellation();
}

export function lancerBiomeSelectionne() {
    if (!biomeChoisi || !BIOMES[biomeChoisi]) return;
    const biome = BIOMES[biomeChoisi];
    if (!deps.biomeEstDebloque(deps.obtenirNiveauGlobal(), biome.niveauDeblocage)) return;
    deps.definirBiomeActif(biomeChoisi);
    deps.sauvegarderBiomeActif(biomeChoisi);
    if (deps.modeCoopEstActif?.()) {
        deps.demarrerCooperatif?.();
    } else {
        deps.demarrerJeu();
    }
}
