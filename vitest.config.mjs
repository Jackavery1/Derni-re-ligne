import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        include: ['tests/**/*.test.mjs'],
        setupFiles: ['tests/setup.mjs'],
        coverage: {
            provider: 'v8',
            include: ['js/logique-pure.js', 'js/progression.js', 'js/piece-jeu.js'],
            thresholds: {
                lines: 60,
                functions: 60,
                statements: 60,
                branches: 50,
            },
        },
    },
});
