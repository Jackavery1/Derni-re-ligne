import { CONFIG, TETROMINOS } from './config.js';
import { estPositionValidePlateau } from './logique-pure.js';
import { etat, obtenirCtx } from './contexte-jeu.js';
import { estPositionValide } from './piece-jeu.js';

export const oracle = {
    actif: false,
    suggestion: null,
    enCalcul: false,
    multiplicateur: 1.0,
    piecesSuivies: 0,
    piecesIgnorees: 0,
    dernierePlaceOk: false,
    scoreBonus: 0,
    placementPrecedent: null,
    suggestionPrecedente: null,
};

export function evaluerPlateau(plateau) {
    let score = 0;

    let lignesCompletes = 0;
    for (let l = 0; l < CONFIG.lignes; l++) {
        if (plateau[l].every((c) => c !== 0)) lignesCompletes++;
    }
    score += lignesCompletes * lignesCompletes * 800;

    let hauteurTotale = 0;
    for (let c = 0; c < CONFIG.colonnes; c++) {
        for (let l = 0; l < CONFIG.lignes; l++) {
            if (plateau[l][c] !== 0) {
                hauteurTotale += CONFIG.lignes - l;
                break;
            }
        }
    }
    score -= hauteurTotale * 5;

    let trous = 0;
    for (let c = 0; c < CONFIG.colonnes; c++) {
        let bloqueParDessus = false;
        for (let l = 0; l < CONFIG.lignes; l++) {
            if (plateau[l][c] !== 0) bloqueParDessus = true;
            else if (bloqueParDessus) trous++;
        }
    }
    score -= trous * 35;

    const hauteurs = new Array(CONFIG.colonnes).fill(0);
    for (let c = 0; c < CONFIG.colonnes; c++) {
        for (let l = 0; l < CONFIG.lignes; l++) {
            if (plateau[l][c] !== 0) {
                hauteurs[c] = CONFIG.lignes - l;
                break;
            }
        }
    }
    let relief = 0;
    for (let c = 0; c < CONFIG.colonnes - 1; c++) {
        relief += Math.abs(hauteurs[c] - hauteurs[c + 1]);
    }
    score -= relief * 4;

    for (let c = 0; c < CONFIG.colonnes; c++) {
        const gauche = c > 0 ? hauteurs[c - 1] : 99;
        const droite = c < CONFIG.colonnes - 1 ? hauteurs[c + 1] : 99;
        const profond = Math.min(gauche, droite) - hauteurs[c];
        if (profond > 2) score -= profond * profond * 2;
    }

    return score;
}

function obtenirRotationsPiece(piece) {
    if (piece.reliqueForme) return [piece.reliqueForme];
    return TETROMINOS[piece.type].rotations;
}

function simulerChute(plateau, piece, forme) {
    let y = piece.y;
    while (estPositionValidePlateau(plateau, { ...piece, y: y + 1 }, forme, 0, 0)) y++;
    return y;
}

export function calculerMeilleurPlacement(piece, plateau) {
    const rotations = obtenirRotationsPiece(piece);
    let meilleurScore = -Infinity;
    let meilleurX = piece.x;
    let meilleureRotation = piece.rotation;

    for (let rot = 0; rot < rotations.length; rot++) {
        const forme = rotations[rot];
        const pieceTmp = { ...piece, rotation: rot };

        for (let x = -2; x < CONFIG.colonnes + 2; x++) {
            pieceTmp.x = x;

            if (!estPositionValidePlateau(plateau, pieceTmp, forme, 0, 0)) continue;

            const yFinal = simulerChute(plateau, pieceTmp, forme);
            const pieceFinale = { ...pieceTmp, y: yFinal };

            const plateauTmp = plateau.map((l) => [...l]);
            let valide = true;

            for (let l = 0; l < forme.length; l++) {
                for (let c = 0; c < forme[l].length; c++) {
                    if (!forme[l][c]) continue;
                    const py = pieceFinale.y + l;
                    const px = pieceFinale.x + c;
                    if (py < 0 || py >= CONFIG.lignes || px < 0 || px >= CONFIG.colonnes) {
                        valide = false;
                        break;
                    }
                    plateauTmp[py][px] = '#ffffff';
                }
                if (!valide) break;
            }
            if (!valide) continue;

            const scorePos = evaluerPlateau(plateauTmp);
            if (scorePos > meilleurScore) {
                meilleurScore = scorePos;
                meilleurX = x;
                meilleureRotation = rot;
            }
        }
    }

    return { x: meilleurX, rotation: meilleureRotation, score: meilleurScore };
}

