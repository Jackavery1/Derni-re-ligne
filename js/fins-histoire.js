import { store } from './store-core.js';
import { logger } from './logger.js';
import { FINS, ETAT_HISTOIRE_VIDE } from './histoire-donnees.js';
import { chargerEtatHistoire, sauvegarderEtatHistoire } from './progression.js';
import { ECRANS } from './ecrans-config.js';
import { afficherEcran } from './navigation-ecrans.js';
import { demarrerFondFin } from './fin-bg-rendu.js';
import { verifierAchievements, statsGlobales, sauvegarderStats } from './achievements.js';

function _obtenirEtatHistoire() {
    if (!store.etatHistoire) {
        store.etatHistoire = chargerEtatHistoire();
    }
    return store.etatHistoire;
}

export function executerFin(finId) {
    logger.info('[fins] exécution fin :', finId);

    const etatHist = _obtenirEtatHistoire();
    etatHist.finObtenue = finId;

    if (finId === 'fin_secrete') {
        etatHist.conditionsParadoxe.finSecreteObtenue = true;
    }
    if (!etatHist.toutesFinObtenues) etatHist.toutesFinObtenues = [];
    if (!etatHist.toutesFinObtenues.includes(finId)) {
        etatHist.toutesFinObtenues.push(finId);
    }
    sauvegarderEtatHistoire(etatHist);
    store.etatHistoire = etatHist;
    statsGlobales.toutesFinHistoire = [...etatHist.toutesFinObtenues];
    sauvegarderStats();

    _afficherEcranFin(finId, etatHist);
    demarrerFondFin(finId);
    verifierAchievements();
}

function _afficherEcranFin(finId, etatHist) {
    const fin = FINS[finId];
    if (!fin) {
        logger.warn('[fins] finId inconnu :', finId);
        afficherEcran(ECRANS.TITRE);
        return;
    }

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
        elStats.innerHTML = _genererStatsFinales(etatHist, finId);
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
        elHint.style.display = finId === 'fin_normale' ? 'block' : 'none';
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

    afficherEcran(ECRANS.HISTOIRE_FIN);
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

function _genererStatsFinales(etatHist, finId) {
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

    return items
        .map(
            (it) => `
        <div class="histoire-fin-stat-item">
            <span class="histoire-fin-stat-label">${it.label}</span>
            <span class="histoire-fin-stat-valeur"
                  style="color:${it.couleur};text-shadow:0 0 6px ${it.couleur}">
                ${it.valeur}
            </span>
        </div>
    `
        )
        .join('');
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

    const nouvelEtat = {
        ...ETAT_HISTOIRE_VIDE,
        conditionsTrame: {
            ...ETAT_HISTOIRE_VIDE.conditionsTrame,
            miroirComplete: miroirDebloque,
        },
        conditionsParadoxe: {
            finSecreteObtenue: finSecrete,
            topsVolontairesPrologue: topsC3,
        },
        toutesFinObtenues: toutesFins,
        enModeHistoire: true,
    };

    if (miroirDebloque) {
        nouvelEtat.conditionsMiroir.bossArchivisteVaincu = true;
        nouvelEtat.conditionsMiroir.tetrisTriplesCyber = 3;
    }
    if (trameDebloquee) {
        nouvelEtat.conditionsTrame.miroirComplete = true;
    }

    sauvegarderEtatHistoire(nouvelEtat);
    store.etatHistoire = nouvelEtat;
    logger.info('[fins] histoire réinitialisée pour replay');
}
