import { execSync, spawnSync } from 'child_process';
import { existsSync } from 'fs';

/** @returns {string | null} */
export function trouverFfmpeg() {
    const candidats = ['ffmpeg', 'ffmpeg.exe'];
    for (const cmd of candidats) {
        const result = spawnSync(cmd, ['-version'], { encoding: 'utf8', shell: true });
        if (result.status === 0) return cmd;
    }
    return null;
}

export function exigerFfmpeg() {
    const ffmpeg = trouverFfmpeg();
    if (!ffmpeg) {
        console.error('ffmpeg introuvable.');
        console.error('Installation Windows (winget) :');
        console.error('  winget install --id Gyan.FFmpeg -e');
        console.error('Puis redemarrer le terminal et relancer la commande.');
        process.exit(1);
    }
    return ffmpeg;
}

/**
 * @param {string} ffmpeg
 * @param {string[]} args
 */
export function executerFfmpeg(ffmpeg, args) {
    execSync(`"${ffmpeg}" ${args.map((a) => `"${a}"`).join(' ')}`, {
        stdio: 'inherit',
        shell: true,
    });
}

/**
 * @param {string} ffmpeg
 * @param {string} fichier
 * @returns {number | null}
 */
export function obtenirDureeSecondes(ffmpeg, fichier) {
    const result = spawnSync(ffmpeg, ['-i', fichier, '-f', 'null', '-hide_banner', '-'], {
        encoding: 'utf8',
        shell: true,
    });
    const sortie = `${result.stderr ?? ''}${result.stdout ?? ''}`;
    const match = sortie.match(/Duration:\s*(\d+):(\d+):(\d+(?:\.\d+)?)/);
    if (!match) return null;
    return Number(match[1]) * 3600 + Number(match[2]) * 60 + Number(match[3]);
}

/**
 * @param {number} octets
 */
export function formaterMo(octets) {
    return Math.round((octets / (1024 * 1024)) * 100) / 100;
}

/**
 * @param {number} octets
 */
export function formaterKo(octets) {
    return Math.round((octets / 1024) * 10) / 10;
}
