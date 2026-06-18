import { obtenirConstellationClicSeul } from './accessibilite.js';

/** @typedef {object} ConstellationEvenementsCtx */

/** @type {ConstellationEvenementsCtx | null} */
let ctx = null;

/** @param {ConstellationEvenementsCtx} configuration */
export function configurerEvenementsConstellation(configuration) {
    ctx = configuration;
}

function noeudSousCurseur(cx, cy) {
    const noeuds = ctx.obtenirNoeuds();
    for (let i = noeuds.length - 1; i >= 0; i--) {
        const n = noeuds[i];
        const rayonHit = n.verrouille ? n.rayon * 0.75 + 4 : n.rayon + 8;
        const dx = cx - n.x;
        const dy = cy - n.y;
        if (dx * dx + dy * dy <= rayonHit * rayonHit) return n;
    }
    return null;
}

function coordonneesCanvas(clientX, clientY) {
    const canvas = ctx.obtenirCanvas();
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
        x: (clientX - rect.left) * scaleX,
        y: (clientY - rect.top) * scaleY,
    };
}

function noeudDepuisPointer(clientX, clientY) {
    const canvas = ctx.obtenirCanvas();
    const { x, y } = coordonneesCanvas(clientX, clientY);
    const w = canvas.width;
    const h = canvas.height;
    const parallax = window.innerWidth <= 768 ? 36 : 18;
    const offX = (x / w - 0.5) * parallax + ctx.obtenirPanX();
    const offY = (y / h - 0.5) * parallax + ctx.obtenirPanY();
    return noeudSousCurseur(x - offX, y - offY);
}

export function attacherEvenementEscapeSelection() {
    if (ctx.obtenirEscapeOk()) return;
    ctx.definirEscapeOk(true);
    document.addEventListener('keydown', (e) => {
        if (e.key !== 'Escape') return;
        if (!document.getElementById('ecran-selection')?.classList.contains('actif')) return;
        if (!ctx.panneauBiomeEstOuvert()) return;
        e.preventDefault();
        ctx.masquerInfoBiome();
    });
}

export function attacherEvenementsConstellation() {
    const canvas = ctx.obtenirCanvas();
    if (!canvas || ctx.obtenirEvenementsOk()) return;
    ctx.definirEvenementsOk(true);

    canvas.addEventListener('mousemove', (e) => {
        ctx.definirSouris(e.clientX, e.clientY);
        const noeud = noeudDepuisPointer(e.clientX, e.clientY);
        if (noeud?.id !== ctx.obtenirBiomeHover()) {
            ctx.definirBiomeHover(noeud?.id ?? null);
            if (!obtenirConstellationClicSeul()) {
                if (noeud && !noeud.verrouille) {
                    ctx.mettreAJourInfoBiome(noeud.id);
                } else if (!noeud && !ctx.obtenirBiomeChoisi()) {
                    ctx.masquerInfoBiome();
                }
            }
        }
        canvas.style.cursor = noeud ? 'pointer' : 'default';
    });

    canvas.addEventListener('mouseleave', () => {
        ctx.definirBiomeHover(null);
        canvas.style.cursor = 'default';
    });

    canvas.addEventListener('click', (e) => {
        const noeud = noeudDepuisPointer(e.clientX, e.clientY);
        if (noeud && noeud.id === ctx.obtenirBiomeChoisi() && ctx.panneauBiomeEstOuvert()) {
            ctx.masquerInfoBiome();
            return;
        }
        ctx.traiterSelectionNoeud(noeud, false);
    });

    canvas.addEventListener(
        'touchstart',
        (e) => {
            const touch = e.touches[0];
            if (!touch) return;
            ctx.definirGlissadeEnCours(false);
            ctx.definirGlissadeConstellation({
                x: touch.clientX,
                y: touch.clientY,
                panX: ctx.obtenirPanX(),
                panY: ctx.obtenirPanY(),
            });
            ctx.definirSouris(touch.clientX, touch.clientY);
        },
        { passive: true }
    );

    canvas.addEventListener(
        'touchmove',
        (e) => {
            const touch = e.touches[0];
            const glissade = ctx.obtenirGlissadeConstellation();
            if (!touch || !glissade) return;
            const dx = touch.clientX - glissade.x;
            const dy = touch.clientY - glissade.y;
            if (Math.abs(dx) > 10 || Math.abs(dy) > 10) {
                ctx.definirGlissadeEnCours(true);
                ctx.definirPan(glissade.panX + dx * 0.85, glissade.panY + dy * 0.85);
                ctx.bornesPan();
            }
            ctx.definirSouris(touch.clientX, touch.clientY);
            if (ctx.obtenirGlissadeEnCours()) e.preventDefault();
        },
        { passive: false }
    );

    canvas.addEventListener(
        'touchend',
        (e) => {
            e.preventDefault();
            if (ctx.obtenirGlissadeEnCours()) {
                ctx.definirGlissadeConstellation(null);
                ctx.definirGlissadeEnCours(false);
                return;
            }
            const touch = e.changedTouches[0];
            if (!touch) return;
            const noeud = noeudDepuisPointer(touch.clientX, touch.clientY);
            ctx.traiterSelectionNoeud(noeud, false);
            ctx.definirGlissadeConstellation(null);
        },
        { passive: false }
    );
}
