let _typewriterTimeout = null;
let _typewriterActif = false;

export function typewriterEstActif() {
    return _typewriterActif;
}

export function stopTypewriter() {
    if (_typewriterTimeout !== null) {
        clearTimeout(_typewriterTimeout);
        _typewriterTimeout = null;
    }
    _typewriterActif = false;
}

export function demarrerTypewriter(el, texte, vitesseMs) {
    stopTypewriter();
    el.textContent = '';
    _typewriterActif = true;
    let i = 0;

    function tapper() {
        if (!_typewriterActif) return;
        if (i < texte.length) {
            el.textContent += texte[i];
            i++;
            const pause = /[.,!?;:…—]/.test(texte[i - 1]) ? vitesseMs * 5 : vitesseMs;
            _typewriterTimeout = setTimeout(tapper, pause);
        } else {
            _typewriterActif = false;
        }
    }
    tapper();
}

export function afficherTexteComplet(el, texte) {
    stopTypewriter();
    el.textContent = texte;
}
