import { BIOMES } from './config/config.js';
import { etat } from './etat/store-jeu.js';
import { obtenirCanvas } from './dom-utils.js';
import { obtenirResumeRecordsLocaux } from './io/progression.js';
import { formaterTemps } from './rendu/hud-jeu.js';
import { sansAccentsE } from './texte-jeu.js';
import { statsGlobales } from './achievements.js';
import { oracle } from './logique/oracle-jeu.js';
import { dessinerHeatmap, dessinerGrapheRythme, dessinerRadar } from './profil-rendu.js';
import {
    donneesPartie,
    dernierProfil,
    calculerProfilStyle,
    genererTitreStyle,
    obtenirDonneesAffichage,
    obtenirNoteVera,
} from './profil-donnees.js';

function dimensionnerCanvasProfil(canvas) {
    if (!(canvas instanceof HTMLCanvasElement)) return;
    const parent = canvas.parentElement;
    if (!parent) return;
    const style = getComputedStyle(parent);
    const paddingX = parseFloat(style.paddingLeft || '0') + parseFloat(style.paddingRight || '0');
    const w = Math.max(200, Math.floor(parent.clientWidth - paddingX));
    const ratio = canvas.height / canvas.width;
    const h = Math.max(80, Math.floor(w * ratio));
    if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
    }
}

function afficherTableauRecordsLocaux() {
    const conteneur = document.getElementById('profil-records-table');
    if (!conteneur) return;

    conteneur.replaceChildren();
    const entetes = document.createElement('div');
    entetes.className = 'profil-records-ligne profil-records-entete';
    entetes.setAttribute('role', 'row');
    for (const label of ['MONDE', 'SANS FIN', 'SPRINT']) {
        const cell = document.createElement('span');
        cell.className = 'profil-records-cell';
        cell.setAttribute('role', 'columnheader');
        cell.textContent = sansAccentsE(label);
        entetes.appendChild(cell);
    }
    conteneur.appendChild(entetes);

    for (const ligne of obtenirResumeRecordsLocaux()) {
        if (!ligne.debloque) continue;
        const row = document.createElement('div');
        row.className = 'profil-records-ligne';
        row.setAttribute('role', 'row');

        const nom = document.createElement('span');
        nom.className = 'profil-records-cell profil-records-nom';
        nom.setAttribute('role', 'cell');
        nom.textContent = sansAccentsE(ligne.nom);

        const marathon = document.createElement('span');
        marathon.className = 'profil-records-cell';
        marathon.setAttribute('role', 'cell');
        marathon.textContent = ligne.record > 0 ? ligne.record.toLocaleString('fr-FR') : '—';

        const sprint = document.createElement('span');
        sprint.className = 'profil-records-cell';
        sprint.setAttribute('role', 'cell');
        sprint.textContent = ligne.sprintMs > 0 ? formaterTemps(ligne.sprintMs) : '—';

        row.append(nom, marathon, sprint);
        conteneur.appendChild(row);
    }
}

function _remplirEnteteProfil(donnees, profil, titre, profilVide) {
    const elTitre = document.getElementById('profil-titre-style');
    const elBiome = document.getElementById('profil-biome-badge');
    const elNote = document.getElementById('profil-note-vera');
    const elVide = document.getElementById('profil-vide-msg');

    if (elTitre) elTitre.textContent = profilVide ? '' : titre;
    if (elVide) elVide.classList.toggle('element-masque', !profilVide);
    if (elNote) {
        if (profil && !profilVide) {
            elNote.textContent = obtenirNoteVera(profil);
            elNote.classList.remove('element-masque');
        } else {
            elNote.textContent = '';
            elNote.classList.add('element-masque');
        }
    }

    const biomeId = donnees.biomeId || dernierProfil.donnees.biomeId;
    if (elBiome) {
        const b = BIOMES[biomeId];
        elBiome.textContent = b && !profilVide ? b.nom.toUpperCase() : '';
    }
}

function _remplirStatsProfil(donnees) {
    const nb = donnees.timestampsVerrou.length;
    const set = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.textContent = val;
    };
    set('pstat-pieces', String(nb));
    set('pstat-rotations', String(donnees.nbRotations));
    set('pstat-drops', String(donnees.nbHardDrops));
    set('pstat-holds', String(donnees.nbHolds));
    set('pstat-mouvements', String(donnees.nbMouvementsLateraux));

    const reactions = donnees.tempsReactions;
    const moyReact =
        reactions.length > 0
            ? Math.round(reactions.reduce((a, b) => a + b, 0) / reactions.length)
            : 0;
    set('pstat-reaction', `${moyReact}ms`);

    const wrapOracle = document.getElementById('pstat-oracle-wrap');
    const multOracle = oracle.actif
        ? oracle.multiplicateur
        : statsGlobales.oracleMeilleuresMult || 1;
    if (wrapOracle) {
        if (oracle.actif || statsGlobales.oraclePartiesJouees > 0) {
            wrapOracle.classList.remove('element-masque');
            set('pstat-oracle-mult', `×${multOracle.toFixed(1)}`);
        } else {
            wrapOracle.classList.add('element-masque');
        }
    }
}

export function afficherProfil() {
    if (typeof document === 'undefined') return;

    const donnees = obtenirDonneesAffichage();
    const lignesPartie = donnees.lignesPartie || 0;
    const profil =
        donnees === donneesPartie && donneesPartie.timestampsVerrou.length > 0
            ? calculerProfilStyle(donnees, lignesPartie || etat.lignes)
            : dernierProfil.profil || calculerProfilStyle(donnees, lignesPartie);

    const titre =
        donnees === donneesPartie && donneesPartie.timestampsVerrou.length > 0
            ? genererTitreStyle(profil)
            : dernierProfil.titreStyle || genererTitreStyle(profil);

    const profilVide = donnees.timestampsVerrou.length === 0;
    _remplirEnteteProfil(donnees, profil, titre, profilVide);
    _remplirStatsProfil(donnees);

    afficherTableauRecordsLocaux();

    requestAnimationFrame(() => {
        const cHeat = obtenirCanvas('canvas-heatmap');
        const cRythm = obtenirCanvas('canvas-rythme');
        const cRad = obtenirCanvas('canvas-radar');
        if (cHeat) dimensionnerCanvasProfil(cHeat);
        if (cRythm) dimensionnerCanvasProfil(cRythm);
        if (cRad) dimensionnerCanvasProfil(cRad);
        const ctxHeat = cHeat?.getContext('2d');
        const ctxRythm = cRythm?.getContext('2d');
        const ctxRad = cRad?.getContext('2d');

        if (ctxHeat && cHeat) {
            ctxHeat.clearRect(0, 0, cHeat.width, cHeat.height);
            dessinerHeatmap(ctxHeat, cHeat.width, cHeat.height, donnees);
        }
        if (ctxRythm && cRythm) {
            ctxRythm.clearRect(0, 0, cRythm.width, cRythm.height);
            dessinerGrapheRythme(ctxRythm, cRythm.width, cRythm.height, donnees);
        }
        if (ctxRad && cRad) {
            ctxRad.clearRect(0, 0, cRad.width, cRad.height);
            dessinerRadar(ctxRad, cRad.width, cRad.height, profil);
        }
    });
}

export { dessinerHeatmap, dessinerGrapheRythme, dessinerRadar };
