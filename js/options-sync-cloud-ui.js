import {
    syncCloudActif,
    activerSyncCloud,
    configurerSupabase,
    obtenirOuCreerSyncId,
    syncCloudConfigure,
    obtenirPseudoLeaderboard,
    persisterPseudoLeaderboard,
} from './config/config-sync.js';
import {
    obtenirStatutSyncCloud,
    synchroniserCloudAuDemarrage,
    pousserCloudMaintenant,
} from './io/progression-sync-cloud.js';
import { chargerBiomeActif } from './io/progression.js';
import { chargerClassementLeaderboard } from './leaderboard-cloud.js';
import { formaterTemps } from './rendu/hud-jeu.js';
import { BIOMES, ORDRE_BIOMES_LIBRE } from './config/config.js';

const MODES_LEADERBOARD = [
    { id: 'marathon', libelle: 'SANS FIN' },
    { id: 'sprint', libelle: 'SPRINT' },
    { id: 'coop', libelle: 'COOP' },
];

function formaterLigneLeaderboard(ligne, mode) {
    if (mode === 'sprint' && ligne.sprint_ms) {
        return `${ligne.pseudo} — ${formaterTemps(ligne.sprint_ms)}`;
    }
    return `${ligne.pseudo} — ${Number(ligne.score).toLocaleString('fr-FR')} pts`;
}

function obtenirSelectLeaderboardMode() {
    return /** @type {HTMLSelectElement | null} */ (
        document.getElementById('select-leaderboard-mode')
    );
}

function obtenirSelectLeaderboardBiome() {
    return /** @type {HTMLSelectElement | null} */ (
        document.getElementById('select-leaderboard-biome')
    );
}

export function peuplerSelectsLeaderboardOptions() {
    const selectBiome = obtenirSelectLeaderboardBiome();
    if (!selectBiome || selectBiome.options.length > 0) return;

    for (const biomeId of ORDRE_BIOMES_LIBRE) {
        const biome = BIOMES[biomeId];
        if (!biome) continue;
        const opt = document.createElement('option');
        opt.value = biomeId;
        opt.textContent = biome.nom ?? biomeId.toUpperCase();
        selectBiome.appendChild(opt);
    }

    const biomeActif = chargerBiomeActif();
    if (ORDRE_BIOMES_LIBRE.includes(biomeActif)) {
        selectBiome.value = biomeActif;
    }
}

function obtenirFiltresLeaderboardOptions() {
    const mode = obtenirSelectLeaderboardMode()?.value ?? 'marathon';
    const biome = obtenirSelectLeaderboardBiome()?.value ?? chargerBiomeActif();
    return { mode, biome };
}

function mettreAJourEnteteLeaderboard(mode, biome) {
    const entete = document.getElementById('leaderboard-options-titre');
    if (!entete) return;
    const modeLibelle = MODES_LEADERBOARD.find((m) => m.id === mode)?.libelle ?? mode.toUpperCase();
    const biomeLibelle = BIOMES[biome]?.nom ?? biome.toUpperCase();
    entete.textContent = `TOP ${modeLibelle} — ${biomeLibelle}`;
}

export async function rafraichirLeaderboardOptions(mode, biome) {
    const liste = document.getElementById('liste-leaderboard-options');
    if (!liste || !syncCloudConfigure() || !syncCloudActif()) {
        liste?.replaceChildren();
        return;
    }

    const filtres = mode && biome ? { mode, biome } : obtenirFiltresLeaderboardOptions();
    mettreAJourEnteteLeaderboard(filtres.mode, filtres.biome);

    const entrees = await chargerClassementLeaderboard({
        mode: filtres.mode,
        biome: filtres.biome,
        limit: 8,
    });
    liste.replaceChildren();
    if (entrees.length === 0) {
        const vide = document.createElement('li');
        vide.textContent = 'Aucun score en ligne pour ce filtre.';
        liste.appendChild(vide);
        return;
    }
    entrees.forEach((ligne, index) => {
        const item = document.createElement('li');
        item.textContent = `${index + 1}. ${formaterLigneLeaderboard(ligne, filtres.mode)}`;
        liste.appendChild(item);
    });
}

