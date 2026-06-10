import { describe, it, expect } from 'vitest';
import {
    PORTRAITS,
    CUTSCENES_ENTREE,
    DIALOGUES_COMBAT_BOSS,
    INTERLUDES,
} from '../js/histoire-textes.js';

function extrairePersonnagesCutscenes(objet) {
    const ids = new Set();
    for (const lignes of Object.values(objet)) {
        if (!Array.isArray(lignes)) continue;
        for (const ligne of lignes) {
            if (ligne?.personnage) ids.add(ligne.personnage);
        }
    }
    return [...ids];
}

describe('histoire-textes — cohérence portraits', () => {
    it('chaque personnage de cutscene existe dans PORTRAITS ou est un boss connu', () => {
        const personnages = extrairePersonnagesCutscenes(CUTSCENES_ENTREE);
        const bossConnus = new Set([
            'brasier',
            'sentinelle',
            'archiviste',
            'avantgarde',
            'distorsion',
        ]);
        for (const id of personnages) {
            const connu = PORTRAITS[id] || bossConnus.has(id) || id === 'narrateur';
            expect(connu, `personnage inconnu : ${id}`).toBeTruthy();
        }
    });

    it('PORTRAITS contient les voix de boss', () => {
        expect(PORTRAITS.brasier_voix).toBeDefined();
        expect(PORTRAITS.sentinelle_voix).toBeDefined();
        expect(PORTRAITS.brasier).toBeDefined();
    });

    it('DIALOGUES_COMBAT_BOSS couvre les 5 boss avec champs requis', () => {
        const ids = ['brasier', 'sentinelle', 'archiviste', 'avantgarde', 'distorsion'];
        for (const id of ids) {
            const d = DIALOGUES_COMBAT_BOSS[id];
            expect(d.epithete).toBeTruthy();
            expect(d.debut).toBeTruthy();
            expect(d.phases.length).toBeGreaterThanOrEqual(2);
            expect(d.reactionTetris).toBeTruthy();
            expect(d.quasiVaincu).toBeTruthy();
            expect(d.gameOver).toBeTruthy();
        }
        expect(DIALOGUES_COMBAT_BOSS.distorsion.phases).toHaveLength(3);
    });

    it('INTERLUDES contient gardiens et veille', () => {
        expect(INTERLUDES.interlude_gardiens?.length).toBeGreaterThan(3);
        expect(INTERLUDES.interlude_veille?.length).toBeGreaterThan(3);
    });

    it('monde_boss_1 inclut le dialogue du Brasier', () => {
        const lignes = CUTSCENES_ENTREE.monde_boss_1 ?? [];
        expect(lignes.some((l) => l.personnage === 'brasier' && l.texte.includes('APPROCHE'))).toBe(
            true
        );
    });
});
