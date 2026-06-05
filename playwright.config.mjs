const serveDist = process.env.E2E_DIST === '1';

export default {
    testDir: './e2e',
    timeout: 30000,
    use: {
        baseURL: 'http://127.0.0.1:3000',
        headless: true,
    },
    webServer: {
        command: serveDist ? 'npx --yes serve dist -p 3000' : 'npx --yes serve . -p 3000',
        url: 'http://127.0.0.1:3000',
        reuseExistingServer: !process.env.CI,
    },
};
