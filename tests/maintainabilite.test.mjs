import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const racineProjet = join(dirname(fileURLToPath(import.meta.url)), '..');
const racineJs = join(racineProjet, 'js');
const SEUIL_HOTSPOT_LIGNES = 450;
const MARQUEUR_DEBUT = '/* PRECACHE:DEBUT */';
const MARQUEUR_FIN = '/* PRECACHE:FIN */';

const ALLOWLIST_STORE_CORE = new Set([
    'store-core.js',
    'store-jeu.js',
    'store-etat-partie.js',
    'store-refs-canvas.js',
    'accessibilite.js',
    'mode-histoire.js',
]);

function listerFichiersJs(dossier) {
    /** @type {string[]} */
    const fichiers = [];
    for (const entree of readdirSync(dossier, { withFileTypes: true })) {
        const chemin = join(dossier, entree.name);
        if (entree.isDirectory()) {
            fichiers.push(...listerFichiersJs(chemin));
        } else if (entree.name.endsWith('.js')) {
            fichiers.push(chemin);
        }
    }
    return fichiers;
}

function compterLignes(chemin) {
    return readFileSync(chemin, 'utf8').split('\n').length;
}

describe('maintainabilite', () => {
    it('store.histoire.actif est encapsule dans mode-histoire.js', () => {
        for (const chemin of listerFichiersJs(racineJs)) {
            const nom = chemin.split(/[/\\]/).pop();
            if (nom === 'mode-histoire.js') continue;
            const contenu = readFileSync(chemin, 'utf8');
            expect(contenu, chemin).not.toMatch(/store\.histoire\.actif/);
        }
    });

    it('store-core est importe uniquement par la couche etat', () => {
        const violations = [];
        for (const chemin of listerFichiersJs(racineJs)) {
            const nom = chemin.split(/[/\\]/).pop();
            if (ALLOWLIST_STORE_CORE.has(nom)) continue;
            const contenu = readFileSync(chemin, 'utf8');
            if (/from ['"][^'"]*store-core\.js['"]/.test(contenu)) {
                violations.push(
                    chemin.replace(racineJs + '\\', 'js\\').replace(racineJs + '/', 'js/')
                );
            }
        }
        expect(violations, JSON.stringify(violations, null, 2)).toEqual([]);
    });

    it(`aucun module js ne depasse ${SEUIL_HOTSPOT_LIGNES} lignes`, () => {
        const depassements = [];
        for (const chemin of listerFichiersJs(racineJs)) {
            const lignes = compterLignes(chemin);
            if (lignes > SEUIL_HOTSPOT_LIGNES) {
                depassements.push({ chemin: chemin.replace(racineJs + '\\', 'js\\'), lignes });
            }
        }
        expect(depassements, JSON.stringify(depassements, null, 2)).toEqual([]);
    });

    it(`sw.js ne depasse pas ${SEUIL_HOTSPOT_LIGNES} lignes`, () => {
        const lignes = compterLignes(join(racineProjet, 'sw.js'));
        expect(lignes).toBeLessThanOrEqual(SEUIL_HOTSPOT_LIGNES);
    });

    it('feuilles decoupees depuis ecran-selection ne depassent pas 320 lignes', () => {
        const stylesDir = join(racineProjet, 'styles');
        const fichiers = [
            'selection-constellation.css',
            'ecran-options.css',
            'notifs-globales.css',
            'ecran-codex.css',
            'panneau-detail.css',
            'overlays-tutoriel.css',
            'selection-oracle.css',
            'interface-coop.css',
            'ecran-codex-mobile.css',
            'ecran-selection.css',
        ];
        const depassements = [];
        for (const nom of fichiers) {
            const lignes = compterLignes(join(stylesDir, nom));
            if (lignes > 320) depassements.push({ fichier: nom, lignes });
        }
        expect(depassements, JSON.stringify(depassements, null, 2)).toEqual([]);
    });

    it('aucune feuille CSS (hors agregateurs) ne depasse 320 lignes', () => {
        const stylesDir = join(racineProjet, 'styles');
        const agregateurs = new Set([
            'main.css',
            'ecran-titre.css',
            'ecran-selection.css',
            'animations.css',
            'mode-histoire.css',
            'overlays-meta.css',
            'objectifs-histoire.css',
            'boss.css',
            'menu-narratif.css',
            'interface-jeu.css',
            'mode-architecte.css',
        ]);
        const depassements = [];
        for (const nom of readdirSync(stylesDir).filter((f) => f.endsWith('.css'))) {
            if (agregateurs.has(nom)) continue;
            const lignes = compterLignes(join(stylesDir, nom));
            if (lignes > 320) depassements.push({ fichier: nom, lignes });
        }
        expect(depassements, JSON.stringify(depassements, null, 2)).toEqual([]);
    });

    it('feuilles cutscenes decoupees ne depassent pas 320 lignes', () => {
        const cutscenesDir = join(racineProjet, 'assets', 'cutscenes');
        const agregateurs = new Set(['cutscenes.css']);
        const depassements = [];
        for (const nom of readdirSync(cutscenesDir).filter((f) => f.endsWith('.css'))) {
            if (agregateurs.has(nom)) continue;
            const lignes = compterLignes(join(cutscenesDir, nom));
            if (lignes > 320) depassements.push({ fichier: nom, lignes });
        }
        expect(depassements, JSON.stringify(depassements, null, 2)).toEqual([]);
    });

    it('racine js/ — barrels et entrees uniquement (vague 3)', () => {
        const racine = readdirSync(racineJs)
            .filter((f) => f.endsWith('.js'))
            .sort();
        expect(racine.length).toBeLessThanOrEqual(15);
    });

    it('tous les modules js sont listes dans le precache SW dev', () => {
        const swPrecache = readFileSync(join(racineProjet, 'sw-precache-list.js'), 'utf8');
        const debut = swPrecache.indexOf(MARQUEUR_DEBUT);
        const fin = swPrecache.indexOf(MARQUEUR_FIN);
        expect(debut).toBeGreaterThanOrEqual(0);
        expect(fin).toBeGreaterThan(debut);
        const blocPrecache = swPrecache.slice(debut, fin);

        const exclusPrecache = new Set(['./js/codex-histoire.js']);

        const manquants = listerFichiersJs(racineJs)
            .map(
                (chemin) =>
                    `./js/${chemin
                        .replace(racineJs + '\\', '')
                        .replace(racineJs + '/', '')
                        .split(/[/\\]/)
                        .join('/')}`
            )
            .filter((entree) => !exclusPrecache.has(entree))
            .filter((entree) => !blocPrecache.includes(`'${entree}'`));

        expect(
            manquants,
            `Relancez npm run sync:sw — manquants: ${manquants.slice(0, 10).join(', ')}`
        ).toEqual([]);
    });
});
