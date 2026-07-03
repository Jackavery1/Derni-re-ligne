import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
    typewriterEstActif,
    arreterMachineAEcrire,
    demarrerTypewriter,
    afficherTexteComplet,
} from '../js/histoire-cutscene-typewriter.js';

describe('histoire-cutscene-typewriter', () => {
    /** @type {HTMLSpanElement} */
    let el;

    beforeEach(() => {
        vi.useFakeTimers();
        el = document.createElement('span');
    });

    afterEach(() => {
        arreterMachineAEcrire();
        vi.useRealTimers();
    });

    it('revele le texte caractere par caractere', () => {
        demarrerTypewriter(el, 'AB', 50);
        expect(typewriterEstActif()).toBe(true);
        expect(el.textContent).toBe('A');
        vi.advanceTimersByTime(50);
        expect(el.textContent).toBe('AB');
        vi.advanceTimersByTime(50);
        expect(typewriterEstActif()).toBe(false);
    });

    it('multiplie la pause apres la ponctuation', () => {
        demarrerTypewriter(el, 'A.B', 20);
        expect(el.textContent).toBe('A');
        vi.advanceTimersByTime(20);
        expect(el.textContent).toBe('A.');
        vi.advanceTimersByTime(120);
        expect(el.textContent).toBe('A.B');
        vi.advanceTimersByTime(20);
        expect(typewriterEstActif()).toBe(false);
    });

    it('arreterMachineAEcrire coupe la machine en cours', () => {
        demarrerTypewriter(el, 'Bonjour', 40);
        expect(el.textContent).toBe('B');
        vi.advanceTimersByTime(40);
        expect(el.textContent).toBe('Bo');
        arreterMachineAEcrire();
        expect(typewriterEstActif()).toBe(false);
        vi.advanceTimersByTime(200);
        expect(el.textContent).toBe('Bo');
    });

    it('afficherTexteComplet affiche tout le texte sans animation', () => {
        demarrerTypewriter(el, 'En cours', 40);
        afficherTexteComplet(el, 'Complet');
        expect(el.textContent).toBe('Complet');
        expect(typewriterEstActif()).toBe(false);
    });
});
