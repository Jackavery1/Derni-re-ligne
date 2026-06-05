import { CONFIG, RELIQUES } from './config.js';
import { majStatsRelique } from './achievements.js';
import { AudioMoteur } from './audio.js';

let deps = {};

export function configurerReliques(dependances) {
    deps = dependances;
}

function afficherAnnonceRelique(relique) {
    const notif = document.getElementById('notif-niveau');
    if (!notif) return;
    notif.textContent = `${relique.icone} ${relique.nom} !`;
    notif.style.color = relique.couleur;
    notif.style.borderColor = relique.couleur;
    notif.style.boxShadow = `0 0 30px ${relique.couleur}`;
    notif.classList.remove('visible');
    void notif.offsetWidth;
    notif.classList.add('visible');
}

function appliquerDoublon(piece, relique, forme, plateau) {
    for (let l = forme.length - 1; l >= 0; l--) {
        for (let c = 0; c < forme[l].length; c++) {
            if (!forme[l][c]) continue;
            const x = piece.x + c;
            const y = piece.y + l + 1;
            if (y < CONFIG.lignes && plateau[y][x] === 0) {
                plateau[y][x] = relique.couleur;
            }
        }
    }
}

function appliquerExplosion(piece, forme, plateau) {
    const cx = piece.x + Math.floor(forme[0].length / 2);
    const cy = piece.y + Math.floor(forme.length / 2);
    for (let dy = -2; dy <= 2; dy++) {
        for (let dx = -2; dx <= 2; dx++) {
            const nx = cx + dx;
            const ny = cy + dy;
            if (nx >= 0 && nx < CONFIG.colonnes && ny >= 0 && ny < CONFIG.lignes) {
                if (plateau[ny][nx] !== 0) {
                    deps.creerParticulesExplosion(nx, ny, plateau[ny][nx]);
                    plateau[ny][nx] = 0;
                }
            }
        }
    }
}

function appliquerFlottaison(piece, forme, plateau) {
    const cellules = [];
    for (let l = 0; l < forme.length; l++) {
        for (let c = 0; c < forme[l].length; c++) {
            if (!forme[l][c]) continue;
            const x = piece.x + c;
            const y = piece.y + l;
            if (y >= 0 && y < CONFIG.lignes) {
                cellules.push({ x, y, couleur: plateau[y][x] });
            }
        }
    }
    cellules.forEach(({ x, y }) => {
        plateau[y][x] = 0;
    });
    cellules.forEach(({ x, y, couleur }) => {
        const ny = Math.max(0, y - 2);
        const dest = plateau[ny][x] === 0 ? ny : y - 1 >= 0 && plateau[y - 1][x] === 0 ? y - 1 : y;
        plateau[dest][x] = couleur;
    });
}

function appliquerCroissance(piece, forme, plateau, relique) {
    const voisins = [];
    const dirs = [
        [-1, 0],
        [1, 0],
        [0, -1],
        [0, 1],
    ];
    for (let l = 0; l < forme.length; l++) {
        for (let c = 0; c < forme[l].length; c++) {
            if (!forme[l][c]) continue;
            dirs.forEach(([dy, dx]) => {
                const nx = piece.x + c + dx;
                const ny = piece.y + l + dy;
                if (
                    nx >= 0 &&
                    nx < CONFIG.colonnes &&
                    ny >= 0 &&
                    ny < CONFIG.lignes &&
                    plateau[ny][nx] === 0
                ) {
                    if (!voisins.find((v) => v.x === nx && v.y === ny)) {
                        voisins.push({ x: nx, y: ny });
                    }
                }
            });
        }
    }
    voisins
        .sort(() => Math.random() - 0.5)
        .slice(0, 4)
        .forEach(({ x, y }) => {
            plateau[y][x] = relique.couleur;
        });
}

