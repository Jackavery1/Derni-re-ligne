/** Lighthouse CI — profil mobile (390×844, warn non bloquant). */
module.exports = {
    ci: {
        collect: {
            url: ['http://127.0.0.1:4173/index.html'],
            startServerCommand: 'npx serve dist -l tcp://127.0.0.1:4173',
            startServerReadyPattern: 'Accepting connections',
            numberOfRuns: 1,
            settings: {
                formFactor: 'mobile',
                screenEmulation: {
                    mobile: true,
                    width: 390,
                    height: 844,
                    deviceScaleFactor: 2,
                    disabled: false,
                },
            },
        },
        assert: {
            assertions: {
                'categories:performance': ['error', { minScore: 0.8 }],
                'categories:accessibility': ['error', { minScore: 0.9 }],
                'categories:best-practices': ['error', { minScore: 0.9 }],
            },
        },
        upload: {
            target: 'temporary-public-storage',
        },
    },
};
