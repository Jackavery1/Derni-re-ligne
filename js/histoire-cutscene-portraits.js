import { logger } from './logger.js';
import { definirHumeurRoboCutscene, dessinerPortraitCutscene } from './portraits-cutscene.js';
import { dessinerRobo } from './rendu-robo.js';
import {
    POSITION_PERSONNAGE,
    COULEUR_PERSONNAGE,
    idPortraitRendu,
} from './histoire-cutscene-config.js';
import { refsDomCutscene, reinitDomPortraitsCutscene } from './histoire-cutscene-ui.js';

let _personnageGauche = null;
let _personnageDroite = null;
let _personnageParlant = 'narrateur';
let _rafPortraits = null;

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

function _dessinerROBOSimple(ctx, w, h, ts, humeur) {
    const cx = w * 0.5;
    const E = Math.min(w, h) * 0.04;
    ctx.fillStyle = '#5533aa';
    ctx.fillRect(cx - 3 * E, h * 0.42, 6 * E, 7 * E);
    ctx.fillStyle = '#d42b2b';
    ctx.fillRect(cx - 2.5 * E, h * 0.24, 5 * E, 4.5 * E);
    ctx.fillStyle = '#00ddc8';
    const ouv = humeur === 'alerte' ? E * 1.6 : E * 1.2;
    ctx.beginPath();
    ctx.ellipse(cx - 1.2 * E, h * 0.35, E * 0.8, ouv, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(cx + 1.2 * E, h * 0.35, E * 0.8, ouv, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 16;
    ctx.shadowColor = '#00ddc8';
    ctx.strokeStyle = '#00ddc8';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(cx - 1.2 * E, h * 0.35, E * 0.8, ouv, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.shadowBlur = 0;
    void ts;
}

function _dessinerPortrait(canvas, ctx, personnageId, parle, ts) {
    if (!ctx || !canvas) return;
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    const idRendu = idPortraitRendu(personnageId);

    if (idRendu === 'robo') {
        const humeur = parle ? 'content' : 'neutre';
        definirHumeurRoboCutscene(humeur);
        if (typeof dessinerRobo === 'function') {
            try {
                dessinerRobo(ctx, w, h, humeur, ts / 1000);
                return;
            } catch {
                _dessinerROBOSimple(ctx, w, h, ts, humeur);
                return;
            }
        }
        _dessinerROBOSimple(ctx, w, h, ts, humeur);
        return;
    }

    try {
        dessinerPortraitCutscene(ctx, w, h, idRendu, ts / 1000);
    } catch (err) {
        logger.warn('[cutscene] erreur portrait :', err);
    }
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

    const { gauche, droite, parleGauche } = _portraitsPourLigne(
        personnageActuel,
        personnages,
        indexLigne
    );
    const posActuel = POSITION_PERSONNAGE[personnageActuel] ?? 'droite';
    const enEcoute = posActuel === 'centre';

    const clsG = !gauche ? 'absent' : enEcoute || !parleGauche ? 'ecoute' : 'parle';
    const clsD = !droite ? 'absent' : enEcoute || parleGauche ? 'ecoute' : 'parle';
    canvasGauche.className = clsG;
    canvasDroite.className = clsD;

    if (gauche) {
        _dessinerPortrait(canvasGauche, ctxGauche, gauche, !enEcoute && parleGauche, ts);
    }
    if (droite) {
        _dessinerPortrait(canvasDroite, ctxDroite, droite, !enEcoute && !parleGauche, ts);
    }

    const couleur = COULEUR_PERSONNAGE[personnageActuel] ?? '#ffffff';
    const nomEl = document.getElementById('nom-perso-dialogue');
    if (nomEl) nomEl.style.setProperty('--couleur-perso', couleur);
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
        const ctx = obtenirContexteFrame();
        mettreAJourPortraitsCutscene(
            ctx.personnageParlant,
            ctx.sequenceLignes,
            ctx.personnages,
            ctx.indexLigne,
            ts
        );
        _rafPortraits = requestAnimationFrame(boucle);
    }
    _rafPortraits = requestAnimationFrame(boucle);
}

export function reinitVisuelPortraitsCutscene() {
    reinitPortraitsCutscene();
    reinitDomPortraitsCutscene();
}
