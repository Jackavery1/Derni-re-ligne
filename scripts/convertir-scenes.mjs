import {
    mkdirSync,
    readdirSync,
    statSync,
    existsSync,
    renameSync,
    unlinkSync,
    writeFileSync,
    readFileSync,
} from 'fs';
import { join, basename, extname } from 'path';
import sharp from 'sharp';
import { formaterKo } from './media-utils.mjs';

const BUDGET_SCENE_KO = 200;
const SOURCE_DIR = 'sources-bruts/scenes';
const OUT_DIR = 'assets/cutscenes';
const LARGEUR = 960;
const HAUTEUR = 540;
const RATIO_16_9 = 16 / 9;
const EXTENSIONS_SOURCE = new Set(['.png', '.jpg', '.jpeg']);
const NOM_SCENE_VALIDE = /^scene_[a-z0-9_]+\.(png|jpe?g)$/i;
const PALETTE_TAILLES = [256, 192, 128];
const FORCE_RECONVERSION = process.argv.includes('--force');

const GRAVITE_RECADRAGE = {
    scene_seuil_avantgarde: 'bas',
    scene_fragmentation: 0.62,
    scene_vide_errance: 0.6,
    scene_observatoire: 'centre',
    scene_labo: 'centre',
    scene_trame: 'centre',
    scene_seuil_brasier: 'centre',
    scene_seuil_sentinelle: 'centre',
    scene_seuil_archiviste: 'centre',
};

/**
 * @param {number} r
 * @param {number} g
 * @param {number} b
 */
function luminance(r, g, b) {
    return 0.299 * r + 0.587 * g + 0.114 * b;
}

/**
 * @param {Buffer} data
 * @param {number} width
 * @param {number} height
 * @param {number} channels
 */
function detecterLetterbox(data, width, height, channels) {
    const seuilLuminance = 8;
    const ratioPixelsNoirs = 0.95;
    const seuilHauteurPx = height * 0.02;

    /** @param {number} y */
    function rangeeQuasiNoire(y) {
        let noirs = 0;
        for (let x = 0; x < width; x++) {
            const i = (y * width + x) * channels;
            if (luminance(data[i], data[i + 1], data[i + 2]) < seuilLuminance) noirs++;
        }
        return noirs / width >= ratioPixelsNoirs;
    }

    let haut = 0;
    while (haut < height && rangeeQuasiNoire(haut)) haut++;

    let bas = 0;
    while (bas < height - haut && rangeeQuasiNoire(height - 1 - bas)) bas++;

    return {
        haut: haut >= seuilHauteurPx ? haut : 0,
        bas: bas >= seuilHauteurPx ? bas : 0,
    };
}

/**
 * @param {number} largeur
 * @param {number} hauteur
 * @param {string | number} gravite
 */
function calculerFenetre169(largeur, hauteur, gravite) {
    const ratioSource = largeur / hauteur;

    if (ratioSource > RATIO_16_9) {
        const cropW = Math.round(hauteur * RATIO_16_9);
        const left = Math.round((largeur - cropW) / 2);
        return { left, top: 0, width: cropW, height: hauteur };
    }

    const cropH = Math.round(largeur / RATIO_16_9);
    let top;

    if (gravite === 'bas') {
        top = hauteur - cropH;
    } else if (gravite === 'haut') {
        top = 0;
    } else if (gravite === 'centre') {
        top = Math.round((hauteur - cropH) / 2);
    } else if (typeof gravite === 'number') {
        const centreY = gravite * hauteur;
        top = Math.round(centreY - cropH / 2);
    } else {
        top = Math.round((hauteur - cropH) / 2);
    }

    top = Math.max(0, Math.min(top, hauteur - cropH));
    return { left: 0, top, width: largeur, height: cropH };
}

/**
 * @param {import('sharp').Sharp} image
 * @param {number} colors
 */
