import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ILLUSTRATIONS_JOURNAUX } from '../js/histoire/histoire-illustrations.js';
import { JOURNAUX_VERA_DIALOGUES } from '../js/histoire-textes/journaux.js';

const { JOURNAUX_VERA } = JSON.parse(
    readFileSync(
        join(dirname(fileURLToPath(import.meta.url)), '../data/histoire-donnees.json'),
        'utf8'
    )
);

/** @param {{ id: string, texte?: unknown[] }} journal */
function lignesJournalEffectives(journal) {
    if (Array.isArray(journal.texte) && journal.texte.length > 0) return journal.texte;
    return JOURNAUX_VERA_DIALOGUES[journal.id] ?? [];
}

describe('journaux VERA — audit D5', () => {
    it('registre contient 9 transmissions numerotees', () => {
        expect(JOURNAUX_VERA).toHaveLength(9);
        expect(JOURNAUX_VERA.map((j) => j.id)).toEqual([
            'journal_1',
            'journal_2',
            'journal_3',
            'journal_4',
            'journal_5',
            'journal_6',
            'journal_7',
            'journal_8',
            'journal_9',
        ]);
    });

    it('chaque journal a titre, contenu narratif et illustration canvas', () => {
        for (const journal of JOURNAUX_VERA) {
            const lignes = lignesJournalEffectives(journal);
            expect(journal.titre?.length, journal.id).toBeGreaterThan(3);
            expect(lignes.length, journal.id).toBeGreaterThan(0);
            expect(typeof ILLUSTRATIONS_JOURNAUX[journal.id], journal.id).toBe('function');
        }
    });
});
