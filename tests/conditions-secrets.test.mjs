import { describe, it, expect, beforeEach } from 'vitest';
import { CONFIG } from '../js/config/config.js';
import { store } from '../js/etat/store-jeu.js';
import { etat } from '../js/etat/store-jeu.js';
import { ETAT_HISTOIRE_VIDE } from '../js/histoire-donnees.js';
import { creerPlateau } from '../js/logique/piece-jeu.js';
import { chargerEtatHistoire } from '../js/io/progression.js';
import {
    conditionsRuntime,
    verifierConditionMiroir,
    verifierConditionC3,
    onMiroirComplete,
    verifierDeblocageTrame,
    tickConditionTrame,
    reinitialiserConditionsRuntime,
    obtenirProgressionAttenteTrameMs,
    DUREE_ATTENTE_TRAME_MS,
} from '../js/conditions-secrets.js';

function etatHistoireTest(surcharge = {}) {
    return {
        ...structuredClone(ETAT_HISTOIRE_VIDE),
        ...surcharge,
        conditionsMiroir: {
            ...ETAT_HISTOIRE_VIDE.conditionsMiroir,
            ...(surcharge.conditionsMiroir ?? {}),
        },
        conditionsTrame: {
            ...ETAT_HISTOIRE_VIDE.conditionsTrame,
            ...(surcharge.conditionsTrame ?? {}),
        },
        conditionsParadoxe: {
            ...ETAT_HISTOIRE_VIDE.conditionsParadoxe,
            ...(surcharge.conditionsParadoxe ?? {}),
        },
    };
}

describe('conditions-secrets', () => {
    beforeEach(() => {
        document.body = document.body ?? { appendChild: () => {} };
        localStorage.clear();
        store.histoire.actif = false;
        store.histoire.mondeActuel = null;
        store.histoire.mecaniques.cyberTetrisConsecutifs = 0;
        store.histoire.etat = null;
        store.histoire.boss.actif = null;
        conditionsRuntime.notificationsMontrées.clear();
        reinitialiserConditionsRuntime();
        etat.plateau = creerPlateau();
    });

    it('verifierConditionMiroir cumule les tetris CYBER sans reset sur lignes partielles', () => {
        store.histoire.actif = true;
        store.histoire.mondeActuel = 'monde_cyber';
        const etatHist = etatHistoireTest();

        verifierConditionMiroir(4, etatHist);
        verifierConditionMiroir(4, etatHist);
        expect(store.histoire.mecaniques.cyberTetrisConsecutifs).toBe(2);

        verifierConditionMiroir(2, etatHist);
        expect(store.histoire.mecaniques.cyberTetrisConsecutifs).toBe(2);
    });

    it('verifierConditionMiroir débloque le monde miroir après 3 tétris', () => {
        store.histoire.actif = true;
        store.histoire.mondeActuel = 'monde_cyber';
        const etatHist = etatHistoireTest({
            conditionsMiroir: { bossArchivisteVaincu: true, tetrisTriplesCyber: 0 },
        });
        store.histoire.etat = etatHist;

        for (let i = 0; i < 3; i++) verifierConditionMiroir(4, etatHist);

        expect(store.histoire.mecaniques.cyberTetrisConsecutifs).toBe(3);
        expect(etatHist.mondesCachesDebloques).toContain('monde_miroir');
        expect(chargerEtatHistoire().mondesCachesDebloques).toContain('monde_miroir');
    });

    it('verifierConditionC3 débloque le monde paradoxe', () => {
        const etatHist = etatHistoireTest({
            conditionsParadoxe: { finSecreteObtenue: true, topsVolontairesPrologue: 0 },
        });
        store.histoire.etat = etatHist;

        verifierConditionC3(3, etatHist);

        expect(etatHist.mondesCachesDebloques).toContain('monde_paradoxe');
    });

    it('verifierDeblocageTrame débloque le monde trame quand toutes les conditions sont réunies', () => {
        const etatHist = etatHistoireTest({
            conditionsTrame: {
                miroirComplete: true,
                tousJournauxTrouves: true,
                tousBossSansContinue: true,
                actionDistorsionFaite: true,
            },
        });
        store.histoire.etat = etatHist;

        verifierDeblocageTrame(etatHist);

        expect(etatHist.mondesCachesDebloques).toContain('monde_trame');
    });

    it('onMiroirComplete active le flag miroirComplete', () => {
        const etatHist = etatHistoireTest();
        store.histoire.etat = etatHist;

        onMiroirComplete(etatHist);

        expect(etatHist.conditionsTrame.miroirComplete).toBe(true);
        expect(chargerEtatHistoire().conditionsTrame.miroirComplete).toBe(true);
    });

    it('tickConditionTrame valide après attente sur plateau rempli', () => {
        store.histoire.actif = true;
        store.histoire.mondeActuel = 'monde_finale';
        store.histoire.boss.actif = { id: 'distorsion' };
        const etatHist = etatHistoireTest({
            conditionsTrame: {
                miroirComplete: true,
                tousJournauxTrouves: true,
                tousBossSansContinue: true,
                actionDistorsionFaite: false,
            },
        });
        store.histoire.etat = etatHist;

        const total = CONFIG.lignes * CONFIG.colonnes;
        const aRemplir = Math.ceil(total * 0.55);
        let posees = 0;
        for (let l = CONFIG.lignes - 1; l >= 0 && posees < aRemplir; l--) {
            for (let c = 0; c < CONFIG.colonnes && posees < aRemplir; c++) {
                etat.plateau[l][c] = '#00f5ff';
                posees++;
            }
        }

        tickConditionTrame(16);
        tickConditionTrame(DUREE_ATTENTE_TRAME_MS);

        expect(etatHist.conditionsTrame.actionDistorsionFaite).toBe(true);
        expect(obtenirProgressionAttenteTrameMs()).toBe(0);
    });
});
