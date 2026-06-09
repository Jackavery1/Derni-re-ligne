export function appliquerTransformCamera(cam, ctx, w, h) {
    ctx.translate(w / 2, h / 2);
    ctx.scale(cam.zoom, cam.zoom);
    ctx.translate(-w / 2, -(h / 2 + cam.y));
}

export function ecranVersMonde(cam, sx, sy, w, h) {
    const zoom = cam?.zoom ?? 1;
    const camY = cam?.y ?? 0;
    return {
        mx: w / 2 + (sx - w / 2) / zoom,
        my: h / 2 + camY + (sy - h / 2) / zoom,
    };
}
