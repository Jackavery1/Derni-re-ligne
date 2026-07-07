import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        include: ['tests/**/*.test.mjs'],
        setupFiles: ['tests/setup.mjs'],
        coverage: {
            provider: 'v8',
            include: ['js/**/*.js'],
            exclude: [
                'js/histoire-textes/**',
                'js/histoire-donnees/**',
                'js/codex-illustrations/**',
                'js/archi-donnees/**',
                'js/**/**.fallback.js',
            ],
            thresholds: {
                lines: 55,
                functions: 55,
                statements: 55,
                branches: 55,
            },
        },
    },
});
