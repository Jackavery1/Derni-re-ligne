import { CONFIG, RELIQUES } from './config.js';
import { emettre } from './bus-jeu.js';
import {
    etat,
    obtenirBiomeActif,
    obtenirReliqueEnAttente,
    definirReliqueActive,
    definirReliqueEnAttente,
} from './store-jeu.js';
import {
    obtenirForme,
    genererProchainePiece,
    activerReliqueSurPiece,
    creerPieceRelique,
} from './piece-jeu.js';

function copierReliqueForme(forme) {
    return Array.isArray(forme) ? forme.map((ligne) => [...ligne]) : forme;
}

export function produireProchainePieceApresShift() {
    if (obtenirReliqueEnAttente()) {
        definirReliqueEnAttente(false);
        const relique = RELIQUES[obtenirBiomeActif()] ?? RELIQUES.classique;
        etat.filePieces.unshift(creerPieceRelique(relique));
    } else {
        etat.filePieces.push(genererProchainePiece());
    }
}

export function produireProchainePieceApresHold() {
    const typeActuel = etat.pieceActuelle.type;

    if (!etat.pieceEnReserve) {
        etat.pieceEnReserve = {
            type: typeActuel,
            rotation: 0,
            reliqueForme: copierReliqueForme(etat.pieceActuelle.reliqueForme),
            reliqueData: etat.pieceActuelle.reliqueData,
        };
        etat.pieceActuelle = etat.filePieces.shift();
        activerReliqueSurPiece(etat.pieceActuelle);
        produireProchainePieceApresShift();
        definirReliqueActive(null);
        emettre('partie:nouvelle-piece');
    } else {
        const reserve = etat.pieceEnReserve;
        etat.pieceEnReserve = {
            type: typeActuel,
            rotation: 0,
            reliqueForme: copierReliqueForme(etat.pieceActuelle.reliqueForme),
            reliqueData: etat.pieceActuelle.reliqueData,
        };
        etat.pieceActuelle = {
            type: reserve.type,
            rotation: 0,
            reliqueForme: reserve.reliqueForme,
            reliqueData: reserve.reliqueData,
            x: 0,
            y: 0,
        };
        activerReliqueSurPiece(etat.pieceActuelle);
    }

    const forme = obtenirForme(etat.pieceActuelle);
    etat.pieceActuelle.x = Math.floor(CONFIG.colonnes / 2) - Math.floor(forme[0].length / 2);
    etat.pieceActuelle.y = 0;
}
