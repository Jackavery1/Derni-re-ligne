import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { obtenirTempsEcoule } from '../js/logique/temps-partie.js';
import { etat } from '../js/etat/store-jeu.js';

describe('temps-partie', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2026-07-16T12:00:00Z'));
        etat.tempsDebut = Date.now() - 5000;
        etat.tempsPauseAccumule = 0;
        etat.estEnPause = false;
        etat.tempsPauseDebut = null;
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('retourne 0 sans debut de partie', () => {
        etat.tempsDebut = null;
        expect(obtenirTempsEcoule()).toBe(0);
    });

    it('mesure le temps hors pause', () => {
        expect(obtenirTempsEcoule()).toBe(5000);
    });

    it('soustrait la pause en cours', () => {
        etat.estEnPause = true;
        etat.tempsPauseDebut = Date.now() - 1000;
        expect(obtenirTempsEcoule()).toBe(4000);
    });
});
