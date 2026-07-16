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
            'dist-test/**',
            'dist-test-bundle/**',
            'scripts/_*-temp.mjs',
            '_audit-glyphes-output/**',
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
        files: ['sw.js', 'sw-precache.js'],
        languageOptions: {
            globals: {
                ...globals.serviceworker,
                FICHIERS_A_CACHER: 'readonly',
            },
        },
        rules: {
            'max-lines': 'off',
            complexity: 'off',
        },
    },
    {
        files: ['sw-precache-list.js'],
        rules: {
            'max-lines': 'off',
            'no-unused-vars': ['warn', { varsIgnorePattern: '^FICHIERS_A_CACHER$' }],
        },
    },
];
