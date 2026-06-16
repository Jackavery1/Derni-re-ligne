import fs from 'fs';
const html = fs.readFileSync('index.html', 'utf8');
const start = html.indexOf('<script type="module">') + '<script type="module">'.length;
const end = html.indexOf('</script>', start);
fs.writeFileSync('js/_extracted.mjs', html.slice(start, end).trim());
console.log('extracted', html.slice(start, end).trim().split('\n').length, 'lines');
