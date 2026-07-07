import {
    archi,
    archi_estPositionValide,
    archi_verrouillerPiece,
    archi_tourner,
    archi_descendreEnBas,
    archi_changerPiece,
    archi_annuler,
} from './logique/archi-logique.js';
import { emettre } from './etat/bus-jeu.js';
import {
    archi_basculerPause,
    archi_terminerNiveau,
    archi_mettreAJourInventaireUI,
    archi_mettreAJourScore,
} from './archi-jeu.js';
import { attacherRepetitionBouton } from './input-repetition.js';

function archiPeutRecevoirInput() {
    return archi.actif && archi.estEnCours && !archi.estEnPause;
}

function archiDeplacerGauche() {
    if (!archiPeutRecevoirInput()) return;
    if (archi_estPositionValide(archi.pieceActuelle, -1, 0)) {
        archi.pieceActuelle.x--;
        emettre('piece:son', { type: 'deplacement' });
    }
}

function archiDeplacerDroite() {
    if (!archiPeutRecevoirInput()) return;
    if (archi_estPositionValide(archi.pieceActuelle, 1, 0)) {
        archi.pieceActuelle.x++;
        emettre('piece:son', { type: 'deplacement' });
    }
}

function archiDeplacerBas() {
    if (!archiPeutRecevoirInput()) return;
    if (archi_estPositionValide(archi.pieceActuelle, 0, 1)) {
        archi.pieceActuelle.y++;
        emettre('piece:son', { type: 'deplacement' });
    }
}

function archiTourner() {
    if (!archiPeutRecevoirInput()) return;
    archi_tourner(1);
}

function archiChute() {
    if (!archiPeutRecevoirInput()) return;
    archi_descendreEnBas();
}

function archiValider() {
    if (!archiPeutRecevoirInput()) return;
    if (archi_verrouillerPiece() === 'termine') {
        setTimeout(archi_terminerNiveau, 300);
    } else {
        archi_mettreAJourInventaireUI();
        archi_mettreAJourScore();
    }
}

function archiChanger() {
    if (!archiPeutRecevoirInput()) return;
    archi_changerPiece();
    archi_mettreAJourInventaireUI();
}

function archiAnnuler() {
    if (!archiPeutRecevoirInput()) return;
    archi_annuler();
    archi_mettreAJourInventaireUI();
    archi_mettreAJourScore();
}

function attacherArchi(idBouton, action, avecRepetition = false) {
    attacherRepetitionBouton(document.getElementById(idBouton), action, avecRepetition);
}

export function initialiserInputArchi() {
    document.addEventListener('keydown', (e) => {
        if (!archiPeutRecevoirInput()) return;

        switch (e.code) {
            case 'ArrowLeft':
                archiDeplacerGauche();
                break;
            case 'ArrowRight':
                archiDeplacerDroite();
                break;
            case 'ArrowDown':
                archiDeplacerBas();
                break;
            case 'ArrowUp':
            case 'KeyZ':
                archiTourner();
                break;
            case 'KeyX':
                if (archiPeutRecevoirInput()) archi_tourner(-1);
                break;
            case 'Space':
                archiChute();
                e.preventDefault();
                break;
            case 'Enter':
                archiValider();
                break;
            case 'KeyP':
            case 'Escape':
                archi_basculerPause();
                break;
            case 'KeyC':
                archiChanger();
                break;
            case 'Backspace':
                archiAnnuler();
                break;
            default:
                return;
        }
        e.preventDefault();
    });

    attacherArchi('btn-archi-gauche', archiDeplacerGauche, true);
    attacherArchi('btn-archi-droite', archiDeplacerDroite, true);
    attacherArchi('btn-archi-bas', archiDeplacerBas, true);
    attacherArchi('btn-archi-tourner', archiTourner);
    attacherArchi('btn-archi-chute', archiChute);
    attacherArchi('btn-archi-changer', archiChanger);
    attacherArchi('btn-archi-valider', archiValider);
    attacherArchi('btn-archi-annuler', archiAnnuler);

    attacherArchi('btn-archi-gauche-p', archiDeplacerGauche, true);
    attacherArchi('btn-archi-droite-p', archiDeplacerDroite, true);
    attacherArchi('btn-archi-bas-p', archiDeplacerBas, true);
    attacherArchi('btn-archi-tourner-p', archiTourner);
    attacherArchi('btn-archi-chute-p', archiChute);
    attacherArchi('btn-archi-changer-p', archiChanger);
    attacherArchi('btn-archi-valider-p', archiValider);
}
