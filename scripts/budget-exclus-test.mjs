/**
 * Chunks JS hors budget prod : entrées auxiliaires (test, dev) non importées par bundle.js.
 * @param {import('esbuild').Metafile} metafile
 * @returns {string[]} noms de fichiers (basename)
 */
export function listerSortiesTestUniquement(metafile) {
    const sorties = Object.keys(metafile.outputs).filter((p) => p.endsWith('.js'));
    const entreeBundle = sorties.find((p) => p.endsWith('/bundle.js'));
    if (!entreeBundle) return ['neo-test-init.js', 'dev-init.js'];

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

    /** @type {string[]} */
    const exclus = [];
    for (const entreeNom of ['neo-test-init.js', 'dev-init.js']) {
        const entree = sorties.find((p) => p.endsWith(`/${entreeNom}`));
        if (!entree) continue;
        exclus.push(entreeNom);
        for (const sortie of collecter(entree)) {
            if (!depuisBundle.has(sortie)) {
                exclus.push(sortie.replace(/^.*[/\\]/, ''));
            }
        }
    }
    return [...new Set(exclus)];
}
