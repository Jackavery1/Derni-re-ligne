import fs from 'fs';
const path = 'index.html';
let html = fs.readFileSync(path, 'utf8');
const debut = html.indexOf('<script type="module">');
const fin = html.indexOf('</script>', debut);
if (debut === -1 || fin === -1) {
    console.log('Aucun script inline à retirer');
    process.exit(0);
}
html =
    html.slice(0, debut) +
    '<script type="module" src="js/main.js"></script>' +
    html.slice(fin + '</script>'.length);
fs.writeFileSync(path, html);
console.log('index.html mis à jour');
