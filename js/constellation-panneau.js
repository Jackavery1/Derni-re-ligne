import { BIOMES, ORDRE_BIOMES_LIBRE } from './config.js';
import { biomeEstDebloqueParHistoire, obtenirMondeHistoirePourBiome } from './progression.js';
import { modeSprintActif } from './mode-sprint.js';
import { obtenirRecordSprintBiome } from './progression.js';
import { formaterTemps } from './hud-jeu.js';
import { NOMS_MONDES_REQUIS } from './constellation-rendu.js';
import { obtenirIdIconeBiome } from './biome-icones-map.js';
import {
    ouvrirPanneauDetail,
    fermerPanneauDetail,
    obtenirPanneauDetailId,
} from './ui-panneau-detail.js';

/**
 * @param {string} idBiome
 * @param {{
 *   obtenirRecordBiome: (id: string) => number,
 *   obtenirRecordNiveauBiome: (id: string) => number,
 *   calculerEtoiles: (score: number, niveau: number) => number,
 *   formaterEtoiles: (n: number) => string,
 *   appliquerThemeBiome: (id: string) => void,
 *   lancerBiome: () => void,
 *   ouvrirHistoireVersMonde?: (mondeId: string) => void,
 * }} deps
 */
export function ouvrirPanneauBiomeConstellation(idBiome, deps) {
    const biome = BIOMES[idBiome];
    if (!biome) return;

    const verrouille = !biomeEstDebloqueParHistoire(idBiome);
    const record = deps.obtenirRecordBiome(idBiome);
    const niveauRecord = deps.obtenirRecordNiveauBiome(idBiome);
    const etoiles = deps.formaterEtoiles(deps.calculerEtoiles(record, niveauRecord));
    const accent = biome.lueurCoul ?? biome.ui?.couleurPrimaire ?? '#00f5ff';
    const requis = NOMS_MONDES_REQUIS[idBiome];
    const mondeHistoire = obtenirMondeHistoirePourBiome(idBiome);

    let recordTexte;
    if (verrouille) {
        const nbVerrouilles = ORDRE_BIOMES_LIBRE.filter(
            (id) => !biomeEstDebloqueParHistoire(id)
        ).length;
        recordTexte =
            nbVerrouilles > 0
                ? `${nbVerrouilles} monde(s) a debloquer en histoire`
                : 'A debloquer en mode histoire';
    } else if (modeSprintActif) {
        const ms = obtenirRecordSprintBiome(idBiome);
        recordTexte =
            ms > 0 ? `Meilleur temps : ${formaterTemps(ms)} (40L)` : 'Sprint 40 lignes — chrono';
    } else {
        recordTexte = `Record : ${record.toLocaleString('fr-FR')} — ${etoiles}`;
    }

    let statut;
    if (verrouille) {
        statut = requis ? `Complete ${requis} en mode histoire pour debloquer` : 'Monde verrouille';
    } else if (idBiome === 'cosmos' || idBiome === 'fuochi') {
        statut = 'Rythme modere — courbe adoucie en chapitre 4';
    } else {
        statut = "Pret pour l'aventure";
    }

    const meta = [recordTexte];
    if (biome.description) meta.push(biome.description);

    /** @type {import('./ui-panneau-detail.js').ConfigPanneauDetail} */
    const config = {
        id: `biome-${idBiome}`,
        accent,
        titre: biome.nom,
        sousTitre: biome.icone ? `${biome.icone} ${biome.tagline ?? ''}`.trim() : '',
        description: statut,
        typoDescription: 'ui',
        lignesMeta: meta,
        verrouille,
        icone: { id: obtenirIdIconeBiome(idBiome), taillePixel: 10 },
        actionPrincipale: verrouille
            ? undefined
            : { libelle: '▶ JOUER', onAction: () => deps.lancerBiome() },
        actionSecondaire:
            verrouille && mondeHistoire
                ? {
                      libelle: '◈ MODE HISTOIRE',
                      onAction: () => deps.ouvrirHistoireVersMonde?.(mondeHistoire),
                  }
                : undefined,
    };

    ouvrirPanneauDetail(config, { basculerSiMemeId: false });
    afficherBarreModesBiome(idBiome);
    deps.appliquerThemeBiome(idBiome);
}

/** @param {string} idBiome */
export function afficherBarreModesBiome(idBiome) {
    const barre = document.getElementById('sel-barre-modes');
    if (!barre || !BIOMES[idBiome]) return;
    barre.classList.remove('element-masque');
    barre.setAttribute('aria-hidden', 'false');
}

export function masquerBarreModesBiome() {
    const barre = document.getElementById('sel-barre-modes');
    barre?.classList.add('element-masque');
    barre?.setAttribute('aria-hidden', 'true');
}

export function fermerPanneauBiomeConstellation() {
    if (obtenirPanneauDetailId()?.startsWith('biome-')) {
        fermerPanneauDetail();
    }
    masquerBarreModesBiome();
}

export function panneauBiomeConstellationOuvert() {
    return obtenirPanneauDetailId()?.startsWith('biome-') ?? false;
}
