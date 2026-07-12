import { store } from '../etat/store-jeu.js';
import { AudioMoteur } from '../audio/audio.js';
import {
    bufferiserInput,
    mettreAJourGameFeel,
    pieceControlesActifs,
    areActive,
    coyoteActif,
    graceSpawnActive,
    demarrerAre,
    activerPieceAuSol,
    quitterSolPiece,
} from '../logique/game-feel-jeu.js';

export function initialiserJournalSfxTest() {
    const journalSfx = [];
    const sonOrig = AudioMoteur.son.bind(AudioMoteur);
    if (!AudioMoteur._journalSfxTest) {
        AudioMoteur._journalSfxTest = journalSfx;
        AudioMoteur.son = (type) => {
            journalSfx.push(type);
            return sonOrig(type);
        };
    }
}

export function creerHandlersGameFeel() {
    return {
        obtenirGameFeel: () => ({
            areRestant: store.areRestant,
            coyoteRestant: store.coyoteRestant,
            spawnGraceRestant: store.spawnGraceRestant,
            inputBuffer: [...store.inputBuffer],
        }),
        bufferiserInputTest: (action) => bufferiserInput(action),
        tickGameFeel: (deltaMs) => mettreAJourGameFeel(deltaMs),
        forcerAreTest: () => demarrerAre(),
        pieceControlesActifsTest: () => pieceControlesActifs(),
        areActiveTest: () => areActive(),
        coyoteActifTest: () => coyoteActif(),
        graceSpawnActiveTest: () => graceSpawnActive(),
        activerPieceAuSolTest: () => activerPieceAuSol(),
        quitterSolPieceTest: () => quitterSolPiece(),
        obtenirJournalSfxTest: () => [...(AudioMoteur._journalSfxTest ?? [])],
        viderJournalSfxTest: () => {
            AudioMoteur._journalSfxTest?.splice(0);
        },
        verifierSamplesBossCharges: async () => {
            AudioMoteur.init();
            await AudioMoteur.prechargerEffetsBossSamples?.();
            const { EFFETS_BOSS_SAMPLES, effetBossSampleCharge } =
                await import('../audio/audio-fichiers-effets-boss.js');
            return EFFETS_BOSS_SAMPLES.map((type) => ({
                type,
                charge: effetBossSampleCharge(type),
            }));
        },
    };
}
