import { describe, it, expect } from 'vitest';
import { PORTRAITS } from '../js/histoire-textes.js';
import { CUTSCENES_ENTREE } from '../js/histoire-textes.js';

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
    });
});
