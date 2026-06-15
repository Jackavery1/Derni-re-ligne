import {
    syncCloudActif,
    activerSyncCloud,
    configurerSupabase,
    obtenirOuCreerSyncId,
    syncCloudConfigure,
    obtenirPseudoLeaderboard,
    persisterPseudoLeaderboard,
} from './config-sync.js';
import {
    obtenirStatutSyncCloud,
    synchroniserCloudAuDemarrage,
    pousserCloudMaintenant,
} from './progression-sync-cloud.js';
import { chargerBiomeActif } from './progression.js';
import { chargerClassementLeaderboard } from './leaderboard-cloud.js';
import { formaterTemps } from './hud-jeu.js';

function formaterLigneLeaderboard(ligne, mode) {
    if (mode === 'sprint' && ligne.sprint_ms) {
        return `${ligne.pseudo} — ${formaterTemps(ligne.sprint_ms)}`;
    }
    return `${ligne.pseudo} — ${Number(ligne.score).toLocaleString('fr-FR')} pts`;
}

export async function rafraichirLeaderboardOptions(mode = 'marathon') {
    const liste = document.getElementById('liste-leaderboard-options');
    if (!liste || !syncCloudConfigure() || !syncCloudActif()) {
        liste?.replaceChildren();
        return;
    }
    const biome = chargerBiomeActif();
    const entrees = await chargerClassementLeaderboard({ mode, biome, limit: 8 });
    liste.replaceChildren();
    if (entrees.length === 0) {
        const vide = document.createElement('li');
        vide.textContent = 'Aucun score en ligne pour ce biome.';
        liste.appendChild(vide);
        return;
    }
    entrees.forEach((ligne, index) => {
        const item = document.createElement('li');
        item.textContent = `${index + 1}. ${formaterLigneLeaderboard(ligne, mode)}`;
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
        void rafraichirLeaderboardOptions('marathon');
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

    document.getElementById('btn-rafraichir-leaderboard')?.addEventListener('click', () => {
        void rafraichirLeaderboardOptions('marathon');
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
        void rafraichirLeaderboardOptions('marathon');
    });
}
