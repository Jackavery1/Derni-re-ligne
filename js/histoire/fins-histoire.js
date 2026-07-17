import { store } from '../etat/store-jeu.js';
import { logger } from '../io/logger.js';
import { FINS, ETAT_HISTOIRE_VIDE } from '../histoire/histoire-donnees-exports.js';
import { obtenirEtatHistoirePersiste, persisterEtatHistoire } from './histoire-etat.js';
import { ECRANS } from '../ui/ecrans-config.js';
import { assurerFragmentsEcran } from '../ui/charger-ecrans.js';
import { afficherEcranDiffere, afficherEcranDiffereAsync } from '../ui/navigation-actions.js';
import { demarrerFondFin, arreterFondFin } from '../rendu/fin-bg-rendu.js';
import { activerModeHistoire, desactiverModeHistoire } from '../etat/mode-histoire.js';
import { verifierAchievements, statsGlobales, sauvegarderStats } from '../achievements.js';

const MARQUEUR_FIN = 'data-neo-fin-lie';
let _boutonsFinOk = false;

function _lierBoutonsFinDom() {
    if (_boutonsFinOk) return;
    _boutonsFinOk = true;
    const lier = (id, handler) => {
        const el = document.getElementById(id);
        if (!el || el.hasAttribute(MARQUEUR_FIN) || typeof el.addEventListener !== 'function')
            return;
        el.setAttribute(MARQUEUR_FIN, '1');
        el.addEventListener('click', () => {
            void handler();
        });
    };
    lier('btn-fin-menu', () => {
        arreterFondFin();
        desactiverModeHistoire();
        document.body.classList.remove('histoire-active');
        afficherEcranDiffere(ECRANS.TITRE);
    });
    lier('btn-fin-rejouer', () => {
        arreterFondFin();
        reinitialiserHistoirePourReplay();
        document.body.classList.remove('histoire-active');
        activerModeHistoire();
        afficherEcranDiffere(ECRANS.HISTOIRE_MAP);
    });
}

function _obtenirEtatHistoire() {
    return obtenirEtatHistoirePersiste();
}

export function executerFin(finId) {
    logger.info('[fins] execution fin :', finId);

    const etatHist = _obtenirEtatHistoire();
    etatHist.finObtenue = finId;

    if (finId === 'fin_secrete') {
        etatHist.conditionsParadoxe.finSecreteObtenue = true;
    }
    if (!etatHist.toutesFinObtenues) etatHist.toutesFinObtenues = [];
    if (!etatHist.toutesFinObtenues.includes(finId)) {
        etatHist.toutesFinObtenues.push(finId);
    }
    persisterEtatHistoire(etatHist);
    store.histoire.etat = etatHist;
    statsGlobales.toutesFinHistoire = [...etatHist.toutesFinObtenues];
    sauvegarderStats();

    void _afficherEcranFin(finId, etatHist);
    demarrerFondFin(finId);
    verifierAchievements();
}

async function _afficherEcranFin(finId, etatHist) {
    const fin = FINS[finId];
    if (!fin) {
        logger.warn('[fins] finId inconnu :', finId);
        afficherEcranDiffere(ECRANS.TITRE);
        return;
    }

    await assurerFragmentsEcran([ECRANS.HISTOIRE_MAP]);
    _lierBoutonsFinDom();

    const elTitre = document.getElementById('histoire-fin-titre');
    const elCorps = document.getElementById('histoire-fin-corps');
    const elStats = document.getElementById('histoire-fin-stats');
    const elBtnR = document.getElementById('btn-fin-rejouer');

    if (elTitre) {
        elTitre.textContent = fin.titre;
        elTitre.style.color = _couleurFin(finId);
        elTitre.style.textShadow = `0 0 14px ${_couleurFin(finId)}`;
    }

    if (elCorps) {
        elCorps.textContent = '';
        fin.texte.forEach((para) => {
            const el = document.createElement('div');
            el.className = 'histoire-fin-para';
            el.textContent = para;
            elCorps.appendChild(el);
        });
    }

    if (elStats) {
        _remplirStatsFinales(elStats, etatHist, finId);
    }

    if (elBtnR) {
        elBtnR.textContent =
            finId === 'fin_secrete' ? '↺ UNE AUTRE FIN ?' : '↺ REJOUER LE MODE HISTOIRE';
    }

    _decorerEcranFin(finId);

    const elHint = document.getElementById('histoire-fin-hint');
    if (elHint) {
        elHint.textContent =
            finId === 'fin_normale' ? "D'autres fins existent. Explore davantage." : '';
        elHint.classList.toggle('element-masque', finId !== 'fin_normale');
    }

    const elEmbleme = document.getElementById('histoire-fin-embleme');
    if (elEmbleme) {
        const EMBLEMES = {
            fin_normale: '◻',
            fin_vraie: '∞',
            fin_secrete: '✦',
        };
        elEmbleme.textContent = EMBLEMES[finId] ?? '✦';
    }

    void _afficherEcranFinAsync();
}

