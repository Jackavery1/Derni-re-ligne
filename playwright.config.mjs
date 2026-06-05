export default {
    testDir: './e2e',
    timeout: 30000,
    use: {
        baseURL: 'http://127.0.0.1:3000',
        headless: true,
    },
    webServer: {
        command: 'npx --yes serve . -p 3000',
        url: 'http://127.0.0.1:3000',
        reuseExistingServer: true,
    },
};
