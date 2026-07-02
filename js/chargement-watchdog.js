const DELAI_MS = 30000;

function afficherErreurChargement(message) {
    const banniere = document.getElementById('banniere-erreur');
    if (!banniere) return;
    const texte = document.getElementById('banniere-erreur-texte');
    if (texte) texte.textContent = message;
    banniere.classList.add('visible');

    const ecran = document.getElementById('ecran-chargement');
    if (!ecran) return;
    ecran.classList.remove('actif', 'sortie');
    ecran.setAttribute('aria-busy', 'false');
}

window.setTimeout(() => {
    const ecran = document.getElementById('ecran-chargement');
    if (!ecran?.classList.contains('actif')) return;
    if (document.body?.dataset?.neoTestReady === '1') return;

    afficherErreurChargement(
        'Chargement trop long. Lancez npm start (pas Live Server ni file://) puis rechargez la page.'
    );
}, DELAI_MS);
