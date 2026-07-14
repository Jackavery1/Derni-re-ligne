/** @type {import('lighthouse').Config} */
module.exports = {
    ci: {
        collect: {
            url: ['http://127.0.0.1:4173/index.html'],
            startServerCommand: 'npx serve dist -l tcp://127.0.0.1:4173',
            startServerReadyPattern: 'Accepting connections',
            numberOfRuns: 2,
        },
        assert: {
            assertions: {
                'categories:performance': ['error', { minScore: 0.85 }],
                'categories:accessibility': ['error', { minScore: 0.9 }],
                'categories:best-practices': ['error', { minScore: 0.9 }],
                'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
            },
        },
        upload: {
            target: 'temporary-public-storage',
        },
    },
};
