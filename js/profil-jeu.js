import { CONFIG, BIOMES } from './config.js';
import { etat } from './store-jeu.js';
import { obtenirForme } from './piece-jeu.js';
import { logger } from './logger.js';
import { obtenirCanvas } from './dom-utils.js';
import { lireStockageJson, ecrireStockageJson } from './progression.js';
import { statsGlobales } from './achievements.js';
import { oracle } from './oracle-jeu.js';

const MAX_VERROUS = 200;
const MAX_REACTIONS = 200;
const CLE_PROFIL = 'tetrisNeo_profilDernier';

function creerDonneesVides() {
    return {
        atterrissagesColonne: new Array(CONFIG.colonnes).fill(0),
        timestampsVerrou: [],
        nbRotations: 0,
        nbHardDrops: 0,
        nbHolds: 0,
        nbMouvementsLateraux: 0,
        tempsReactions: [],
        dernierTempsApparition: 0,
        lignesParNiveau: {},
        maxHauteurPlateau: 0,
        lignesPartie: 0,
        biomeId: null,
    };
}

export const donneesPartie = creerDonneesVides();

export let dernierProfil = {
    donnees: creerDonneesVides(),
    titreStyle: '',
    profil: null,
};

export function reinitialiserDonneesPartie() {
    Object.assign(donneesPartie, creerDonneesVides());
    donneesPartie.dernierTempsApparition = Date.now();
}

export function signalerApparitionPiece() {
    donneesPartie.dernierTempsApparition = Date.now();
}

export function enregistrerReaction() {
    if (!donneesPartie.dernierTempsApparition) return;
    const reaction = Date.now() - donneesPartie.dernierTempsApparition;
    if (reaction > 0 && reaction < 10000) {
        if (donneesPartie.tempsReactions.length < MAX_REACTIONS) {
            donneesPartie.tempsReactions.push(reaction);
        }
        donneesPartie.dernierTempsApparition = null;
    }
}

export function calculerHauteurPlateau() {
    for (let l = 0; l < CONFIG.lignes; l++) {
        if (etat.plateau[l].some((c) => c !== 0)) {
            return CONFIG.lignes - l;
        }
    }
    return 0;
}

export function enregistrerDonneesVerrouillage() {
    if (!etat.pieceActuelle) return;
    const piece = etat.pieceActuelle;
    const forme = obtenirForme(piece);

    for (let c = 0; c < forme[0].length; c++) {
        if (forme.some((ligne) => ligne[c])) {
            const col = piece.x + c;
            if (col >= 0 && col < CONFIG.colonnes) {
                donneesPartie.atterrissagesColonne[col]++;
            }
        }
    }

    if (donneesPartie.timestampsVerrou.length < MAX_VERROUS) {
        donneesPartie.timestampsVerrou.push(Date.now());
    }

    const hauteur = calculerHauteurPlateau();
    if (hauteur > donneesPartie.maxHauteurPlateau) {
        donneesPartie.maxHauteurPlateau = hauteur;
    }
}

export function compterRotation() {
    donneesPartie.nbRotations++;
    enregistrerReaction();
}

export function compterMouvementLateral() {
    donneesPartie.nbMouvementsLateraux++;
    enregistrerReaction();
}

export function compterHardDrop() {
    donneesPartie.nbHardDrops++;
}

export function compterHold() {
    donneesPartie.nbHolds++;
}

export function enregistrerLignesParNiveau(nbLignes) {
    if (nbLignes <= 0) return;
    donneesPartie.lignesParNiveau[etat.niveau] =
        (donneesPartie.lignesParNiveau[etat.niveau] || 0) + nbLignes;
}

function clonerDonnees(src) {
    return {
        atterrissagesColonne: [...src.atterrissagesColonne],
        timestampsVerrou: [...src.timestampsVerrou],
        nbRotations: src.nbRotations,
        nbHardDrops: src.nbHardDrops,
        nbHolds: src.nbHolds,
        nbMouvementsLateraux: src.nbMouvementsLateraux,
        tempsReactions: [...src.tempsReactions],
        dernierTempsApparition: src.dernierTempsApparition,
        lignesParNiveau: { ...src.lignesParNiveau },
        maxHauteurPlateau: src.maxHauteurPlateau,
        lignesPartie: src.lignesPartie,
        biomeId: src.biomeId,
    };
}

