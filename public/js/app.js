/* js/app.js — Multi-page real estate site logic */
(function () {
  'use strict';

  /* ── Property Data ──────────────────────────────────────────── */
  const FALLBACK_PROPERTIES = [
    {
      id: 'fallback-1',
      title_key: 're-duran-title',
      location_key: 're-duran-loc',
      title: 'Proyecto Duran',
      location: 'Residencial María Mercedes, Aut. San Isidro, SDE',
      status: 'en_desarrollo',
      price: 175000,
      m2: 150,
      bedrooms: 3,
      bathrooms: 3.5,
      parking: 2,
      image_urls: [
        '/assets/images/projects/duran-2.webp',
        '/assets/images/projects/duran-3.webp',
        '/assets/images/projects/duran-4.webp',
        '/assets/images/projects/duran-5.webp',
        '/assets/images/projects/rodriguez-ii-1.webp',
        '/assets/images/projects/rodriguez-ii-2.webp',
      ]
    },
    {
      id: 'fallback-2',
      title_key: 're-rod-title',
      location_key: 're-rod-loc',
      title: 'Residencial Rodríguez II',
      location: 'San Isidro, Santo Domingo Este',
      price: 200000,
      m2: 172,
      bedrooms: 3,
      bathrooms: 3.5,
      parking: 2,
      status: 'en_desarrollo',
      image_urls: [
        '/assets/images/projects/rodriguez-ii-0.webp',
        '/assets/images/projects/rodriguez-ii-1.webp',
        '/assets/images/projects/rodriguez-ii-2.webp',
        '/assets/images/projects/duran-4.webp',
        '/assets/images/projects/duran-5.webp'
      ]
    }
  ];

  let allProperties = [...FALLBACK_PROPERTIES];

  /* ── Helpers ─────────────────────────────────────────────────── */
  function t(key) {
    const lang = localStorage.getItem('lorenzo_lang') || 'es';
    try {
      if (typeof window.translations !== 'undefined' && window.translations[lang] && window.translations[lang][key]) {
        return window.translations[lang][key];
      }
    } catch(e) {}
    return key;
  }

  function formatPrice(price) {
    if (!price || price === 0) return t('price-consultar') || 'Precio a consultar';
    return 'USD ' + parseFloat(price).toLocaleString();
  }

  function statusBadge(status, isAbsolute = true) {
    const pos = isAbsolute ? 'absolute top-4 right-4 ' : '';
    if (status === 'en_desarrollo') return `<span class="${pos}bg-gold text-white text-xs font-bold tracking-wider uppercase px-3 py-1.5 rounded shadow-md">${t('tag-dev')}</span>`;
    return `<span class="${pos}bg-navy text-white text-xs font-bold tracking-wider uppercase px-3 py-1.5 rounded shadow-md">${t('filter-sale') || 'En Venta'}</span>`;
  }

  function specIcon(type) {
    const icons = {
      beds:  '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 9V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v4"/><path d="M2 11v5a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-5"/><path d="M2 11h20"/></svg>',
      baths: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 6 6.5 3.5a1.5 1.5 0 0 0-1-.5C4.683 3 4 3.683 4 4.5V17a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5"/><line x1="2" y1="12" x2="22" y2="12"/></svg>',
      area:  '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="1"/><path d="M3 9h18M9 21V9"/></svg>',
    };
    return icons[type] || '';
  }

  /* ── Property Card Builder ───────────────────────────────────── */
  function buildCard(prop) {
    const title = prop.title || t(prop.title_key);
    const loc   = prop.location || t(prop.location_key);
    const img   = prop.image_urls && prop.image_urls[0] ? prop.image_urls[0] : '/assets/images/projects/duran-2.webp';

    const card = document.createElement('article');
    card.className = 'fade-up bg-white rounded-xl overflow-hidden shadow-lg shadow-navy/5 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border border-mid/30 group';
    card.setAttribute('data-status', prop.status);
    card.setAttribute('data-id', prop.id);
    card.innerHTML = `
      <a href="/proyecto?id=${prop.id}" style="display:block;color:inherit;text-decoration:none">
        <div class="relative h-64 overflow-hidden">
          <img src="${img}" alt="${title}" loading="lazy" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105">
          ${statusBadge(prop.status)}
        </div>
        <div class="p-8">
          <p class="text-sm text-gold font-medium tracking-wide mb-2">${loc}</p>
          <h3 class="font-serif text-2xl text-navy mb-3">${title}</h3>
          <p class="text-muted mb-6">${formatPrice(prop.price)}</p>
          <div class="flex items-center justify-between pt-4 border-t border-mid/40 text-sm text-navy/80">
            <span class="flex items-center gap-2">${specIcon('beds')} ${prop.bedrooms} <span class="sr-only">${t('spec-beds') || 'Hab.'}</span></span>
            <span class="flex items-center gap-2">${specIcon('baths')} ${prop.bathrooms} <span class="sr-only">${t('spec-baths') || 'Baños'}</span></span>
            <span class="flex items-center gap-2">${specIcon('area')} ${prop.m2} m²</span>
          </div>
        </div>
      </a>`;
    return card;
  }

  /* ── Render Properties Grid ─────────────────────────────────── */
  function renderGrid(containerEl, properties, filter = 'all') {
    containerEl.innerHTML = '';
    const filtered = filter === 'all' ? properties : properties.filter(p => p.status === filter);
    if (filtered.length === 0) {
      const nr = document.getElementById('no-results');
      if (nr) nr.style.display = 'block';
      return;
    }
    const nr = document.getElementById('no-results');
    if (nr) nr.style.display = 'none';

    filtered.forEach(p => containerEl.appendChild(buildCard(p)));

    // Re-trigger fade-up for newly added cards
    if (window.IntersectionObserver) {
      const obs = new IntersectionObserver(entries => {
        entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } });
      }, { threshold: 0.1 });
      containerEl.querySelectorAll('.fade-up').forEach(el => obs.observe(el));
    }
  }

  /* ── Filter Buttons ─────────────────────────────────────────── */
  function initFilters(containerEl, properties) {
    const btns = document.querySelectorAll('.filter-btn');
    if (!btns.length) return;
    let currentFilter = 'all';

    btns.forEach(btn => {
      btn.addEventListener('click', () => {
        btns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.getAttribute('data-filter') || 'all';
        renderGrid(containerEl, properties, currentFilter);
      });
    });
  }

  /* ── Property Detail Page ───────────────────────────────────── */
  function initDetailPage() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    if (!id) return;

    const prop = allProperties.find(p => p.id === id);
    if (!prop) return;

    const title     = prop.title || t(prop.title_key);
    const loc       = prop.location || t(prop.location_key);
    
    // For new properties, the DB provides the description object
    const currentLang = localStorage.getItem('lorenzo_lang') || 'es';
    let desc = '';
    if (prop.description && typeof prop.description === 'object') {
      desc = prop.description[currentLang] || prop.description['es'] || '';
    } else {
      const descKey   = id === 'fallback-1' ? 're-duran-desc' : id === 'fallback-2' ? 're-rod-desc' : id === 'fallback-3' ? 're-c1-desc' : id === 'fallback-4' ? 're-c2-desc' : 're-c3-desc';
      desc = t(descKey);
    }

    // Page title
    document.title = `${title} | Constructora Rodríguez Javier`;

    // Populate elements if they exist
    const set = (sel, val, html = false) => {
      const el = document.querySelector(sel);
      if (el) { html ? el.innerHTML = val : el.textContent = val; }
    };

    set('#detail-title', title);
    set('#detail-title-h1', title);
    set('#detail-location', loc);
    set('#detail-price', formatPrice(prop.price));
    set('#detail-m2', prop.m2 + ' m²');
    set('#detail-beds', prop.bedrooms);
    set('#detail-baths', prop.bathrooms);
    set('#detail-park', prop.parking);

    // Description (preserve newlines and style beautifully)
    const descEl = document.querySelector('#detail-desc');
    if (descEl) {
      let html = '';
      let inList = false;
      desc.split('\n').forEach(line => {
        let t = line.trim();
        if (!t) return;
        
        if (t.startsWith('•') || t.startsWith('-')) {
          if (!inList) { html += '<ul class="mb-8 space-y-3">'; inList = true; }
          html += `<li class="flex items-start gap-3">
                     <span class="text-gold mt-1 shrink-0"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg></span>
                     <span class="text-muted leading-relaxed text-[14px]">${t.substring(1).trim()}</span>
                   </li>`;
        } else {
          if (inList) { html += '</ul>'; inList = false; }
          if (t.match(/^(✨|💳|📅)/)) {
            html += `<h3 class="text-xl font-serif text-navy mt-10 mb-4 flex items-center gap-3 border-b border-mid/20 pb-3">${t}</h3>`;
          } else if (t.startsWith('📍')) {
            html += `<div class="mb-8">
                       <p class="text-muted leading-relaxed mb-4 text-[14px] font-medium text-navy flex items-start gap-2">
                         <span>${t}</span>
                       </p>
                       <iframe src="https://maps.google.com/maps?q=18.510239,-69.784874&t=&z=15&ie=UTF8&iwloc=&output=embed" width="100%" height="300" style="border:0; border-radius: 0.5rem;" allowfullscreen="" loading="lazy"></iframe>
                     </div>`;
          } else if (t.startsWith('📲')) {
            html += `<p class="text-navy font-medium leading-relaxed mb-6 text-[14px] bg-navy/5 p-4 rounded-lg border border-navy/10 flex items-start gap-2"><span>${t}</span></p>`;
          } else {
            html += `<p class="text-muted leading-relaxed mb-6 text-[14px]">${t}</p>`;
          }
        }
      });
      if (inList) html += '</ul>';
      descEl.innerHTML = html;
    }

    // Image carousel
    const carousel = document.getElementById('detail-carousel');
    if (carousel && prop.image_urls) {
      carousel.innerHTML = '';
      prop.image_urls.forEach((url, i) => {
        const img = document.createElement('img');
        img.src = url;
        img.alt = `${title} — imagen ${i + 1}`;
        img.loading = i === 0 ? 'eager' : 'lazy';
        img.style.cssText = `width:100%;height:100%;object-fit:cover;display:${i === 0 ? 'block' : 'none'};`;
        img.setAttribute('data-index', i);
        carousel.appendChild(img);
      });

      // Thumbnails
      const thumbs = document.getElementById('detail-thumbs');
      if (thumbs) {
        thumbs.innerHTML = '';
        prop.image_urls.forEach((url, i) => {
          const btn = document.createElement('button');
          btn.className = `w-20 h-14 md:w-24 md:h-16 rounded-md overflow-hidden border-2 transition-all duration-300 flex-shrink-0 ${i === 0 ? 'border-gold opacity-100 shadow-md' : 'border-transparent opacity-60 hover:opacity-100'}`;
          btn.innerHTML = `<img src="${url}" alt="thumb" loading="lazy" class="w-full h-full object-cover">`;
          btn.addEventListener('click', () => {
            carousel.querySelectorAll('img').forEach((im, idx) => {
              im.style.opacity = '0';
              setTimeout(() => {
                im.style.display = idx === i ? 'block' : 'none';
                if (idx === i) {
                  requestAnimationFrame(() => { im.style.transition = 'opacity 0.4s ease'; im.style.opacity = '1'; });
                }
              }, 150);
            });
            thumbs.querySelectorAll('button').forEach((b, idx) => {
              b.className = `w-20 h-14 md:w-24 md:h-16 rounded-md overflow-hidden border-2 transition-all duration-300 flex-shrink-0 ${idx === i ? 'border-gold opacity-100 shadow-md' : 'border-transparent opacity-60 hover:opacity-100'}`;
            });
          });
          thumbs.appendChild(btn);
        });
      }
    }

    // Status badge on detail page
    const badgeEl = document.getElementById('detail-badge');
    if (badgeEl) badgeEl.innerHTML = statusBadge(prop.status, false);

    // Back link
    const backEl = document.querySelector('.detail-back');
    if (backEl) backEl.href = '/properties';
  }

  /* ── Homepage featured grid ─────────────────────────────────── */
  function initHomePage() {
    // Re-render featured cards with translated text
    const grid = document.getElementById('featured-props');
    if (!grid) return;
    grid.innerHTML = '';
    FALLBACK_PROPERTIES.slice(0, 3).forEach(p => grid.appendChild(buildCard(p)));
    if (window.IntersectionObserver) {
      const obs = new IntersectionObserver(entries => {
        entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } });
      }, { threshold: 0.1 });
      grid.querySelectorAll('.fade-up').forEach(el => obs.observe(el));
    }
  }

  /* ── Supabase Loader ─────────────────────────────────────────── */
  async function loadFromSupabase() {
    const url  = 'https://kvxcnuckuxoemcfgkhau.supabase.co';
    const key  = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt2eGNudWNrdXhvZW1jZmdraGF1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM4MTA5NjksImV4cCI6MjA5OTM4Njk2OX0.tFmj4dTF7VaKCbGFtpt6AMMTYVoVDaj8y4emxtgrRhc';
    if (!key || typeof supabase === 'undefined') return;
    try {
      const client = supabase.createClient(url, key);
      
      // Load translations
      const { data: transData, error: transError } = await client.from('translations').select('*');
      if (!transError && transData) {
        window.translations = {};
        transData.forEach(row => {
          if (!window.translations[row.lang]) window.translations[row.lang] = {};
          window.translations[row.lang][row.key] = row.value;
        });
      }

      // Load properties
      const { data, error } = await client.from('properties').select('*').order('created_at', { ascending: false });
      if (!error && data && data.length > 0) {
        const currentLang = localStorage.getItem('lorenzo_lang') || 'es';
        allProperties = data.map(p => {
          // If title/location are objects, extract current lang or fallback to 'es'
          p.id = p.slug; // maintain id compatibility
          if (typeof p.title === 'object' && p.title !== null) p.title = p.title[currentLang] || p.title['es'] || '';
          if (typeof p.location === 'object' && p.location !== null) p.location = p.location[currentLang] || p.location['es'] || '';
          if (Array.isArray(p.image_urls)) {
            p.image_urls = p.image_urls.map(img => {
              if (img.startsWith('http') || img.startsWith('/assets')) return img;
              return `${url}/storage/v1/object/public/property-images/${img}`;
            });
          }
          return p;
        });
      }
    } catch (e) {
      console.warn('Supabase load error:', e);
    }
  }

  /* ── Init ─────────────────────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', async () => {
    await loadFromSupabase();

    const page = window.location.pathname.replace(/\/$/, '').split('/').pop() || 'index.html';

    if (page === 'index.html' || page === 'index' || page === '') {
      initHomePage();
    }

    if (page === 'properties.html' || page === 'properties') {
      const grid = document.getElementById('props-grid');
      if (grid) {
        renderGrid(grid, allProperties, 'all');
        initFilters(grid, allProperties);
      }
    }

    if (page === 'proyecto.html' || page === 'proyecto') {
      initDetailPage();
    }

    // Re-render on lang switch
    const origSwitch = window.switchLanguage;
    window.switchLanguage = function(lang) {
      if (typeof origSwitch === 'function') origSwitch(lang);
      if (page === 'index.html' || page === 'index' || page === '') initHomePage();
      if (page === 'properties.html' || page === 'properties') {
        const grid = document.getElementById('props-grid');
        const active = document.querySelector('.filter-btn.active');
        const filter = active ? (active.getAttribute('data-filter') || 'all') : 'all';
        if (grid) renderGrid(grid, allProperties, filter);
      }
      if (page === 'proyecto.html' || page === 'proyecto') initDetailPage();
    };
  });

})();