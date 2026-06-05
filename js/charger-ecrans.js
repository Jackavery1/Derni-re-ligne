const ECRANS = [
    'ecran-titre',
    'ecran-achievements',
    'ecran-profil',
    'ecran-codex',
    'ecran-selection',
    'ecran-options',
    'ecran-pause',
    'ecran-game-over',
    'overlays',
    'interface-jeu',
    'controles',
];

export async function chargerEcrans() {
    const conteneur = document.getElementById('conteneur-ecrans');
    if (!conteneur) throw new Error('conteneur-ecrans introuvable');

    const fragments = await Promise.all(
        ECRANS.map(async (nom) => {
            const reponse = await fetch(`html/${nom}.html`);
            if (!reponse.ok) throw new Error(`Échec chargement html/${nom}.html`);
            return reponse.text();
        })
    );

    conteneur.innerHTML = fragments.join('\n');
}
