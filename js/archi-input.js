import {
    archi,
    archi_estPositionValide,
    archi_verrouillerPiece,
    archi_tourner,
    archi_descendreEnBas,
    archi_changerPiece,
    archi_annuler,
} from './archi-logique.js';
import {
    archi_basculerPause,
    archi_terminerNiveau,
    archi_mettreAJourInventaireUI,
    archi_mettreAJourScore,
} from './archi-jeu.js';

export function initialiserInputArchi() {
    document.addEventListener('keydown', (e) => {
        if (!archi.actif || !archi.estEnCours || archi.estEnPause) return;

        switch (e.code) {
            case 'ArrowLeft':
                if (archi_estPositionValide(archi.pieceActuelle, -1, 0)) archi.pieceActuelle.x--;
                break;
            case 'ArrowRight':
                if (archi_estPositionValide(archi.pieceActuelle, 1, 0)) archi.pieceActuelle.x++;
                break;
            case 'ArrowDown':
                if (archi_estPositionValide(archi.pieceActuelle, 0, 1)) archi.pieceActuelle.y++;
                break;
            case 'ArrowUp':
            case 'KeyZ':
                archi_tourner(1);
                break;
            case 'KeyX':
                archi_tourner(-1);
                break;
            case 'Space':
                archi_descendreEnBas();
                e.preventDefault();
                break;
            case 'Enter':
                if (archi_verrouillerPiece() === 'termine') {
                    setTimeout(archi_terminerNiveau, 300);
                } else {
                    archi_mettreAJourInventaireUI();
                    archi_mettreAJourScore();
                }
                break;
            case 'KeyP':
            case 'Escape':
                archi_basculerPause();
                break;
            case 'KeyC':
                archi_changerPiece();
                archi_mettreAJourInventaireUI();
                break;
            case 'Backspace':
                archi_annuler();
                archi_mettreAJourInventaireUI();
                archi_mettreAJourScore();
                break;
            default:
                return;
        }
        e.preventDefault();
    });
}
