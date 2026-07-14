import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

function splitRenduBlocsStyles() {
    const lines = readFileSync('js/rendu-blocs-styles.js', 'utf8').split('\n');
    const importLine = lines[0];
    const nature = [importLine, '', ...lines.slice(10, 286)].join('\n');
    const tech = [importLine, '', ...lines.slice(287)].join('\n');
    writeFileSync('js/rendu-blocs-styles-nature.js', `${nature}\n`);
    writeFileSync('js/rendu-blocs-styles-tech.js', `${tech}\n`);
    writeFileSync(
        'js/rendu-blocs-styles.js',
        `export {
    dessinerBlocBiseaute,
    dessinerBlocFondu,
    dessinerBlocCristal,
    dessinerBlocOrganique,
    dessinerBlocGlace,
} from '../../js/rendu/rendu-blocs-styles-nature.js';
export {
    dessinerBlocGrain,
    dessinerBlocCircuit,
    dessinerBlocDiamant,
    dessinerBlocNebuleuse,
} from '../../js/rendu/rendu-blocs-styles-tech.js';
`
    );
    console.log('rendu-blocs-styles découpé');
}

function splitCoopLogique() {
    const src = readFileSync('js/coop-logique.js', 'utf8').split('\n');
    const lignesModule = [
        "import { CONFIG } from '../../js/config/config.js';",
        "import { appliquerScoreLignes } from '../../js/logique/score-partie.js';",
        "import { statsGlobales } from '../../js/achievements.js';",
        "import { afficherNotificationNiveau } from '../../js/ui/ui-notifications.js';",
        "import { obtenirBouton } from '../../js/logique/dom-utils.js';",
        "import { creerParticulesLigne } from '../../js/rendu/particules-jeu.js';",
        "import { etat } from '../../js/etat/store-jeu.js';",
        "import { coop, DEMI_LARGEUR, coop_rafraichirStats } from '../../js/logique/coop-logique.js';",
        '',
        ...src.slice(172, 267),
    ].join('\n');
    writeFileSync('js/coop-lignes-score.js', `${lignesModule}\n`);

    const kept = [
        ...src.slice(0, 171),
        'import {',
        '    afficherNotifSynchro,',
        '    afficherNotifNiveauCoop,',
        '    coop_calculerScore,',
        '    coop_verifierLignes,',
        "} from '../../js/logique/coop-lignes-score.js';",
        '',
        ...src.slice(268),
    ].join('\n');
    writeFileSync('js/coop-logique.js', kept);
    console.log('coop-logique découpé');
}

