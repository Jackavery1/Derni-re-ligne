import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { defineConfig, devices } from '@playwright/test';

const racineProjet = dirname(fileURLToPath(import.meta.url));

const serveDist = process.env.E2E_DIST === '1';

/** @returns {string | undefined} */
function detecterChannelNavigateur() {
    if (process.env.PW_CHANNEL) return process.env.PW_CHANNEL;
    if (process.env.CI) return 'chromium';

    const candidats = [
        { channel: 'chrome', path: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe' },
        {
            channel: 'chrome',
            path: join(
                process.env.LOCALAPPDATA ?? '',
                'Google',
                'Chrome',
                'Application',
                'chrome.exe'
            ),
        },
        {
            channel: 'msedge',
            path: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
        },
        {
            channel: 'msedge',
            path: join(
                process.env.ProgramFiles ?? '',
                'Microsoft',
                'Edge',
                'Application',
                'msedge.exe'
            ),
        },
    ];

    for (const { channel, path } of candidats) {
        if (path && existsSync(path)) return channel;
    }
    return 'chromium';
}

const channel = detecterChannelNavigateur();
const channelUse = channel !== 'chromium' ? { channel } : {};

const specsMatriceResponsive = [
    '**/audit-c-responsive.spec.mjs',
    '**/audit-c-responsive-encoche.spec.mjs',
    '**/histoire-responsive.spec.mjs',
    '**/histoire-responsive-d8.spec.mjs',
    '**/histoire-responsive-encoche.spec.mjs',
    '**/histoire-carte-mobile.spec.mjs',
];

/** Desktop : tests portrait / touch exclus (paysage reste sur desktop). */
const grepInvertDesktop = /@viewport-mobile-portrait|@viewport-mobile-etroit|@touch-only/;

/** Projets mobile portrait : tests paysage exclus. */
const grepPortraitMatrice = /@viewport-mobile-portrait|@viewport-mobile-etroit|@touch-only/;
const grepInvertPortraitMatrice = /@desktop-only|@viewport-mobile-landscape/;

/** Projets mobile paysage : tests portrait exclus. */
const grepLandscapeMatrice = /@viewport-mobile-landscape/;
const grepInvertLandscapeMatrice =
    /@desktop-only|@viewport-mobile-portrait|@viewport-mobile-etroit|@touch-only/;

const iphone14Chromium = {
    viewport: devices['iPhone 14'].viewport,
    userAgent: devices['iPhone 14'].userAgent,
    deviceScaleFactor: devices['iPhone 14'].deviceScaleFactor,
    isMobile: true,
    hasTouch: true,
};

const iphone15ProChromium = {
    viewport: devices['iPhone 15 Pro'].viewport,
    userAgent: devices['iPhone 15 Pro'].userAgent,
    deviceScaleFactor: devices['iPhone 15 Pro'].deviceScaleFactor,
    isMobile: true,
    hasTouch: true,
};

const iphoneSeChromium = {
    viewport: devices['iPhone SE'].viewport,
    userAgent: devices['iPhone SE'].userAgent,
    deviceScaleFactor: devices['iPhone SE'].deviceScaleFactor,
    isMobile: true,
    hasTouch: true,
};

const webServer = {
    command: serveDist
        ? 'npx --yes serve dist -p 3000'
        : 'npx --yes serve . -c serve.json -l tcp://127.0.0.1:3000',
    url: 'http://127.0.0.1:3000',
    cwd: racineProjet,
    reuseExistingServer: process.env.CI !== 'true' && process.env.CI !== '1',
};

export default defineConfig({
    testDir: './e2e',
    // CI : plafonner pour éviter contention CPU/IO (chargement / typewriter flaky).
    workers: process.env.CI ? 2 : 1,
    timeout: 25000,
    retries: process.env.CI ? 1 : 0,
    snapshotPathTemplate: '{testDir}/__snapshots__/{testFilePath}/{arg}{ext}',
    expect: {
        toHaveScreenshot: {
            maxDiffPixelRatio: 0.02,
            animations: 'disabled',
        },
    },
    use: {
        baseURL: 'http://127.0.0.1:3000',
        headless: true,
    },
    webServer,
    projects: [
        {
            name: 'desktop',
            grepInvert: grepInvertDesktop,
            use: { ...channelUse, viewport: { width: 1280, height: 800 } },
        },
        {
            name: 'mobile-portrait',
            testMatch: specsMatriceResponsive,
            grep: grepPortraitMatrice,
            grepInvert: grepInvertPortraitMatrice,
            use: {
                ...channelUse,
                viewport: { width: 390, height: 844 },
                hasTouch: true,
                isMobile: true,
            },
        },
        {
            name: 'mobile-landscape',
            testMatch: specsMatriceResponsive,
            grep: grepLandscapeMatrice,
            grepInvert: grepInvertLandscapeMatrice,
            use: {
                ...channelUse,
                viewport: { width: 667, height: 375 },
                hasTouch: true,
                isMobile: true,
            },
        },
        {
            name: 'iphone-14',
            testMatch: specsMatriceResponsive,
            grep: grepPortraitMatrice,
            grepInvert: grepInvertPortraitMatrice,
            use: { ...channelUse, ...iphone14Chromium },
        },
        {
            name: 'iphone-15-pro',
            testMatch: specsMatriceResponsive,
            grep: grepPortraitMatrice,
            grepInvert: grepInvertPortraitMatrice,
            use: { ...channelUse, ...iphone15ProChromium },
        },
        {
            name: 'iphone-se',
            testMatch: specsMatriceResponsive,
            grep: grepPortraitMatrice,
            grepInvert: grepInvertPortraitMatrice,
            use: { ...channelUse, ...iphoneSeChromium },
        },
        {
            name: 'tablet-landscape',
            testMatch: specsMatriceResponsive,
            grep: grepLandscapeMatrice,
            grepInvert: grepInvertLandscapeMatrice,
            use: {
                ...channelUse,
                viewport: { width: 1024, height: 768 },
                hasTouch: true,
                isMobile: true,
            },
        },
        {
            name: 'mobile-portrait-visuels',
            grep: /@viewport-mobile-portrait/,
            testMatch: '**/visual.spec.mjs',
            use: {
                ...channelUse,
                viewport: { width: 390, height: 844 },
                hasTouch: true,
                isMobile: true,
            },
        },
        {
            name: 'mobile-etroit-visuels',
            grep: /@viewport-mobile-etroit/,
            testMatch: '**/visual.spec.mjs',
            use: {
                ...channelUse,
                viewport: { width: 319, height: 568 },
                hasTouch: true,
                isMobile: true,
            },
        },
    ],
});
