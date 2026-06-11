import { mkdirSync, readdirSync, statSync, existsSync } from 'fs';
import { join, basename, extname } from 'path';
import {
    exigerFfmpeg,
    executerFfmpeg,
    obtenirDureeSecondes,
    formaterKo,
    formaterMo,
} from './media-utils.mjs';

/** 'opus' = Ogg Opus + M4A AAC (chemin A) | 'mp3' = MP3 VBR seul (chemin B) */
const FORMAT_CIBLE = 'opus';

const BUDGET_PISTE_MO = 3.5;
const SOURCE_DIR = 'sources-bruts/musique';
const OUT_DIR = 'assets/musique';
const EXTENSIONS_SOURCE = new Set(['.wav', '.mp3', '.flac', '.m4a', '.aac', '.ogg']);
const NOM_PISTE_VALIDE = /^[a-z0-9]+(?:_[a-z0-9]+)*$/;

const FILTRE_AUDIO = '-af';
const LOUDNORM = 'loudnorm=I=-14:TP=-1.5';
const SAMPLE_RATE = '44100';
const CANAUX = '2';

/** @type {{ ext: string, args: string[] }[]} */
const SORTIES_PAR_FORMAT = {
    opus: [
        { ext: '.ogg', args: ['-c:a', 'libopus', '-b:a', '112k'] },
        { ext: '.m4a', args: ['-c:a', 'aac', '-b:a', '160k'] },
    ],
    mp3: [{ ext: '.mp3', args: ['-c:a', 'libmp3lame', '-q:a', '2'] }],
};

function listerSources() {
    if (!existsSync(SOURCE_DIR)) return [];
    return readdirSync(SOURCE_DIR)
        .filter((f) => EXTENSIONS_SOURCE.has(extname(f).toLowerCase()))
        .sort();
}

function validerNomPiste(nomBase) {
    if (!NOM_PISTE_VALIDE.test(nomBase)) {
        console.warn(`  REFUSE — nom invalide : "${nomBase}" (attendu : {mondeId}.{ext})`);
        return false;
    }
    return true;
}

function sortiesAttendues(nomBase) {
    const modeles = SORTIES_PAR_FORMAT[FORMAT_CIBLE] ?? SORTIES_PAR_FORMAT.opus;
    return modeles.map(({ ext }) => join(OUT_DIR, `${nomBase}${ext}`));
}

function doitReconvertir(cheminSource, cheminsSortie) {
    if (cheminsSortie.some((s) => !existsSync(s))) return true;
    const mtimeSource = statSync(cheminSource).mtimeMs;
    return cheminsSortie.some((s) => statSync(s).mtimeMs < mtimeSource);
}

function convertirPiste(ffmpeg, fichierSource) {
    const cheminSource = join(SOURCE_DIR, fichierSource);
    const nomBase = basename(fichierSource, extname(fichierSource));

    if (!validerNomPiste(nomBase)) return { ignoree: true };

    const modeles = SORTIES_PAR_FORMAT[FORMAT_CIBLE] ?? SORTIES_PAR_FORMAT.opus;
    const cheminsSortie = modeles.map(({ ext }) => join(OUT_DIR, `${nomBase}${ext}`));

    if (!doitReconvertir(cheminSource, cheminsSortie)) {
        console.log(`  SKIP (a jour) : ${fichierSource}`);
        return { ignoree: false, skip: true };
    }

    const octetsSource = statSync(cheminSource).size;
    const duree = obtenirDureeSecondes(ffmpeg, cheminSource);

    console.log(
        `  CONVERT : ${fichierSource} (${formaterMo(octetsSource)} Mo${duree ? `, ${Math.round(duree)}s` : ''})`
    );

    /** @type {{ ext: string, octets: number }[]} */
    const produits = [];

    for (const { ext, args } of modeles) {
        const cheminSortie = join(OUT_DIR, `${nomBase}${ext}`);
        executerFfmpeg(ffmpeg, [
            '-y',
            '-i',
            cheminSource,
            FILTRE_AUDIO,
            LOUDNORM,
            '-ar',
            SAMPLE_RATE,
            '-ac',
            CANAUX,
            ...args,
            cheminSortie,
        ]);
        const octetsSortie = statSync(cheminSortie).size;
        produits.push({ ext, octets: octetsSortie });

        const moSortie = formaterMo(octetsSortie);
        const alerte = octetsSortie > BUDGET_PISTE_MO * 1024 * 1024 ? ' ALERTE BUDGET' : '';
        console.log(
            `    → ${nomBase}${ext} : ${formaterKo(octetsSource)} Ko → ${formaterKo(octetsSortie)} Ko (${moSortie} Mo)${alerte}`
        );
    }

    return { ignoree: false, skip: false, produits };
}

const ffmpeg = exigerFfmpeg();
mkdirSync(SOURCE_DIR, { recursive: true });
mkdirSync(OUT_DIR, { recursive: true });

const sources = listerSources();

console.log(`\n=== Conversion musique (FORMAT_CIBLE=${FORMAT_CIBLE}) ===\n`);

if (sources.length === 0) {
    console.log(`Aucun fichier dans ${SOURCE_DIR}/`);
    console.log(
        `Deposez vos exports Suno/Udio ({mondeId}.wav) puis relancez npm run media:musique`
    );
    process.exit(0);
}

let converties = 0;
let skip = 0;
let refusees = 0;

for (const fichier of sources) {
    const resultat = convertirPiste(ffmpeg, fichier);
    if (resultat.ignoree) refusees++;
    else if (resultat.skip) skip++;
    else converties++;
}

console.log(`\nTermine : ${converties} convertie(s), ${skip} skip, ${refusees} refusee(s)`);
console.log("\nNote Surtension : le futur gestionnaire-musique choisira l'extension via");
console.log("  audio.canPlayType('audio/ogg; codecs=opus') avec fallback .m4a");
