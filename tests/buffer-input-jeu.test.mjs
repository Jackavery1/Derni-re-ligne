import { describe, it, expect } from 'vitest';
import { CONFIG } from '../js/config/config-jeu.js';
import { etat } from '../js/etat/store-jeu.js';
import {
    ajouterBufferInput,
    bufferInputEstVide,
    creerBufferInputVide,
    obtenirInputBufferMax,
    premierBufferInput,
    retirerPremierBufferInput,
} from '../js/logique/buffer-input-jeu.js';

describe('buffer-input-jeu', () => {
    it('conserve trois actions en marathon avant decrasement du plus ancien', () => {
        etat.modeJeu = 'marathon';
        let file = creerBufferInputVide();
        file = ajouterBufferInput(file, 'gauche');
        file = ajouterBufferInput(file, 'tourner_cw');
        file = ajouterBufferInput(file, 'droite');
        expect(file).toEqual(['gauche', 'tourner_cw', 'droite']);

        file = ajouterBufferInput(file, 'bas');
        expect(file).toEqual(['tourner_cw', 'droite', 'bas']);
        expect(file.length).toBe(CONFIG.inputBufferMax);
        etat.modeJeu = 'sansFin';
    });

    it('autorise trois actions en mode sprint', () => {
        etat.modeJeu = 'sprint';
        let file = creerBufferInputVide();
        file = ajouterBufferInput(file, 'gauche');
        file = ajouterBufferInput(file, 'tourner_cw');
        file = ajouterBufferInput(file, 'droite');
        expect(file).toEqual(['gauche', 'tourner_cw', 'droite']);
        file = ajouterBufferInput(file, 'bas');
        expect(file).toEqual(['tourner_cw', 'droite', 'bas']);
        expect(obtenirInputBufferMax()).toBe(CONFIG.sprintInputBufferMax);
        etat.modeJeu = 'sansFin';
    });

    it('retire la première action sans toucher au reste', () => {
        const file = ['gauche', 'tourner_cw'];
        const suivant = retirerPremierBufferInput(file);
        expect(suivant.action).toBe('gauche');
        expect(suivant.file).toEqual(['tourner_cw']);
    });

    it('migre un buffer legacy mono-action', () => {
        expect(premierBufferInput('hold')).toBe('hold');
        expect(bufferInputEstVide('hold')).toBe(false);
        const suivant = retirerPremierBufferInput('hold');
        expect(suivant.action).toBe('hold');
        expect(suivant.file).toEqual([]);
    });
});
