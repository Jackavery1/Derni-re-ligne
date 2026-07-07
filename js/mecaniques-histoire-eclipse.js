import { CONFIG, BIOMES } from './config/config.js';
import { store } from './etat/store-jeu.js';
import { etat } from './etat/store-jeu.js';
import { modeHistoireEnCours } from './etat/mode-histoire.js';
import { biomeActuelMecanique } from './mecaniques-histoire-queries.js';

const ECLIPSE_VITESSE_HAUT_FACTEUR = 1.5;
const ECLIPSE_VITESSE_BAS_FACTEUR = 0.65;
const ECLIPSE_MONTEE_INTERVALLE_MS = () => BIOMES.eclipse?.monteeIntervalleMs ?? 30000;
const ECLIPSE_LIGNE_MIN = () => BIOMES.eclipse?.ligneEclipseMin ?? 6;

export function initialiserEclipse() {
    store.histoire.mecaniques.eclipseLigne = BIOMES.eclipse?.ligneEclipseBase ?? 10;
    store.histoire.mecaniques.eclipseDerniereMaj = performance.now();
}

export function tickEclipse(timestamp) {
    if (
        timestamp - store.histoire.mecaniques.eclipseDerniereMaj >=
        ECLIPSE_MONTEE_INTERVALLE_MS()
    ) {
        store.histoire.mecaniques.eclipseLigne = Math.max(
            ECLIPSE_LIGNE_MIN(),
            store.histoire.mecaniques.eclipseLigne - 1
        );
        store.histoire.mecaniques.eclipseDerniereMaj = timestamp;
    }
}

export function obtenirVitesseChuteModifiee(vitesseBase) {
    if (!modeHistoireEnCours()) return vitesseBase;
    if (biomeActuelMecanique() !== 'eclipse') return vitesseBase;
    if (!etat.pieceActuelle) return vitesseBase;

    const pieceY = etat.pieceActuelle.y;
    if (pieceY < store.histoire.mecaniques.eclipseLigne) {
        return Math.min(vitesseBase * ECLIPSE_VITESSE_HAUT_FACTEUR, CONFIG.vitesseBase * 2);
    }
    return Math.max(vitesseBase * ECLIPSE_VITESSE_BAS_FACTEUR, CONFIG.vitesseMin);
}

export function obtenirLigneEclipse() {
    return store.histoire.mecaniques.eclipseLigne;
}

export function obtenirLibelleModificateurBiomeHud() {
    if (!modeHistoireEnCours()) return '';
    const parties = [];
    if (store.surtensionActive) parties.push('SURTENSION');
    if (biomeActuelMecanique() === 'eclipse') {
        parties.push(`ÉCLIPSE L${obtenirLigneEclipse()}`);
    }
    if (store.histoire.mondeActuel === 'monde_cyber') {
        const n = store.histoire.mecaniques.cyberTetrisConsecutifs ?? 0;
        parties.push(`TETRIS CYBER ${n}/3`);
    }
    return parties.join(' · ');
}
