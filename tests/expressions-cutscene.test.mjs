import { describe, it, expect, beforeEach } from 'vitest';
import { store } from '../js/store-jeu.js';
import {
    HUMEURS_PERSONNAGES,
    resoudreHumeurPortrait,
    notifierChangementLigneCutscene,
    obtenirHumeurEffectivePortrait,
    obtenirParamsExpressionPortrait,
    reinitExpressionsCutscene,
    prechargerPresetsExpressions,
} from '../js/expressions-cutscene.js';
import { definirReduireEffetsAccessibilite } from '../js/accessibilite.js';

describe('expressions cutscene', () => {
    beforeEach(async () => {
        reinitExpressionsCutscene();
        await prechargerPresetsExpressions();
        store.histoire.cutscene.enCours = true;
        definirReduireEffetsAccessibilite(false);
    });

    it('expose le vocabulaire par personnage', () => {
        expect(HUMEURS_PERSONNAGES.robo).toEqual([
            'neutre',
            'content',
            'excite',
            'triste',
            'alerte',
        ]);
        expect(HUMEURS_PERSONNAGES.vera).toContain('inquiete');
        expect(HUMEURS_PERSONNAGES.distorsion).toContain('souffrante');
    });

    it('ROBO sans humeur : parle → content, écoute → neutre', () => {
        expect(resoudreHumeurPortrait('robo', undefined, { parle: true })).toBe('content');
        expect(resoudreHumeurPortrait('robo', undefined, { parle: false })).toBe('neutre');
    });

    it('VERA sans humeur : parle → douce, écoute → neutre', () => {
        expect(resoudreHumeurPortrait('vera', undefined, { parle: true })).toBe('douce');
        expect(resoudreHumeurPortrait('vera', undefined, { parle: false })).toBe('neutre');
    });

    it('humeur invalide : fallback sans exception', () => {
        expect(() => resoudreHumeurPortrait('vera', 'banane', { parle: true })).not.toThrow();
        expect(resoudreHumeurPortrait('vera', 'banane', { parle: true })).toBe('douce');
    });

    it('applique les humeurs explicites sur trois personnages', () => {
        const lignes = [
            { personnage: 'vera', texte: 'test', humeur: 'inquiete' },
            { personnage: 'distorsion', texte: 'test', humeur: 'souffrante' },
            { personnage: 'robo', texte: 'test', humeur: 'excite' },
        ];
        lignes.forEach((ligne, i) => {
            notifierChangementLigneCutscene(i, ligne, 1000 + i * 500);
            expect(obtenirHumeurEffectivePortrait(ligne.personnage, ligne, true)).toBe(
                ligne.humeur
            );
            const params = obtenirParamsExpressionPortrait(ligne.personnage, ligne.humeur, 1500);
            expect(params).toBeTruthy();
            if (ligne.personnage === 'vera') {
                expect(params.sourcils).toBe(true);
            }
            if (ligne.personnage === 'distorsion') {
                expect(params.paupiere).toBe(true);
            }
        });
    });

    it('portrait écoute conserve la dernière humeur parlée', () => {
        notifierChangementLigneCutscene(
            0,
            { personnage: 'vera', texte: 'a', humeur: 'douce' },
            1000
        );
        expect(obtenirHumeurEffectivePortrait('vera', null, false)).toBe('douce');
    });

    it('expose la dernière humeur parlée pour l’API test', async () => {
        const { obtenirDerniereHumeurParleePortrait } =
            await import('../js/expressions-cutscene.js');
        notifierChangementLigneCutscene(
            0,
            { personnage: 'vera', texte: 'a', humeur: 'douce' },
            1000
        );
        expect(obtenirDerniereHumeurParleePortrait('vera')).toBe('douce');
    });

    it('effets réduits : paramètres statiques', () => {
        definirReduireEffetsAccessibilite(true);
        notifierChangementLigneCutscene(
            0,
            { personnage: 'vera', texte: 'a', humeur: 'glitch' },
            1000
        );
        const p0 = obtenirParamsExpressionPortrait('vera', 'glitch', 1000);
        const p1 = obtenirParamsExpressionPortrait('vera', 'glitch', 2000);
        expect(p0.effetsReduits).toBe(true);
        expect(p1.fragmentVitesse).toBe(p0.fragmentVitesse);
        expect(p1.decalagesGlitch).toEqual(p0.decalagesGlitch);
    });

    it('transition douce entre humeurs sur ~400 ms', () => {
        notifierChangementLigneCutscene(
            0,
            { personnage: 'distorsion', texte: 'a', humeur: 'menacante' },
            1000
        );
        notifierChangementLigneCutscene(
            1,
            { personnage: 'distorsion', texte: 'b', humeur: 'apaisee' },
            2000
        );
        const debut = obtenirParamsExpressionPortrait('distorsion', 'apaisee', 2000);
        const milieu = obtenirParamsExpressionPortrait('distorsion', 'apaisee', 2200);
        const fin = obtenirParamsExpressionPortrait('distorsion', 'apaisee', 2500);
        expect(debut.vortexVitesse).toBeGreaterThan(fin.vortexVitesse);
        expect(milieu.vortexVitesse).toBeLessThan(debut.vortexVitesse);
        expect(milieu.vortexVitesse).toBeGreaterThan(fin.vortexVitesse);
    });
});
