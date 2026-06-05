export function annoncer(texte) {
    const el = document.getElementById('annonce-jeu');
    if (el) el.textContent = texte;
}
