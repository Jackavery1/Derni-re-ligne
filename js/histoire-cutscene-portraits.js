import { logger } from './logger.js';
import { definirHumeurRoboCutscene, dessinerPortraitCutscene } from './portraits-cutscene.js';
import { dessinerRobo } from './rendu-robo.js';
import { convertirHumeurVersCanvas } from './mascotte-robo.js';
import {
    POSITION_PERSONNAGE,
    COULEUR_PERSONNAGE,
    idPortraitRendu,
} from './histoire-cutscene-config.js';
import { refsDomCutscene, reinitDomPortraitsCutscene } from './histoire-cutscene-ui.js';
import {
    notifierChangementLigneCutscene,
    obtenirHumeurEffectivePortrait,
    obtenirParamsExpressionPortrait,
    obtenirHumeurRoboCutsceneDepuisLigne,
    reinitExpressionsCutscene,
    expressionsCutsceneActives,
} from './expressions-cutscene.js';
import { store } from './store-core.js';

let _personnageGauche = null;
let _personnageDroite = null;
let _personnageParlant = 'narrateur';
let _rafPortraits = null;
let _dernierIndexLigne = -1;

export function obtenirPersonnageParlantCutscene() {
    return _personnageParlant;
}

export function definirPersonnageParlantCutscene(personnageId) {
    _personnageParlant = personnageId;
}

export function reinitPortraitsCutscene() {
    _personnageGauche = null;
    _personnageDroite = null;
    _personnageParlant = 'narrateur';
    _dernierIndexLigne = -1;
    reinitExpressionsCutscene();
}

export function detecterParticipantsCutscene(sequenceLignes) {
    const participants = [...new Set(sequenceLignes.map((l) => l.personnage))].filter(
        (p) => p !== 'narrateur' && POSITION_PERSONNAGE[p] !== 'centre'
    );
    _personnageGauche = participants.find((p) => POSITION_PERSONNAGE[p] === 'gauche') ?? null;
    _personnageDroite =
        participants.find((p) => POSITION_PERSONNAGE[p] && POSITION_PERSONNAGE[p] !== 'gauche') ??
        null;
}

function _dernierLocuteurCote(cote, personnages, jusquAIndex) {
    for (let i = jusquAIndex - 1; i >= 0; i--) {
        const perso = personnages[i] ?? 'narrateur';
        const pos = POSITION_PERSONNAGE[perso] ?? 'droite';
        if (pos === cote) return perso;
    }
    return cote === 'gauche' ? _personnageGauche : _personnageDroite;
}

function _portraitsPourLigne(personnageActuel, personnages, indexLigne) {
    const posActuel = POSITION_PERSONNAGE[personnageActuel] ?? 'droite';
    if (posActuel === 'centre') {
        return {
            gauche:
                _dernierLocuteurCote('gauche', personnages, indexLigne + 1) ?? _personnageGauche,
            droite:
                _dernierLocuteurCote('droite', personnages, indexLigne + 1) ?? _personnageDroite,
            parleGauche: false,
        };
    }

    const parleGauche = posActuel === 'gauche';
    return {
        gauche: parleGauche
            ? personnageActuel
            : (_dernierLocuteurCote('gauche', personnages, indexLigne + 1) ?? _personnageGauche),
        droite: parleGauche
            ? (_dernierLocuteurCote('droite', personnages, indexLigne + 1) ?? _personnageDroite)
            : personnageActuel,
        parleGauche,
    };
}

/**
 * @param {HTMLCanvasElement} canvas
 * @param {CanvasRenderingContext2D | null} ctx
 * @param {string | null} personnageId
 * @param {boolean} parle
 * @param {number} ts
 * @param {{ humeur?: string } | null | undefined} ligneCourante
 */
