import { describe, it, expect } from 'vitest';
import {
    BRIEFINGS_MECANIQUES_BOSS,
    INFOBULLES_ATTAQUES_BOSS,
    obtenirBriefingMecaniqueBoss,
    obtenirInfobulleAttaqueBoss,
} from '../js/histoire/histoire-map-briefings-boss.js';
import { DIALOGUES_COMBAT_BOSS } from '../js/histoire-textes/dialogues-boss.js';

const MOTS_CLEFS_BRIEFING = {
    brasier: /braise|brûle/i,
    sentinelle: /gel|colonn/i,
    archiviste: /fant[oô]me|invers/i,
    avantgarde: /permut|gel/i,
    distorsion: /fant[oô]me|gel|invers/i,
};

describe('histoire-map-briefings-boss', () => {
    it('couvre les cinq boss de campagne', () => {
        expect(Object.keys(BRIEFINGS_MECANIQUES_BOSS).sort()).toEqual([
            'archiviste',
            'avantgarde',
            'brasier',
            'distorsion',
            'sentinelle',
        ]);
    });

    it('mentionne le faux fantôme pour l’Archiviste', () => {
        expect(obtenirBriefingMecaniqueBoss('archiviste')).toMatch(/faux fant[oô]me/i);
    });

    it('retourne une chaîne vide pour un boss inconnu', () => {
        expect(obtenirBriefingMecaniqueBoss('inconnu')).toBe('');
        expect(obtenirBriefingMecaniqueBoss(undefined)).toBe('');
    });

    it('expose une infobulle pour le faux fantôme', () => {
        const info = obtenirInfobulleAttaqueBoss('faux_fantome');
        expect(info?.titre).toMatch(/FANTOME/i);
        expect(info?.texte).toMatch(/rose/i);
        expect(obtenirInfobulleAttaqueBoss('inconnu')).toBeNull();
    });

    it('couvre les attaques boss à infobulle', () => {
        expect(Object.keys(INFOBULLES_ATTAQUES_BOSS).sort()).toEqual([
            'distorsion_plateau',
            'faux_fantome',
            'inverser_controles',
            'permutation_colonnes',
        ]);
    });

    for (const bossId of Object.keys(BRIEFINGS_MECANIQUES_BOSS)) {
        it(`briefing ${bossId} aligne mécaniques et dialogues`, () => {
            const briefing = obtenirBriefingMecaniqueBoss(bossId);
            const dialogues = DIALOGUES_COMBAT_BOSS[bossId];
            expect(briefing.length).toBeGreaterThan(0);
            expect(dialogues?.phases?.length).toBeGreaterThan(0);
            expect(briefing).toMatch(MOTS_CLEFS_BRIEFING[bossId]);
        });
    }
});
