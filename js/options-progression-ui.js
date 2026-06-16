import { exporterProgressionB10, importerProgressionB10 } from './progression.js';
import { lierBouton } from './ui-lier-bouton.js';

const MARQUEUR_IMPORT = 'data-neo-import-lie';

async function traiterImportFichier(fichier) {
    if (!fichier) return;

    try {
        const texte = await fichier.text();
        const payload = JSON.parse(texte);
        const resultat = importerProgressionB10(payload);
        if (!resultat.ok) {
            window.alert(resultat.erreur ?? 'Import impossible');
            return;
        }
        const { chargerProfilDernier, afficherProfil } = await import('./profil-jeu.js');
        chargerProfilDernier();
        afficherProfil();
        window.alert(
            `Import reussi : ${resultat.importes} nouvelle(s) entree(s), ${resultat.fusionnes} fusion(s).`
        );
    } catch {
        window.alert('Fichier de sauvegarde invalide.');
    }
}

function lierExportImport({ btnExportId, btnImportId, inputImportId }) {
    lierBouton(btnExportId, () => {
        const exportData = exporterProgressionB10();
        const blob = new Blob([JSON.stringify(exportData, null, 2)], {
            type: 'application/json',
        });
        const url = URL.createObjectURL(blob);
        const lien = document.createElement('a');
        lien.href = url;
        lien.download = `derniere-ligne-records-${exportData.exportedAt.slice(0, 10)}.json`;
        lien.click();
        URL.revokeObjectURL(url);
    });

    lierBouton(btnImportId, () => {
        document.getElementById(inputImportId)?.click();
    });

    const inputImport = document.getElementById(inputImportId);
    if (inputImport instanceof HTMLInputElement && !inputImport.hasAttribute(MARQUEUR_IMPORT)) {
        inputImport.setAttribute(MARQUEUR_IMPORT, '1');
        inputImport.addEventListener('change', async (e) => {
            const cible = /** @type {HTMLInputElement} */ (e.target);
            const fichier = cible.files?.[0];
            cible.value = '';
            await traiterImportFichier(fichier);
        });
    }
}

export function initialiserSauvegardeProgression() {
    lierExportImport({
        btnExportId: 'btn-export-progression',
        btnImportId: 'btn-import-progression',
        inputImportId: 'input-import-progression',
    });
    lierExportImport({
        btnExportId: 'btn-profil-export-progression',
        btnImportId: 'btn-profil-import-progression',
        inputImportId: 'input-profil-import-progression',
    });
}
