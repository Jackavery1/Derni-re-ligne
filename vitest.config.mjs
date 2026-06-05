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
                'js/archi-logique.js',
            ],
            thresholds: {
                lines: 55,
                functions: 60,
                statements: 55,
                branches: 45,
            },
        },
    },
});
