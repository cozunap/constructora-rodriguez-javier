const fs = require('fs');
let code = fs.readFileSync('public/js/lang.js', 'utf8');

const target = `if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', _lorenzInitLang);
} else {
  _lorenzInitLang();
}

window.switchLanguage = function(lang) {`;

const replacement = `window.switchLanguage = function(lang) {`;

code = code.replace(target, replacement);

const append = `\nif (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', _lorenzInitLang);
} else {
  _lorenzInitLang();
}`;

code += append;

fs.writeFileSync('public/js/lang.js', code);
console.log('lang.js fixed');

let astro = fs.readFileSync('src/pages/index.astro', 'utf8');
astro = astro.replace('grid-cols-1 lg:grid-cols-2 gap-12">', 'grid-cols-1 lg:grid-cols-5 gap-12">');
astro = astro.replace('<div class="flex flex-col items-start justify-center text-left">', '<div class="lg:col-span-3 flex flex-col items-start justify-center text-left">');
astro = astro.replace('<div></div>', '<div class="lg:col-span-2"></div>');
fs.writeFileSync('src/pages/index.astro', astro);
console.log('index.astro fixed');
