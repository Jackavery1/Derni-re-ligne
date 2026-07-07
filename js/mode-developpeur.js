import { SEQUENCE_HISTOIRE, JOURNAUX_VERA } from './histoire-donnees.js';
import { chargerEtatHistoire, sauvegarderEtatHistoire, ecrireStockage } from './io/progression.js';
import { mettreAJourVisibiliteModesDebloques } from './deblocage-ui.js';
import { reinitialiserCampagneComplete } from './reinitialiser-campagne.js';
import { afficherEcran } from './ui/ecrans-ui.js';
import { ECRANS } from './etat/store-jeu.js';
import { store } from './etat/store-jeu.js';
import { modeDevActif, activerSessionDev, desactiverSessionDev } from './mode-dev-etat.js';

export { modeDevActif } from './mode-dev-etat.js';

function chargerFeuilleDev() {
    if (document.getElementById('feuille-dev')) return;
    const lien = document.createElement('link');
    lien.id = 'feuille-dev';
    lien.rel = 'stylesheet';
    lien.href = 'styles/dev.css';
    document.head.appendChild(lien);
}

export function activerModeDev() {
    activerSessionDev();
    chargerFeuilleDev();
    _monterInterfaceDev();
    rafraichirApresActionDev();
}

export function desactiverModeDev() {
    desactiverSessionDev();
    document.getElementById('panneau-dev')?.remove();
    rafraichirApresActionDev();
}

export function basculerModeDev() {
    if (modeDevActif()) desactiverModeDev();
    else activerModeDev();
}

export function rafraichirApresActionDev() {
    mettreAJourVisibiliteModesDebloques();
    store.histoire.etat = chargerEtatHistoire();
    window.dispatchEvent(new CustomEvent('dl-dev-refresh'));
}

function _reinitialiserHistoire() {
    reinitialiserCampagneComplete();
    rafraichirApresActionDev();
}

function _debloquerTousMondes() {
    const etat = chargerEtatHistoire();
    const ids = SEQUENCE_HISTOIRE.map((m) => m.id);
    etat.mondesCompletes = [...new Set([...etat.mondesCompletes, ...ids])];
    etat.bossVaincus = ['brasier', 'sentinelle', 'archiviste', 'avantgarde', 'distorsion'];
    etat.journauxTrouves = JOURNAUX_VERA.map((j) => j.id);
    etat.conditionsMiroir = { bossArchivisteVaincu: true, tetrisTriplesCyber: 3 };
    etat.conditionsTrame = {
        miroirComplete: true,
        tousJournauxTrouves: true,
        tousBossSansContinue: true,
        actionDistorsionFaite: true,
    };
    etat.conditionsParadoxe = { finSecreteObtenue: true, topsVolontairesPrologue: 3 };
    sauvegarderEtatHistoire(etat);
    rafraichirApresActionDev();
}

function _debloquerConditionsSecrets() {
    const etat = chargerEtatHistoire();
    etat.conditionsMiroir = { bossArchivisteVaincu: true, tetrisTriplesCyber: 3 };
    etat.conditionsTrame = {
        ...etat.conditionsTrame,
        miroirComplete: true,
        tousJournauxTrouves: true,
        tousBossSansContinue: true,
        actionDistorsionFaite: true,
    };
    etat.conditionsParadoxe = {
        finSecreteObtenue: true,
        topsVolontairesPrologue: 3,
    };
    if (!etat.mondesCachesDebloques.includes('monde_miroir')) {
        etat.mondesCachesDebloques.push('monde_miroir');
    }
    sauvegarderEtatHistoire(etat);
    rafraichirApresActionDev();
}

function _reinitialiserMonde(mondeId) {
    if (!mondeId) return;
    const etat = chargerEtatHistoire();
    etat.mondesCompletes = etat.mondesCompletes.filter((id) => id !== mondeId);
    if (etat.mondesDejaMontres) {
        etat.mondesDejaMontres = etat.mondesDejaMontres.filter((id) => id !== mondeId);
    }
    sauvegarderEtatHistoire(etat);
    rafraichirApresActionDev();
}

function _definirNiveauGlobal(niveau) {
    ecrireStockage('derniereLigne_niveauGlobal', String(Math.max(0, niveau)));
    rafraichirApresActionDev();
}

function _masquerTutoriels() {
    ecrireStockage('derniereLigne_tutorielVu', '1');
    ecrireStockage('derniereLigne_tutorielHistoireVu', '1');
    ecrireStockage('derniereLigne_tutorielCoopVu', '1');
    ecrireStockage('derniereLigne_tutorielArchitecteVu', '1');
}

