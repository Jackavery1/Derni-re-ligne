import { exporterProgressionB10, importerProgressionB10 } from './progression.js';

export function initialiserSauvegardeProgression() {
    const btnExport = document.getElementById('btn-export-progression');
    const btnImport = document.getElementById('btn-import-progression');
    const inputImport = document.getElementById('input-import-progression');

    btnExport?.addEventListener('click', () => {
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

    btnImport?.addEventListener('click', () => {
        inputImport?.click();
    });

    inputImport?.addEventListener('change', async (e) => {
        const cible = /** @type {HTMLInputElement} */ (e.target);
        const fichier = cible.files?.[0];
        cible.value = '';
        if (!fichier) return;

        try {
            const texte = await fichier.text();
            const payload = JSON.parse(texte);
            const resultat = importerProgressionB10(payload);
            if (!resultat.ok) {
                window.alert(resultat.erreur ?? 'Import impossible');
                return;
            }
            const [{ chargerProfilDernier }] = await Promise.all([import('./profil-jeu.js')]);
            chargerProfilDernier();
            window.alert(
                `Import reussi : ${resultat.importes} nouvelle(s) entree(s), ${resultat.fusionnes} fusion(s).`
            );
        } catch {
            window.alert('Fichier de sauvegarde invalide.');
        }
    });
}
