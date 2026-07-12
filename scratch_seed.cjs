const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabase = createClient('https://kvxcnuckuxoemcfgkhau.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt2eGNudWNrdXhvZW1jZmdraGF1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM4MTA5NjksImV4cCI6MjA5OTM4Njk2OX0.tFmj4dTF7VaKCbGFtpt6AMMTYVoVDaj8y4emxtgrRhc');

// Mock t function for app.js
global.t = (key) => key;

// Read lang.js
let langFile = fs.readFileSync('/Users/cozuna/Documents/WebSites/Lorenzo/public/js/lang.js', 'utf8');
let translations;
let langMatch = langFile.match(/const translations\s*=\s*(\{[\s\S]*?\});/);
if (langMatch) {
  eval('translations = ' + langMatch[1]);
}

// Read app.js
let appFile = fs.readFileSync('/Users/cozuna/Documents/WebSites/Lorenzo/public/js/app.js', 'utf8');
let allProperties = [];
let propsMatch = appFile.match(/const allProperties = (\[[\s\S]*?\]);/);
if (propsMatch) {
  eval(`allProperties = ${propsMatch[1]}`);
}

async function seed() {
  const transData = [];
  for (const [lang, keys] of Object.entries(translations)) {
    for (const [key, value] of Object.entries(keys)) {
      transData.push({ lang, key, value });
    }
  }

  // Insert translations in chunks
  for (let i = 0; i < transData.length; i += 100) {
    const chunk = transData.slice(i, i + 100);
    const { error } = await supabase.from('translations').upsert(chunk, { onConflict: 'lang,key' });
    if (error) console.error('Translations chunk error:', error);
  }
  console.log('Translations seeded.');

  const propsData = [];
  for (const prop of allProperties) {
    let title = {};
    let location = {};
    let desc = {};
    
    for (const lang of Object.keys(translations)) {
      title[lang] = translations[lang][prop.title_key] || prop.title;
      location[lang] = translations[lang][prop.location_key] || prop.location;
      let descKey = prop.id === 'fallback-1' ? 're-duran-desc' : prop.id === 'fallback-2' ? 're-rod-desc' : prop.id === 'fallback-3' ? 're-c1-desc' : prop.id === 'fallback-4' ? 're-c2-desc' : 're-c3-desc';
      desc[lang] = translations[lang][descKey] || '';
    }

    propsData.push({
      slug: prop.id,
      title: title,
      location: location,
      price: prop.price || null,
      m2: prop.m2 || null,
      bedrooms: prop.bedrooms || null,
      bathrooms: prop.bathrooms || null,
      parking: prop.parking || null,
      status: prop.status || '',
      image_urls: prop.image_urls || [],
      description: desc
    });
  }

  const { error } = await supabase.from('properties').upsert(propsData, { onConflict: 'slug' });
  if (error) console.error('Properties error:', error);
  else console.log('Properties seeded.');
}

seed();
