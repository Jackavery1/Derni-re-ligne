import { BIOMES, ORDRE_BIOMES_LIBRE } from '../config/biomes.js';
import { biomeEstDebloqueParHistoire, obtenirMondeHistoirePourBiome } from '../io/progression.js';
import { modeSprintActif } from './mode-sprint.js';
import { obtenirRecordSprintBiome } from '../io/progression.js';
import { formaterTemps } from '../rendu/hud-jeu.js';
import { NOMS_MONDES_REQUIS } from '../rendu/constellation-rendu.js';
import { obtenirIdIconeBiome } from '../biome-icones-map.js';
import {
    ouvrirPanneauDetail,
    fermerPanneauDetail,
    obtenirPanneauDetailId,
} from '../ui/ui-panneau-detail.js';

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
            ms > 0 ? `Meilleur temps : ${formaterTemps(ms)}` : 'Sprint — chrono 40 lignes';
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

    /** @type {import('../ui/ui-panneau-detail.js').ConfigPanneauDetail} */
    const config = {
        id: `biome-${idBiome}`,
        accent,
        titre: biome.nom,
        sousTitre: biome.icone ? `${biome.icone} ${biome.tagline ?? ''}`.trim() : '',
        description: statut,
        typoDescription: 'ui',
        lignesMeta: meta,
        verrouille,
        afficherTeaserVerrouille: verrouille,
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
    void import('../ui/deblocage-ui.js').then(({ mettreAJourVisibiliteModesDebloques }) =>
        mettreAJourVisibiliteModesDebloques()
    );
    void import('./mode-sprint.js').then(({ mettreAJourToggleSprint }) =>
        mettreAJourToggleSprint()
    );
    void import('./mode-defi-jour.js').then(({ mettreAJourToggleDefiJour }) =>
        mettreAJourToggleDefiJour()
    );
    void import('../ui/infobulles-contexte.js').then(({ proposerInfobulleModeJeu }) => {
        if (typeof window !== 'undefined' && window.__NEO_SUPPRESS_MODE_INFOBULLE_AUTO__) return;
        proposerInfobulleModeJeu(modeSprintActif ? 'sprint' : 'sansFin');
    });
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
