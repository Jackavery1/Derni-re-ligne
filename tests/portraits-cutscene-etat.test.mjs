import { describe, it, expect, beforeEach } from 'vitest';
import {
    definirHumeurRoboCutscene,
    obtenirHumeurRoboCutscene,
    definirHumeurVeraCutscene,
    obtenirHumeurVeraCutscene,
    definirHumeurBossCutscene,
    obtenirHumeurBossCutscene,
    obtenirHumeurPortraitCutsceneEtat,
} from '../js/rendu/portraits-cutscene-etat.js';

describe('portraits-cutscene-etat', () => {
    beforeEach(() => {
        definirHumeurRoboCutscene('content');
        definirHumeurVeraCutscene('douce');
    });

    it('expose humeur ROBO par défaut', () => {
        expect(obtenirHumeurRoboCutscene()).toBe('content');
        definirHumeurRoboCutscene('triste');
        expect(obtenirHumeurRoboCutscene()).toBe('triste');
    });

    it('expose humeur VERA par défaut', () => {
        expect(obtenirHumeurVeraCutscene()).toBe('douce');
        definirHumeurVeraCutscene('inquiete');
        expect(obtenirHumeurVeraCutscene()).toBe('inquiete');
    });

    it('obtenirHumeurPortraitCutsceneEtat route par personnage', () => {
        definirHumeurRoboCutscene('alerte');
        definirHumeurVeraCutscene('determinee');
        definirHumeurBossCutscene('brasier', 'vacillant');
        expect(obtenirHumeurPortraitCutsceneEtat('robo')).toBe('alerte');
        expect(obtenirHumeurPortraitCutsceneEtat('vera')).toBe('determinee');
        expect(obtenirHumeurPortraitCutsceneEtat('brasier')).toBe('vacillant');
        expect(obtenirHumeurPortraitCutsceneEtat('distorsion')).toBe('menacante');
        expect(obtenirHumeurPortraitCutsceneEtat('inconnu')).toBeNull();
    });

    it('obtenirHumeurBossCutscene retourne la humeur par défaut', () => {
        expect(obtenirHumeurBossCutscene('sentinelle')).toBe('calme');
    });
});
