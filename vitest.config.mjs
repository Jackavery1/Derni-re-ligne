import { defineConfig } from 'vitest/config';

/**
 * Périmètre couverture = logique domaine testable unitairement (>80 % branches).
 * Hors périmètre : voir COVERAGE_ETENDU et `npm run test:coverage:etendu`.
 */
const COVERAGE_LOGIC = [
    'js/logique/logique-pure.js',
    'js/io/progression.js',
    'js/etat/registre-modes.js',
    'js/logique/moteur-piece.js',
    'js/achievements.js',
    'js/logique/logique-partie.js',
    'js/logique/logique-partie-pose.js',
    'js/logique/planificateur-raf.js',
    'js/logique/oracle-placement.js',
    'js/logique/score-partie.js',
    'js/etat/bus-jeu.js',
    'js/rendu/expressions-cutscene.js',
    'js/logique/actions-piece-communes.js',
    'js/histoire/mecaniques-histoire-queries.js',
    'js/rendu/rendu-fond-biome-donnees.js',
    'js/histoire/histoire-etat.js',
    'js/histoire/histoire-manager.js',
    'js/rendu/portraits-cutscene.js',
    'js/rendu/layout-calcul.js',
    'js/logique/coop-game-feel.js',
    'js/logique/gestionnaire-difficulte.js',
    'js/logique/moteur-config-actions.js',
    'js/etat/mode-histoire.js',
    'js/ui/tutoriel-contenus.js',
    'js/logique/safe-area.js',
    'js/rendu/portraits-cutscene-etat.js',
    'js/histoire/histoire-map-briefings-boss.js',
    'js/histoire/histoire-map-fond-donnees.js',
    'js/rendu/rendu-plateau-pieces.js',
    'js/logique/temps-partie.js',
    'js/histoire/histoire-map-rendu.js',
    'js/logique/partie-fin-commun.js',
    'js/logique/partie-fin-constantes.js',
];

export const COVERAGE_ETENDU_EXCLUS_SEUIL_80 = [
    'js/rendu/rendu-fx.js',
    'js/ui/charger-ecrans.js',
    'js/ui/navigation-ecrans.js',
    'js/rendu/boucle-jeu.js',
    'js/logique/effets-partie.js',
];

/** Options pool communes — évite Timeout waiting for worker (suites longues + coverage). */
export const OPTIONS_POOL = {
    pool: 'forks',
    teardownTimeout: 60000,
    hookTimeout: 30000,
    fileParallelism: true,
};

export default defineConfig({
    test: {
        include: ['tests/**/*.test.mjs'],
        setupFiles: ['tests/setup.mjs'],
        ...OPTIONS_POOL,
        coverage: {
            provider: 'v8',
            include: COVERAGE_LOGIC,
            thresholds: {
                lines: 80,
                functions: 80,
                statements: 80,
                branches: 80,
            },
        },
    },
});
