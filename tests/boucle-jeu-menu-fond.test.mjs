import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

vi.mock('../js/rendu/rendu-jeu.js', () => ({
    mettreAJourTransition: vi.fn(),
}));

vi.mock('../js/rendu/tick-rendu-solo.js', () => ({
    dessinerFrameSolo: vi.fn(),
}));

vi.mock('../js/logique/boucle-jeu-tick.js', () => ({
    mettreAJourTickPartieActive: vi.fn(),
    mettreAJourTimersEffets: vi.fn(),
    effetsVisuelsActifs: () => false,
}));

const mettreAJourMenuFond = vi.fn();

vi.mock('../js/rendu/menu-fond.js', () => ({
    get menuAnimActif() {
        return true;
    },
    mettreAJourMenuFond: (...args) => mettreAJourMenuFond(...args),
}));

vi.mock('../js/etat/registre-modes.js', () => ({
    partieSpecialiseeActive: () => false,
}));

describe('boucle-jeu — menu sans plateau', () => {
    /** @type {FrameRequestCallback | null} */
    let callbackRaf = null;

    beforeEach(() => {
        vi.resetModules();
        mettreAJourMenuFond.mockClear();
        callbackRaf = null;
        vi.stubGlobal(
            'requestAnimationFrame',
            vi.fn((cb) => {
                callbackRaf = cb;
                return 1;
            })
        );
        vi.stubGlobal('cancelAnimationFrame', vi.fn());
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('planifie la boucle et met a jour le fond menu sans canvas plateau', async () => {
        const { definirBoucleActive, definirIdFrame, etat } =
            await import('../js/etat/store-jeu.js');
        etat.estEnCours = false;
        definirBoucleActive(false);
        definirIdFrame(null);

        const { planifierBoucle, suspendreBoucleSolo } =
            await import('../js/logique/boucle-jeu.js');
        planifierBoucle();
        expect(callbackRaf).toBeTypeOf('function');

        callbackRaf?.(16);
        expect(mettreAJourMenuFond).toHaveBeenCalled();

        suspendreBoucleSolo();
    });
});
