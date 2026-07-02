import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

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

export default {
    testDir: './e2e',
    workers: process.env.CI ? undefined : 1,
    timeout: 30000,
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
        ...(channel !== 'chromium' ? { channel } : {}),
    },
    webServer: {
        command: serveDist
            ? 'npx --yes serve dist -p 3000'
            : 'npx --yes serve . -c serve.json -l tcp://127.0.0.1:3000',
        url: 'http://127.0.0.1:3000',
        cwd: racineProjet,
        reuseExistingServer: process.env.CI !== 'true' && process.env.CI !== '1',
    },
};
