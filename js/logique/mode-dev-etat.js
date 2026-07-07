const CLE_SESSION = 'derniereLigne_devActif';

export function modeDevActif() {
    if (typeof sessionStorage === 'undefined') return false;
    return sessionStorage.getItem(CLE_SESSION) === '1';
}

export function activerSessionDev() {
    if (typeof sessionStorage === 'undefined') return;
    sessionStorage.setItem(CLE_SESSION, '1');
}

export function desactiverSessionDev() {
    if (typeof sessionStorage === 'undefined') return;
    sessionStorage.removeItem(CLE_SESSION);
}
