import { execSync } from 'child_process';

function fichiersPousses() {
    try {
        const upstream = execSync('git rev-parse --abbrev-ref @{upstream}', {
            encoding: 'utf8',
        }).trim();
        const range = `${upstream}..HEAD`;
        return execSync(`git diff --name-only ${range}`, { encoding: 'utf8' })
            .split(/\r?\n/)
            .filter(Boolean);
    } catch {
        try {
            return execSync('git diff --name-only HEAD~1..HEAD', { encoding: 'utf8' })
                .split(/\r?\n/)
                .filter(Boolean);
        } catch {
            return [];
        }
    }
}

const touchesDonnees = fichiersPousses().some(
    (f) =>
        f.startsWith('js/histoire-textes/') ||
        f === 'js/histoire-textes.js' ||
        f === 'data/histoire-textes.json' ||
        f.startsWith('data/') ||
        f.startsWith('scripts/generer-') ||
        f.startsWith('scripts/exporter-donnees')
);

if (!touchesDonnees) {
    console.log(
        'pre-push: verify:data ignoré (aucune donnée narrative/export stagée dans le push)'
    );
    process.exit(0);
}

execSync('npm run verify:data', { stdio: 'inherit' });
