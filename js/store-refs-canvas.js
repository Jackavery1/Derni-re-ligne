import { store } from './store-core.js';

export function obtenirCanvasPlateau() {
    return store.canvasPlateau;
}
export function obtenirCtx() {
    return store.ctx;
}
export function obtenirCanvasPreview() {
    return store.canvasPreview;
}
export function obtenirCtxPreview() {
    return store.ctxPreview;
}
export function obtenirCanvasReserve() {
    return store.canvasReserve;
}
export function obtenirCtxReserve() {
    return store.ctxReserve;
}

export function definirRefsCanvas(refs) {
    store.canvasPlateau = refs.canvasPlateau;
    store.ctx = refs.ctx;
    store.canvasPreview = refs.canvasPreview;
    store.ctxPreview = refs.ctxPreview;
    store.canvasReserve = refs.canvasReserve;
    store.ctxReserve = refs.ctxReserve;
}