export function reinitialiserOraclePartie() {
    oracle.suggestion = null;
    oracle.enCalcul = false;
    oracle.multiplicateur = 1.0;
    oracle.piecesSuivies = 0;
    oracle.piecesIgnorees = 0;
    oracle.dernierePlaceOk = false;
    oracle.scoreBonus = 0;
    oracle.placementPrecedent = null;
    oracle.suggestionPrecedente = null;
}

export function declencherCalculOracle() {
    if (!oracle.actif || !etat.pieceActuelle || !etat.estEnCours || etat.estEnPause) return;
    if (oracle.enCalcul) return;

    oracle.enCalcul = true;
    oracle.suggestion = null;

    setTimeout(() => {
        if (!oracle.actif || !etat.pieceActuelle || !etat.estEnCours || etat.estEnPause) {
            oracle.enCalcul = false;
            return;
        }
        const piece = { ...etat.pieceActuelle };
        const plateau = etat.plateau.map((l) => [...l]);
        oracle.suggestion = calculerMeilleurPlacement(piece, plateau);
        oracle.enCalcul = false;
    }, 0);
}

export function sauvegarderPlacementOracle() {
    if (!oracle.actif || !etat.pieceActuelle) return;
    oracle.placementPrecedent = {
        x: etat.pieceActuelle.x,
        rotation: etat.pieceActuelle.rotation,
    };
    oracle.suggestionPrecedente = oracle.suggestion ? { ...oracle.suggestion } : null;
}

export function evaluerDecisionOracle(nbLignesEffacees) {
    if (!oracle.actif || !oracle.suggestionPrecedente) return;

    const suivi =
        oracle.placementPrecedent &&
        oracle.placementPrecedent.x === oracle.suggestionPrecedente.x &&
        oracle.placementPrecedent.rotation === oracle.suggestionPrecedente.rotation;

    if (suivi) {
        oracle.piecesSuivies++;
    } else if (nbLignesEffacees > 0) {
        oracle.piecesIgnorees++;
        oracle.dernierePlaceOk = true;
        oracle.multiplicateur = Math.min(5.0, oracle.multiplicateur + 0.2);
        oracle.scoreBonus += Math.floor(nbLignesEffacees * 100 * oracle.multiplicateur);
        afficherFeedbackOracle(true, oracle.multiplicateur);
    } else {
        oracle.dernierePlaceOk = false;
        oracle.multiplicateur = Math.max(1.0, oracle.multiplicateur - 0.3);
        afficherFeedbackOracle(false, oracle.multiplicateur);
    }

    oracle.placementPrecedent = null;
    oracle.suggestionPrecedente = null;
    mettreAJourStatsOracleUI();
}

export function mettreAJourStatsOracleUI() {
    if (typeof document === 'undefined') return;
    const elMult = document.getElementById('oracle-mult');
    const elDev = document.getElementById('oracle-dev');
    if (elMult) {
        elMult.textContent = `×${oracle.multiplicateur.toFixed(1)}`;
        elMult.classList.remove('oracle-mult-vert', 'oracle-mult-jaune', 'oracle-mult-rose');
        if (oracle.multiplicateur >= 3) elMult.classList.add('oracle-mult-rose');
        else if (oracle.multiplicateur >= 2) elMult.classList.add('oracle-mult-jaune');
        else elMult.classList.add('oracle-mult-vert');
    }
    if (elDev) elDev.textContent = String(oracle.piecesIgnorees);
}

export function obtenirScoreAffiche() {
    if (!oracle.actif) return etat.score;
    return etat.score + oracle.scoreBonus;
}

export function obtenirScoreFinalOracle() {
    if (!oracle.actif) return etat.score;
    return etat.score + oracle.scoreBonus;
}

