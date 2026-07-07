import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
    proposerInfobulleVivant,
    proposerInfobulleMeteo,
    proposerInfobulleRelique,
    proposerInfobulleModeJeu,
    proposerInfobulleOracleCoopExclusif,
    proposerInfobulleAttaqueBoss,
    _reinitialiserInfobullesContexte,
} from '../js/ui/infobulles-contexte.js';
import { chargerContenuJeu } from '../js/config/contenu-jeu.js';

function installerOverlayInfobulle() {
    const overlay = {
        classList: { add: vi.fn(), remove: vi.fn(), contains: vi.fn(() => false) },
    };
    const titre = { textContent: '' };
    const texte = { textContent: '' };
    const btn = { onclick: null, click: vi.fn() };
    vi.spyOn(document, 'getElementById').mockImplementation((id) => {
        if (id === 'overlay-infobulle-contexte') return overlay;
        if (id === 'infobulle-contexte-titre') return titre;
        if (id === 'infobulle-contexte-texte') return texte;
        if (id === 'btn-infobulle-contexte-fermer') return btn;
        if (id === 'toggle-oracle-wrap') {
            return { classList: { contains: (c) => c === 'mode-debloque' } };
        }
        return null;
    });
    return { overlay, titre, texte };
}

describe('infobulles-contexte', () => {
    beforeEach(async () => {
        _reinitialiserInfobullesContexte();
        await chargerContenuJeu();
        vi.restoreAllMocks();
        delete window.__NEO_SILENT_NOTIFS__;
    });

    it('affiche une infobulle vivant une seule fois', () => {
        const { titre } = installerOverlayInfobulle();
        proposerInfobulleVivant('classique', { nom: 'TEST', icone: '!' });
        expect(titre.textContent).toContain('TEST');
        titre.textContent = '';
        proposerInfobulleVivant('classique', { nom: 'TEST', icone: '!' });
        expect(titre.textContent).toBe('');
    });

    it('affiche une infobulle meteo', () => {
        const { titre } = installerOverlayInfobulle();
        proposerInfobulleMeteo('lave', { nom: 'PLUIE', icone: 'R' });
        expect(titre.textContent).toContain('PLUIE');
    });

    it('ignore relique inconnue', () => {
        installerOverlayInfobulle();
        expect(() => proposerInfobulleRelique('inconnu', null)).not.toThrow();
    });

    it('persiste infobulle mode sprint', () => {
        installerOverlayInfobulle();
        proposerInfobulleModeJeu('sprint');
        const raw = localStorage.getItem('derniereLigne_infobullesModesJeu') ?? '{}';
        expect(JSON.parse(raw).sprint).toBe(true);
    });

    it('oracle coop exclusif une seule fois', () => {
        installerOverlayInfobulle();
        proposerInfobulleOracleCoopExclusif();
        proposerInfobulleOracleCoopExclusif();
        expect(localStorage.getItem('derniereLigne_infobulleOracleCoop')).toBe('1');
    });

    it('affiche infobulle attaque boss', () => {
        const { titre } = installerOverlayInfobulle();
        proposerInfobulleAttaqueBoss('faux_fantome');
        expect(titre.textContent.length).toBeGreaterThan(0);
    });

    it('respecte __NEO_SILENT_NOTIFS__', () => {
        window.__NEO_SILENT_NOTIFS__ = true;
        const { titre } = installerOverlayInfobulle();
        proposerInfobulleModeJeu('sprint');
        expect(titre.textContent).toBe('');
    });
});
