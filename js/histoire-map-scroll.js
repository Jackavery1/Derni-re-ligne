const ZOOM_MIN = 1;
const ZOOM_MAX = 2.4;

/** @param {{ camera: { cibleY: number, cibleZoom: number, scrollMin: number, scrollMax: number } }} etatCarte @param {HTMLCanvasElement} canvas */
export function attacherScrollCarte(etatCarte, canvas) {
    canvas.addEventListener(
        'wheel',
        (e) => {
            e.preventDefault();
            const cam = etatCarte.camera;
            if (e.ctrlKey) {
                cam.cibleZoom = Math.max(
                    ZOOM_MIN,
                    Math.min(ZOOM_MAX, cam.cibleZoom - e.deltaY * 0.002)
                );
                return;
            }
            cam.cibleY = Math.max(
                cam.scrollMin,
                Math.min(cam.scrollMax, cam.cibleY + e.deltaY * 0.45)
            );
        },
        { passive: false }
    );

    let touchY0 = 0;
    let camY0 = 0;
    let pinchDist0 = 0;
    let pinchZoom0 = 1.6;
    canvas.addEventListener(
        'touchstart',
        (e) => {
            if (e.touches.length === 2) {
                const dx = e.touches[0].clientX - e.touches[1].clientX;
                const dy = e.touches[0].clientY - e.touches[1].clientY;
                pinchDist0 = Math.hypot(dx, dy) || 1;
                pinchZoom0 = etatCarte.camera.cibleZoom;
                return;
            }
            touchY0 = e.touches[0].clientY;
            camY0 = etatCarte.camera.cibleY;
        },
        { passive: true }
    );
    canvas.addEventListener(
        'touchmove',
        (e) => {
            e.preventDefault();
            const cam = etatCarte.camera;
            if (e.touches.length === 2) {
                const dx = e.touches[0].clientX - e.touches[1].clientX;
                const dy = e.touches[0].clientY - e.touches[1].clientY;
                const dist = Math.hypot(dx, dy) || 1;
                cam.cibleZoom = Math.max(
                    ZOOM_MIN,
                    Math.min(ZOOM_MAX, pinchZoom0 * (dist / pinchDist0))
                );
                return;
            }
            cam.cibleY = Math.max(
                cam.scrollMin,
                Math.min(cam.scrollMax, camY0 + (touchY0 - e.touches[0].clientY) * 1.1)
            );
        },
        { passive: false }
    );
}
