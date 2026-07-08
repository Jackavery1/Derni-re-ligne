import { execSync } from 'child_process';
import { ecrireHistoireTextesJson } from './generer-histoire-json.mjs';

await ecrireHistoireTextesJson();

try {
    execSync('git diff --exit-code data/histoire-textes.json', { stdio: 'inherit' });
} catch {
    console.error(
        'data/histoire-textes.json désynchronisé des modules js/histoire-textes/ — lancez npm run histoire:json puis incluez le JSON dans le commit'
    );
    process.exit(1);
}

console.log('histoire-textes.json à jour (modules JS = artefact généré)');
