const SEUIL_MOBILE = 768;

function estPortraitMobile() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    return Math.min(w, h) <= SEUIL_MOBILE && h > w;
}

function partieActive() {
    return document.body.classList.contains('partie-active');
}

export function mettreAJourOverlayOrientation() {
    const overlay = document.getElementById('overlay-orientation');
    if (!overlay) return;
    const afficher = partieActive() && estPortraitMobile();
    overlay.classList.toggle('visible', afficher);
    overlay.setAttribute('aria-hidden', afficher ? 'false' : 'true');
}

export function initialiserOverlayOrientation() {
    mettreAJourOverlayOrientation();
    window.addEventListener('resize', mettreAJourOverlayOrientation);
    window.addEventListener('orientationchange', mettreAJourOverlayOrientation);
    window.visualViewport?.addEventListener('resize', mettreAJourOverlayOrientation);
    const observer = new MutationObserver(() => mettreAJourOverlayOrientation());
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
}
