const fs = require('fs');
let code = fs.readFileSync('public/js/lang.js', 'utf8');

const m = code.match(/const translations=(\{.*?\});/);
if (m) {
  const t = JSON.parse(m[1]);
  t.es['hero-title'] = 'Transformamos Espacios,<br>Construimos Sueños';
  t.en['hero-title'] = 'Transforming Spaces,<br>Building Your Dreams';
  t.fr['hero-title'] = 'Nous Transformons les Espaces,<br>Nous Construisons vos Rêves';
  t.ht['hero-title'] = 'Nou Transfòme Espas,<br>Nou Bati Rèv';
  
  code = code.replace(m[0], 'const translations=' + JSON.stringify(t) + ';');
  fs.writeFileSync('public/js/lang.js', code);
  console.log('lang.js updated');
}

// Update index.astro to reduce mobile font size slightly to prevent wrapping before the <br>
let astro = fs.readFileSync('src/pages/index.astro', 'utf8');
astro = astro.replace('text-4xl md:text-5xl lg:text-6xl text-white', 'text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-white');
astro = astro.replace('Transformamos Espacios,<br>Construimos Sueños', 'Transformamos Espacios,<br>Construimos Sueños'); // in case it was different
fs.writeFileSync('src/pages/index.astro', astro);
console.log('index.astro updated');
