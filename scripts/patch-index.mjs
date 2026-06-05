import fs from 'fs';

let html = fs.readFileSync('index.html', 'utf8');

html = html.replace(
    /<link rel="apple-touch-icon" href="icon-512.png">\s*<style>[\s\S]*?<\/style>/,
    `<link rel="apple-touch-icon" href="icon-512.png">
    <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self'; media-src 'self'; object-src 'none'; base-uri 'self';">
    <link rel="stylesheet" href="styles/main.css">`
);

html = html.replace(
    '<div id="annonce-jeu"',
    `<div id="banniere-erreur" role="alert" aria-live="assertive">
    <span id="banniere-erreur-texte">Erreur de chargement</span>
    <button class="bouton" type="button" id="btn-recharger-erreur">RECHARGER</button>
</div>

<div id="annonce-jeu"`
);

fs.writeFileSync('index.html', html);
console.log('index.html patched');
