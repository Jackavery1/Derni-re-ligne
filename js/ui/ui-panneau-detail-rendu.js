import { rendreIconeSurCanvas, rendreIconeGlitchSurCanvas } from '../rendu/icones-pixel.js';
import { sansAccentsE } from '../logique/texte-jeu.js';

/**
 * @typedef {import('./ui-panneau-detail.js').ConfigPanneauDetail} ConfigPanneauDetail
 * @typedef {import('./ui-panneau-detail.js').ConfigIcone} ConfigIcone
 */

/** @param {HTMLElement | null} el @returns {el is HTMLCanvasElement} */
function estCanvas(el) {
    if (!el) return false;
    if (typeof HTMLCanvasElement !== 'undefined' && el instanceof HTMLCanvasElement) return true;
    return typeof (/** @type {HTMLCanvasElement} */ (el).getContext) === 'function';
}

/** @param {ConfigPanneauDetail} config */
export function rendreIconePanneau(config) {
    const icone = document.getElementById('panneau-detail-icone');
    if (!estCanvas(icone) || !config.icone) return;

    const taillePixel = config.icone.taillePixel ?? 10;
    const px = 16 * taillePixel;
    icone.width = px;
    icone.height = px;
    icone.style.width = `${px}px`;
    icone.style.height = `${px}px`;

    const ctx = icone.getContext('2d');
    if (!ctx) return;

    if (typeof config.icone.canvasPersonnalise === 'function') {
        ctx.clearRect(0, 0, px, px);
        config.icone.canvasPersonnalise(icone, ctx);
        return;
    }

    if (config.icone.id) {
        if (config.verrouille && config.icone.glitch) {
            rendreIconeGlitchSurCanvas(icone, config.icone.id, {
                accent: config.accent,
                seedId: config.icone.seedId ?? config.id,
            });
        } else {
            rendreIconeSurCanvas(icone, config.icone.id, {
                silhouette: !!config.verrouille,
                accent: config.accent,
            });
        }
    }
}

/** @param {HTMLElement | null} el @param {string | string[] | undefined} description @param {'narratif' | 'ui'} typo */
function remplirDescription(el, description, typo) {
    if (!el) return;
    el.replaceChildren();
    el.classList.toggle('panneau-detail-description--narratif', typo === 'narratif');
    el.classList.toggle('panneau-detail-description--ui', typo !== 'narratif');

    if (!description) return;

    const blocs = Array.isArray(description) ? description : [description];
    for (const bloc of blocs) {
        const parties = String(bloc).split(/\n\n+/);
        for (const partie of parties) {
            if (!partie.trim()) continue;
            const p = document.createElement('p');
            p.className = 'panneau-detail-para';
            p.textContent = sansAccentsE(partie.trim());
            el.appendChild(p);
        }
    }
}

/** @param {Record<string, HTMLElement | null>} refs @param {ConfigPanneauDetail['progression']} progression */
function remplirProgression(refs, progression) {
    if (!refs.progression) return;
    if (!progression || progression.cible <= 0) {
        refs.progression.classList.add('element-masque');
        return;
    }
    refs.progression.classList.remove('element-masque');
    const ratio = Math.min(1, Math.max(0, progression.actuel / progression.cible));
    const pct = `${Math.round(ratio * 100)}%`;
    refs.progressionFill?.style.setProperty('--panneau-progression-pct', pct);
    const texte = progression.formaterTexte
        ? progression.formaterTexte(progression.actuel, progression.cible)
        : `${progression.actuel} / ${progression.cible}`;
    if (refs.progressionTexte) refs.progressionTexte.textContent = sansAccentsE(texte);
}

/** @param {HTMLElement | null} el @param {string[] | undefined} lignes */
function remplirMeta(el, lignes) {
    if (!el) return;
    el.replaceChildren();
    if (!lignes?.length) {
        el.classList.add('element-masque');
        return;
    }
    el.classList.remove('element-masque');
    for (const ligne of lignes) {
        const li = document.createElement('li');
        li.textContent = sansAccentsE(ligne);
        el.appendChild(li);
    }
}

/** @param {Record<string, HTMLElement | null>} refs @param {ConfigPanneauDetail} config @param {boolean} masquerSpoiler */
function appliquerTextesPanneau(refs, config, masquerSpoiler) {
    if (refs.titre) {
        refs.titre.textContent = sansAccentsE(masquerSpoiler ? '???' : config.titre);
    }
    if (refs.sousTitre) {
        const st = masquerSpoiler ? '' : (config.sousTitre ?? '');
        refs.sousTitre.textContent = sansAccentsE(st);
        refs.sousTitre.classList.toggle('element-masque', !st);
    }

    remplirDescription(
        refs.description,
        masquerSpoiler ? '' : config.description,
        config.typoDescription ?? 'ui'
    );

    remplirMeta(refs.meta, config.lignesMeta);
    remplirProgression(refs, config.verrouille ? config.progression : null);

    if (refs.condition) {
        const cond = config.conditionTexte ?? '';
        refs.condition.textContent = sansAccentsE(cond);
        refs.condition.classList.toggle('element-masque', !cond);
    }

    refs.racine?.classList.toggle('panneau-detail--verrouille', !!config.verrouille);
}

/** @param {Record<string, HTMLElement | null>} refs @param {ConfigPanneauDetail} config */
function appliquerBoutonsPanneau(refs, config) {
    if (refs.btnJouer) {
        const action = config.actionPrincipale;
        const visible = Boolean(action?.onAction) && !config.verrouille;
        refs.btnJouer.classList.toggle('element-masque', !visible);
        if (visible) {
            refs.btnJouer.textContent = sansAccentsE(action?.libelle ?? '▶ JOUER');
        }
    }

    if (refs.btnSecondaire) {
        const action = config.actionSecondaire;
        const visible = Boolean(action?.onAction);
        refs.btnSecondaire.classList.toggle('element-masque', !visible);
        if (visible) {
            refs.btnSecondaire.textContent = sansAccentsE(action?.libelle ?? 'ACTION');
        }
    }
}

/** @param {Record<string, HTMLElement | null>} refs @param {ConfigPanneauDetail} config */
export function appliquerContenuPanneau(refs, config) {
    if (!refs.racine || !refs.corps) return;

    refs.racine.style.setProperty('--accent-carte', config.accent);
    refs.corps.style.setProperty('--accent-carte', config.accent);
    if (refs.iconeWrap) {
        refs.iconeWrap.style.setProperty('--accent-carte', config.accent);
    }

    rendreIconePanneau(config);

    const masquerSpoiler = config.verrouille && !config.afficherTeaserVerrouille;
    appliquerTextesPanneau(refs, config, masquerSpoiler);
    appliquerBoutonsPanneau(refs, config);
}
