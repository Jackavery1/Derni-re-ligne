/** Recompression PNG icônes PWA (audit A — precache). */
import sharp from 'sharp';
import { readFileSync, statSync } from 'fs';

const SOURCE = 'assets/splash-chargement.png';
const FOND = { r: 18, g: 8, b: 24, alpha: 1 };

const CIBLES = [
    { chemin: 'img/icon-192.png', taille: 192 },
    { chemin: 'img/icon-512.png', taille: 512 },
    { chemin: 'img/icon-maskable-512.png', taille: 512, maskable: true },
];

const source = readFileSync(SOURCE);

for (const { chemin, taille, maskable } of CIBLES) {
    const avant = statSync(chemin).size;
    let pipeline = sharp(source).resize(taille, taille, { fit: 'contain', background: FOND });
    if (maskable) {
        const inset = Math.round(taille * 0.1);
        const inner = taille - inset * 2;
        pipeline = sharp(source).resize(inner, inner, { fit: 'contain', background: FOND }).extend({
            top: inset,
            bottom: inset,
            left: inset,
            right: inset,
            background: FOND,
        });
    }
    await pipeline.png({ compressionLevel: 9, palette: true, quality: 80 }).toFile(chemin);
    const apres = statSync(chemin).size;
    console.log(`${chemin}: ${Math.round(avant / 1024)} Ko → ${Math.round(apres / 1024)} Ko`);
}

console.log('Icones PWA recompressees');