async function quantifierPng(image, colors) {
    return image
        .clone()
        .png({
            palette: true,
            colors,
            quality: 80,
            compressionLevel: 9,
            effort: 10,
        })
        .toBuffer();
}

function listerSources() {
    if (!existsSync(SOURCE_DIR)) return [];

    /** @type {Map<string, string>} */
    const parBase = new Map();

    for (const fichier of readdirSync(SOURCE_DIR).sort()) {
        const ext = extname(fichier).toLowerCase();
        if (!EXTENSIONS_SOURCE.has(ext) || !NOM_SCENE_VALIDE.test(fichier)) continue;

        const base = basename(fichier, ext);
        const existant = parBase.get(base);
        if (!existant) {
            parBase.set(base, fichier);
            continue;
        }

        const extExistant = extname(existant).toLowerCase();
        if (extExistant !== '.png' && ext === '.png') parBase.set(base, fichier);
    }

    return [...parBase.values()].sort();
}

function cheminMetaSource(cheminSortie) {
    return `${cheminSortie}.meta.json`;
}

function lireMetaSource(cheminSortie) {
    const cheminMeta = cheminMetaSource(cheminSortie);
    if (!existsSync(cheminMeta)) return null;
    try {
        return JSON.parse(readFileSync(cheminMeta, 'utf8'));
    } catch {
        return null;
    }
}

function ecrireMetaSource(cheminSource, cheminSortie) {
    const src = statSync(cheminSource);
    writeFileSync(
        cheminMetaSource(cheminSortie),
        JSON.stringify({ mtimeMs: src.mtimeMs, size: src.size })
    );
}

function doitReconvertir(cheminSource, cheminSortie) {
    if (FORCE_RECONVERSION) return true;
    if (!existsSync(cheminSortie)) return true;

    const src = statSync(cheminSource);
    const meta = lireMetaSource(cheminSortie);
    if (meta && meta.mtimeMs === src.mtimeMs && meta.size === src.size) return false;

    if (!meta) return statSync(cheminSortie).mtimeMs < src.mtimeMs;
    return true;
}

function formatGravite(gravite) {
    if (typeof gravite === 'number') return gravite.toFixed(2);
    return gravite;
}

/**
 * @param {string} idScene
 * @param {string} cheminSortie
 * @param {string} graviteLabel
 */
async function rapportSceneSkip(idScene, cheminSortie, graviteLabel, cheminSource) {
    if (!lireMetaSource(cheminSortie)) ecrireMetaSource(cheminSource, cheminSortie);
    const meta = await sharp(cheminSortie).metadata();
    const octetsSortie = statSync(cheminSortie).size;
    return {
        ignoree: false,
        skip: true,
        rapport: {
            scene: idScene,
            source: `${meta.width}×${meta.height} (skip)`,
            letterbox: '—',
            gravite: graviteLabel,
            poids: `${formaterKo(octetsSortie)} Ko`,
            statut: octetsSortie <= BUDGET_SCENE_KO * 1024 ? 'OK' : 'ALERTE',
        },
    };
}

/**
 * @param {string} cheminSource
 * @param {string} idScene
 * @param {number} octetsSource
 * @param {string} formatSource
 */
