import { modeDevActif } from './mode-dev-etat.js';

function devDemandeDansUrl() {
    const params = new URLSearchParams(window.location.search);
    const dev = params.get('dev');
    if (dev === '1' || dev === 'true') return true;
    const brut = window.location.search.toLowerCase();
    return brut.includes('dev=1') || brut.includes('dev1') || brut.includes('=dev1');
}

function chargerDevInit() {
    if (document.querySelector('script[data-dev-init]')) return;
    const script = document.createElement('script');
    script.type = 'module';
    script.src = 'js/dev-init.js';
    script.dataset.devInit = '1';
    document.head.appendChild(script);
}

export function initialiserEcouteurDev() {
    if (devDemandeDansUrl() || modeDevActif()) {
        chargerDevInit();
    }

    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'd') {
            e.preventDefault();
            if (window.__DL_DEV__) {
                window.__DL_DEV__.basculerModeDev();
                return;
            }
            chargerDevInit();
        }
    });

    let clics = 0;
    let timer = null;
    (
        document.getElementById('menu-titre-dl') ?? document.querySelector('.menu-titre-dl')
    )?.addEventListener('click', () => {
        clics++;
        clearTimeout(timer);
        timer = setTimeout(() => {
            clics = 0;
        }, 1800);
        if (clics >= 5) {
            clics = 0;
            chargerDevInit();
        }
    });
}
