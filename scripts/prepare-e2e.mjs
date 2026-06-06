/**
 * Prépare l'environnement E2E sans téléchargement Playwright si un navigateur
 * système est disponible (contourne les erreurs TLS en environnement proxy).
 */
import { existsSync } from 'fs';
import { spawnSync } from 'child_process';
import { join } from 'path';

const RACINE = join(import.meta.dirname, '..');

/** @type {{ channel: string, binaire: string }[]} */
const CANDIDATS = [
    {
        channel: 'chrome',
        binaire: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    },
    {
        channel: 'chrome',
        binaire: join(
            process.env.LOCALAPPDATA ?? '',
            'Google',
            'Chrome',
            'Application',
            'chrome.exe'
        ),
    },
    {
        channel: 'msedge',
        binaire: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    },
    {
        channel: 'msedge',
        binaire: join(
            process.env.ProgramFiles ?? '',
            'Microsoft',
            'Edge',
            'Application',
            'msedge.exe'
        ),
    },
];

function detecterNavigateur() {
    for (const candidat of CANDIDATS) {
        if (candidat.binaire && existsSync(candidat.binaire)) return candidat;
    }
    return null;
}

function installerChromiumAvecSecoursTls() {
    console.warn(
        'Aucun Chrome/Edge système détecté — tentative de téléchargement Chromium (secours TLS).'
    );
    const env = { ...process.env, NODE_TLS_REJECT_UNAUTHORIZED: '0' };
    const resultat = spawnSync(
        process.platform === 'win32' ? 'npx.cmd' : 'npx',
        ['playwright', 'install', 'chromium'],
        { cwd: RACINE, stdio: 'inherit', env }
    );
    if (resultat.status !== 0) process.exit(resultat.status ?? 1);
}

function main() {
    const nav = detecterNavigateur();
    if (nav) {
        console.log(`E2E : utilisation de ${nav.channel} (${nav.binaire}).`);
        console.log(`Définissez PW_CHANNEL=${nav.channel} pour les exécutions locales.`);
        return;
    }
    installerChromiumAvecSecoursTls();
}

main();
