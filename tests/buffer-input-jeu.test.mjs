import { describe, it, expect } from 'vitest';
import { CONFIG } from '../js/config/config-jeu.js';
import {
    ajouterBufferInput,
    bufferInputEstVide,
    creerBufferInputVide,
    premierBufferInput,
    retirerPremierBufferInput,
} from '../js/logique/buffer-input-jeu.js';

describe('buffer-input-jeu', () => {
    it('conserve deux actions avant decrasement du plus ancien', () => {
        let file = creerBufferInputVide();
        file = ajouterBufferInput(file, 'gauche');
        file = ajouterBufferInput(file, 'tourner_cw');
        expect(file).toEqual(['gauche', 'tourner_cw']);

        file = ajouterBufferInput(file, 'droite');
        expect(file).toEqual(['tourner_cw', 'droite']);
        expect(file.length).toBe(CONFIG.inputBufferMax);
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
