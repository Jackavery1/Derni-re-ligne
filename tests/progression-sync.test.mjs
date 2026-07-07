import { describe, it, expect, beforeEach } from 'vitest';
import {
    estCleProgressionB10,
    exporterProgressionB10,
    importerProgressionB10,
    VERSION_EXPORT_PROGRESSION,
    ecrireStockage,
} from '../js/io/progression-stockage.js';

describe('progression-sync (B10)', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it('identifie les cles records et profil', () => {
        expect(estCleProgressionB10('derniereLigne_record_classique')).toBe(true);
        expect(estCleProgressionB10('derniereLigne_profilDernier')).toBe(true);
        expect(estCleProgressionB10('derniereLigne_volume')).toBe(false);
        expect(estCleProgressionB10('derniereLigne_histoire')).toBe(false);
    });

    it('exporte les donnees locales', () => {
        ecrireStockage('derniereLigne_record_classique', '1200');
        ecrireStockage('derniereLigne_volume', '1');
        const exportData = exporterProgressionB10();
        expect(exportData.version).toBe(VERSION_EXPORT_PROGRESSION);
        expect(exportData.donnees['derniereLigne_record_classique']).toBe('1200');
        expect(exportData.donnees['derniereLigne_volume']).toBeUndefined();
    });

    it('fusionne les records au max et sprint au min', () => {
        ecrireStockage('derniereLigne_record_classique', '1000');
        ecrireStockage('derniereLigne_sprint_classique', '90000');

        const resultat = importerProgressionB10({
            version: VERSION_EXPORT_PROGRESSION,
            app: 'derniere-ligne',
            donnees: {
                derniereLigne_record_classique: '2500',
                derniereLigne_sprint_classique: '45000',
            },
        });

        expect(resultat.ok).toBe(true);
        expect(localStorage.getItem('derniereLigne_record_classique')).toBe('2500');
        expect(localStorage.getItem('derniereLigne_sprint_classique')).toBe('45000');
        expect(resultat.fusionnes).toBeGreaterThanOrEqual(2);
    });

    it('refuse une sauvegarde incompatible', () => {
        const resultat = importerProgressionB10({ version: 99, app: 'autre-jeu', donnees: {} });
        expect(resultat.ok).toBe(false);
    });
});
