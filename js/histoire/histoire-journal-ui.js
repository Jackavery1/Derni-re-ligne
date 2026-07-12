/** Journal narratif histoire. */
import { definirExpressionVera } from '../rendu/portraits-vera.js';
import { ECRANS } from '../ui/ecrans-config.js';
import { logger } from '../io/logger.js';
import { obtenirCanvas } from '../logique/dom-utils.js';
import { afficherEcranHistoire } from './histoire-cutscene-nav.js';

let journalCallbackFermer = null;
let _boutonJournalFermeOk = false;

function _lierBoutonJournalFermer() {
    if (_boutonJournalFermeOk) return;
    const btn = document.getElementById('btn-journal-fermer');
    if (!btn || typeof btn.addEventListener !== 'function') return;
    _boutonJournalFermeOk = true;
    btn.addEventListener('click', () => {
        fermerJournalHistoire();
    });
}

export function afficherJournalHistoire(journal, onFermer) {
    definirExpressionVera('journal_decouvert');
    const elTitre = document.getElementById('histoire-journal-titre');
    if (!elTitre) {
        void _afficherJournalApresChargementDom(journal, onFermer);
        return;
    }
    _remplirEtAfficherJournal(journal, onFermer);
}

async function _afficherJournalApresChargementDom(journal, onFermer) {
    try {
        await afficherEcranHistoire(ECRANS.HISTOIRE_JOURNAL);
        if (!document.getElementById('histoire-journal-titre')) {
            logger.warn('[journal] conteneur introuvable apres chargement');
            onFermer?.();
            return;
        }
        _remplirEtAfficherJournal(journal, onFermer);
    } catch (err) {
        logger.error('[journal] echec chargement fragment :', err);
        onFermer?.();
    }
}

function _remplirEtAfficherJournal(journal, onFermer) {
    const elTitre = document.getElementById('histoire-journal-titre');
    const elSsTitre = document.getElementById('histoire-journal-soustitre');
    const elTexte = document.getElementById('histoire-journal-texte');
    const elNum = document.getElementById('histoire-journal-numero');
    const canvas = obtenirCanvas('canvas-journal-illust');

    if (elNum) elNum.textContent = `TRANSMISSION ${String(journal.numero).padStart(2, '0')}`;
    if (elTitre) elTitre.textContent = journal.titre;
    if (elSsTitre) elSsTitre.textContent = journal.sousTitre;

    if (elTexte) {
        elTexte.textContent = '';
        journal.texte.forEach((para, index) => {
            const el = document.createElement('div');
            el.className = 'histoire-journal-para';
            const ligne = typeof para === 'string' ? { personnage: null, texte: para } : para;
            const endommager =
                journal.estEndommage &&
                ligne.personnage === 'vera' &&
                (typeof window !== 'undefined' && window.__NEO_TEST__
                    ? index % 3 === 0
                    : Math.random() < 0.3);
            if (endommager) {
                el.classList.add('histoire-journal-para-endommage');
            }
            if (ligne.personnage) {
                el.classList.add(`histoire-journal-para--${ligne.personnage}`);
            }
            el.textContent = ligne.texte;
            elTexte.appendChild(el);
        });
    }

    if (canvas) {
        const ctx2d = canvas.getContext('2d');
        if (ctx2d) {
            ctx2d.clearRect(0, 0, canvas.width, canvas.height);
            if (journal._illustrerFn) {
                try {
                    journal._illustrerFn(ctx2d, canvas.width, canvas.height);
                } catch (err) {
                    logger.warn('[journal] erreur illustration :', err);
                    illustrationFallback(ctx2d, canvas.width, canvas.height);
                }
            } else if (journal.illustration) {
                void import('../codex/codex-illustrations.js')
                    .then(({ ILLUSTRATIONS_CODEX }) => {
                        const fn = ILLUSTRATIONS_CODEX[journal.illustration];
                        if (typeof fn === 'function') fn(ctx2d, canvas.width, canvas.height);
                        else illustrationFallback(ctx2d, canvas.width, canvas.height);
                    })
                    .catch((err) => {
                        logger.warn('[journal] illustration codex indisponible :', err);
                        illustrationFallback(ctx2d, canvas.width, canvas.height);
                    });
            } else {
                illustrationFallback(ctx2d, canvas.width, canvas.height);
            }
        }
    }

    const elDommage = document.getElementById('histoire-journal-dommage');
    if (elDommage) {
        elDommage.classList.toggle('element-masque', !journal.estEndommage);
    }

    journalCallbackFermer = onFermer ?? null;

    _lierBoutonJournalFermer();
    void afficherEcranHistoire(ECRANS.HISTOIRE_JOURNAL);
}

function illustrationFallback(ctx2d, w, h) {
    ctx2d.fillStyle = '#04020a';
    ctx2d.fillRect(0, 0, w, h);
    ctx2d.fillStyle = 'rgba(255,0,110,0.15)';
    ctx2d.fillRect(0, 0, w, h);
}

export function fermerJournalHistoire() {
    const cb = journalCallbackFermer;
    journalCallbackFermer = null;
    document.getElementById(ECRANS.HISTOIRE_JOURNAL)?.classList.remove('actif');
    try {
        cb?.();
    } catch (err) {
        logger.error('[journal] erreur callback fermeture :', err);
    }
}