function appliquerBlizzard(plateau) {
    let ligneHaute = CONFIG.lignes;
    for (let l = 0; l < CONFIG.lignes; l++) {
        if (plateau[l].some((c) => c !== 0)) {
            ligneHaute = l;
            break;
        }
    }
    if (ligneHaute <= 2) return;
    plateau.splice(ligneHaute, 0, Array(CONFIG.colonnes).fill(0));
    plateau.splice(0, 1);
}

function appliquerRemplissage(plateau, relique) {
    const trous = [];
    for (let c = 0; c < CONFIG.colonnes; c++) {
        let occupe = false;
        for (let l = 0; l < CONFIG.lignes; l++) {
            if (plateau[l][c] !== 0) occupe = true;
            else if (occupe) trous.push({ x: c, y: l });
        }
    }
    trous
        .sort((a, b) => b.y - a.y)
        .slice(0, 3)
        .forEach(({ x, y }) => {
            plateau[y][x] = relique.couleur;
        });
}

function appliquerHack(plateau) {
    const lignesOccupees = [];
    for (let l = CONFIG.lignes - 1; l >= 0; l--) {
        const nbOccupees = plateau[l].filter((c) => c !== 0).length;
        if (nbOccupees >= 5) lignesOccupees.push(l);
    }
    if (lignesOccupees.length === 0) return;
    const ligneCible =
        lignesOccupees[Math.floor(Math.random() * Math.min(3, lignesOccupees.length))];
    const nbAEffacer = Math.floor(Math.random() * 3) + 4;
    const colonnesOccupees = [];
    for (let c = 0; c < CONFIG.colonnes; c++) {
        if (plateau[ligneCible][c] !== 0) colonnesOccupees.push(c);
    }
    colonnesOccupees
        .sort(() => Math.random() - 0.5)
        .slice(0, nbAEffacer)
        .forEach((c) => {
            deps.creerParticulesExplosion(c, ligneCible, plateau[ligneCible][c]);
            plateau[ligneCible][c] = 0;
        });
}

function appliquerColonne(piece, forme, plateau) {
    const cx = piece.x + Math.floor(forme[0].length / 2);
    for (let l = 0; l < CONFIG.lignes; l++) {
        if (plateau[l][cx] !== 0) {
            deps.creerParticulesExplosion(cx, l, plateau[l][cx]);
            plateau[l][cx] = 0;
        }
    }
}

function appliquerGravite(plateau) {
    for (let l = CONFIG.lignes - 2; l >= 0; l--) {
        for (let c = 0; c < CONFIG.colonnes; c++) {
            if (plateau[l][c] !== 0 && plateau[l + 1][c] === 0) {
                plateau[l + 1][c] = plateau[l][c];
                plateau[l][c] = 0;
            }
        }
    }
}

export function appliquerEffetRelique(relique, piece) {
    const etat = deps.obtenirEtat();
    const biomeActif = deps.obtenirBiomeActif();
    const forme = deps.obtenirForme(piece);
    const plateau = etat.plateau;
    const reliqueBiome = RELIQUES[biomeActif] ?? RELIQUES.classique;

    const effets = {
        doublon: () => appliquerDoublon(piece, relique, forme, plateau),
        explosion: () => appliquerExplosion(piece, forme, plateau),
        flottaison: () => appliquerFlottaison(piece, forme, plateau),
        croissance: () =>
            appliquerCroissance(piece, forme, plateau, RELIQUES.foret ?? reliqueBiome),
        blizzard: () => appliquerBlizzard(plateau),
        remplissage: () => appliquerRemplissage(plateau, RELIQUES.desert ?? reliqueBiome),
        hack: () => appliquerHack(plateau),
        colonne: () => appliquerColonne(piece, forme, plateau),
        gravite: () => appliquerGravite(plateau),
    };
    effets[relique.effet]?.();
    majStatsRelique(relique.effet);
    afficherAnnonceRelique(relique);
    AudioMoteur.son('relique');
}