async function convertirPipelineImage(cheminSource, idScene, octetsSource, formatSource) {
    const cheminSortie = join(OUT_DIR, `${idScene}.png`);
    const cheminTemp = join(OUT_DIR, `.${idScene}.png.tmp`);

    const imageSource = sharp(cheminSource);
    const metaSource = await imageSource.metadata();
    const largeurSource = metaSource.width ?? 0;
    const hauteurSource = metaSource.height ?? 0;

    const { data, info } = await imageSource.clone().ensureAlpha().raw().toBuffer({
        resolveWithObject: true,
    });

    const letterbox = detecterLetterbox(data, info.width, info.height, info.channels);
    if (letterbox.haut > 0 || letterbox.bas > 0) {
        console.log(`    letterbox detectee : ${letterbox.haut} px haut / ${letterbox.bas} px bas`);
    }

    const cropLetterbox = {
        left: 0,
        top: letterbox.haut,
        width: info.width,
        height: info.height - letterbox.haut - letterbox.bas,
    };

    if (cropLetterbox.height <= 0 || cropLetterbox.width <= 0) {
        throw new Error('image invalide apres rognage letterbox');
    }

    const gravite = GRAVITE_RECADRAGE[idScene] ?? 'centre';
    const fenetre = calculerFenetre169(cropLetterbox.width, cropLetterbox.height, gravite);
    const extractFinal = {
        left: cropLetterbox.left + fenetre.left,
        top: cropLetterbox.top + fenetre.top,
        width: fenetre.width,
        height: fenetre.height,
    };

    if (fenetre.width < LARGEUR || fenetre.height < HAUTEUR) {
        console.warn(
            `    AVERT — zone 16:9 ${fenetre.width}×${fenetre.height} < ${LARGEUR}×${HAUTEUR}, upscale nearest`
        );
    }

    const image = sharp(cheminSource).extract(extractFinal).resize(LARGEUR, HAUTEUR, {
        kernel: sharp.kernel.nearest,
    });

    let bufferFinal = null;
    let paletteUtilisee = PALETTE_TAILLES[0];

    for (const colors of PALETTE_TAILLES) {
        const buffer = await quantifierPng(image, colors);
        bufferFinal = buffer;
        paletteUtilisee = colors;
        if (buffer.length <= BUDGET_SCENE_KO * 1024) break;
    }

    if (!bufferFinal) {
        throw new Error('echec quantification PNG');
    }

    if (paletteUtilisee !== PALETTE_TAILLES[0]) {
        console.log(
            `    palette reduite a ${paletteUtilisee} couleurs (budget ${BUDGET_SCENE_KO} Ko)`
        );
    }

    writeFileSync(cheminTemp, bufferFinal);
    renameSync(cheminTemp, cheminSortie);
    ecrireMetaSource(cheminSource, cheminSortie);

    const octetsSortie = bufferFinal.length;
    const alerteBudget = octetsSortie > BUDGET_SCENE_KO * 1024;
    const statut = alerteBudget ? 'ALERTE' : 'OK';

    console.log(
        `    → ${idScene}.png : ${formaterKo(octetsSource)} Ko → ${formaterKo(octetsSortie)} Ko (${LARGEUR}×${HAUTEUR}, gravite ${formatGravite(gravite)}, ${paletteUtilisee} couleurs)${alerteBudget ? ' ALERTE BUDGET' : ''}`
    );

    return {
        ignoree: false,
        skip: false,
        rapport: {
            scene: idScene,
            source: `${largeurSource}×${hauteurSource} ${formatSource}`,
            letterbox:
                letterbox.haut > 0 || letterbox.bas > 0
                    ? `${letterbox.haut}/${letterbox.bas} px`
                    : '0/0',
            gravite: formatGravite(gravite),
            poids: `${formaterKo(octetsSortie)} Ko`,
            statut,
        },
    };
}

/**
 * @param {string} fichierSource
 * @returns {Promise<{
 *   ignoree?: boolean,
 *   skip?: boolean,
 *   echec?: boolean,
 *   rapport?: Record<string, unknown>
 * }>}
 */