export function calculerProfilStyle(donnees, lignesPartie) {
    const nb = donnees.timestampsVerrou.length;
    if (nb < 3) return null;

    const intervalles = [];
    for (let i = 1; i < donnees.timestampsVerrou.length; i++) {
        intervalles.push(donnees.timestampsVerrou[i] - donnees.timestampsVerrou[i - 1]);
    }
    const moyInter = intervalles.reduce((a, b) => a + b, 0) / intervalles.length;
    const vitesse = Math.round(Math.max(0, Math.min(100, 100 - (moyInter - 800) / 32)));

    const precision = Math.round(Math.min(100, (lignesPartie / nb) * 250));

    const agressivite = Math.round(Math.min(100, (donnees.nbHardDrops / nb) * 100));

    const endurance = Math.round(Math.min(100, (nb / 150) * 100));

    const ratioRot = donnees.nbRotations / nb;
    const ratioHold = donnees.nbHolds / nb;
    const creativite = Math.round(Math.min(100, ratioRot * 40 + ratioHold * 60));

    const moy = donnees.atterrissagesColonne.reduce((a, b) => a + b, 0) / CONFIG.colonnes;
    const variance =
        donnees.atterrissagesColonne.reduce((acc, v) => acc + Math.pow(v - moy, 2), 0) /
        CONFIG.colonnes;
    const ecartType = Math.sqrt(variance);
    const equilibre = Math.round(Math.max(0, Math.min(100, 100 - (ecartType / (moy || 1)) * 50)));

    return { vitesse, precision, agressivite, endurance, creativite, equilibre };
}

export function genererTitreStyle(profil) {
    if (!profil) return 'JOUEUR MYSTÉRIEUX';

    const axes = [
        { val: profil.vitesse, titres: ['ÉCLAIR', 'FULGURANT', 'RAPIDE'] },
        { val: profil.precision, titres: ['ARCHITECTE', 'CHIRURGIEN', 'PRÉCIS'] },
        { val: profil.agressivite, titres: ['AGRESSIF', 'BRUTAL', 'FRÉNÉTIQUE'] },
        { val: profil.endurance, titres: ['MARATHONIEN', 'TENACE', 'SOLIDE'] },
        { val: profil.creativite, titres: ['CRÉATIF', 'ARTISTE', 'INVENTIF'] },
        { val: profil.equilibre, titres: ['ZEN', 'ÉQUILIBRÉ', 'MAÎTRE'] },
    ].sort((a, b) => b.val - a.val);

    const dominant = axes[0];
    const secondaire = axes[1];
    const t1 = dominant.titres[Math.floor(Math.random() * dominant.titres.length)];
    const t2 = secondaire.titres[Math.floor(Math.random() * secondaire.titres.length)];

    if (dominant.val - secondaire.val < 15) return `${t1} & ${t2}`;
    return `${t2} ${t1}`;
}

export function obtenirDonneesAffichage() {
    if (donneesPartie.timestampsVerrou.length > 0) {
        return donneesPartie;
    }
    return dernierProfil.donnees;
}

function messageVide(ctx2d, w, h, texte) {
    ctx2d.fillStyle = 'rgba(0,0,0,0.4)';
    ctx2d.fillRect(0, 0, w, h);
    ctx2d.fillStyle = 'rgba(255,255,255,0.35)';
    ctx2d.font = '8px monospace';
    ctx2d.textAlign = 'center';
    ctx2d.fillText(texte, w / 2, h / 2);
}

