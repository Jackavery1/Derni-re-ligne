let _raccourcisOk = false;

export function initialiserRaccourcisHistoire() {
    if (_raccourcisOk) return;
    _raccourcisOk = true;
    document.addEventListener('keydown', (e) => {
        const ecranCutscene = document.getElementById('ecran-histoire-cutscene');
        if (!ecranCutscene?.classList.contains('actif')) return;
        void import('../histoire/histoire-cutscene.js').then(
            ({ avancerCutscene, passerCutscene }) => {
                if (e.code === 'Space' || e.code === 'Enter') {
                    e.preventDefault();
                    avancerCutscene();
                }
                if (e.code === 'Escape') passerCutscene();
            }
        );
    });
}
