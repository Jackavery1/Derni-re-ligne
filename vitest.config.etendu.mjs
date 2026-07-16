import { defineConfig } from 'vitest/config';
import vitestConfig, { COVERAGE_ETENDU_EXCLUS_SEUIL_80 } from './vitest.config.mjs';

const COVERAGE_LOGIC = vitestConfig.test.coverage.include;

export default defineConfig({
    test: {
        include: ['tests/**/*.test.mjs'],
        setupFiles: ['tests/setup.mjs'],
        coverage: {
            provider: 'v8',
            include: [...COVERAGE_LOGIC, ...COVERAGE_ETENDU_EXCLUS_SEUIL_80],
            exclude: [
                'js/histoire-textes/**',
                'js/histoire-donnees/**',
                'js/codex-illustrations/**',
                'js/archi-donnees/**',
                'js/**/**.fallback.js',
            ],
            thresholds: {
                lines: 60,
                functions: 60,
                statements: 60,
                branches: 60,
            },
        },
    },
});
