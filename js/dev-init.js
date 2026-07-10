import {
    activerModeDev,
    basculerModeDev,
    initialiserModeDeveloppeur,
} from './logique/mode-developpeur.js';
import { modeDevActif } from './logique/mode-dev-etat.js';

function devDemandeDansUrl() {
    const params = new URLSearchParams(window.location.search);
    const dev = params.get('dev');
    if (dev === '1' || dev === 'true') return true;
    const brut = window.location.search.toLowerCase();
    return brut.includes('dev=1') || brut.includes('dev1') || brut.includes('=dev1');
}

if (devDemandeDansUrl() || !modeDevActif()) {
    activerModeDev();
} else {
    initialiserModeDeveloppeur();
}

window.__DL_DEV__ = { basculerModeDev, activerModeDev };
