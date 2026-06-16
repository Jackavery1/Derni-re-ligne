import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from 'fs';
import { join, relative } from 'path';

const BUDGETS = {
    appShellKo: 2048,
    appShellAlerteKo: 1800,
    jsMinifieKo: 900,
    cssKo: 151,
    policesKo: 300,
    sceneCutsceneKo: 200,
    pisteMusiqueMo: 3.5,
    totalInstallableMo: 5,
};

const EXCLUSIONS = new Set([
    'node_modules',
    '.git',
    'e2e',
    'tests',
    'dist',
    'test-results',
    'playwright-report',
    'coverage',
]);

const OCTET = 1;
const KO = 1024 * OCTET;
const MO = 1024 * KO;

function formaterKo(octets) {
    return Math.round((octets / KO) * 10) / 10;
}

function formaterMo(octets) {
    return Math.round((octets / MO) * 100) / 100;
}

function listerFichiersRecursif(dossier, racine = dossier) {
    /** @type {{ cheminRelatif: string, octets: number }[]} */
    const resultat = [];
    if (!existsSync(dossier)) return resultat;

    for (const entree of readdirSync(dossier, { withFileTypes: true })) {
        if (EXCLUSIONS.has(entree.name)) continue;
        const cheminAbsolu = join(dossier, entree.name);
        if (entree.isDirectory()) {
            resultat.push(...listerFichiersRecursif(cheminAbsolu, racine));
        } else if (entree.isFile()) {
            if (entree.name === 'rapport-poids.json') continue;
            resultat.push({
                cheminRelatif: relative('.', cheminAbsolu).replace(/\\/g, '/'),
                octets: statSync(cheminAbsolu).size,
            });
        }
    }
    return resultat;
}

function filtrerParPrefixe(fichiers, prefixes) {
    return fichiers.filter((f) => prefixes.some((p) => f.cheminRelatif.startsWith(p)));
}

function sommeOctets(fichiers) {
    return fichiers.reduce((total, f) => total + f.octets, 0);
}

