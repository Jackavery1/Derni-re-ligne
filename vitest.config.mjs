import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        include: ['tests/**/*.test.mjs'],
        setupFiles: ['tests/setup.mjs'],
        coverage: {
            provider: 'v8',
            include: [
                'js/logique-pure.js',
                'js/progression.js',
                'js/piece-jeu.js',
                'js/moteur-piece.js',
                'js/achievements.js',
                'js/logique-partie.js',
                'js/oracle-jeu.js',
                'js/coop-logique.js',
            ],
            thresholds: {
                lines: 45,
                functions: 55,
                statements: 45,
                branches: 38,
            },
        },
    },
});
