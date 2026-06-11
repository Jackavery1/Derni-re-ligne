import { BIOMES } from './config.js';
import { AudioMoteur } from './audio.js';
import { creerPlateau, lierCouleursTetrominos } from './piece-jeu.js';
import { particules, definirBiomeActif, ECRANS } from './store-jeu.js';
import { lireStockage, ecrireStockage } from './progression.js';
import { planifierBoucle, suspendreBoucleSolo } from './boucle-jeu.js';
import { mettreAJourParticules } from './particules-jeu.js';
import { dessinerPreview } from './rendu-jeu.js';
import { obtenirCanvas } from './dom-utils.js';
import {
    cacherEcrans,
    afficherEcran,
    retournerAuMenuTitre,
    appliquerThemeBiome,
} from './ecrans-ui.js';
import { arreterConstellation } from './constellation.js';
import { arreterAnimationMenu } from './menu-fond.js';
import { basculerOracle, oracle } from './oracle-jeu.js';
import { statsGlobales, sauvegarderStats, verifierAchievements } from './achievements.js';
import { obtenirTousNiveauxArchi } from './archi-generateur.js';
import {
    archi,
    historiqueArchi,
    archi_parserSilhouette,
    archi_prochainePiece,
    archi_calculerScoreTempsReel,
    archi_calculerEtoiles,
    archi_reinitialiserEtatNiveau,
} from './archi-logique.js';
import { archi_rendreFrame } from './archi-rendu.js';
import { modeDevActif } from './mode-dev-etat.js';
import { adapterInterfaceArchi } from './layout-jeu.js';

export { archi, modeArchiActif } from './archi-logique.js';

let idFrameArchi = null;

function arreterBoucleArchi() {
    if (idFrameArchi) {
        cancelAnimationFrame(idFrameArchi);
        idFrameArchi = null;
    }
}

function deplacerZoneJeuVersArchi() {
    const zone = document.getElementById('zone-jeu');
    const zoneArchi = document.getElementById('zone-jeu-archi');
    if (!zone || !zoneArchi) return;
    zoneArchi.appendChild(zone);
}

function restaurerZoneJeu() {
    const zone = document.getElementById('zone-jeu');
    const iface = document.getElementById('interface-jeu');
    if (!zone || !iface) return;
    if (zone.parentElement?.id === 'zone-jeu-archi') {
        const panneaux = iface.querySelectorAll('aside');
        if (panneaux.length >= 2) iface.insertBefore(zone, panneaux[1]);
        else iface.appendChild(zone);
    }
}

function afficherInterfaceArchi(visible) {
    const solo = document.getElementById('conteneur-principal');
    const archiCont = document.getElementById('conteneur-principal-archi');
    if (visible) {
        solo?.classList.add('element-masque');
        archiCont?.classList.remove('element-masque');
        document.body.classList.add('partie-active');
        document.body.classList.add('archi-active');
    } else {
        solo?.classList.remove('element-masque');
        archiCont?.classList.add('element-masque');
        document.body.classList.remove('archi-active');
    }
}

export function demarrerArchi(niveauId) {
    const niveau = obtenirTousNiveauxArchi().find((n) => n.id === niveauId);
    if (!niveau) return;

    if (oracle.actif) basculerOracle();

    archi.actif = true;
    archi.niveauActuel = niveau;
    archi.plateau = creerPlateau();
    archi.piecesUtilisees = 0;
    archi.estEnCours = true;
    archi.estEnPause = false;
    archi.scorePartie = 0;
    archi.precisionActuelle = 0;
    archi.efficaciteActuelle = 0;
    historiqueArchi.length = 0;

    archi_parserSilhouette(niveau);
    archi.inventaire = niveau.pieces.map((p) => ({
        type: p.type,
        qte: p.qte,
        qteDispo: p.qte,
    }));
    archi.pieceActuelle = archi_prochainePiece();

    particules.length = 0;
    suspendreBoucleSolo();
    arreterConstellation();
    arreterAnimationMenu();

    definirBiomeActif(niveau.biome);
    lierCouleursTetrominos();
    appliquerThemeBiome(niveau.biome);
    AudioMoteur.init();

    cacherEcrans();
    deplacerZoneJeuVersArchi();
    afficherInterfaceArchi(true);
    adapterInterfaceArchi();

    archi_mettreAJourInventaireUI();
    archi_mettreAJourScore();
    archi_mettreAJourInfosNiveau();

    arreterBoucleArchi();
    idFrameArchi = requestAnimationFrame(boucleArchi);
}

function boucleArchi() {
    if (!archi.actif) return;

    if (!archi.estEnPause) {
        mettreAJourParticules(16);
    }
    archi_rendreFrame();
    idFrameArchi = requestAnimationFrame(boucleArchi);
}