function _monterInterfaceDev() {
    if (document.getElementById('panneau-dev')) return;

    const panneau = document.createElement('div');
    panneau.id = 'panneau-dev';

    const poignee = document.createElement('button');
    poignee.type = 'button';
    poignee.id = 'dev-poignee';
    poignee.title = 'Outils developpeur';
    poignee.textContent = 'DEV';
    poignee.setAttribute('aria-label', 'Outils developpeur');
    poignee.setAttribute('aria-expanded', 'false');
    poignee.setAttribute('aria-controls', 'dev-corps');

    const corps = document.createElement('div');
    corps.id = 'dev-corps';
    corps.hidden = true;

    const titre = document.createElement('p');
    titre.className = 'dev-titre';
    titre.textContent = 'DEV';

    const selectMonde = document.createElement('select');
    selectMonde.id = 'dev-select-monde';
    selectMonde.setAttribute('aria-label', 'Monde histoire');
    const optVide = document.createElement('option');
    optVide.value = '';
    optVide.textContent = '— monde —';
    selectMonde.appendChild(optVide);
    for (const m of SEQUENCE_HISTOIRE) {
        const opt = document.createElement('option');
        opt.value = m.id;
        opt.textContent = m.nomAffiche + (m.estCache ? ' ★' : '');
        selectMonde.appendChild(opt);
    }

    const actions = [
        {
            id: 'dev-lancer-monde',
            label: 'Lancer monde',
            fn: () => {
                const id = selectMonde.value;
                if (!id) return;
                void import('./histoire/histoire-session.js').then(({ demarrerMondeHistoire }) =>
                    demarrerMondeHistoire(id)
                );
            },
        },
        {
            id: 'dev-rejouer-monde',
            label: 'Rejouer monde',
            fn: () => _reinitialiserMonde(selectMonde.value),
        },
        {
            id: 'dev-valider-monde',
            label: 'Valider + suivant',
            fn: () => {
                const id = selectMonde.value;
                if (!id) return;
                void import('./histoire/histoire-manager-completion.js').then(
                    ({ devCompleterMondeHistoire }) => {
                        const { suivant } = devCompleterMondeHistoire(id);
                        rafraichirApresActionDev();
                        if (suivant) selectMonde.value = suivant;
                    }
                );
            },
        },
        {
            id: 'dev-carte',
            label: 'Carte histoire',
            fn: () => afficherEcran(ECRANS.HISTOIRE_MAP),
        },
        {
            id: 'dev-reset-histoire',
            label: 'Reset histoire',
            fn: () => {
                if (confirm('Reinitialiser toute la progression histoire ?'))
                    _reinitialiserHistoire();
            },
        },
        {
            id: 'dev-tous-mondes',
            label: 'Tout completer',
            fn: () => {
                if (confirm('Marquer tous les mondes comme completes ?')) _debloquerTousMondes();
            },
        },
        {
            id: 'dev-secrets',
            label: 'Conditions secrets',
            fn: _debloquerConditionsSecrets,
        },
        {
            id: 'dev-niveau',
            label: 'Niveau global 99',
            fn: () => _definirNiveauGlobal(99),
        },
        {
            id: 'dev-tutoriels',
            label: 'Skip tutoriels',
            fn: _masquerTutoriels,
        },
        {
            id: 'dev-quitter',
            label: 'Quitter DEV',
            fn: desactiverModeDev,
        },
    ];

    corps.append(titre, selectMonde);

    for (const { id, label, fn } of actions) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.id = id;
        btn.className = 'dev-bouton';
        btn.textContent = label;
        btn.addEventListener('click', fn);
        corps.appendChild(btn);
    }

    poignee.addEventListener('click', () => {
        const ouvert = !corps.hidden;
        corps.hidden = ouvert;
        corps.inert = ouvert;
        panneau.classList.toggle('dev-ouvert', !ouvert);
        poignee.setAttribute('aria-expanded', String(!ouvert));
    });

    panneau.append(poignee, corps);
    document.body.appendChild(panneau);
}

function _devDemandeDansUrl() {
    const params = new URLSearchParams(window.location.search);
    const dev = params.get('dev');
    if (dev === '1' || dev === 'true') return true;
    const brut = window.location.search.toLowerCase();
    return brut.includes('dev=1') || brut.includes('dev1') || brut.includes('=dev1');
}

function _ecouterActivationDiscrete() {
    if (_devDemandeDansUrl()) {
        activerModeDev();
    }

    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'd') {
            e.preventDefault();
            basculerModeDev();
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
            activerModeDev();
        }
    });
}

export function initialiserModeDeveloppeur() {
    _ecouterActivationDiscrete();
    if (modeDevActif()) _monterInterfaceDev();
}
