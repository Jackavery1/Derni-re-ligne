import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
    PALETTE_BRASIER,
    dessinerPortraitBrasierCanon,
    viderCachePortraitBrasier,
} from '../js/rendu/portrait-brasier-rendu.js';
import {
    PALETTE_SENTINELLE,
    dessinerPortraitSentinelleCanon,
    viderCachePortraitSentinelle,
} from '../js/rendu/portrait-sentinelle-rendu.js';
import {
    PALETTE_ARCHIVISTE,
    dessinerPortraitArchivisteCanon,
    viderCachePortraitArchiviste,
} from '../js/rendu/portrait-archiviste-rendu.js';
import {
    PALETTE_AVANTGARDE,
    dessinerPortraitAvantgardeCanon,
    viderCachePortraitAvantgarde,
} from '../js/rendu/portrait-avantgarde-rendu.js';
import {
    obtenirParamsExpressionPortrait,
    reinitExpressionsCutscene,
} from '../js/expressions-cutscene.js';
import { store } from '../js/etat/store-jeu.js';

function creerCtxMock() {
    const gradient = { addColorStop: vi.fn() };
    return {
        clearRect: vi.fn(),
        fillRect: vi.fn(),
        save: vi.fn(),
        restore: vi.fn(),
        translate: vi.fn(),
        rotate: vi.fn(),
        scale: vi.fn(),
        beginPath: vi.fn(),
        fill: vi.fn(),
        stroke: vi.fn(),
        moveTo: vi.fn(),
        lineTo: vi.fn(),
        quadraticCurveTo: vi.fn(),
        bezierCurveTo: vi.fn(),
        closePath: vi.fn(),
        arc: vi.fn(),
        ellipse: vi.fn(),
        rect: vi.fn(),
        clip: vi.fn(),
        drawImage: vi.fn(),
        createLinearGradient: vi.fn(() => gradient),
        createRadialGradient: vi.fn(() => gradient),
        fillStyle: '',
        strokeStyle: '',
        lineWidth: 1,
        globalAlpha: 1,
        shadowBlur: 0,
        shadowColor: '',
    };
}

const DESSINS = [
    ['brasier', PALETTE_BRASIER, dessinerPortraitBrasierCanon, viderCachePortraitBrasier],
    [
        'sentinelle',
        PALETTE_SENTINELLE,
        dessinerPortraitSentinelleCanon,
        viderCachePortraitSentinelle,
    ],
    [
        'archiviste',
        PALETTE_ARCHIVISTE,
        dessinerPortraitArchivisteCanon,
        viderCachePortraitArchiviste,
    ],
    [
        'avantgarde',
        PALETTE_AVANTGARDE,
        dessinerPortraitAvantgardeCanon,
        viderCachePortraitAvantgarde,
    ],
];

describe('portraits boss canon', () => {
    beforeEach(() => {
        reinitExpressionsCutscene();
        store.histoire.cutscene.enCours = true;
        for (const [, , , vider] of DESSINS) vider();
    });

    it.each(DESSINS)('%s : palette canon et 3 états', (id, palette, dessiner) => {
        expect(Object.keys(palette).length).toBeGreaterThanOrEqual(6);
        for (const humeur of ['calme', 'agressif', 'vacillant']) {
            const ctx = creerCtxMock();
            const params = obtenirParamsExpressionPortrait(`${id}_voix`, humeur, 1000);
            expect(() => dessiner(ctx, 180, 260, 1.2, params)).not.toThrow();
            expect(ctx.clearRect).toHaveBeenCalled();
        }
    });
});
