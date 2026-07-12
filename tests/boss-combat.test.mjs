import { describe, it, expect, beforeEach, vi } from 'vitest';
import { store, etat } from '../js/etat/store-jeu.js';
import { creerPlateau } from '../js/logique/piece-jeu.js';
import { activerModeHistoire, desactiverModeHistoire } from '../js/etat/mode-histoire.js';
import { demarrerBoss, arreterBoss, DUREE_VICTOIRE_BOSS_MS } from '../js/logique/boss-jeu.js';

vi.mock('../js/audio/audio.js', () => ({
    AudioMoteur: { muet: true, son: vi.fn() },
}));

const terminerPartie = vi.fn();
vi.mock('../js/logique/actions-jeu.js', () => ({
    obtenirActions: () => ({ terminerPartie }),
}));

import {
    obtenirIntervalleAttaqueBoss,
    endommagerBossCombat,
    declencherVictoireBoss,
    verifierPhaseBoss,
    obtenirSonAttaqueBoss,
    SONS_ATTAQUE_BOSS,
} from '../js/logique/boss-combat.js';

function reinitialiserEtatBoss() {
    store.histoire.boss = {
        actif: null,
        pv: 0,
        phase: 0,
        timerAttaque: 0,
        timerAttaqueActive: 0,
        vaincu: false,
        timerVaincu: 0,
        timerDebut: 0,
        timerPortrait: 0,
        effets: {
            colonnesGelees: [],
            timerDegelMs: 0,
            blocksRouilles: [],
            pieceInvisibleDepuis: null,
            bossControlesInverses: false,
            timerControlesInverses: 0,
            bossFauxFantome: false,
            timerFauxFantome: 0,
            decalageDistorsion: 0,
            timerDistorsion: 0,
        },
    };
}

describe('boss-combat', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        desactiverModeHistoire();
        activerModeHistoire();
        arreterBoss();
        reinitialiserEtatBoss();
        etat.plateau = creerPlateau();
        terminerPartie.mockReset();
    });

    it('obtenirIntervalleAttaqueBoss accelere distorsion sous 12 PV', () => {
        demarrerBoss('distorsion');
        const boss = store.histoire.boss.actif;
        expect(obtenirIntervalleAttaqueBoss(boss)).toBe(boss.attaqueIntervalleMs ?? 15000);
        store.histoire.boss.pv = 10;
        expect(obtenirIntervalleAttaqueBoss(boss)).toBe(9000);
    });

    it('endommagerBossCombat reduit les PV et declenche la victoire', () => {
        demarrerBoss('brasier');
        endommagerBossCombat(14);
        expect(store.histoire.boss.pv).toBe(0);
        expect(store.histoire.boss.vaincu).toBe(true);
        expect(store.histoire.boss.timerVaincu).toBe(DUREE_VICTOIRE_BOSS_MS);
    });

    it('declencherVictoireBoss est idempotent', () => {
        demarrerBoss('brasier');
        store.histoire.boss.pv = 0;
        declencherVictoireBoss();
        const timer = store.histoire.boss.timerVaincu;
        declencherVictoireBoss();
        expect(store.histoire.boss.timerVaincu).toBe(timer);
    });

    it('verifierPhaseBoss monte la phase quand les PV passent un seuil', () => {
        demarrerBoss('archiviste');
        const boss = store.histoire.boss.actif;
        const seuil = boss.phases[1].pvSeuil;
        store.histoire.boss.pv = seuil;
        verifierPhaseBoss();
        expect(store.histoire.boss.phase).toBe(1);
    });

    it('declenche terminerPartie apres delai victoire boss', async () => {
        vi.useFakeTimers();
        demarrerBoss('brasier');
        endommagerBossCombat(14);
        await vi.advanceTimersByTimeAsync(DUREE_VICTOIRE_BOSS_MS);
        expect(terminerPartie).toHaveBeenCalledWith(true);
        vi.useRealTimers();
    });

    it('mappe chaque attaque boss vers un sfx dedie', () => {
        expect(obtenirSonAttaqueBoss('rangee_braise')).toBe('boss_braise');
        expect(obtenirSonAttaqueBoss('colonne_gelee')).toBe('boss_gel');
        expect(obtenirSonAttaqueBoss('distorsion_plateau')).toBe('boss_distorsion');
        expect(Object.keys(SONS_ATTAQUE_BOSS)).toHaveLength(6);
    });
});
