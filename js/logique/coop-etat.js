export const DEMI_LARGEUR = 5;
export const COLONNES_J1 = [0, 1, 2, 3, 4];
export const COLONNES_J2 = [5, 6, 7, 8, 9];

export const coop = {
    actif: false,
    j1: {
        pieceActuelle: null,
        prochainePiece: null,
        pieceEnReserve: null,
        reserveUtilisee: false,
        passerelleDisponible: true,
    },
    j2: {
        pieceActuelle: null,
        prochainePiece: null,
        pieceEnReserve: null,
        reserveUtilisee: false,
        passerelleDisponible: true,
    },
    score: 0,
    lignes: 0,
    niveau: 1,
    estEnCours: false,
    estEnPause: false,
    accJ1: 0,
    accJ2: 0,
    lignesEnAttenteJ1: -1,
    lignesEnAttenteJ2: -1,
    flashSynchro: 0,
    combo: 0,
    dernierEtaitTetris: false,
};

export function coop_rafraichirStats() {
    if (typeof document === 'undefined') return;
    const elScore = document.getElementById('coop-score');
    const elLignes = document.getElementById('coop-lignes');
    const elNiveau = document.getElementById('coop-niveau');
    const elAttenteJ1 = document.getElementById('coop-attente-j1');
    const elAttenteJ2 = document.getElementById('coop-attente-j2');
    const elSynchroHud = document.getElementById('coop-synchro-hud');
    if (elScore) elScore.textContent = coop.score.toLocaleString('fr-FR');
    if (elLignes) elLignes.textContent = String(coop.lignes);
    if (elNiveau) elNiveau.textContent = String(coop.niveau);
    const j1Attente = coop.lignesEnAttenteJ1 >= 0;
    const j2Attente = coop.lignesEnAttenteJ2 >= 0;
    if (elAttenteJ1) elAttenteJ1.textContent = j1Attente ? 'EN ATTENTE' : '—';
    if (elAttenteJ2) elAttenteJ2.textContent = j2Attente ? 'EN ATTENTE' : '—';
    if (elSynchroHud) elSynchroHud.classList.toggle('element-masque', !j1Attente && !j2Attente);
}
