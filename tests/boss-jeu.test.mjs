import { describe, it, expect, beforeEach } from 'vitest';
import { store } from '../js/store-core.js';
import {
    demarrerBoss,
    arreterBoss,
    endommagerBoss,
    bossEstActif,
    bossEstVaincu,
    DUREE_VICTOIRE_BOSS_MS,
} from '../js/boss-jeu.js';

describe('boss-jeu', () => {
    beforeEach(() => {
        arreterBoss();
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
    });

    it('demarrerBoss initialise les PV du boss Brasier', () => {
        demarrerBoss('brasier');
        expect(bossEstActif()).toBe(true);
        expect(store.histoire.boss.pv).toBe(14);
        expect(store.histoire.boss.actif?.id).toBe('brasier');
    });

    it('demarrerBoss ignore un id inconnu', () => {
        demarrerBoss('boss_inexistant');
        expect(bossEstActif()).toBe(false);
    });

    it('endommagerBoss réduit les PV partiellement', () => {
        demarrerBoss('brasier');
        endommagerBoss(3);
        expect(store.histoire.boss.pv).toBe(11);
        expect(bossEstVaincu()).toBe(false);
    });

    it('demarrerBoss initialise les PV du boss Sentinelle', () => {
        demarrerBoss('sentinelle');
        expect(bossEstActif()).toBe(true);
        expect(store.histoire.boss.pv).toBe(12);
        expect(store.histoire.boss.actif?.id).toBe('sentinelle');
    });

    it('endommagerBoss réduit les PV et déclenche la victoire', () => {
        demarrerBoss('brasier');
        endommagerBoss(14);
        expect(store.histoire.boss.pv).toBe(0);
        expect(bossEstVaincu()).toBe(true);
        expect(store.histoire.boss.timerVaincu).toBe(DUREE_VICTOIRE_BOSS_MS);
    });

    it('arreterBoss remet l état à zéro', () => {
        demarrerBoss('brasier');
        arreterBoss();
        expect(bossEstActif()).toBe(false);
        expect(store.histoire.boss.pv).toBe(0);
    });
});