function splitBossJeu() {
    const src = readFileSync('js/boss-jeu.js', 'utf8').split('\n');

    const uiHud = [
        "import { store } from '../../js/etat/store-core.js';",
        "import { modeHistoireEnCours } from '../../js/etat/mode-histoire.js';",
        'import {',
        '    obtenirSecondesRestantesAttenteTrame,',
        '    obtenirProgressionAttenteTrameMs,',
        '    conditionsRuntime,',
        "} from '../../js/histoire/conditions-secrets.js';",
        "import { obtenirEtatHistoire } from '../../js/histoire/histoire-mondes.js';",
        "import { dialogueBossActif, mettreAJourLabelBossAttaque } from '../../js/histoire/boss-dialogues.js';",
        '',
        ...src.slice(360, 396),
        '',
        ...src.slice(398, 422),
        '',
        ...src.slice(424, 456),
        '',
        'export function mettreAJourHPBarBoss() {',
        ...src.slice(377, 391).map((l) => l.replace('function _mettreAJourHPBar', '')),
        '}',
        '',
        'export function afficherSectionBoss(visible) {',
        ...src.slice(361, 375).map((l) => l.replace('function _afficherSectionBoss', '')),
        '}',
        '',
        'export function afficherTexteBoss(texte) {',
        ...src.slice(393, 396).map((l) => l.replace('function _afficherTexteBoss', '')),
        '}',
        '',
        'export function mettreAJourTimerUIBoss() {',
        ...src.slice(424, 456).map((l) => l.replace('function _mettreAJourTimerUI', '')),
        '}',
    ].join('\n');

    // Rebuild ui file cleanly from source sections
    writeFileSync(
        'js/boss-ui-hud.js',
        `import { store } from '../../js/etat/store-core.js';
import { modeHistoireEnCours } from '../../js/etat/mode-histoire.js';
import {
    obtenirSecondesRestantesAttenteTrame,
    obtenirProgressionAttenteTrameMs,
    conditionsRuntime,
} from '../../js/histoire/conditions-secrets.js';
import { obtenirEtatHistoire } from '../../js/histoire/histoire-mondes.js';
import { dialogueBossActif, mettreAJourLabelBossAttaque } from '../../js/histoire/boss-dialogues.js';

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
    if (fill) fill.style.width = \`\${pct}%\`;
    if (label) label.textContent = \`\${store.histoire.boss.pv} / \${boss.pvMax}\`;
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
        el.textContent = secRestantes > 0 ? \`ATTENTE : \${secRestantes}s\` : 'CONDITION VALIDÉE';
    }
    if (trameWrap) {
        trameWrap.classList.remove('element-masque');
        trameWrap.setAttribute('aria-hidden', 'false');
    }
    if (trameFill) {
        trameFill.style.width = \`\${Math.round(progression * 100)}%\`;
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
        el.textContent = sec > 0 ? \`PROCHAINE : \${sec}s\` : 'ATTAQUE !';
    }
}
`
    );

    writeFileSync(
        'js/boss-combat.js',
        `import { CONFIG } from '../../js/config/config.js';
import { store } from '../../js/etat/store-core.js';
import { etat } from '../../js/etat/store-jeu.js';
import { AudioMoteur } from '../../js/audio/audio.js';
import { modeHistoireEnCours } from '../../js/etat/mode-histoire.js';
import { creerParticulesExplosion } from '../../js/rendu/particules-jeu.js';
import { enregistrerVictoireBossTimer } from '../../js/achievements/achievements-histoire.js';
import {
    notifierPhaseBoss,
    notifierPhaseBossParPv,
    victoireObjectifDeclenchee,
} from '../../js/logique/gestionnaire-difficulte.js';
import {
    reagirRoboBossAttaque,
    reagirRoboBossDegats,
    reagirRoboBossVaincu,
} from '../../js/ui/mascotte-robo.js';
import { degelColonnes, executerAttaqueBoss } from '../../js/logique/boss-attaques.js';
import {
    enqueueDialogueBoss,
    notifierTransitionPhaseBoss,
    notifierSeuilsPvBoss,
    notifierQuasiVaincuBoss,
    dialogueBossActif,
} from '../../js/histoire/boss-dialogues.js';
import { DUREE_VICTOIRE_BOSS_MS } from '../../js/logique/boss-jeu-constantes.js';
import { afficherTexteBoss, mettreAJourHPBarBoss } from '../../js/rendu/boss-ui-hud.js';

/** @returns {import('../../js/logique/boss-attaques.js').ContexteAttaqueBoss} */
function ctxAttaque() {
    return {
        plateau: etat.plateau,
        effets: store.histoire.boss.effets,
        bossActif: store.histoire.boss.actif,
    };
}

/** @param {{ id?: string, attaqueIntervalleMs?: number }} boss */
export function obtenirIntervalleAttaqueBoss(boss) {
    const base = boss.attaqueIntervalleMs ?? 15000;
    if (boss.id === 'distorsion' && store.histoire.boss.pv <= 12) {
        return 9000;
    }
    return base;
}

/** @param {number} nbLignes */
export function endommagerBossCombat(nbLignes) {
    if (!store.histoire.boss.actif || store.histoire.boss.vaincu) return;
    store.histoire.boss.pv = Math.max(0, store.histoire.boss.pv - nbLignes);
    mettreAJourHPBarBoss();
    reagirRoboBossDegats();

    const boss = store.histoire.boss.actif;
    const pctRestant = (store.histoire.boss.pv / boss.pvMax) * 100;
    if (modeHistoireEnCours()) {
        notifierQuasiVaincuBoss(pctRestant);
    }

    if (store.histoire.boss.pv <= 0) {
        declencherVictoireBoss();
    }
}

export function declencherVictoireBoss() {
    if (store.histoire.boss.vaincu) return;
    store.histoire.boss.vaincu = true;
    store.histoire.boss.timerVaincu = DUREE_VICTOIRE_BOSS_MS;
    if (store.histoire.boss.timerDebut) {
        enregistrerVictoireBossTimer(store.histoire.boss.timerDebut);
    }

    const boss = store.histoire.boss.actif;
    const texte = boss?.texteDefaite ?? boss?.texteDefaite_normal ?? 'Defaite...';
    enqueueDialogueBoss(texte);
    reagirRoboBossVaincu();

    for (let i = 0; i < 20; i++) {
        const x = Math.floor(Math.random() * CONFIG.colonnes);
        const y = Math.floor(Math.random() * 6);
        creerParticulesExplosion(x, y, boss?.couleur ?? '#ffe600');
    }
    if (!AudioMoteur.muet) AudioMoteur.son('tetris');

    setTimeout(() => {
        if (victoireObjectifDeclenchee()) return;
        import('../../js/logique/actions-jeu.js').then(({ obtenirActions }) => {
            obtenirActions().terminerPartie?.(true);
        });
    }, DUREE_VICTOIRE_BOSS_MS);
}

export function executerAttaqueBossCombat() {
    if (!store.histoire.boss.actif || store.histoire.boss.vaincu) return;
    store.histoire.boss._flashAttaque = true;
    reagirRoboBossAttaque();
    setTimeout(() => {
        if (store.histoire.boss.actif) store.histoire.boss._flashAttaque = false;
    }, 280);

    const boss = store.histoire.boss.actif;
    const attaque = executerAttaqueBoss(boss, store.histoire.boss.phase, ctxAttaque());
    if (attaque) afficherEffetAttaqueBoss(attaque.type, attaque.dureeMs, attaque.resultat);
}

/**
 * @param {string} type
 * @param {number} dureeMs
 * @param {unknown} resultat
 */
function afficherEffetAttaqueBoss(type, dureeMs, resultat) {
    switch (type) {
        case 'rangee_braise':
            if (resultat === false) {
                enqueueDialogueBoss('🔥 BRAISE CONTENUE');
            } else {
                enqueueDialogueBoss('🔥 RANGÉE DE BRAISE');
                if (!AudioMoteur.muet) AudioMoteur.son('verrou');
            }
            break;
        case 'colonne_gelee': {
            const colonnes = /** @type {number[] | undefined} */ (resultat);
            if (colonnes?.length) {
                enqueueDialogueBoss(\`❄ COLONNES \${colonnes.map((c) => c + 1).join(', ')} GELÉES\`);
                if (!AudioMoteur.muet) AudioMoteur.son('hold');
            }
            break;
        }
        case 'inverser_controles':
            enqueueDialogueBoss('⚠ CONTRÔLES INVERSÉS');
            if (!AudioMoteur.muet) AudioMoteur.son('niveau');
            break;
        case 'faux_fantome':
            enqueueDialogueBoss('⚠ SIGNAL BROUILLÉ');
            if (!AudioMoteur.muet) AudioMoteur.son('rotation');
            break;
        case 'distorsion_plateau':
            enqueueDialogueBoss('∞ DISTORSION ACTIVE');
            if (!AudioMoteur.muet) AudioMoteur.son('rotation');
            break;
        case 'permutation_colonnes': {
            const cols = /** @type {[number, number] | null | undefined} */ (resultat);
            if (cols) {
                enqueueDialogueBoss(\`🌀 PERMUTATION DES COLONNES \${cols[0] + 1} ↔ \${cols[1] + 1}\`);
                if (!AudioMoteur.muet) AudioMoteur.son('rotation');
            }
            break;
        }
        default:
            break;
    }
}

export function degelColonnesBoss() {
    degelColonnes(etat.plateau, store.histoire.boss.effets);
    if (!dialogueBossActif()) afficherTexteBoss('');
}

export function verifierPhaseBoss() {
    const boss = store.histoire.boss.actif;
    if (!boss) return;

    const pctRestant = (store.histoire.boss.pv / boss.pvMax) * 100;

    if (modeHistoireEnCours()) {
        notifierSeuilsPvBoss(pctRestant);
        notifierPhaseBossParPv(boss.id, pctRestant);
    }

    const phaseAvant = store.histoire.boss.phase;

    if (!boss.phases) return;

    for (let i = boss.phases.length - 1; i >= 0; i--) {
        const phase = boss.phases[i];
        const seuilPhase = phase.pvSeuil ?? boss.pvMax;
        if (store.histoire.boss.pv <= seuilPhase && store.histoire.boss.phase < i) {
            store.histoire.boss.phase = i;
            if (modeHistoireEnCours()) {
                notifierTransitionPhaseBoss(phaseAvant, store.histoire.boss.phase);
            } else {
                enqueueDialogueBoss('⚠ NOUVELLE PHASE');
            }
            if (!AudioMoteur.muet) AudioMoteur.son('niveau');
            setTimeout(executerAttaqueBossCombat, 800);
            if (store.histoire.boss.phase !== phaseAvant) {
                notifierPhaseBoss(boss.id, store.histoire.boss.phase);
            }
            break;
        }
    }
}
`
    );

    writeFileSync('js/boss-jeu-constantes.js', `export const DUREE_VICTOIRE_BOSS_MS = 2200;\n`);

    const bossMain = `import { store } from '../../js/etat/store-core.js';
import { etat } from '../../js/etat/store-jeu.js';
import { BOSS } from '../../js/histoire/histoire-donnees-exports.js';
import { AudioMoteur } from '../../js/audio/audio.js';
import { logger } from '../../js/io/logger.js';
import { modeHistoireEnCours } from '../../js/etat/mode-histoire.js';
import {
    tickConditionTrame,
    reinitialiserConditionsRuntime,
} from '../../js/histoire/conditions-secrets.js';
import { demarrerPresentationBoss, mettreAJourDialoguesBoss, reinitialiserDialoguesBoss } from '../../js/histoire/boss-dialogues.js';
import { COULEUR_BRAISE, COULEUR_GLACE_B } from '../../js/logique/boss-attaques.js';
import { DUREE_VICTOIRE_BOSS_MS } from '../../js/logique/boss-jeu-constantes.js';
import {
    afficherSectionBoss,
    afficherTexteBoss,
    mettreAJourHPBarBoss,
    mettreAJourTimerUIBoss,
} from '../../js/rendu/boss-ui-hud.js';
import {
    degelColonnesBoss,
    endommagerBossCombat,
    executerAttaqueBossCombat,
    obtenirIntervalleAttaqueBoss,
    verifierPhaseBoss,
} from '../../js/logique/boss-combat.js';

export { COULEUR_BRAISE, COULEUR_GLACE_B };
export {
    notifierTetrisBoss,
    obtenirRepliqueGameOverBoss,
    appliquerRepliqueGameOverBoss,
} from '../../js/histoire/boss-dialogues.js';
export { DUREE_VICTOIRE_BOSS_MS } from '../../js/logique/boss-jeu-constantes.js';

/** @param {string} bossId */
export function demarrerBoss(bossId) {
    const boss = BOSS[bossId];
    if (!boss) {
        logger.warn('[boss] bossId inconnu :', bossId);
        return;
    }
    reinitialiserDialoguesBoss();
    store.histoire.boss.actif = boss;
    store.histoire.boss.pv = boss.pvMax;
    store.histoire.boss.phase = 0;
    store.histoire.boss.timerAttaque = obtenirIntervalleAttaqueBoss(boss);
    store.histoire.boss.timerAttaqueActive = 0;
    store.histoire.boss.vaincu = false;
    store.histoire.boss.timerVaincu = 0;
    store.histoire.boss.timerDebut = performance.now();
    store.histoire.boss.timerPortrait = 0;
    store.histoire.boss._textesMiAffiches = null;
    store.histoire.boss._flashAttaque = false;
    reinitialiserMecaniquesBoss();

    afficherSectionBoss(true);
    mettreAJourHPBarBoss();

    if (modeHistoireEnCours()) {
        demarrerPresentationBoss(bossId);
        afficherTexteBoss(
            boss.entrainement
                ? 'ENTRAINEMENT — attaques ralenties, apprenez le rythme avant la Distorsion.'
                : ''
        );
    } else {
        afficherTexteBoss(boss.texteApparition ?? '');
    }

    logger.info('[boss] demarre :', bossId, 'PV:', boss.pvMax);
    if (!AudioMoteur.muet) AudioMoteur.jouerStingerBoss?.();
    reinitialiserConditionsRuntime();
}

export function arreterBoss() {
    if (!store.histoire.boss.actif) return;
    reinitialiserMecaniquesBoss();
    reinitialiserDialoguesBoss();
    store.histoire.boss._textesMiAffiches = null;
    store.histoire.boss._flashAttaque = false;
    store.histoire.boss.actif = null;
    store.histoire.boss.pv = 0;
    store.histoire.boss.phase = 0;
    store.histoire.boss.timerAttaque = 0;
    store.histoire.boss.timerAttaqueActive = 0;
    store.histoire.boss.vaincu = false;
    store.histoire.boss.timerVaincu = 0;
    store.histoire.boss.timerPortrait = 0;
    afficherSectionBoss(false);
}

function reinitialiserMecaniquesBoss() {
    const m = store.histoire.boss.effets;
    m.colonnesGelees = [];
    m.timerDegelMs = 0;
    m.bossControlesInverses = false;
    m.timerControlesInverses = 0;
    m.bossFauxFantome = false;
    m.timerFauxFantome = 0;
    m.decalageDistorsion = 0;
    m.timerDistorsion = 0;
}

/** @param {number} dt */
export function mettreAJourBoss(dt) {
    if (!store.histoire.boss.actif || store.histoire.boss.vaincu || etat.estEnPause) return;

    mettreAJourDialoguesBoss(dt);

    const boss = store.histoire.boss.actif;
    const m = store.histoire.boss.effets;

    if (m.timerControlesInverses > 0) {
        m.timerControlesInverses -= dt;
        if (m.timerControlesInverses <= 0) {
            m.bossControlesInverses = false;
            m.timerControlesInverses = 0;
            if (!store.histoire.boss.actif) return;
            import('../../js/histoire/boss-dialogues.js').then(({ dialogueBossActif }) => {
                if (!dialogueBossActif()) afficherTexteBoss('');
            });
        }
    }
    if (m.timerFauxFantome > 0) {
        m.timerFauxFantome -= dt;
        if (m.timerFauxFantome <= 0) {
            m.bossFauxFantome = false;
            m.timerFauxFantome = 0;
            import('../../js/histoire/boss-dialogues.js').then(({ dialogueBossActif }) => {
                if (!dialogueBossActif()) afficherTexteBoss('');
            });
        }
    }
    if (m.timerDegelMs > 0) {
        m.timerDegelMs -= dt;
        if (m.timerDegelMs <= 0) degelColonnesBoss();
    }
    if (m.timerDistorsion > 0) {
        m.timerDistorsion -= dt;
        if (m.timerDistorsion <= 0) {
            m.decalageDistorsion = 0;
            m.timerDistorsion = 0;
            import('../../js/histoire/boss-dialogues.js').then(({ dialogueBossActif }) => {
                if (!dialogueBossActif()) afficherTexteBoss('');
            });
        }
    }

    store.histoire.boss.timerAttaque -= dt;
    if (store.histoire.boss.timerAttaque <= 0) {
        executerAttaqueBossCombat();
        store.histoire.boss.timerAttaque = obtenirIntervalleAttaqueBoss(boss);
    }

    verifierPhaseBoss();
    store.histoire.boss.timerPortrait += dt;

    if (store.histoire.boss.vaincu) {
        store.histoire.boss.timerVaincu -= dt;
    }

    mettreAJourTimerUIBoss();

    if (store.histoire.boss.actif.id === 'distorsion') {
        tickConditionTrame(dt);
    }
}

/** @param {number} nbLignes */
export function endommagerBoss(nbLignes) {
    endommagerBossCombat(nbLignes);
}

export function obtenirDecalageDistorsionBoss() {
    if (!store.histoire.boss.actif) return 0;
    return store.histoire.boss.effets.decalageDistorsion ?? 0;
}

export function obtenirControlesInversesBoss() {
    if (!store.histoire.boss.actif) return false;
    return store.histoire.boss.effets.bossControlesInverses ?? false;
}

export function obtenirFauxFantomeActif() {
    if (!store.histoire.boss.actif) return false;
    return store.histoire.boss.effets.bossFauxFantome ?? false;
}

export function bossEstActif() {
    return !!store.histoire.boss.actif;
}

export function bossEstVaincu() {
    return store.histoire.boss.vaincu;
}

export function obtenirBossIdActif() {
    return store.histoire.boss.actif?.id ?? null;
}
`;

    writeFileSync('js/boss-jeu.js', bossMain);
    console.log('boss-jeu découpé');
}

