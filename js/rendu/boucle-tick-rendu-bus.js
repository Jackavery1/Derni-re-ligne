import { ecouter } from '../etat/bus-jeu.js';
import {
    mettreAJourAmbiante,
    mettreAJourParticulesAmbiance,
    mettreAJourTextesFlottants,
    mettreAJourSecousse,
} from './rendu-jeu.js';
import { mettreAJourParticules } from './particules-jeu.js';
import { mettreAJourAffichageTemps } from './hud-jeu.js';
import { mettreAJourHistoriquePositions } from './decorations-jeu.js';
import { rendrePortraitBossLazy } from './tick-rendu-solo.js';

let boucleTickRenduBusInitialise = false;

export function initialiserBoucleTickRenduBus() {
    if (boucleTickRenduBusInitialise) return;
    boucleTickRenduBusInitialise = true;

    ecouter('boucle:tick-rendu', ({ deltaTemps, timestamp, bossActif }) => {
        mettreAJourParticules(deltaTemps);
        mettreAJourParticulesAmbiance(deltaTemps);
        mettreAJourTextesFlottants(deltaTemps);
        mettreAJourAffichageTemps();
        if (bossActif) void rendrePortraitBossLazy(timestamp);
        mettreAJourAmbiante(deltaTemps);
    });

    ecouter('boucle:timers-effets', ({ deltaTemps }) => {
        mettreAJourSecousse(deltaTemps);
    });

    ecouter('boucle:historique-positions', () => {
        mettreAJourHistoriquePositions();
    });
}