function _dessinerPortrait(canvas, ctx, personnageId, parle, ts, ligneCourante) {
    if (!ctx || !canvas || !personnageId) return;
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    const idRendu = idPortraitRendu(personnageId);
    const expressionsActives = expressionsCutsceneActives() && store.histoire.cutscene.enCours;

    const humeur = expressionsActives
        ? obtenirHumeurEffectivePortrait(personnageId, ligneCourante, parle)
        : parle
          ? 'content'
          : 'neutre';

    if (idRendu === 'robo') {
        const humeurRobo = expressionsActives
            ? obtenirHumeurRoboCutsceneDepuisLigne(personnageId, ligneCourante?.humeur, parle)
            : parle
              ? 'content'
              : 'neutre';
        definirHumeurRoboCutscene(humeurRobo);
        dessinerRobo(
            ctx,
            w,
            h,
            /** @type {'neutre'|'content'|'excite'|'triste'|'alerte'} */ (
                convertirHumeurVersCanvas(humeurRobo)
            ),
            ts / 1000
        );
        return;
    }

    const params = expressionsActives
        ? obtenirParamsExpressionPortrait(personnageId, humeur, ts)
        : null;

    try {
        dessinerPortraitCutscene(ctx, w, h, idRendu, ts / 1000, { humeur, params });
    } catch (err) {
        logger.warn('[cutscene] erreur portrait :', err);
    }
}

function _etatVisuelPortraits(personnageActuel, personnages, indexLigne, sequenceLignes) {
    const { gauche, droite, parleGauche } = _portraitsPourLigne(
        personnageActuel,
        personnages,
        indexLigne
    );
    const posActuel = POSITION_PERSONNAGE[personnageActuel] ?? 'droite';
    const enEcoute = posActuel === 'centre';
    const ligneCourante = sequenceLignes[indexLigne] ?? null;

    return {
        gauche,
        droite,
        parleGauche,
        enEcoute,
        ligneCourante,
        clsG: !gauche ? 'absent' : enEcoute || !parleGauche ? 'ecoute' : 'parle',
        clsD: !droite ? 'absent' : enEcoute || parleGauche ? 'ecoute' : 'parle',
        ligneGauche: parleGauche && !enEcoute ? ligneCourante : null,
        ligneDroite: !parleGauche && !enEcoute ? ligneCourante : null,
        couleur: COULEUR_PERSONNAGE[personnageActuel] ?? '#ffffff',
    };
}

export function mettreAJourPortraitsCutscene(
    personnageActuel,
    sequenceLignes,
    personnages,
    indexLigne,
    ts
) {
    const { canvasGauche, canvasDroite, ctxGauche, ctxDroite } = refsDomCutscene;
    if (!canvasGauche || !canvasDroite) return;

    if (!_personnageGauche && !_personnageDroite) {
        detecterParticipantsCutscene(sequenceLignes);
    }

    if (indexLigne !== _dernierIndexLigne && expressionsCutsceneActives()) {
        const ligne = sequenceLignes[indexLigne] ?? {
            personnage: personnages[indexLigne] ?? personnageActuel,
            texte: '',
            humeur: undefined,
        };
        notifierChangementLigneCutscene(indexLigne, ligne, ts);
        _dernierIndexLigne = indexLigne;
    }

    const visuel = _etatVisuelPortraits(personnageActuel, personnages, indexLigne, sequenceLignes);
    canvasGauche.className = visuel.clsG;
    canvasDroite.className = visuel.clsD;

    if (visuel.gauche) {
        _dessinerPortrait(
            canvasGauche,
            ctxGauche,
            visuel.gauche,
            !visuel.enEcoute && visuel.parleGauche,
            ts,
            visuel.ligneGauche
        );
    }
    if (visuel.droite) {
        _dessinerPortrait(
            canvasDroite,
            ctxDroite,
            visuel.droite,
            !visuel.enEcoute && !visuel.parleGauche,
            ts,
            visuel.ligneDroite
        );
    }

    const nomEl = document.getElementById('nom-perso-dialogue');
    if (nomEl) nomEl.style.setProperty('--couleur-perso', visuel.couleur);
}

export function stopBouclePortraitsCutscene() {
    if (_rafPortraits) {
        cancelAnimationFrame(_rafPortraits);
        _rafPortraits = null;
    }
}

export function demarrerBouclePortraitsCutscene(enCours, obtenirContexteFrame) {
    if (_rafPortraits) return;
    function boucle(ts) {
        if (!enCours()) return;
        _rafPortraits = requestAnimationFrame(boucle);
        if (document.hidden) return;
        const ctx = obtenirContexteFrame();
        mettreAJourPortraitsCutscene(
            ctx.personnageParlant,
            ctx.sequenceLignes,
            ctx.personnages,
            ctx.indexLigne,
            ts
        );
    }
    _rafPortraits = requestAnimationFrame(boucle);
}

export function reinitVisuelPortraitsCutscene() {
    reinitPortraitsCutscene();
    reinitDomPortraitsCutscene();
}