function splitCodexIllustrationsHistoire() {
    const src = readFileSync('js/codex-illustrations-histoire.js', 'utf8').split('\n');
    const dir = 'js/codex-illustrations-histoire';
    mkdirSync(dir, { recursive: true });
    writeFileSync(
        join(dir, 'mondes.js'),
        `function fondNoir(ctx, w, h) {
    ctx.fillStyle = '#04020a';
    ctx.fillRect(0, 0, w, h);
}

${src.slice(8, 210).join('\n')}
`
    );
    writeFileSync(join(dir, 'boss-fins.js'), `${src.slice(211, 448).join('\n')}\n`);
    writeFileSync(
        'js/codex-illustrations-histoire.js',
        `export {
    dessinerIllustRouille,
    dessinerIllustEclipse,
    dessinerIllustVide,
    dessinerIllustMiroir,
    dessinerIllustTrame,
} from '../../js/codex-illustrations-histoire/mondes.js';
export {
    dessinerIllustVera,
    dessinerIllustDistorsion,
    dessinerIllustBrasier,
    dessinerIllustSentinelle,
    dessinerIllustArchiviste,
    dessinerIllustAvantgarde,
    dessinerIllustTroisFins,
} from '../../js/codex-illustrations-histoire/boss-fins.js';

import * as mondes from '../../js/codex-illustrations-histoire/mondes.js';
import * as bossFins from '../../js/codex-illustrations-histoire/boss-fins.js';

export const ILLUSTRATIONS_CODEX_HISTOIRE = {
    ...mondes,
    ...bossFins,
};
`
    );
    console.log('codex-illustrations-histoire découpé');
}

