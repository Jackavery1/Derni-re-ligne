import { describe, it, expect, beforeEach, vi } from 'vitest';
import { store } from '../js/store-core.js';
import {
    enqueueDialogueBoss,
    notifierTetrisBoss,
    notifierQuasiVaincuBoss,
    notifierSeuilsPvBoss,
    notifierTransitionPhaseBoss,
    obtenirRepliqueGameOverBoss,
    reinitialiserDialoguesBoss,
    dialogueBossActif,
    DUREE_AFFICHAGE_DIALOGUE_MS,
} from '../js/boss-dialogues.js';

describe('boss-dialogues', () => {
    beforeEach(async () => {
        const { chargerHistoireTextes } = await import('../js/charger-histoire-textes.js');
        await chargerHistoireTextes();
        store.histoire.actif = true;
        store.histoire.boss = {
            actif: { id: 'brasier', nom: 'LE BRASIER', couleur: '#ff4500', pvMax: 14 },
            pv: 14,
            _dialogues: null,
        };
        reinitialiserDialoguesBoss();
        document.getElementById = vi.fn((id) => {
            if (id === 'boss-attaque-label') return { textContent: '' };
            return null;
        });
    });

    it('expose les répliques game over par boss', () => {
        expect(obtenirRepliqueGameOverBoss('brasier')).toContain('brûler');
        expect(obtenirRepliqueGameOverBoss('inconnu')).toBe('');
    });

    it('n affiche pas de dialogue hors mode histoire', () => {
        store.histoire.actif = false;
        enqueueDialogueBoss('test');
        expect(dialogueBossActif()).toBe(false);
    });

    it('notifie le premier tetris une seule fois', () => {
        notifierTetrisBoss();
        notifierTetrisBoss();
        expect(dialogueBossActif()).toBe(true);
        const d = store.histoire.boss._dialogues;
        expect(d.tetrisVu).toBe(true);
    });

    it('notifie quasi-vaincu une seule fois sous 15%', () => {
        notifierQuasiVaincuBoss(14);
        notifierQuasiVaincuBoss(5);
        expect(store.histoire.boss._dialogues.quasiVaincuVu).toBe(true);
    });

    it('affiche les phases classiques aux seuils 50 et 25%', () => {
        notifierSeuilsPvBoss(49);
        notifierSeuilsPvBoss(24);
        const d = store.histoire.boss._dialogues;
        expect(d.seuilsPvVus).toEqual([50, 25]);
    });

    it('archiviste : transition phase puis replique au seuil 25%', () => {
        store.histoire.boss.actif = {
            id: 'archiviste',
            nom: 'ARCHIVISTE',
            couleur: '#ff00ff',
            pvMax: 14,
            phases: [
                { pvSeuil: 13, type: 'inverser_controles', dureeMs: 6000 },
                { pvSeuil: 7, type: 'faux_fantome', dureeMs: 8000 },
            ],
        };
        reinitialiserDialoguesBoss();

        notifierTransitionPhaseBoss(0, 1);
        expect(store.histoire.boss._dialogues.phasesVues).toContain(0);

        notifierSeuilsPvBoss(24);
        expect(store.histoire.boss._dialogues.phasesVues).toContain(1);
        expect(store.histoire.boss._dialogues.seuilsPvVus).toContain(25);
    });

    it('enqueue un dialogue avec durée d affichage', () => {
        enqueueDialogueBoss('BRÛLE');
        expect(dialogueBossActif()).toBe(true);
        expect(store.histoire.boss._dialogues.affichageRestantMs).toBe(DUREE_AFFICHAGE_DIALOGUE_MS);
    });
});
