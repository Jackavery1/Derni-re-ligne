import { describe, it, expect } from 'vitest';
import { obtenirActions } from '../js/logique/actions-jeu.js';
import { configurerActionsMoteur } from '../js/logique/moteur-config-actions.js';

describe('moteur-config-actions', () => {
    it('injecte les actions solo dans le registre partagé', () => {
        configurerActionsMoteur();
        const actions = obtenirActions();
        expect(typeof actions.planifierBoucle).toBe('function');
        expect(typeof actions.demarrerJeu).toBe('function');
        expect(typeof actions.terminerPartie).toBe('function');
        expect(typeof actions.tourner).toBe('function');
        expect(typeof actions.utiliserReserve).toBe('function');
        expect(typeof actions.chuteRapide).toBe('function');
    });
});
