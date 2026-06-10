/** Journal narratif histoire. */
import { definirExpressionVera } from './portraits-vera.js';
import { ECRANS } from './ecrans-config.js';
import { logger } from './logger.js';
import { obtenirCanvas } from './dom-utils.js';
import { afficherEcranHistoire, cacherEcransHistoire } from './histoire-cutscene-nav.js';

let journalCallbackFermer = null;

export function afficherJournalHistoire(journal, onFermer) {
    definirExpressionVera('journal_decouvert');
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
        journal.texte.forEach((para) => {
            const el = document.createElement('div');
            el.className = 'histoire-journal-para';
            if (journal.estEndommage && Math.random() < 0.3) {
                el.classList.add('histoire-journal-para-endommage');
            }
            el.textContent = para;
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
                void import('./codex-illustrations.js')
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

    afficherEcranHistoire(ECRANS.HISTOIRE_JOURNAL);
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
    cacherEcransHistoire();
    cb?.();
}
