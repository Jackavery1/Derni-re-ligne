let filtreDifficulteArchi = '1';
let filtreDifficulteArchiOk = false;

export function synchroniserUiFiltreDifficulteArchi() {
    document.querySelectorAll('.archi-filtre-btn').forEach((b) => {
        const btn = /** @type {HTMLElement} */ (b);
        btn.classList.toggle('actif', btn.dataset.difficulte === filtreDifficulteArchi);
    });
}

export function reinitialiserFiltreDifficulteArchiParDefaut() {
    filtreDifficulteArchi = '1';
    synchroniserUiFiltreDifficulteArchi();
}

export function appliquerFiltreDifficulteArchi() {
    document.querySelectorAll('.carte-niveau-archi').forEach((el) => {
        const carte = /** @type {HTMLElement} */ (el);
        const diff = carte.dataset.difficulte ?? '';
        const visible = filtreDifficulteArchi === 'tous' || diff === filtreDifficulteArchi;
        carte.classList.toggle('element-masque', !visible);
    });
}

export function initialiserFiltreDifficulteArchi() {
    synchroniserUiFiltreDifficulteArchi();
    if (filtreDifficulteArchiOk) return;
    filtreDifficulteArchiOk = true;
    document.getElementById('archi-filtre-difficulte')?.addEventListener('click', (e) => {
        const cible = e.target instanceof Element ? e.target : null;
        const btn = cible?.closest('.archi-filtre-btn');
        if (!(btn instanceof HTMLElement) || !btn.dataset.difficulte) return;
        filtreDifficulteArchi = btn.dataset.difficulte;
        document.querySelectorAll('.archi-filtre-btn').forEach((b) => {
            b.classList.toggle('actif', b === btn);
        });
        appliquerFiltreDifficulteArchi();
    });
}
