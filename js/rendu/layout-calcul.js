/**
 * @param {number} largeurFenetre
 * @param {number} hauteurFenetre
 * @param {number} largeurTotale
 * @param {number} hauteurTotale
 * @param {{ margeScale?: number, hauteurControles?: number, scaleMax?: number, scaleMin?: number }} [opts]
 */
export function calculerEchelleInterface(
    largeurFenetre,
    hauteurFenetre,
    largeurTotale,
    hauteurTotale,
    opts = {}
) {
    const { margeScale = 20, hauteurControles = 0, scaleMax = 2.2, scaleMin = 0.52 } = opts;
    const scaleW = (largeurFenetre - margeScale) / largeurTotale;
    const scaleH = (hauteurFenetre - hauteurControles - margeScale) / hauteurTotale;
    return Math.max(scaleMin, Math.min(scaleW, scaleH, scaleMax));
}