function lirePrecacheSw() {
    const swPath = existsSync('dist/sw.js') ? 'dist/sw.js' : 'sw.js';
    const sw = readFileSync(swPath, 'utf8');
    const match = sw.match(/\/\* PRECACHE:DEBUT \*\/([\s\S]*?)\/\* PRECACHE:FIN \*\//);
    if (!match) return { chemins: [], racine: swPath.startsWith('dist') ? 'dist' : '.' };
    const chemins = [...match[1].matchAll(/'\.\/([^']*)'/g)].map((m) => m[1]);
    return { chemins, racine: swPath.startsWith('dist') ? 'dist' : '.' };
}

function mesurerPrecache(cheminsPrecache, racine = '.') {
    /** @type {{ chemin: string, octets: number, manquant: boolean }[]} */
    const details = [];
    let total = 0;

    for (const chemin of cheminsPrecache) {
        if (chemin === '' || chemin === '.') continue;
        const cheminDisque = join(racine, chemin.replace(/^\.\//, ''));
        if (!existsSync(cheminDisque)) {
            details.push({ chemin: `./${chemin}`, octets: 0, manquant: true });
            continue;
        }
        const octets = statSync(cheminDisque).size;
        details.push({ chemin: `./${chemin}`, octets, manquant: false });
        total += octets;
    }

    return { total, details, nombre: cheminsPrecache.filter((c) => c !== '' && c !== '.').length };
}

function mesurerJsMinifie() {
    const dossier = 'dist/js';
    if (!existsSync(dossier)) return null;
    const fichiers = readdirSync(dossier)
        .filter((f) => f.endsWith('.js') && !f.endsWith('.map'))
        .map((f) => ({ chemin: `dist/js/${f}`, octets: statSync(join(dossier, f)).size }));
    return { octets: sommeOctets(fichiers), fichiers: fichiers.length, details: fichiers };
}

function categoriser(fichiersProjet) {
    const jsSource = filtrerParPrefixe(fichiersProjet, ['js/', 'data/']).filter(
        (f) => f.cheminRelatif.endsWith('.js') || f.cheminRelatif.endsWith('.json')
    );
    const css = filtrerParPrefixe(fichiersProjet, ['styles/']).filter(
        (f) => f.cheminRelatif.endsWith('.css') && f.cheminRelatif !== 'styles/dev.css'
    );
    const html = [
        ...fichiersProjet.filter((f) => f.cheminRelatif === 'index.html'),
        ...filtrerParPrefixe(fichiersProjet, ['html/']).filter((f) =>
            f.cheminRelatif.endsWith('.html')
        ),
    ];
    const polices = filtrerParPrefixe(fichiersProjet, ['assets/polices/']);
    const images = [
        ...filtrerParPrefixe(fichiersProjet, ['img/']),
        ...filtrerParPrefixe(fichiersProjet, ['assets/']).filter(
            (f) =>
                !f.cheminRelatif.startsWith('assets/musique/') &&
                !f.cheminRelatif.endsWith('.gitkeep')
        ),
    ];
    const audio = filtrerParPrefixe(fichiersProjet, ['assets/musique/']).filter((f) =>
        /\.(mp3|ogg|wav|webm|m4a|aac)$/i.test(f.cheminRelatif)
    );
    const cutscenes = filtrerParPrefixe(fichiersProjet, ['assets/cutscenes/']).filter((f) =>
        f.cheminRelatif.endsWith('.png')
    );

    return { jsSource, css, html, polices, images, audio, cutscenes };
}

function evaluerBudgets(donnees) {
    /** @type {{ cle: string, libelle: string, valeur: number, budget: number, unite: string, actif: boolean, depasse: boolean }[]} */
    const evaluations = [];

    evaluations.push({
        cle: 'appShellKo',
        libelle: 'App shell (SW precache)',
        valeur: formaterKo(donnees.appShell.octets),
        budget: BUDGETS.appShellKo,
        unite: 'Ko',
        actif: true,
        depasse: donnees.appShell.octets > BUDGETS.appShellKo * KO,
        alerte:
            donnees.appShell.octets > BUDGETS.appShellAlerteKo * KO &&
            donnees.appShell.octets <= BUDGETS.appShellKo * KO,
    });

    if (donnees.jsMinifie) {
        evaluations.push({
            cle: 'jsMinifieKo',
            libelle: 'JS minifie (dist/js)',
            valeur: formaterKo(donnees.jsMinifie.octets),
            budget: BUDGETS.jsMinifieKo,
            unite: 'Ko',
            actif: true,
            depasse: donnees.jsMinifie.octets > BUDGETS.jsMinifieKo * KO,
        });
    }

    evaluations.push({
        cle: 'cssKo',
        libelle: 'CSS',
        valeur: formaterKo(donnees.categories.css.octets),
        budget: BUDGETS.cssKo,
        unite: 'Ko',
        actif: true,
        depasse: donnees.categories.css.octets > BUDGETS.cssKo * KO,
    });

    evaluations.push({
        cle: 'policesKo',
        libelle: 'Polices',
        valeur: formaterKo(donnees.categories.polices.octets),
        budget: BUDGETS.policesKo,
        unite: 'Ko',
        actif: true,
        depasse: donnees.categories.polices.octets > BUDGETS.policesKo * KO,
    });

    if (donnees.categories.cutscenes.fichiers.length > 0) {
        for (const scene of donnees.categories.cutscenes.details) {
            evaluations.push({
                cle: 'sceneCutsceneKo',
                libelle: `Scene cutscene (${scene.chemin})`,
                valeur: formaterKo(scene.octets),
                budget: BUDGETS.sceneCutsceneKo,
                unite: 'Ko',
                actif: true,
                depasse: scene.octets > BUDGETS.sceneCutsceneKo * KO,
            });
        }
    }

    if (donnees.categories.audio.fichiers.length > 0) {
        for (const piste of donnees.categories.audio.details) {
            evaluations.push({
                cle: 'pisteMusiqueMo',
                libelle: `Piste musique (${piste.chemin})`,
                valeur: formaterMo(piste.octets),
                budget: BUDGETS.pisteMusiqueMo,
                unite: 'Mo',
                actif: true,
                depasse: piste.octets > BUDGETS.pisteMusiqueMo * MO,
            });
        }
    }

    evaluations.push({
        cle: 'totalInstallableMo',
        libelle: 'Total installable (hors musique/scenes)',
        valeur: formaterMo(donnees.totalInstallable.octets),
        budget: BUDGETS.totalInstallableMo,
        unite: 'Mo',
        actif: true,
        depasse: donnees.totalInstallable.octets > BUDGETS.totalInstallableMo * MO,
    });

    return evaluations;
}

function afficherTableau(categories, jsMinifie, appShell, evaluations) {
    const lignes = [
        '',
        '=== AUDIT POIDS — Derniere Ligne ===',
        '',
        'Categorie                    Fichiers    Poids      Budget     Statut',
        '---------------------------  ----------  ---------  ---------  ------',
    ];

    const entrees = [
        {
            nom: 'JS source (js/ + data/)',
            fichiers: categories.jsSource.fichiers,
            octets: categories.jsSource.octets,
            budget: null,
            suffixe: jsMinifie ? ` (minifie: ${formaterKo(jsMinifie.octets)} Ko)` : '',
        },
        {
            nom: 'CSS (styles/)',
            fichiers: categories.css.fichiers,
            octets: categories.css.octets,
            budget: BUDGETS.cssKo,
        },
        {
            nom: 'HTML (index + html/)',
            fichiers: categories.html.fichiers,
            octets: categories.html.octets,
            budget: null,
        },
        {
            nom: 'Polices (assets/polices/)',
            fichiers: categories.polices.fichiers,
            octets: categories.polices.octets,
            budget: BUDGETS.policesKo,
        },
        {
            nom: 'Images (img/ + assets/)',
            fichiers: categories.images.fichiers,
            octets: categories.images.octets,
            budget: null,
        },
        {
            nom: 'Audio (assets/musique/)',
            fichiers: categories.audio.fichiers,
            octets: categories.audio.octets,
            budget: null,
        },
        {
            nom: 'Cutscenes (assets/cutscenes/)',
            fichiers: categories.cutscenes.fichiers,
            octets: categories.cutscenes.octets,
            budget: null,
        },
        {
            nom: 'App shell (SW precache)',
            fichiers: appShell.nombre,
            octets: appShell.total,
            budget: BUDGETS.appShellKo,
        },
    ];

    for (const entree of entrees) {
        const poids = `${formaterKo(entree.octets)} Ko${entree.suffixe ?? ''}`;
        const budget = entree.budget != null ? `${entree.budget} Ko` : '—';
        const statut =
            entree.budget != null ? (entree.octets > entree.budget * KO ? 'DEPASSE' : 'OK') : '—';
        lignes.push(
            `${entree.nom.padEnd(27)}  ${String(entree.fichiers).padStart(8)}  ${poids.padEnd(9)}  ${budget.padEnd(9)}  ${statut}`
        );
    }

    const totalProjet =
        categories.jsSource.octets +
        categories.css.octets +
        categories.html.octets +
        categories.polices.octets +
        categories.images.octets +
        categories.audio.octets;

    lignes.push('---------------------------  ----------  ---------  ---------  ------');
    lignes.push(
        `${'TOTAL projet (source)'.padEnd(27)}  ${''.padStart(8)}  ${`${formaterKo(totalProjet)} Ko`.padEnd(9)}  ${'—'.padEnd(9)}  —`
    );
    lignes.push('');

    const depassements = evaluations.filter((e) => e.actif && e.depasse);
    const alertes = evaluations.filter((e) => e.actif && e.alerte);
    if (depassements.length > 0) {
        lignes.push('Budgets depasses :');
        for (const d of depassements) {
            lignes.push(`  - ${d.libelle} : ${d.valeur} ${d.unite} > ${d.budget} ${d.unite}`);
        }
    } else if (alertes.length > 0) {
        lignes.push('Budgets en zone d alerte :');
        for (const d of alertes) {
            lignes.push(
                `  - ${d.libelle} : ${d.valeur} ${d.unite} (alerte ${BUDGETS.appShellAlerteKo} ${d.unite})`
            );
        }
    } else {
        lignes.push('Tous les budgets actifs sont respectes.');
    }

    lignes.push('');
    console.log(lignes.join('\n'));
}

function resumerCategorie(fichiers) {
    return {
        fichiers: fichiers.length,
        octets: sommeOctets(fichiers),
        details: fichiers
            .map((f) => ({ chemin: f.cheminRelatif, octets: f.octets, ko: formaterKo(f.octets) }))
            .sort((a, b) => b.octets - a.octets),
    };
}

const fichiersProjet = listerFichiersRecursif('.');
const brutes = categoriser(fichiersProjet);

const categories = {
    jsSource: resumerCategorie(brutes.jsSource),
    css: resumerCategorie(brutes.css),
    html: resumerCategorie(brutes.html),
    polices: resumerCategorie(brutes.polices),
    images: resumerCategorie(brutes.images),
    audio: resumerCategorie(brutes.audio),
    cutscenes: resumerCategorie(brutes.cutscenes),
};

const { chemins: cheminsPrecache, racine: racinePrecache } = lirePrecacheSw();
const appShell = mesurerPrecache(cheminsPrecache, racinePrecache);
const jsMinifie = mesurerJsMinifie();

const totalInstallableOctets =
    categories.jsSource.octets +
    categories.css.octets +
    categories.html.octets +
    categories.polices.octets +
    categories.images.octets -
    categories.cutscenes.octets;

const top10 = [...fichiersProjet]
    .filter((f) => !f.cheminRelatif.endsWith('package-lock.json'))
    .sort((a, b) => b.octets - a.octets)
    .slice(0, 10);

const donnees = {
    categories,
    appShell: { octets: appShell.total, nombre: appShell.nombre, details: appShell.details },
    jsMinifie: jsMinifie ? { octets: jsMinifie.octets, fichiers: jsMinifie.fichiers } : null,
    totalInstallable: { octets: totalInstallableOctets },
};

const evaluations = evaluerBudgets(donnees);
afficherTableau(categories, jsMinifie, appShell, evaluations);

console.log('Top 10 fichiers les plus lourds :');
for (const [i, f] of top10.entries()) {
    console.log(`  ${String(i + 1).padStart(2)}. ${f.cheminRelatif} — ${formaterKo(f.octets)} Ko`);
}
console.log('');

const rapport = {
    date: new Date().toISOString(),
    budgets: BUDGETS,
    categories: Object.fromEntries(
        Object.entries(categories).map(([cle, val]) => [
            cle,
            {
                fichiers: val.fichiers,
                octets: val.octets,
                ko: formaterKo(val.octets),
                details: val.details,
            },
        ])
    ),
    jsMinifie: jsMinifie
        ? {
              fichiers: jsMinifie.fichiers,
              octets: jsMinifie.octets,
              ko: formaterKo(jsMinifie.octets),
          }
        : null,
    appShell: {
        nombre: appShell.nombre,
        octets: appShell.total,
        ko: formaterKo(appShell.total),
        precache: appShell.details,
    },
    totalInstallable: {
        octets: totalInstallableOctets,
        mo: formaterMo(totalInstallableOctets),
    },
    top10: top10.map((f) => ({
        chemin: f.cheminRelatif,
        octets: f.octets,
        ko: formaterKo(f.octets),
    })),
    evaluations,
    depassement: evaluations.some((e) => e.actif && e.depasse),
};

writeFileSync('rapport-poids.json', JSON.stringify(rapport, null, 2));
console.log('Rapport ecrit : rapport-poids.json');

process.exit(rapport.depassement ? 1 : 0);
