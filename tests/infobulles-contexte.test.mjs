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
    /** @type {Record<string, string>} */
    const attrs = { 'aria-hidden': 'true' };
    const listeners = new Map();
    const overlay = {
        classList: { add: vi.fn(), remove: vi.fn(), contains: vi.fn(() => false) },
        setAttribute: vi.fn((name, value) => {
            attrs[name] = value;
        }),
        getAttribute: vi.fn((name) => attrs[name]),
        addEventListener: vi.fn((type, handler) => {
            listeners.set(type, handler);
        }),
        removeEventListener: vi.fn((type) => {
            listeners.delete(type);
        }),
        dispatchEvent: vi.fn((event) => {
            listeners.get(event.type)?.(event);
            return true;
        }),
    };
    const titre = { textContent: '' };
    const texte = { textContent: '' };
    const btn = {
        onclick: null,
        click: vi.fn(),
        focus: vi.fn(),
        offsetParent: {},
    };
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
    return { overlay, titre, texte, btn };
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

    it('expose aria-hidden et focus trap a l ouverture', () => {
        const { overlay, btn } = installerOverlayInfobulle();
        proposerInfobulleModeJeu('sansFin');
        expect(overlay.setAttribute).toHaveBeenCalledWith('aria-hidden', 'false');
        expect(overlay.classList.remove).toHaveBeenCalledWith('element-masque');
        expect(btn.focus).toHaveBeenCalled();
        expect(overlay.addEventListener).toHaveBeenCalledWith('keydown', expect.any(Function));
    });

    it('ferme sur Escape et remet aria-hidden', () => {
        const { overlay } = installerOverlayInfobulle();
        proposerInfobulleModeJeu('oracle');
        overlay.dispatchEvent({ type: 'keydown', key: 'Escape' });
        expect(overlay.setAttribute).toHaveBeenCalledWith('aria-hidden', 'true');
        expect(overlay.classList.add).toHaveBeenCalledWith('element-masque');
    });
});