async function _afficherEcranFinAsync() {
    await afficherEcranDiffereAsync(ECRANS.HISTOIRE_FIN);
}

function _couleurFin(finId) {
    switch (finId) {
        case 'fin_normale':
            return '#00f5ff';
        case 'fin_vraie':
            return '#00ff88';
        case 'fin_secrete':
            return '#ffe600';
        default:
            return '#ffffff';
    }
}

function _obtenirItemsStats(etatHist, finId) {
    const nbMondes = etatHist.mondesCompletes.filter(
        (id) => !['monde_miroir', 'monde_trame', 'monde_paradoxe'].includes(id)
    ).length;
    const nbJournaux = etatHist.journauxTrouves.length;
    const nbContinues = etatHist.nbContinuesUtilises ?? 0;
    const nbBoss = etatHist.bossVaincus?.length ?? 0;

    const items = [
        { label: 'MONDES TRAVERSÉS', valeur: `${nbMondes} / 17`, couleur: '#00f5ff' },
        { label: 'TRANSMISSIONS VERA', valeur: `${nbJournaux} / 9`, couleur: '#ff006e' },
        { label: 'BOSS VAINCUS', valeur: `${nbBoss} / 5`, couleur: '#ffe600' },
        {
            label: 'CONTINUES UTILISÉS',
            valeur: String(nbContinues),
            couleur: nbContinues === 0 ? '#00ff88' : '#ff8800',
        },
    ];

    if (finId === 'fin_vraie' || finId === 'fin_secrete') {
        items.push({
            label: 'MONDE MIROIR',
            valeur: etatHist.mondesCompletes.includes('monde_miroir') ? '✓ DÉCOUVERT' : '✗ MANQUÉ',
            couleur: '#ff8800',
        });
    }
    if (finId === 'fin_secrete') {
        items.push({
            label: 'TRAME PRIMORDIALE',
            valeur: etatHist.mondesCompletes.includes('monde_trame') ? '✓ DÉCOUVERTE' : '✗ MANQUÉE',
            couleur: '#ffe600',
        });
    }

    return items;
}

/** @param {HTMLElement} conteneur @param {typeof ETAT_HISTOIRE_VIDE} etatHist @param {string} finId */
function _remplirStatsFinales(conteneur, etatHist, finId) {
    conteneur.replaceChildren();
    for (const it of _obtenirItemsStats(etatHist, finId)) {
        const ligne = document.createElement('div');
        ligne.className = 'histoire-fin-stat-item';

        const label = document.createElement('span');
        label.className = 'histoire-fin-stat-label';
        label.textContent = it.label;

        const valeur = document.createElement('span');
        valeur.className = 'histoire-fin-stat-valeur';
        valeur.textContent = it.valeur;
        valeur.style.color = it.couleur;
        valeur.style.textShadow = `0 0 6px ${it.couleur}`;

        ligne.append(label, valeur);
        conteneur.appendChild(ligne);
    }
}

function _decorerEcranFin(finId) {
    const ecran = document.getElementById('ecran-histoire-fin');
    if (!ecran) return;
    ecran.dataset.fin = finId;
}

export function reinitialiserHistoirePourReplay() {
    const etatHist = _obtenirEtatHistoire();

    const miroirDebloque = etatHist.mondesCompletes.includes('monde_miroir');
    const trameDebloquee = etatHist.mondesCompletes.includes('monde_trame');
    const finSecrete = etatHist.conditionsParadoxe.finSecreteObtenue;
    const topsC3 = etatHist.conditionsParadoxe.topsVolontairesPrologue ?? 0;
    const toutesFins = etatHist.toutesFinObtenues ?? [];

    const nouvelEtat = structuredClone(ETAT_HISTOIRE_VIDE);
    Object.assign(nouvelEtat, {
        conditionsTrame: {
            ...nouvelEtat.conditionsTrame,
            miroirComplete: miroirDebloque,
        },
        conditionsParadoxe: {
            finSecreteObtenue: finSecrete,
            topsVolontairesPrologue: topsC3,
        },
        toutesFinObtenues: toutesFins,
        enModeHistoire: true,
    });

    if (miroirDebloque) {
        nouvelEtat.conditionsMiroir.bossArchivisteVaincu = true;
        nouvelEtat.conditionsMiroir.tetrisTriplesCyber = 3;
    }
    if (trameDebloquee) {
        nouvelEtat.conditionsTrame.miroirComplete = true;
    }

    persisterEtatHistoire(nouvelEtat);
    logger.info('[fins] histoire reinitialisee pour replay');
}
