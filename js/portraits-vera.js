/**
 * Expressions VERA pour cutscenes et journaux.
 * Appliquées via data-expression sur le canvas portrait cutscene.
 */

/** @type {string} */
let _expressionCourante = 'neutre';

export const EXPRESSIONS_VERA = {
    neutre: { nomStyle: 'italic', vitesseMs: 28 },
    journal_decouvert: { nomStyle: 'italic', vitesseMs: 32, larme: true, fatigue: true },
    chapitre_complete: { nomStyle: 'italic', vitesseMs: 30, espoir: true },
    boss_vaincu: { nomStyle: 'italic', vitesseMs: 26, larme: true, contenue: true },
    monde_cache: { nomStyle: 'italic', vitesseMs: 22, stupéfaite: true },
    fin_normale: { nomStyle: 'italic', vitesseMs: 34, sereine: true },
    fin_vraie: { nomStyle: 'italic', vitesseMs: 36, paix: true },
    fin_secrete: { nomStyle: 'italic', vitesseMs: 24, joie: true },
};

/** @param {string} id */
export function definirExpressionVera(id) {
    _expressionCourante = EXPRESSIONS_VERA[id] ? id : 'neutre';
}

export function obtenirExpressionVera() {
    return _expressionCourante;
}

/**
 * @param {string} [journalId]
 * @param {string} [finId]
 */
export function infererExpressionVeraJournal(journalId, finId) {
    if (finId === 'fin_secrete') return 'fin_secrete';
    if (finId === 'fin_vraie') return 'fin_vraie';
    if (finId === 'fin_normale') return 'fin_normale';
    if (journalId) return 'journal_decouvert';
    return 'neutre';
}

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} cx
 * @param {number} cy
 * @param {string} couleur
 * @param {number} t
 */
export function enrichirPortraitVera(ctx, cx, cy, couleur, t) {
    const exp = EXPRESSIONS_VERA[_expressionCourante] ?? EXPRESSIONS_VERA.neutre;

    if (exp.larme) {
        ctx.save();
        ctx.fillStyle = 'rgba(92,229,229,0.55)';
        ctx.beginPath();
        ctx.ellipse(cx + 10, cy - 6, 2, 4, 0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    if (exp.fatigue) {
        ctx.save();
        ctx.strokeStyle = couleur;
        ctx.globalAlpha = 0.5;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(cx - 14, cy - 18);
        ctx.lineTo(cx - 4, cy - 16);
        ctx.stroke();
        ctx.restore();
    }

    if (exp.stupéfaite) {
        ctx.save();
        ctx.fillStyle = couleur;
        ctx.font = '10px serif';
        ctx.textAlign = 'center';
        ctx.fillText('!', cx, cy - 22);
        ctx.restore();
    }

    if (exp.joie) {
        ctx.save();
        ctx.globalAlpha = 0.4 + 0.3 * Math.sin(t * 2);
        ctx.fillStyle = '#ff44ff';
        ctx.beginPath();
        ctx.arc(cx - 18, cy - 8, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    if (exp.paix || exp.sereine) {
        ctx.save();
        ctx.globalAlpha = 0.25;
        ctx.strokeStyle = couleur;
        ctx.beginPath();
        ctx.arc(cx, cy, 30 + Math.sin(t) * 2, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
    }
}