export function archi_mettreAJourInventaireUI() {
    const el = document.getElementById('archi-inventaire');
    if (!el) return;
    el.textContent = '';

    archi.inventaire.forEach((item) => {
        const div = document.createElement('div');
        div.className = `archi-inv-item${
            item.type === archi.pieceActuelle?.type ? ' selectionne' : ''
        }${item.qteDispo === 0 ? ' epuise' : ''}`;

        const label = document.createElement('span');
        label.textContent = `${item.type}-piece`;
        const qte = document.createElement('span');
        qte.className = 'archi-inv-qte';
        qte.textContent = String(item.qteDispo);
        div.append(label, qte);
        el.appendChild(div);
    });

    if (archi.pieceActuelle) {
        const cvs = obtenirCanvas('canvas-archi-preview');
        if (cvs) dessinerPreview(cvs.getContext('2d'), cvs, archi.pieceActuelle);
    }
}

export function archi_mettreAJourScore() {
    const elPrc = document.getElementById('archi-precision');
    const elUsd = document.getElementById('archi-pieces-used');
    const elScr = document.getElementById('archi-score');
    const pct = Math.round(archi.precisionActuelle * 100);

    if (elPrc) {
        elPrc.textContent = `${pct}%`;
        elPrc.style.color = pct >= 80 ? 'var(--vert)' : pct >= 50 ? 'var(--jaune)' : 'var(--rose)';
    }
    if (elUsd) elUsd.textContent = String(archi.piecesUtilisees);
    if (elScr) elScr.textContent = String(archi.scorePartie);
}

function archi_mettreAJourInfosNiveau() {
    const niv = archi.niveauActuel;
    if (!niv) return;

    const elNom = document.getElementById('archi-niveau-nom');
    const elDiff = document.getElementById('archi-difficulte-etoiles');
    const elPar = document.getElementById('archi-par');

    if (elNom) elNom.textContent = niv.nom;
    if (elDiff) {
        elDiff.textContent = '●'.repeat(niv.difficulte) + '○'.repeat(3 - niv.difficulte);
        elDiff.style.color =
            niv.difficulte === 3
                ? 'var(--rose)'
                : niv.difficulte === 2
                  ? 'var(--jaune)'
                  : 'var(--vert)';
    }
    if (elPar) elPar.textContent = `${niv.parPieces} pieces min`;
}

export function archi_terminerNiveau() {
    archi.estEnCours = false;
    archi_calculerScoreTempsReel();

    const score = archi.scorePartie;
    const etoiles = archi_calculerEtoiles(score);

    const cle = `derniereLigne_archi_${archi.niveauActuel.id}`;
    const ancien = parseInt(lireStockage(cle, '0'), 10);
    if (score > ancien) ecrireStockage(cle, score.toString());

    statsGlobales.archiScoreTotal = (statsGlobales.archiScoreTotal || 0) + score;
    if (!statsGlobales.archiNiveauxCompletes) {
        statsGlobales.archiNiveauxCompletes = new Set();
    }
    statsGlobales.archiNiveauxCompletes.add(archi.niveauActuel.id);
    // Meilleures etoiles PAR niveau (rejouer un même niveau ne cumule plus) :
    // archiEtoilesMax = somme des meilleurs resultats, conforme à « ★★★ sur 5 niveaux ».
    if (!statsGlobales.archiEtoilesParNiveau) statsGlobales.archiEtoilesParNiveau = {};
    statsGlobales.archiEtoilesParNiveau[archi.niveauActuel.id] = Math.max(
        statsGlobales.archiEtoilesParNiveau[archi.niveauActuel.id] || 0,
        etoiles
    );
    statsGlobales.archiEtoilesMax = Object.values(statsGlobales.archiEtoilesParNiveau).reduce(
        (somme, n) => somme + n,
        0
    );

    const precisionPct = Math.round(archi.precisionActuelle * 100);
    if (precisionPct > (statsGlobales.archiPrecisionMax || 0)) {
        statsGlobales.archiPrecisionMax = precisionPct;
    }
    if (archi.piecesUtilisees <= archi.niveauActuel.parPieces) {
        statsGlobales.archiParAtteint = (statsGlobales.archiParAtteint || 0) + 1;
    }

    verifierAchievements();
    sauvegarderStats();
    archi_afficherResultat(score, etoiles);
}

export function archi_afficherResultat(score, etoiles) {
    const elNom = document.getElementById('archi-res-nom');
    const elScore = document.getElementById('archi-res-score');
    const elEtoiles = document.getElementById('archi-res-etoiles');
    const elPrecision = document.getElementById('archi-res-precision');
    const elPieces = document.getElementById('archi-res-pieces');

    if (elNom) elNom.textContent = archi.niveauActuel.nom;
    if (elScore) elScore.textContent = String(score);
    if (elEtoiles) {
        elEtoiles.textContent = '★'.repeat(etoiles) + '☆'.repeat(3 - etoiles);
        elEtoiles.style.color = etoiles === 3 ? '#ffe600' : etoiles === 2 ? '#aaeeff' : '#888';
    }
    if (elPrecision) elPrecision.textContent = `${Math.round(archi.precisionActuelle * 100)}%`;
    if (elPieces) {
        elPieces.textContent = `${archi.piecesUtilisees} / ${archi.niveauActuel.parPieces} min`;
    }

    const idxActuel = obtenirTousNiveauxArchi().findIndex((n) => n.id === archi.niveauActuel.id);
    const suivant = obtenirTousNiveauxArchi()[idxActuel + 1];
    const btnSuivant = document.getElementById('archi-res-btn-suivant');
    if (btnSuivant) {
        if (suivant) {
            btnSuivant.textContent = `▶ ${suivant.nom}`;
            btnSuivant.onclick = () => demarrerArchi(suivant.id);
            btnSuivant.style.display = 'block';
        } else {
            btnSuivant.style.display = 'none';
        }
    }

    afficherEcran(ECRANS.ARCHI_RESULTAT);
}