export function dessinerHeatmap(ctx2d, w, h, donnees) {
    if (donnees.timestampsVerrou.length === 0) {
        messageVide(ctx2d, w, h, 'JOUEZ UNE PREMIÈRE PARTIE !');
        return;
    }

    const data = donnees.atterrissagesColonne;
    const maxVal = Math.max(...data, 1);
    const colW = w / CONFIG.colonnes;

    ctx2d.fillStyle = 'rgba(0,0,0,0.4)';
    ctx2d.fillRect(0, 0, w, h);

    data.forEach((val, i) => {
        const ratio = val / maxVal;
        const hauteur = ratio * (h - 20);
        const x = i * colW;
        const y = h - hauteur;
        const hue = 240 - ratio * 240;
        const grad = ctx2d.createLinearGradient(x, y, x, h);
        grad.addColorStop(0, `hsla(${hue}, 100%, 65%, 0.9)`);
        grad.addColorStop(1, `hsla(${hue}, 100%, 40%, 0.6)`);
        ctx2d.fillStyle = grad;
        ctx2d.shadowColor = `hsl(${hue}, 100%, 60%)`;
        ctx2d.shadowBlur = 8;
        ctx2d.fillRect(x + 2, y, colW - 4, hauteur);

        ctx2d.shadowBlur = 0;
        ctx2d.fillStyle = 'rgba(255,255,255,0.4)';
        ctx2d.font = '7px monospace';
        ctx2d.textAlign = 'center';
        ctx2d.fillText(String(i + 1), x + colW / 2, h - 4);

        if (val > 0) {
            ctx2d.fillStyle = 'rgba(255,255,255,0.7)';
            ctx2d.fillText(String(val), x + colW / 2, y - 3);
        }
    });

    ctx2d.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx2d.lineWidth = 1;
    ctx2d.beginPath();
    ctx2d.moveTo(0, h - 14);
    ctx2d.lineTo(w, h - 14);
    ctx2d.stroke();
}

export function dessinerGrapheRythme(ctx2d, w, h, donnees) {
    const ts = donnees.timestampsVerrou;
    if (ts.length === 0) {
        messageVide(ctx2d, w, h, 'JOUEZ UNE PREMIÈRE PARTIE !');
        return;
    }
    if (ts.length < 2) {
        messageVide(ctx2d, w, h, 'DONNÉES INSUFFISANTES');
        return;
    }

    const intervalles = [];
    for (let i = 1; i < ts.length; i++) {
        intervalles.push(ts[i] - ts[i - 1]);
    }

    const maxI = Math.max(...intervalles);
    const minI = Math.min(...intervalles);
    const range = maxI - minI || 1;
    const nb = intervalles.length;

    ctx2d.fillStyle = 'rgba(0,0,0,0.4)';
    ctx2d.fillRect(0, 0, w, h);

    ctx2d.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx2d.lineWidth = 0.5;
    for (let i = 0; i < 4; i++) {
        const y = (i / 4) * (h - 20) + 10;
        ctx2d.beginPath();
        ctx2d.moveTo(0, y);
        ctx2d.lineTo(w, y);
        ctx2d.stroke();
    }

    const lisses = intervalles.map((v, i) => {
        const voisins = intervalles.slice(Math.max(0, i - 1), i + 2);
        return voisins.reduce((a, b) => a + b, 0) / voisins.length;
    });

    ctx2d.beginPath();
    lisses.forEach((v, i) => {
        const x = 4 + (i / (nb - 1)) * (w - 8);
        const y = 10 + (1 - (v - minI) / range) * (h - 30);
        if (i === 0) ctx2d.moveTo(x, y);
        else ctx2d.lineTo(x, y);
    });
    ctx2d.lineTo(w - 4, h - 10);
    ctx2d.lineTo(4, h - 10);
    ctx2d.closePath();
    const aireGrad = ctx2d.createLinearGradient(0, 0, 0, h);
    aireGrad.addColorStop(0, 'rgba(0,245,255,0.25)');
    aireGrad.addColorStop(1, 'rgba(0,245,255,0.02)');
    ctx2d.fillStyle = aireGrad;
    ctx2d.fill();

    ctx2d.beginPath();
    ctx2d.strokeStyle = '#00f5ff';
    ctx2d.lineWidth = 1.5;
    ctx2d.shadowColor = '#00f5ff';
    ctx2d.shadowBlur = 6;
    lisses.forEach((v, i) => {
        const x = 4 + (i / (nb - 1)) * (w - 8);
        const y = 10 + (1 - (v - minI) / range) * (h - 30);
        if (i === 0) ctx2d.moveTo(x, y);
        else ctx2d.lineTo(x, y);
    });
    ctx2d.stroke();

    ctx2d.shadowBlur = 0;
    lisses.forEach((v, i) => {
        if (i === 0 || i === nb - 1) return;
        const estPic = v < lisses[i - 1] && v < lisses[i + 1];
        const estCreux = v > lisses[i - 1] && v > lisses[i + 1];
        if (!estPic && !estCreux) return;
        const x = 4 + (i / (nb - 1)) * (w - 8);
        const y = 10 + (1 - (v - minI) / range) * (h - 30);
        ctx2d.beginPath();
        ctx2d.arc(x, y, 3, 0, Math.PI * 2);
        ctx2d.fillStyle = estPic ? '#00ff88' : '#ff006e';
        ctx2d.fill();
    });

    ctx2d.fillStyle = 'rgba(255,255,255,0.35)';
    ctx2d.font = '6px monospace';
    ctx2d.textAlign = 'left';
    ctx2d.fillText('LENT', 2, 16);
    ctx2d.fillText('RAPIDE', 2, h - 14);
}

