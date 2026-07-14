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
    '**/histoire-responsive.spec.mjs',
    '**/histoire-responsive-d8.spec.mjs',
];

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
    workers: process.env.CI ? undefined : 1,
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
            grepInvert: /@viewport-mobile-portrait|@viewport-mobile-etroit|@touch-only/,
            use: { ...channelUse, viewport: { width: 1280, height: 800 } },
        },
        {
            name: 'mobile-portrait',
            testMatch: specsMatriceResponsive,
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
            use: { ...channelUse, ...iphone14Chromium },
        },
        {
            name: 'iphone-15-pro',
            testMatch: specsMatriceResponsive,
            use: { ...channelUse, ...iphone15ProChromium },
        },
        {
            name: 'iphone-se',
            testMatch: specsMatriceResponsive,
            use: { ...channelUse, ...iphoneSeChromium },
        },
        {
            name: 'tablet-landscape',
            testMatch: specsMatriceResponsive,
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