export function afficherFeedbackOracle(succes, multiplicateur) {
    if (typeof document === 'undefined') return;
    const notif = document.getElementById('notif-oracle');
    if (!notif) return;

    notif.classList.remove('oracle-feedback-succes', 'oracle-feedback-reset');
    if (succes) {
        notif.textContent = `✦ DÉVIATION ×${multiplicateur.toFixed(1)}`;
        notif.classList.add('oracle-feedback-succes');
    } else {
        notif.textContent = `↺ RESET ×${multiplicateur.toFixed(1)}`;
        notif.classList.add('oracle-feedback-reset');
    }

    notif.classList.remove('visible');
    void notif.offsetWidth;
    notif.classList.add('visible');
}

export function basculerOracle() {
    oracle.actif = !oracle.actif;
    if (typeof document === 'undefined') return;
    const btn = document.getElementById('toggle-oracle');
    const label = document.getElementById('oracle-toggle-label');
    const desc = document.getElementById('oracle-toggle-desc');
    if (!btn || !label) return;

    if (oracle.actif) {
        btn.classList.add('actif');
        label.textContent = 'ORACLE : ON';
        if (desc) {
            desc.textContent =
                "Ignorez les suggestions avec succès pour multiplier votre score jusqu'à ×5.0";
        }
    } else {
        btn.classList.remove('actif');
        label.textContent = 'ORACLE : OFF';
        if (desc) {
            desc.textContent =
                "Activez l'Oracle pour obtenir des suggestions de placement. " +
                'Déviez avec succès pour multiplier votre score.';
        }
    }
}

export function dessinerSuggestionOracle() {
    if (!oracle.actif || !oracle.suggestion || !etat.pieceActuelle) return;

    const ctx = obtenirCtx();
    if (!ctx) return;

    const sug = oracle.suggestion;
    const rotations = obtenirRotationsPiece(etat.pieceActuelle);
    const forme = rotations[sug.rotation] ?? rotations[0];
    const pieceTmp = { ...etat.pieceActuelle, x: sug.x, rotation: sug.rotation };

    let yFinal = pieceTmp.y;
    while (estPositionValide({ ...pieceTmp, y: yFinal + 1 }, 0, 0)) yFinal++;

    const couleurOracle = '#ffffff';
    const t = performance.now() / 600;
    const opacitePulse = 0.3 + Math.sin(t) * 0.15;

    ctx.save();
    for (let l = 0; l < forme.length; l++) {
        for (let c = 0; c < forme[l].length; c++) {
            if (!forme[l][c]) continue;
            const px = (sug.x + c) * CONFIG.taille;
            const py = (yFinal + l) * CONFIG.taille;

            ctx.strokeStyle = couleurOracle;
            ctx.lineWidth = 1.5;
            ctx.globalAlpha = opacitePulse;
            ctx.shadowColor = couleurOracle;
            ctx.shadowBlur = 8;
            ctx.strokeRect(px + 2, py + 2, CONFIG.taille - 4, CONFIG.taille - 4);

            ctx.fillStyle = 'rgba(255,255,255,0.06)';
            ctx.globalAlpha = opacitePulse * 0.5;
            ctx.fillRect(px + 2, py + 2, CONFIG.taille - 4, CONFIG.taille - 4);
        }
    }

    let largeurForme = 0;
    for (const ligne of forme) largeurForme = Math.max(largeurForme, ligne.length);
    const centreX = (sug.x + largeurForme / 2) * CONFIG.taille;
    ctx.globalAlpha = 0.6 + Math.sin(t * 1.5) * 0.2;
    ctx.fillStyle = couleurOracle;
    ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.moveTo(centreX, 6);
    ctx.lineTo(centreX - 8, 18);
    ctx.lineTo(centreX + 8, 18);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    const suggX = (oracle.suggestion.x + largeurForme / 2) * CONFIG.taille;
    const pieceY = etat.pieceActuelle.y * CONFIG.taille;

    ctx.save();
    ctx.setLineDash([4, 6]);
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(suggX, 0);
    ctx.lineTo(suggX, pieceY);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
}

export function afficherSectionOracle(actif) {
    if (typeof document === 'undefined') return;
    const section = document.getElementById('section-oracle-stats');
    if (!section) return;
    if (actif) section.classList.remove('element-masque');
    else section.classList.add('element-masque');
}
