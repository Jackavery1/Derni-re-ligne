/**
 * Chunks JS atteignables uniquement depuis l'entrée neo-test-init (hors budget prod).
 * @param {import('esbuild').Metafile} metafile
 * @returns {string[]} noms de fichiers (basename)
 */
export function listerSortiesTestUniquement(metafile) {
    const sorties = Object.keys(metafile.outputs).filter((p) => p.endsWith('.js'));
    const entreeBundle = sorties.find((p) => p.endsWith('/bundle.js'));
    const entreeTest = sorties.find((p) => p.endsWith('/neo-test-init.js'));
    if (!entreeBundle || !entreeTest) return ['neo-test-init.js'];

    /** @param {string} racine */
    function collecter(racine) {
        /** @type {Set<string>} */
        const visite = new Set();
        /** @type {string[]} */
        const pile = [racine];
        while (pile.length > 0) {
            const fichier = pile.pop();
            if (!fichier || visite.has(fichier)) continue;
            visite.add(fichier);
            for (const imp of metafile.outputs[fichier]?.imports ?? []) {
                if (imp.path.endsWith('.js')) pile.push(imp.path);
            }
        }
        return visite;
    }

    const depuisBundle = collecter(entreeBundle);
    const depuisTest = collecter(entreeTest);

    /** @type {string[]} */
    const exclus = ['neo-test-init.js'];
    for (const sortie of depuisTest) {
        if (!depuisBundle.has(sortie)) {
            exclus.push(sortie.replace(/^.*[/\\]/, ''));
        }
    }
    return [...new Set(exclus)];
}
