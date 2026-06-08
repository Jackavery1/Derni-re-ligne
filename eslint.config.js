import js from '@eslint/js';
import globals from 'globals';

export default [
    js.configs.recommended,
    {
        ignores: ['node_modules/**', 'coverage/**', 'test-results/**', 'dist/**'],
    },
    {
        files: ['**/*.{js,mjs}'],
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: 'module',
            globals: {
                ...globals.browser,
                ...globals.node,
            },
        },
        rules: {
            'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
            'no-console': 'off',
            complexity: ['warn', 25],
            'max-lines': ['warn', { max: 450, skipBlankLines: true, skipComments: true }],
        },
    },
    {
        files: [
            'js/histoire-donnees.js',
            'js/histoire-textes.js',
            'js/histoire-manager-ui.js',
            'js/portraits-cutscene.js',
            'js/codex-donnees.js',
            'js/codex-illustrations.js',
            'js/codex-illustrations-histoire.js',
            'js/archi-donnees.js',
            'js/boss-rendu.js',
            'js/rendu-robo.js',
            'js/histoire-map-rendu.js',
            'js/rendu-ambiance-particules.js',
        ],
        rules: {
            'max-lines': 'off',
        },
    },
];