export function archi_afficherSelection() {
    const grille = document.getElementById('archi-sel-grille');
    if (!grille) return;
    grille.textContent = '';

    const niveaux = obtenirTousNiveauxArchi();
    const total = niveaux.length;
    const completes = statsGlobales.archiNiveauxCompletes?.size ?? 0;
    const elProg = document.getElementById('archi-sel-progression');
    if (elProg) elProg.textContent = `${completes} / ${total} NIVEAUX`;

    niveaux.forEach((niv) => {
        const cle = `derniereLigne_archi_${niv.id}`;
        const meilleur = parseInt(lireStockage(cle, '0'), 10);
        const etoiles = archi_calculerEtoiles(meilleur);
        const debloque = modeDevActif() || (statsGlobales.archiScoreTotal || 0) >= niv.deblocage;
        const biome = BIOMES[niv.biome];
        const diffStr = '●'.repeat(niv.difficulte) + '○'.repeat(3 - niv.difficulte);
        const couleurDiff =
            niv.difficulte === 3
                ? 'var(--rose)'
                : niv.difficulte === 2
                  ? 'var(--jaune)'
                  : 'var(--vert)';

        const carte = document.createElement('div');
        carte.className = `carte-niveau-archi${debloque ? '' : ' verrouillee'}`;

        const biomeEl = document.createElement('div');
        biomeEl.className = 'cna-biome';
        biomeEl.textContent = `${biome?.icone ?? ''} ${biome?.nom ?? ''}`.trim();

        const nomEl = document.createElement('div');
        nomEl.className = 'cna-nom';
        nomEl.textContent = niv.nom;

        const diffEl = document.createElement('div');
        diffEl.className = 'cna-difficulte';
        diffEl.style.color = couleurDiff;
        diffEl.textContent = diffStr;

        carte.append(biomeEl, nomEl, diffEl);

        if (meilleur > 0) {
            const etoilesEl = document.createElement('div');
            etoilesEl.className = 'cna-etoiles';
            etoilesEl.textContent = '★'.repeat(etoiles) + '☆'.repeat(3 - etoiles);
            const scoreEl = document.createElement('div');
            scoreEl.className = 'cna-score';
            scoreEl.textContent = `${meilleur} pts`;
            carte.append(etoilesEl, scoreEl);
        } else {
            const scoreEl = document.createElement('div');
            scoreEl.className = 'cna-score';
            scoreEl.style.color = 'var(--texte-dim)';
            scoreEl.textContent = debloque ? 'À FAIRE' : `🔒 ${niv.deblocage} pts`;
            carte.appendChild(scoreEl);
        }

        if (debloque) {
            carte.onclick = () => demarrerArchi(niv.id);
        }
        grille.appendChild(carte);
    });

    afficherEcran(ECRANS.ARCHI_SELECTION);
}

export function archi_basculerPause() {
    if (!archi.estEnCours) return;
    archi.estEnPause = !archi.estEnPause;

    if (archi.estEnPause) {
        // afficherEcran() remplit l'ecran pause avec les stats solo :
        // on ecrit les valeurs et libelles archi APRES son appel.
        afficherEcran(ECRANS.PAUSE);
        const elS = document.getElementById('pause-score');
        if (elS) elS.textContent = String(archi.scorePartie);
        const elL = document.getElementById('pause-lignes');
        if (elL) elL.textContent = `${Math.round(archi.precisionActuelle * 100)}%`;
        const elN = document.getElementById('pause-niveau');
        if (elN) elN.textContent = archi.niveauActuel?.nom ?? '';
        const labelLignes = document.querySelector('#ecran-pause [data-label="lignes"]');
        if (labelLignes) labelLignes.textContent = 'PRÉCISION';
        const labelNiveau = document.querySelector('#ecran-pause [data-label="niveau"]');
        if (labelNiveau) labelNiveau.textContent = 'PUZZLE';
    } else {
        cacherEcrans();
    }
}

export function archi_reinitialiserNiveau() {
    if (!archi.niveauActuel) return;
    archi_reinitialiserEtatNiveau();
    archi_mettreAJourInventaireUI();
    archi_mettreAJourScore();
}

export function quitterModeArchi() {
    archi.actif = false;
    archi.estEnCours = false;
    arreterBoucleArchi();
    restaurerZoneJeu();
    afficherInterfaceArchi(false);
    document.body.classList.remove('partie-active');
    retournerAuMenuTitre(() => planifierBoucle());
}