export function dessinerRadar(ctx2d, w, h, profil) {
    if (!profil) {
        messageVide(ctx2d, w, h, 'JOUEZ UNE PREMIÈRE PARTIE !');
        return;
    }

    const cx = w / 2;
    const cy = h / 2;
    const rayon = Math.min(w, h) * 0.38;
    const axes = [
        { label: 'VITESSE', val: profil.vitesse },
        { label: 'PRÉCISION', val: profil.precision },
        { label: 'AGRESSIVITÉ', val: profil.agressivite },
        { label: 'ENDURANCE', val: profil.endurance },
        { label: 'CRÉATIVITÉ', val: profil.creativite },
        { label: 'ÉQUILIBRE', val: profil.equilibre },
    ];
    const nb = axes.length;
    const angle0 = -Math.PI / 2;

    ctx2d.fillStyle = 'rgba(0,0,0,0.4)';
    ctx2d.fillRect(0, 0, w, h);

    [0.25, 0.5, 0.75, 1].forEach((niveau, ni) => {
        ctx2d.beginPath();
        for (let i = 0; i < nb; i++) {
            const a = angle0 + (i / nb) * Math.PI * 2;
            const x = cx + Math.cos(a) * rayon * niveau;
            const y = cy + Math.sin(a) * rayon * niveau;
            if (i === 0) ctx2d.moveTo(x, y);
            else ctx2d.lineTo(x, y);
        }
        ctx2d.closePath();
        ctx2d.strokeStyle = ni === 3 ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.07)';
        ctx2d.lineWidth = ni === 3 ? 1 : 0.5;
        ctx2d.stroke();
    });

    ctx2d.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx2d.lineWidth = 0.5;
    for (let i = 0; i < nb; i++) {
        const a = angle0 + (i / nb) * Math.PI * 2;
        ctx2d.beginPath();
        ctx2d.moveTo(cx, cy);
        ctx2d.lineTo(cx + Math.cos(a) * rayon, cy + Math.sin(a) * rayon);
        ctx2d.stroke();
    }

    ctx2d.beginPath();
    axes.forEach((axe, i) => {
        const a = angle0 + (i / nb) * Math.PI * 2;
        const r = rayon * (axe.val / 100);
        const x = cx + Math.cos(a) * r;
        const y = cy + Math.sin(a) * r;
        if (i === 0) ctx2d.moveTo(x, y);
        else ctx2d.lineTo(x, y);
    });
    ctx2d.closePath();
    const radarGrad = ctx2d.createRadialGradient(cx, cy, 0, cx, cy, rayon);
    radarGrad.addColorStop(0, 'rgba(0,245,255,0.5)');
    radarGrad.addColorStop(1, 'rgba(0,245,255,0.1)');
    ctx2d.fillStyle = radarGrad;
    ctx2d.fill();
    ctx2d.strokeStyle = '#00f5ff';
    ctx2d.lineWidth = 1.5;
    ctx2d.shadowColor = '#00f5ff';
    ctx2d.shadowBlur = 8;
    ctx2d.stroke();

    axes.forEach((axe, i) => {
        const a = angle0 + (i / nb) * Math.PI * 2;
        const r = rayon * (axe.val / 100);
        const x = cx + Math.cos(a) * r;
        const y = cy + Math.sin(a) * r;
        ctx2d.beginPath();
        ctx2d.arc(x, y, 3, 0, Math.PI * 2);
        ctx2d.fillStyle = '#ffffff';
        ctx2d.shadowBlur = 6;
        ctx2d.fill();
    });

    ctx2d.shadowBlur = 0;
    ctx2d.fillStyle = 'rgba(255,255,255,0.65)';
    ctx2d.font = '6px monospace';
    ctx2d.textAlign = 'center';
    axes.forEach((axe, i) => {
        const a = angle0 + (i / nb) * Math.PI * 2;
        const marge = rayon + 16;
        const lx = cx + Math.cos(a) * marge;
        const ly = cy + Math.sin(a) * marge + 3;
        ctx2d.fillStyle = 'rgba(255,255,255,0.65)';
        ctx2d.fillText(axe.label, lx, ly);
        ctx2d.fillStyle = '#00f5ff';
        ctx2d.fillText(`${axe.val}%`, lx, ly + 8);
    });
}

