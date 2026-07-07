import { describe, it, expect, beforeEach } from 'vitest';
import { store } from '../js/etat/store-jeu.js';
import { archi } from '../js/logique/archi-logique.js';
import { coop, reinitialiserEtatCoop } from '../js/logique/coop-logique.js';
import {
    MODES_JEU,
    obtenirModeActif,
    modeSoloEnCours,
    partieSpecialiseeActive,
    boucleSoloActive,
} from '../js/etat/registre-modes.js';

describe('registre-modes', () => {
    beforeEach(() => {
        archi.actif = false;
        coop.actif = false;
        store.histoire.actif = false;
        reinitialiserEtatCoop();
    });

    it('retourne solo par defaut', () => {
        expect(obtenirModeActif()).toBe(MODES_JEU.SOLO);
        expect(modeSoloEnCours()).toBe(true);
        expect(partieSpecialiseeActive()).toBe(false);
        expect(boucleSoloActive()).toBe(true);
    });

    it('priorise archi puis coop puis histoire', () => {
        store.histoire.actif = true;
        expect(obtenirModeActif()).toBe(MODES_JEU.HISTOIRE);

        coop.actif = true;
        expect(obtenirModeActif()).toBe(MODES_JEU.COOP);

        archi.actif = true;
        expect(obtenirModeActif()).toBe(MODES_JEU.ARCHI);
        expect(partieSpecialiseeActive()).toBe(true);
        expect(boucleSoloActive()).toBe(false);
    });
});
