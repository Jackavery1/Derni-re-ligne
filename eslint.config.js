import js from '@eslint/js';
import globals from 'globals';

export default [
    js.configs.recommended,
    {
        ignores: [
            'node_modules/**',
            'coverage/**',
            'test-results/**',
            'dist/**',
            'scripts/histoire-manager-ui.original.js',
        ],
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
            'js/histoire-textes.js',
            'js/portraits-cutscene.js',
            'js/portraits-cutscene-personnages.js',
            'js/boss-rendu.js',
            'js/icones-pixel.js',
            'js/coop-logique.js',
        ],
        rules: {
            'max-lines': 'off',
            complexity: 'off',
        },
    },
];