export function sauvegarderSnapshotProfil(lignesPartie, biomeId) {
    donneesPartie.lignesPartie = lignesPartie;
    donneesPartie.biomeId = biomeId;
    const profil = calculerProfilStyle(donneesPartie, lignesPartie);
    const titreStyle = genererTitreStyle(profil);

    dernierProfil = {
        donnees: clonerDonnees(donneesPartie),
        titreStyle,
        profil,
    };

    try {
        ecrireStockageJson(CLE_PROFIL, {
            donnees: clonerDonnees(donneesPartie),
            titreStyle,
            profil,
        });
    } catch (err) {
        logger.warn('Erreur sauvegarde profil:', err);
    }
}

export function chargerProfilDernier() {
    try {
        /** @type {Record<string, any> | null} */
        const parsed = lireStockageJson(CLE_PROFIL, null);
        if (!parsed || typeof parsed !== 'object') return;
        dernierProfil = {
            donnees: {
                ...creerDonneesVides(),
                ...parsed.donnees,
                atterrissagesColonne: parsed.donnees?.atterrissagesColonne ?? new Array(10).fill(0),
                timestampsVerrou: parsed.donnees?.timestampsVerrou ?? [],
                tempsReactions: parsed.donnees?.tempsReactions ?? [],
                lignesParNiveau: parsed.donnees?.lignesParNiveau ?? {},
            },
            titreStyle: parsed.titreStyle ?? '',
            profil: parsed.profil ?? null,
        };
    } catch (err) {
        logger.warn('Erreur chargement profil:', err);
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

    const elTitre = document.getElementById('profil-titre-style');
    const elBiome = document.getElementById('profil-biome-badge');
    if (elTitre) elTitre.textContent = titre;

    const biomeId = donnees.biomeId || dernierProfil.donnees.biomeId;
    if (elBiome) {
        const b = BIOMES[biomeId];
        elBiome.textContent = b ? `${b.icone} ${b.nom}` : '';
    }

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

    requestAnimationFrame(() => {
        const cHeat = obtenirCanvas('canvas-heatmap');
        const cRythm = obtenirCanvas('canvas-rythme');
        const cRad = obtenirCanvas('canvas-radar');
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
