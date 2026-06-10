import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as textesHistoire from '../js/histoire-textes.js';
import { store } from '../js/store-core.js';

vi.mock('../js/navigation-ecrans.js', () => ({
    afficherEcran: vi.fn(),
    cacherEcrans: vi.fn(),
    annoncer: vi.fn(),
}));

function creerCanvas(id) {
    const canvas = {
        id,
        width: 180,
        height: 260,
        className: 'absent',
        classList: {
            add: vi.fn(),
            remove: vi.fn(),
        },
        getContext: () => ({
            clearRect: vi.fn(),
            fillRect: vi.fn(),
            strokeRect: vi.fn(),
            beginPath: vi.fn(),
            moveTo: vi.fn(),
            lineTo: vi.fn(),
            stroke: vi.fn(),
            fill: vi.fn(),
            arc: vi.fn(),
            ellipse: vi.fn(),
            quadraticCurveTo: vi.fn(),
            closePath: vi.fn(),
            save: vi.fn(),
            restore: vi.fn(),
            translate: vi.fn(),
            scale: vi.fn(),
            rotate: vi.fn(),
            fillText: vi.fn(),
            createRadialGradient: () => ({ addColorStop: vi.fn() }),
            createLinearGradient: () => ({ addColorStop: vi.fn() }),
            set fillStyle(_v) {},
            set strokeStyle(_v) {},
            set lineWidth(_v) {},
            set font(_v) {},
            set globalAlpha(_v) {},
            set shadowBlur(_v) {},
            set shadowColor(_v) {},
            set textAlign(_v) {},
            set textBaseline(_v) {},
        }),
    };
    Object.defineProperty(canvas, 'className', {
        get() {
            return this._className ?? 'absent';
        },
        set(v) {
            this._className = v;
        },
    });
    return canvas;
}

describe('cutscene UI', () => {
    /** @type {Map<string, object>} */
    let elements;
    let texteEl;
    let narrationEl;
    let ecranCutscene;

    beforeEach(async () => {
        elements = new Map();
        texteEl = { textContent: '', className: '', style: {}, dataset: {} };
        narrationEl = { textContent: '', className: '', style: {}, dataset: {} };
        ecranCutscene = {
            dataset: {},
            classList: { add: vi.fn(), remove: vi.fn(), toggle: vi.fn() },
        };

        const gauche = creerCanvas('canvas-portrait-gauche');
        const droite = creerCanvas('canvas-portrait-droite');
        const bg = creerCanvas('canvas-cutscene-bg');
        bg.width = 800;
        bg.height = 600;

        elements.set('canvas-portrait-gauche', gauche);
        elements.set('canvas-portrait-droite', droite);
        elements.set('canvas-cutscene-bg', bg);
        elements.set('texte-dialogue-cutscene', texteEl);
        elements.set('texte-narration-cutscene', narrationEl);
        elements.set('zone-narration-cutscene', {});
        elements.set('nom-perso-dialogue', { textContent: '', style: { setProperty: vi.fn() } });
        elements.set('histoire-cutscene-progress', { textContent: '' });
        elements.set('ecran-histoire-cutscene', ecranCutscene);

        globalThis.document = {
            getElementById: (id) => elements.get(id) ?? null,
            querySelector: () => null,
            querySelectorAll: () => [],
            body: { classList: { add: vi.fn(), remove: vi.fn() } },
        };

        globalThis.fetch = async (url) => {
            if (String(url).includes('histoire-textes.json')) {
                return { ok: true, json: async () => textesHistoire };
            }
            return { ok: false, status: 404, json: async () => ({}) };
        };

        store.histoire.cutscene.enCours = false;
        vi.resetModules();
        const { chargerHistoireTextes } = await import('../js/charger-histoire-textes.js');
        await chargerHistoireTextes();
    });

    it('remplace le texte à chaque ligne au lieu de l accumuler', async () => {
        const { afficherCutsceneHistoire, avancerCutscene } =
            await import('../js/histoire-manager-ui.js');

        afficherCutsceneHistoire(['Ligne un.', 'Ligne deux.'], ['robo', 'vera'], null);

        avancerCutscene();
        expect(texteEl.textContent).toBe('Ligne un.');

        avancerCutscene();
        avancerCutscene();
        expect(texteEl.textContent).toBe('Ligne deux.');
        expect(texteEl.textContent).not.toContain('Ligne un.');
    }, 15_000);

    it('affiche la narration en haut sans bulle de dialogue', async () => {
        const { afficherCutsceneHistoire, avancerCutscene } =
            await import('../js/histoire-manager-ui.js');

        afficherCutsceneHistoire(['Une voix off.', 'ROBO parle.'], ['narrateur', 'robo'], null);
        avancerCutscene();

        expect(narrationEl.textContent).toBe('Une voix off.');
        expect(texteEl.textContent).toBe('');
        expect(ecranCutscene.classList.toggle).toHaveBeenCalledWith(
            'cutscene-mode-narration',
            true
        );
    }, 15_000);

    it('passe toute la cutscene en un seul appel', async () => {
        const { afficherCutsceneHistoire, passerCutscene } =
            await import('../js/histoire-manager-ui.js');
        const onFin = vi.fn();

        afficherCutsceneHistoire(['A', 'B', 'C'], ['narrateur', 'robo', 'vera'], onFin);
        passerCutscene();

        expect(onFin).toHaveBeenCalledTimes(1);
        expect(store.histoire.cutscene.enCours).toBe(false);
    }, 15_000);

    it('ignore les avances supplementaires apres la fin', async () => {
        const { afficherCutsceneHistoire, avancerCutscene } =
            await import('../js/histoire-manager-ui.js');
        const onFin = vi.fn();

        afficherCutsceneHistoire(['Fin.'], ['robo'], onFin);
        avancerCutscene();
        avancerCutscene();
        avancerCutscene();

        expect(onFin).toHaveBeenCalledTimes(1);
    }, 15_000);

    it('injecte la zone narration si le HTML cache est obsolete', async () => {
        elements.delete('zone-narration-cutscene');
        elements.delete('texte-narration-cutscene');

        globalThis.document.createElement = (tag) => {
            const el = {
                tagName: tag.toUpperCase(),
                id: '',
                textContent: '',
                childNodes: [],
                setAttribute() {},
                appendChild(child) {
                    if (child.id) elements.set(child.id, child);
                    this.childNodes.push(child);
                },
            };
            return el;
        };
        ecranCutscene.prepend = (child) => {
            if (child.id) elements.set(child.id, child);
        };
        ecranCutscene.insertBefore = (child) => {
            if (child.id) elements.set(child.id, child);
        };

        const { afficherCutsceneHistoire } = await import('../js/histoire-manager-ui.js');
        afficherCutsceneHistoire(['Voix off.'], ['narrateur'], null);

        expect(elements.has('zone-narration-cutscene')).toBe(true);
        expect(elements.get('texte-narration-cutscene')).toBeTruthy();
    });

    it('intro sans DOM cutscene : pas de callback fin (flag intro preserve)', async () => {
        elements.delete('ecran-histoire-cutscene');
        const { afficherCutsceneHistoire } = await import('../js/histoire-manager-ui.js');
        const onFin = vi.fn();

        const demarre = afficherCutsceneHistoire(['Jour 2 554.'], ['narrateur'], onFin, {
            intro: true,
        });

        expect(demarre).toBe(false);
        expect(onFin).not.toHaveBeenCalled();
    });
});
