import { readFileSync, writeFileSync, mkdirSync } from 'fs';

const html = readFileSync('index.html', 'utf8');
const lines = html.split('\n');

const extraits = [
    ['ecran-titre', 36, 136],
    ['ecran-achievements', 137, 153],
    ['ecran-profil', 154, 238],
    ['ecran-codex', 239, 282],
    ['ecran-selection', 283, 311],
    ['ecran-options', 312, 427],
    ['ecran-pause', 428, 476],
    ['ecran-game-over', 477, 563],
    ['overlays', 568, 596],
    ['interface-jeu', 601, 931],
    ['controles', 936, 992],
];

mkdirSync('html', { recursive: true });

for (const [nom, debut, fin] of extraits) {
    const contenu = lines
        .slice(debut, fin + 1)
        .join('\n')
        .trim();
    writeFileSync(`html/${nom}.html`, contenu + '\n');
    console.log(`html/${nom}.html`, fin - debut + 1, 'lignes');
}

const entete = lines.slice(0, 33).join('\n');
const pied = `
        <div id="conteneur-ecrans"></div>

        <script type="module" src="js/main.js?v=2.4.2"></script>
    </body>
</html>
`;

writeFileSync('index.html', entete + pied);
console.log('index.html réduit à', entete.split('\n').length + 4, 'lignes');
