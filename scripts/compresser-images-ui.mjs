/** Recompression PNG accueil (audit A — precache). */
import sharp from 'sharp';
import { readFileSync, statSync, writeFileSync } from 'fs';

const FOND = { r: 18, g: 8, b: 24, alpha: 1 };

const CIBLES = [
    { chemin: 'assets/splash-chargement.png', largeurMax: 512 },
    { chemin: 'img/robo-accueil.png', largeurMax: 640 },
    { chemin: 'img/vera.png', largeurMax: 360 },
];

for (const { chemin, largeurMax } of CIBLES) {
    const avant = statSync(chemin).size;
    const meta = await sharp(readFileSync(chemin)).metadata();
    const largeur = meta.width && meta.width > largeurMax ? largeurMax : meta.width;
    const buffer = await sharp(readFileSync(chemin))
        .resize(largeur, null, { fit: 'inside', withoutEnlargement: true, background: FOND })
        .png({ compressionLevel: 9, palette: true, quality: 82, effort: 10 })
        .toBuffer();
    writeFileSync(chemin, buffer);
    const apres = statSync(chemin).size;
    console.log(`${chemin}: ${Math.round(avant / 1024)} Ko → ${Math.round(apres / 1024)} Ko`);
}

console.log('Images UI recompressees');
