import { describe, it, expect, beforeEach } from 'vitest';
import { CONFIG } from '../js/config/config.js';
import { store } from '../js/etat/store-jeu.js';
import { etat } from '../js/etat/store-jeu.js';
import { creerPlateau } from '../js/logique/piece-jeu.js';
import {
    demarrerBoss,
    arreterBoss,
    endommagerBoss,
    mettreAJourBoss,
    bossEstActif,
    bossEstVaincu,
    DUREE_VICTOIRE_BOSS_MS,
    COULEUR_GLACE_B,
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

    it('rangee braise bloquee si le stack est deja trop haut', () => {
        etat.plateau = creerPlateau();
        for (let lig = 0; lig < CONFIG.lignes - 1; lig++) {
            etat.plateau[lig] = Array(CONFIG.colonnes).fill('#ff0000');
        }
        etat.estEnPause = false;
        demarrerBoss('brasier');
        store.histoire.boss.timerAttaque = 1;
        const hauteurAvant = etat.plateau.filter((l) => l.some((c) => c !== 0)).length;
        mettreAJourBoss(100);
        const hauteurApres = etat.plateau.filter((l) => l.some((c) => c !== 0)).length;
        expect(hauteurApres).toBe(hauteurAvant);
    });

    it('degel glace uniquement sur les colonnes gelees actives', () => {
        etat.plateau = creerPlateau();
        etat.estEnPause = false;
        demarrerBoss('sentinelle');
        const lig = CONFIG.lignes - 1;
        etat.plateau[lig][0] = COULEUR_GLACE_B;
        etat.plateau[lig][5] = COULEUR_GLACE_B;
        store.histoire.boss.effets.colonnesGelees = [0];
        store.histoire.boss.effets.timerDegelMs = 1000;
        mettreAJourBoss(1500);
        expect(etat.plateau[lig][0]).toBe(0);
        expect(etat.plateau[lig][5]).toBe(COULEUR_GLACE_B);
    });
});
