/** Escape ferme les écrans méta (options, codex, profil, etc.) vers le titre. */
let _raccourcisOk = false;

const RETOURS_ECRANS = [
    { ecranId: 'ecran-options', boutonId: 'btn-options-retour' },
    { ecranId: 'ecran-codex', boutonId: 'btn-codex-retour' },
    { ecranId: 'ecran-profil', boutonId: 'btn-profil-menu' },
    { ecranId: 'ecran-achievements', boutonId: 'btn-achievements-retour' },
    { ecranId: 'ecran-selection', boutonId: 'btn-selection-retour' },
    { ecranId: 'ecran-histoire-journal', boutonId: 'btn-journal-fermer' },
    { ecranId: 'ecran-histoire-map', boutonId: 'btn-histoire-retour' },
    { ecranId: 'ecran-archi-selection', boutonId: 'archi-sel-retour' },
];

export function initialiserRaccourcisEcrans() {
    if (_raccourcisOk) return;
    _raccourcisOk = true;
    document.addEventListener('keydown', (e) => {
        if (e.code !== 'Escape' && e.key !== 'Escape') return;
        if (document.body.classList.contains('partie-active')) return;
        if (document.getElementById('ecran-histoire-cutscene')?.classList.contains('actif')) return;
        if (document.getElementById('ecran-pause')?.classList.contains('actif')) return;

        for (const { ecranId, boutonId } of RETOURS_ECRANS) {
            const ecran = document.getElementById(ecranId);
            if (!ecran?.classList.contains('actif')) continue;
            const bouton = document.getElementById(boutonId);
            if (!bouton || bouton.classList.contains('element-masque')) continue;
            e.preventDefault();
            bouton.click();
            return;
        }
    });
}
