import { readFileSync } from 'fs';

const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
const version = pkg.version;

/** @type {string[]} */
const erreurs = [];

const index = readFileSync('index.html', 'utf8');
if (!index.includes(`js/main.js?v=${version}`)) {
    erreurs.push(`index.html (attendu main.js?v=${version})`);
}

const sw = readFileSync('sw.js', 'utf8');
if (!sw.includes('VERSION_SHELL')) {
    erreurs.push('sw.js VERSION_SHELL manquant');
}
if (!sw.includes('VERSION_MEDIAS')) {
    erreurs.push('sw.js VERSION_MEDIAS manquant');
}
if (!sw.includes('PRECACHE:DEBUT')) {
    erreurs.push('sw.js marqueurs PRECACHE manquants');
}

const readme = readFileSync('README.md', 'utf8');
if (!readme.includes(`**Version : ${version}**`)) {
    erreurs.push('README.md');
}

const changelog = readFileSync('CHANGELOG.md', 'utf8');
if (!changelog.includes(`## [${version}]`)) {
    erreurs.push(`CHANGELOG.md (section [${version}] manquante)`);
}

if (erreurs.length > 0) {
    console.error('Versions desalignees :');
    erreurs.forEach((e) => console.error(`  - ${e}`));
    process.exit(1);
}

console.log(`Versions alignees sur ${version}`);
