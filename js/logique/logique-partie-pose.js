let _poseApresRotation = false;

export function marquerPoseApresRotation() {
    _poseApresRotation = true;
}

export function reinitialiserPoseApresRotation() {
    _poseApresRotation = false;
}

export function consommerPoseApresRotation() {
    const etaitPosee = _poseApresRotation;
    _poseApresRotation = false;
    return etaitPosee;
}
