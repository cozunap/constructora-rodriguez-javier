const fs = require('fs');

// 1. Remove localStorage caching from lang.js so it ALWAYS detects browser language on load
let langCode = fs.readFileSync('public/js/lang.js', 'utf8');
langCode = langCode.replace("const saved = localStorage.getItem('lorenzo_lang');", "const saved = null;");
langCode = langCode.replace("localStorage.setItem('lorenzo_lang', lang);", "// localStorage.setItem('lorenzo_lang', lang);");
fs.writeFileSync('public/js/lang.js', langCode);
console.log('lang.js fixed');

// 2. Make nav items uppercase and make the CTA button stand out
let navCode = fs.readFileSync('src/components/Nav.astro', 'utf8');
navCode = navCode.replace(/text-lg md:text-sm font-medium/g, "text-lg md:text-sm font-semibold uppercase");
navCode = navCode.replace('class="btn-primary"', 'class="btn-gold shadow-lg shadow-gold/20 hover:shadow-gold/40 scale-100 hover:scale-105 transition-all duration-300"');
fs.writeFileSync('src/components/Nav.astro', navCode);
console.log('Nav.astro fixed');
