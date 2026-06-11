import { mkdirSync, readdirSync, statSync, existsSync } from 'fs';
import { join } from 'path';
import sharp from 'sharp';
import { formaterKo } from './media-utils.mjs';

const BUDGET_SCENE_KO = 200;
const SOURCE_DIR = 'sources-bruts/scenes';
const OUT_DIR = 'assets/cutscenes';
const LARGEUR = 960;
const HAUTEUR = 540;
const NOM_SCENE_VALIDE = /^scene_[a-z0-9_]+\.png$/i;

function listerSources() {
    if (!existsSync(SOURCE_DIR)) return [];
    return readdirSync(SOURCE_DIR)
        .filter((f) => f.toLowerCase().endsWith('.png'))
        .sort();
}

function doitReconvertir(cheminSource, cheminSortie) {
    if (!existsSync(cheminSortie)) return true;
    return statSync(cheminSortie).mtimeMs < statSync(cheminSource).mtimeMs;
}

async function convertirScene(fichierSource) {
    const cheminSource = join(SOURCE_DIR, fichierSource);
    const cheminSortie = join(OUT_DIR, fichierSource);

    if (!NOM_SCENE_VALIDE.test(fichierSource)) {
        console.warn(`  REFUSE — nom invalide : "${fichierSource}" (attendu : scene_<id>.png)`);
        return { ignoree: true };
    }

    if (!doitReconvertir(cheminSource, cheminSortie)) {
        console.log(`  SKIP (a jour) : ${fichierSource}`);
        return { ignoree: false, skip: true };
    }

    const octetsSource = statSync(cheminSource).size;
    console.log(`  CONVERT : ${fichierSource} (${formaterKo(octetsSource)} Ko)`);

    await sharp(cheminSource)
        .resize(LARGEUR, HAUTEUR, {
            fit: 'cover',
            position: 'centre',
            kernel: sharp.kernel.nearest,
        })
        .png({
            palette: true,
            colors: 256,
            quality: 80,
            compressionLevel: 9,
            effort: 10,
        })
        .toFile(cheminSortie);

    const octetsSortie = statSync(cheminSortie).size;
    const alerte = octetsSortie > BUDGET_SCENE_KO * 1024 ? ' ALERTE BUDGET' : '';
    console.log(
        `    → ${fichierSource} : ${formaterKo(octetsSource)} Ko → ${formaterKo(octetsSortie)} Ko (${LARGEUR}×${HAUTEUR}, nearest)${alerte}`
    );

    return { ignoree: false, skip: false };
}

mkdirSync(SOURCE_DIR, { recursive: true });
mkdirSync(OUT_DIR, { recursive: true });

const sources = listerSources();
/** @type {string[]} */
const malNommes = readdirSync(SOURCE_DIR, { withFileTypes: true })
    .filter((e) => e.isFile() && !e.name.endsWith('.gitkeep'))
    .map((e) => e.name)
    .filter((f) => !f.toLowerCase().endsWith('.png') || !NOM_SCENE_VALIDE.test(f));

console.log(`\n=== Conversion scenes cutscene ===\n`);

if (malNommes.length > 0) {
    console.log('Fichiers refuses (nommage) :');
    for (const f of malNommes) console.log(`  - ${f}`);
    console.log('');
}

if (sources.length === 0) {
    console.log(`Aucun PNG valide dans ${SOURCE_DIR}/`);
    console.log(`Deposez vos exports Leonardo (scene_<id>.png) puis relancez npm run media:scenes`);
    process.exit(malNommes.length > 0 ? 1 : 0);
}

let converties = 0;
let skip = 0;
let refusees = malNommes.length;

for (const fichier of sources) {
    const resultat = await convertirScene(fichier);
    if (resultat.ignoree) refusees++;
    else if (resultat.skip) skip++;
    else converties++;
}

console.log(`\nTermine : ${converties} convertie(s), ${skip} skip, ${refusees} refusee(s)`);
process.exit(refusees > 0 && converties === 0 && skip === 0 ? 1 : 0);
