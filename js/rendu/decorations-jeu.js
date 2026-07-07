import { statsGlobales } from '../achievements.js';
import {
    etat,
    obtenirCanvasPlateau,
    obtenirEffetsReduits,
    obtenirEffetsAccessibiliteReduits,
} from '../etat/store-jeu.js';
import { definirArcEnCiel } from './rendu-robo.js';
import {
    reinitialiserHistoriquePositions,
    mettreAJourHistoriquePositions,
    dessinerTrainee,
    dessinerTraineeArcEnCiel,
    dessinerTraineeCombo,
    dessinerEtoilesTrainee,
} from './decorations-trainees.js';
import {
    dessinerAuraCosmos,
    dessinerAuraDoree,
    dessinerBordureBicolore,
    dessinerBordurePulse,
    dessinerEclairsBords,
    dessinerFlashCyan,
    dessinerFlammesBords,
    dessinerGemmesOrbitales,
    dessinerHaloOracle,
    dessinerHaloRelique,
    dessinerNotesFlottantes,
    dessinerParticulesBiome,
    dessinerPoulsBordure,
    dessinerVortexBords,
} from './decorations-jeu-effets.js';

export { reinitialiserHistoriquePositions, mettreAJourHistoriquePositions };

function reinitialiserEffetsHorsCanvas() {
    if (!statsGlobales.decorationsActives.includes('robo_arc_en_ciel')) {
        definirArcEnCiel(false);
    }
}

/** @type {Record<string, (reduits: boolean) => void>} */
const DESSINATEURS_DECO = {
    trainee_simple: () => dessinerTrainee(1),
    trainee_double: () => dessinerTrainee(2),
    trainee_arc_en_ciel: () => dessinerTraineeArcEnCiel(),
    trainee_combo: () => dessinerTraineeCombo(),
    etoiles_trainee: () => dessinerEtoilesTrainee(),
    flammes_bords: () => dessinerFlammesBords(0.6, obtenirEffetsReduits()),
    flammes_intenses: () => dessinerFlammesBords(1, obtenirEffetsReduits()),
    eclairs_bords: () => dessinerEclairsBords(),
    bordure_pulse: (reduits) => {
        if (!reduits) dessinerBordurePulse();
    },
    pouls_bordure: (reduits) => {
        if (!reduits) dessinerPoulsBordure();
    },
    aura_doree: () => dessinerAuraDoree(),
    aura_cosmos: () => dessinerAuraCosmos(),
    vortex_bords: () => dessinerVortexBords(),
    notes_flottantes: () => dessinerNotesFlottantes(),
    gemmes_orbitales: () => dessinerGemmesOrbitales(),
    flash_cyan: (reduits) => {
        if (!reduits) dessinerFlashCyan();
    },
    particules_biome: () => dessinerParticulesBiome(),
    halo_relique: () => dessinerHaloRelique(),
    halo_oracle: () => dessinerHaloOracle(),
    bordure_bicolore: () => dessinerBordureBicolore(),
    couronne_lumineuse: () => {
        dessinerAuraDoree();
        dessinerGemmesOrbitales();
    },
    robo_arc_en_ciel: () => definirArcEnCiel(true),
};

export function dessinerDecorations() {
    const actives = statsGlobales.decorationsActives;
    if (!actives.length || !etat.estEnCours || etat.estEnPause) {
        reinitialiserEffetsHorsCanvas();
        return;
    }

    const reduits = obtenirEffetsAccessibiliteReduits();
    if (reduits) {
        const canvas = obtenirCanvasPlateau();
        if (canvas) canvas.style.boxShadow = '';
    }

    for (const deco of actives) {
        DESSINATEURS_DECO[deco]?.(reduits);
    }
}
