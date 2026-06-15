import { store } from './store-core.js';
import {
    obtenirSecondesRestantesAttenteTrame,
    obtenirProgressionAttenteTrameMs,
    conditionsRuntime,
} from './conditions-secrets.js';
import { obtenirEtatHistoire } from './histoire-mondes.js';
import { dialogueBossActif, mettreAJourLabelBossAttaque } from './boss-dialogues.js';

/** @param {boolean} visible */
export function afficherSectionBoss(visible) {
    if (typeof document === 'undefined') return;
    const sectionBoss = document.getElementById('section-boss');
    const sectionMascotte = document.getElementById('section-mascotte');
    if (sectionBoss) sectionBoss.classList.toggle('element-masque', !visible);
    if (sectionMascotte) sectionMascotte.classList.toggle('element-masque', visible);

    if (visible && store.histoire.boss.actif) {
        const elNom = document.getElementById('boss-nom-affiche');
        if (elNom) {
            elNom.textContent = store.histoire.boss.actif.nom ?? 'BOSS';
            elNom.style.color = store.histoire.boss.actif.couleur ?? 'var(--rose)';
        }
    }
}

export function mettreAJourHPBarBoss() {
    if (typeof document === 'undefined') return;
    const boss = store.histoire.boss.actif;
    if (!boss) return;
    const pct = Math.max(0, (store.histoire.boss.pv / boss.pvMax) * 100);
    const fill = document.getElementById('boss-hp-fill');
    const label = document.getElementById('boss-hp-label');
    if (fill) fill.style.width = `${pct}%`;
    if (label) label.textContent = `${store.histoire.boss.pv} / ${boss.pvMax}`;
    if (fill) {
        if (pct > 60) fill.style.background = store.histoire.boss.actif?.couleur ?? 'var(--vert)';
        else if (pct > 30) fill.style.background = 'var(--jaune)';
        else fill.style.background = 'var(--rose)';
    }
}

/** @param {string} texte */
export function afficherTexteBoss(texte) {
    mettreAJourLabelBossAttaque(texte);
}

/** @param {HTMLElement | null} trameWrap @param {HTMLElement | null} trameFill */
function masquerUiAttenteTrame(trameWrap, trameFill) {
    if (trameWrap) {
        trameWrap.classList.add('element-masque');
        trameWrap.setAttribute('aria-hidden', 'true');
    }
    if (trameFill) trameFill.style.width = '0%';
}

function afficherUiAttenteTrame(el, attaqueEl, trameWrap, trameFill) {
    const secRestantes = obtenirSecondesRestantesAttenteTrame();
    const progression = obtenirProgressionAttenteTrameMs();
    if (el) {
        el.textContent = secRestantes > 0 ? `ATTENTE : ${secRestantes}s` : 'CONDITION VALIDÉE';
    }
    if (trameWrap) {
        trameWrap.classList.remove('element-masque');
        trameWrap.setAttribute('aria-hidden', 'false');
    }
    if (trameFill) {
        trameFill.style.width = `${Math.round(progression * 100)}%`;
    }
    if (attaqueEl && !dialogueBossActif()) {
        mettreAJourLabelBossAttaque('NE RIEN EFFACER…');
    }
}

export function mettreAJourTimerUIBoss() {
    if (typeof document === 'undefined') return;
    const el = document.getElementById('boss-timer-label');
    const attaqueEl = document.getElementById('boss-attaque-label');
    const trameWrap = document.getElementById('boss-trame-attente-wrap');
    const trameFill = document.getElementById('boss-trame-attente-fill');

    if (store.histoire.boss.actif?.id === 'distorsion' && conditionsRuntime.trameAttenteActive) {
        afficherUiAttenteTrame(el, attaqueEl, trameWrap, trameFill);
        return;
    }

    masquerUiAttenteTrame(trameWrap, trameFill);

    if (store.histoire.boss.actif?.id === 'distorsion' && attaqueEl && !dialogueBossActif()) {
        const etatHist = obtenirEtatHistoire();
        const ct = etatHist?.conditionsTrame;
        const prerequisOk =
            ct &&
            !ct.actionDistorsionFaite &&
            ct.miroirComplete &&
            ct.tousJournauxTrouves &&
            ct.tousBossSansContinue;
        if (prerequisOk) {
            mettreAJourLabelBossAttaque("UN ÉCHO RÉSONNE… REMPLISSEZ LE PLATEAU SANS L'EFFACER");
        }
    }

    if (el && store.histoire.boss.actif) {
        const sec = Math.ceil(store.histoire.boss.timerAttaque / 1000);
        el.textContent = sec > 0 ? `PROCHAINE : ${sec}s` : 'ATTAQUE !';
    }
}