async function convertirScene(fichierSource) {
    const cheminSource = join(SOURCE_DIR, fichierSource);
    const extSource = extname(fichierSource).toLowerCase();
    const idScene = basename(fichierSource, extSource);
    const fichierSortie = `${idScene}.png`;
    const cheminSortie = join(OUT_DIR, fichierSortie);
    const cheminTemp = join(OUT_DIR, `.${fichierSortie}.tmp`);

    if (!NOM_SCENE_VALIDE.test(fichierSource)) {
        console.warn(
            `  REFUSE — nom invalide : "${fichierSource}" (attendu : scene_<id>.png|.jpg|.jpeg)`
        );
        return { ignoree: true };
    }

    if (!doitReconvertir(cheminSource, cheminSortie)) {
        console.log(`  SKIP (a jour) : ${fichierSource}`);
        const gravite = GRAVITE_RECADRAGE[idScene] ?? 'centre';
        return await rapportSceneSkip(idScene, cheminSortie, formatGravite(gravite), cheminSource);
    }

    const octetsSource = statSync(cheminSource).size;
    const formatSource = extSource === '.png' ? 'PNG' : 'JPG';
    console.log(`  CONVERT : ${fichierSource} (${formaterKo(octetsSource)} Ko, ${formatSource})`);

    if (formatSource === 'JPG') {
        console.warn('    AVERT — source JPG : qualite reduite, preferer PNG si disponible');
    }

    try {
        return await convertirPipelineImage(cheminSource, idScene, octetsSource, formatSource);
    } catch (erreur) {
        if (existsSync(cheminTemp)) unlinkSync(cheminTemp);
        console.error(
            `  ECHEC : ${fichierSource} — ${erreur instanceof Error ? erreur.message : erreur}`
        );
        return { ignoree: false, echec: true };
    }
}

function afficherRapport(lignes) {
    if (lignes.length === 0) return;

    const colonnes = [
        { cle: 'scene', titre: 'Scene', largeur: 24 },
        { cle: 'source', titre: 'Source', largeur: 18 },
        { cle: 'letterbox', titre: 'Letterbox', largeur: 12 },
        { cle: 'gravite', titre: 'Gravite', largeur: 8 },
        { cle: 'poids', titre: 'Poids', largeur: 10 },
        { cle: 'statut', titre: 'Statut', largeur: 7 },
    ];

    console.log('\n=== Rapport scenes ===\n');
    console.log(colonnes.map((c) => c.titre.padEnd(c.largeur)).join(' '));

    for (const ligne of lignes) {
        console.log(colonnes.map((c) => String(ligne[c.cle] ?? '').padEnd(c.largeur)).join(' '));
    }
}

mkdirSync(SOURCE_DIR, { recursive: true });
mkdirSync(OUT_DIR, { recursive: true });

const sources = listerSources();
/** @type {string[]} */
const malNommes = readdirSync(SOURCE_DIR, { withFileTypes: true })
    .filter((e) => e.isFile() && !e.name.endsWith('.gitkeep'))
    .map((e) => e.name)
    .filter((f) => {
        const ext = extname(f).toLowerCase();
        return !EXTENSIONS_SOURCE.has(ext) || !NOM_SCENE_VALIDE.test(f);
    });

console.log(`\n=== Conversion scenes cutscene ===\n`);

if (malNommes.length > 0) {
    console.log('Fichiers refuses (nommage) :');
    for (const f of malNommes) console.log(`  - ${f}`);
    console.log('');
}

if (sources.length === 0) {
    console.log(`Aucune source valide dans ${SOURCE_DIR}/`);
    console.log(
        `Deposez vos exports Leonardo (scene_<id>.png|.jpg|.jpeg) puis relancez npm run media:scenes`
    );
    process.exit(malNommes.length > 0 ? 1 : 0);
}

let converties = 0;
let skip = 0;
let refusees = malNommes.length;
let echecs = 0;
/** @type {Record<string, unknown>[]} */
const rapports = [];

for (const fichier of sources) {
    const resultat = await convertirScene(fichier);
    if (resultat.ignoree) refusees++;
    else if (resultat.echec) echecs++;
    else if (resultat.skip) skip++;
    else converties++;
    if (resultat.rapport) rapports.push(resultat.rapport);
}

afficherRapport(rapports);

console.log(
    `\nTermine : ${converties} convertie(s), ${skip} skip, ${refusees} refusee(s), ${echecs} echec(s)`
);
process.exit(echecs > 0 || (refusees > 0 && converties === 0 && skip === 0) ? 1 : 0);