function splitRenduAmbianceParticules() {
    const src = readFileSync('js/rendu-ambiance-particules.js', 'utf8').split('\n');
    writeFileSync(
        'js/rendu-ambiance-particules-init.js',
        `import {
    particulesAmbiance,
    CARACTERES_HEX,
    obtenirBiomeActif,
    obtenirCanvasPlateau,
} from '../../js/etat/store-jeu.js';

const MAX_PARTICULES_AMBIANCE = 40;
let idxParticulesAmbiance = 0;
const HEX_CHARS = CARACTERES_HEX;

export function creerParticulAmbiance(props) {
    if (particulesAmbiance.length < MAX_PARTICULES_AMBIANCE) {
        particulesAmbiance.push({
            actif: true,
            age: 0,
            rotation: 0,
            vRot: 0,
            sinPhase: 0,
            scintille: 0,
            char: '',
            ...props,
        });
    } else {
        const p = particulesAmbiance[idxParticulesAmbiance];
        Object.assign(p, {
            actif: true,
            age: 0,
            rotation: 0,
            vRot: 0,
            sinPhase: 0,
            scintille: 0,
            char: '',
            ...props,
        });
        idxParticulesAmbiance = (idxParticulesAmbiance + 1) % MAX_PARTICULES_AMBIANCE;
    }
}

export function initParticulesAmbiance() {
    particulesAmbiance.length = 0;
    idxParticulesAmbiance = 0;

    const canvas = obtenirCanvasPlateau();
    if (!canvas) return;
    const w = canvas.width;
    const h = canvas.height;

${src.slice(70, 228).join('\n')}
}
`
    );

    const main = `import {
    particulesAmbiance,
    CARACTERES_HEX,
    obtenirBiomeActif,
    obtenirEffetsReduits,
    obtenirCanvasPlateau,
    obtenirCtx,
} from '../../js/etat/store-jeu.js';
import { creerParticulAmbiance, initParticulesAmbiance } from '../../js/rendu/rendu-ambiance-particules-init.js';

export { initParticulesAmbiance };

const HEX_CHARS = CARACTERES_HEX;

${src.slice(40, 60).join('\n')}

${src.slice(230).join('\n')}
`;
    writeFileSync('js/rendu-ambiance-particules.js', main);
    console.log('rendu-ambiance-particules découpé');
}

splitRenduBlocsStyles();
splitCoopLogique();
splitBossJeu();
splitCodexIllustrationsHistoire();
splitRenduAmbianceParticules();
console.log('Tous les hotspots audit A découpés');