export function mettreAJourUiSyncCloud() {
    const actif = syncCloudActif();
    const btn = document.getElementById('btn-toggle-sync-cloud');
    const panneau = document.getElementById('panneau-sync-config');
    const panneauLeaderboard = document.getElementById('panneau-leaderboard-options');
    const statut = document.getElementById('options-sync-statut');
    const inputSyncId = /** @type {HTMLInputElement | null} */ (
        document.getElementById('input-sync-id')
    );
    const inputPseudo = /** @type {HTMLInputElement | null} */ (
        document.getElementById('input-leaderboard-pseudo')
    );
    btn?.setAttribute('aria-pressed', actif ? 'true' : 'false');
    btn?.classList.toggle('actif', actif);
    panneau?.classList.toggle('element-masque', !actif);
    panneauLeaderboard?.classList.toggle('element-masque', !actif || !syncCloudConfigure());
    if (inputSyncId && actif) {
        inputSyncId.value = obtenirOuCreerSyncId();
    }
    if (inputPseudo && actif) {
        inputPseudo.value = obtenirPseudoLeaderboard();
    }
    if (statut && actif) {
        statut.classList.remove('element-masque');
        const labels = {
            idle: 'Sync cloud : inactif',
            sync: 'Sync cloud : en cours…',
            ok: 'Sync cloud : a jour',
            erreur: 'Sync cloud : erreur reseau',
            'hors-ligne': 'Sync cloud : hors ligne',
            config: 'Sync cloud : URL Supabase invalide',
        };
        const cleStatut = syncCloudConfigure() ? obtenirStatutSyncCloud() : 'config';
        statut.textContent = labels[cleStatut] ?? labels.idle;
    } else {
        statut?.classList.add('element-masque');
    }
    if (actif && syncCloudConfigure()) {
        peuplerSelectsLeaderboardOptions();
        void rafraichirLeaderboardOptions();
    }
}

export function initialiserSyncCloudOptions(
    btnSyncCloud,
    btnSyncMaintenant,
    inputSupabaseUrl,
    inputSupabaseKey,
    inputSyncId,
    btnCopierSyncId
) {
    peuplerSelectsLeaderboardOptions();

    btnSyncCloud?.addEventListener('click', async () => {
        const actif = !syncCloudActif();
        activerSyncCloud(actif);
        if (actif && inputSupabaseUrl?.value && inputSupabaseKey?.value) {
            configurerSupabase(inputSupabaseUrl.value, inputSupabaseKey.value);
        }
        if (inputSyncId && actif) inputSyncId.value = obtenirOuCreerSyncId();
        mettreAJourUiSyncCloud();
        if (actif && syncCloudConfigure()) {
            await synchroniserCloudAuDemarrage();
            mettreAJourUiSyncCloud();
        }
    });

    const persisterSupabase = () => {
        configurerSupabase(inputSupabaseUrl?.value ?? '', inputSupabaseKey?.value ?? '');
        mettreAJourUiSyncCloud();
    };

    inputSupabaseUrl?.addEventListener('change', persisterSupabase);
    inputSupabaseKey?.addEventListener('change', persisterSupabase);

    const inputPseudo = /** @type {HTMLInputElement | null} */ (
        document.getElementById('input-leaderboard-pseudo')
    );
    inputPseudo?.addEventListener('change', () => {
        persisterPseudoLeaderboard(inputPseudo.value);
        mettreAJourUiSyncCloud();
    });

    const selectMode = obtenirSelectLeaderboardMode();
    const selectBiome = obtenirSelectLeaderboardBiome();
    const rafraichirDepuisFiltres = () => void rafraichirLeaderboardOptions();

    selectMode?.addEventListener('change', rafraichirDepuisFiltres);
    selectBiome?.addEventListener('change', rafraichirDepuisFiltres);

    document.getElementById('btn-rafraichir-leaderboard')?.addEventListener('click', () => {
        try {
            if (localStorage.getItem('derniereLigne_haptique') !== 'false') navigator.vibrate?.(8);
        } catch {
            /* ignore */
        }
        void rafraichirLeaderboardOptions();
    });

    btnCopierSyncId?.addEventListener('click', async () => {
        const id = obtenirOuCreerSyncId();
        if (inputSyncId) inputSyncId.value = id;
        try {
            await navigator.clipboard.writeText(id);
        } catch {
            inputSyncId?.select();
        }
    });

    btnSyncMaintenant?.addEventListener('click', async () => {
        if (!syncCloudActif()) return;
        configurerSupabase(inputSupabaseUrl?.value ?? '', inputSupabaseKey?.value ?? '');
        if (!syncCloudConfigure()) {
            mettreAJourUiSyncCloud();
            return;
        }
        await synchroniserCloudAuDemarrage();
        await pousserCloudMaintenant();
        mettreAJourUiSyncCloud();
        void rafraichirLeaderboardOptions();
    });
}
