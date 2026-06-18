import { obtenirHistoireTextesSync } from './charger-histoire-textes.js';
import { prechargerScenes } from './scenes-cutscene.js';
import { prechargerPortraitVera } from './portrait-vera-rendu.js';
import { COULEUR_PERSONNAGE, idPortraitMeta } from './histoire-cutscene-config.js';
import {
    assurerZoneNarrationCutscene,
    appliquerFondPersonnageEcran,
    preparerTexteLigneCutscene,
    estLigneNarration,
    obtenirElTexteLigneCourante,
} from './histoire-cutscene-ui.js';
import {
    mettreAJourPortraitsCutscene,
    definirPersonnageParlantCutscene,
} from './histoire-cutscene-portraits.js';
import {
    typewriterEstActif,
    stopTypewriter,
    demarrerTypewriter,
    afficherTexteComplet,
} from './histoire-cutscene-typewriter.js';
import { logger } from './logger.js';

/** @param {unknown} textes @param {string[] | null | undefined} personnages */
export function normaliserEntreeCutscene(textes, personnages) {
    let sceneDefaut = null;
    /** @type {unknown} */
    let lignesRaw = textes;

    if (
        textes &&
        typeof textes === 'object' &&
        !Array.isArray(textes) &&
        'lignes' in /** @type {object} */ (textes)
    ) {
        sceneDefaut = /** @type {{ scene?: string }} */ (textes).scene ?? null;
        lignesRaw = /** @type {{ lignes?: unknown[] }} */ (textes).lignes ?? [];
    }

    if (
        Array.isArray(lignesRaw) &&
        lignesRaw.length > 0 &&
        typeof lignesRaw[0] === 'object' &&
        lignesRaw[0] !== null &&
        'texte' in /** @type {object} */ (lignesRaw[0])
    ) {
        return {
            sceneDefaut,
            lignes: lignesRaw.map((l) => /** @type {{ texte: string }} */ (l).texte ?? ''),
            personnages: lignesRaw.map(
                (l, i) =>
                    /** @type {{ personnage?: string }} */ (l).personnage ??
                    personnages?.[i] ??
                    'narrateur'
            ),
            humeurs: lignesRaw.map((l) => /** @type {{ humeur?: string }} */ (l).humeur),
            scenes: lignesRaw.map((l) => /** @type {{ scene?: string }} */ (l).scene ?? null),
        };
    }
    return {
        sceneDefaut,
        lignes: /** @type {string[]} */ (lignesRaw ?? []),
        personnages: personnages ?? [],
        humeurs: [],
        scenes: [],
    };
}

/** @param {ReturnType<typeof normaliserEntreeCutscene>} entree */
export async function prechargerScenesCutscene(entree) {
    const ids = new Set();
    if (entree.sceneDefaut) ids.add(entree.sceneDefaut);
    for (const s of entree.scenes) {
        if (s) ids.add(s);
    }
    if (ids.size === 0) {
        await prechargerPortraitVera();
        return;
    }
    await Promise.all([prechargerPortraitVera(), prechargerScenes(ids)]);
}

let _boutonsCutsceneOk = false;

/** @param {() => void} avancer @param {() => void} passer */
export function lierBoutonsCutsceneDom(avancer, passer) {
    if (_boutonsCutsceneOk) return;
    _boutonsCutsceneOk = true;
    const marqueur = 'data-neo-cutscene-lie';
    const lier = (id, handler) => {
        const el = document.getElementById(id);
        if (!el || el.hasAttribute?.(marqueur) || typeof el.addEventListener !== 'function') return;
        el.setAttribute?.(marqueur, '1');
        el.addEventListener('click', handler);
    };
    lier('btn-cutscene-suivant', avancer);
    lier('btn-cutscene-passer', passer);
    const ecranCutscene = document.getElementById('ecran-histoire-cutscene');
    if (
        ecranCutscene &&
        !ecranCutscene.hasAttribute?.(marqueur) &&
        typeof ecranCutscene.addEventListener === 'function'
    ) {
        ecranCutscene.setAttribute?.(marqueur, '1');
        ecranCutscene.addEventListener('click', (e) => {
            if (e.target instanceof HTMLElement && !e.target.closest('.cutscene-controles')) {
                avancer();
            }
        });
    }
}

export function domCutscenePret() {
    assurerZoneNarrationCutscene();
    return (
        document.getElementById('ecran-histoire-cutscene') &&
        document.getElementById('texte-dialogue-cutscene')
    );
}

/**
 * @param {{
 *   index: number;
 *   lignes: string[];
 *   personnages: string[];
 *   obtenirSequence: () => { texte: string; personnage: string; humeur?: string }[];
 *   appliquerFondPourLigne: (personnageId: string) => void;
 * }} session
 */
export function afficherProchaineLigneCutscene(session) {
    const texte = session.lignes[session.index] ?? '';
    const personnageId = session.personnages[session.index] ?? 'narrateur';
    const estNarration = estLigneNarration(personnageId);

    const { PORTRAITS } = obtenirHistoireTextesSync();
    const p =
        PORTRAITS[personnageId] ?? PORTRAITS[idPortraitMeta(personnageId)] ?? PORTRAITS.narrateur;

    const prep = preparerTexteLigneCutscene({
        personnageId,
        estNarration,
        police: p.police,
        couleurPerso: COULEUR_PERSONNAGE[personnageId] ?? p.couleur,
        nom: p.nom,
    });
    if (!prep) return;

    definirPersonnageParlantCutscene(personnageId);
    appliquerFondPersonnageEcran(personnageId);
    session.appliquerFondPourLigne(personnageId);

    mettreAJourPortraitsCutscene(
        personnageId,
        session.obtenirSequence(),
        session.personnages,
        session.index,
        performance.now()
    );

    prep.texteEl.textContent = '';
    demarrerTypewriter(prep.texteEl, texte, p.vitesseMs ?? 35);
}

/** @param {{ enCours: () => boolean; index: number; lignes: string[]; personnages: string[]; mettreAJourProgress: (index: number, total: number) => void; afficherLigne: () => void; terminer: () => void }} ctx */
export function passerCutsceneLignes(ctx) {
    if (!ctx.enCours()) return;
    stopTypewriter();
    ctx.index = ctx.lignes.length - 1;
    avancerCutsceneLignes(ctx);
}

/** @param {Parameters<typeof passerCutsceneLignes>[0]} ctx */
export function avancerCutsceneLignes(ctx) {
    if (!ctx.enCours()) return;

    if (typewriterEstActif()) {
        const personnageId = ctx.personnages[ctx.index] ?? 'narrateur';
        const el = obtenirElTexteLigneCourante(personnageId);
        if (el) afficherTexteComplet(el, ctx.lignes[ctx.index] ?? '');
        return;
    }

    ctx.index++;
    if (ctx.index >= ctx.lignes.length) {
        ctx.terminer();
        return;
    }
    ctx.mettreAJourProgress(ctx.index, ctx.lignes.length);
    try {
        ctx.afficherLigne();
    } catch (err) {
        logger.error('[cutscene] erreur affichage ligne :', err);
        ctx.terminer();
    }
}
