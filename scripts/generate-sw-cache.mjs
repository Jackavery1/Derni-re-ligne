import { execSync } from 'child_process';

console.warn('generate-sw-cache.mjs est deprecie — utilisation de generer-precache.mjs');
execSync('node scripts/generer-precache.mjs', { stdio: 'inherit' });
