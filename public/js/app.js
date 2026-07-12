/* js/app.js — Multi-page real estate site logic */
(function () {
  'use strict';

  /* ── Supabase config ──────────────────────────────────────────── */
  const SUPA_URL = 'https://kvxcnuckuxoemcfgkhau.supabase.co';
  const SUPA_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt2eGNudWNrdXhvZW1jZmdraGF1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM4MTA5NjksImV4cCI6MjA5OTM4Njk2OX0.tFmj4dTF7VaKCbGFtpt6AMMTYVoVDaj8y4emxtgrRhc';

  /* ── Fallback properties (shown if Supabase fails) ───────────── */
  const FALLBACK_PROPERTIES = [
    {
      id: 'fallback-1',
      title: 'Proyecto Duran',
      location: 'Residencial María Mercedes, Aut. San Isidro, SDE',
      status: 'en_desarrollo',
      price: 175000,
      m2: 150,
      bedrooms: 3,
      bathrooms: 3.5,
      parking: 2,
      image_urls: ['/assets/images/projects/duran-2.webp']
    },
    {
      id: 'fallback-2',
      title: 'Residencial Rodríguez II',
      location: 'San Isidro, Santo Domingo Este',
      price: 200000,
      m2: 172,
      bedrooms: 3,
      bathrooms: 3.5,
      parking: 2,
      status: 'en_desarrollo',
      image_urls: ['/assets/images/projects/rodriguez-ii-0.webp']
    }
  ];

  /* ── State ────────────────────────────────────────────────────── */
  let allProperties = [...FALLBACK_PROPERTIES];

  /* ── Helpers ──────────────────────────────────────────────────── */
  function t(key) {
    const lang = localStorage.getItem('lorenzo_lang') || 'es';
    try {
      if (window.translations && window.translations[lang] && window.translations[lang][key]) {
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
    if (status === 'en_desarrollo') {
      return `<span class="${pos}bg-gold text-white text-xs font-bold tracking-wider uppercase px-3 py-1.5 rounded shadow-md">${t('tag-dev') || 'Preventa'}</span>`;
    }
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

  /* ── Property Card Builder ────────────────────────────────────── */
  function buildCard(prop) {
    const lang = localStorage.getItem('lorenzo_lang') || 'es';
    let title = prop.title || '';
    if (typeof prop.title === 'object' && prop.title !== null) {
      title = prop.title[lang] || prop.title['es'] || '';
    } else if (prop.title_key) {
      title = t(prop.title_key) || prop.title;
    }

    let loc = prop.location || '';
    if (typeof prop.location === 'object' && prop.location !== null) {
      loc = prop.location[lang] || prop.location['es'] || '';
    } else if (prop.location_key) {
      loc = t(prop.location_key) || prop.location;
    }

    const img   = prop.image_urls && prop.image_urls[0] ? prop.image_urls[0] : '/assets/images/projects/duran-2.webp';

    const card = document.createElement('article');
    card.className = 'fade-up bg-white rounded-xl overflow-hidden shadow-lg shadow-navy/5 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border border-mid/30 group';
    card.setAttribute('data-status', prop.status || '');
    card.setAttribute('data-id', prop.id || '');
    card.innerHTML = `
      <a href="/proyecto/${prop.id}" style="display:block;color:inherit;text-decoration:none">
        <div class="relative h-64 overflow-hidden">
          <img src="${img}" alt="${title}" loading="lazy" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105">
          ${statusBadge(prop.status)}
        </div>
        <div class="p-8">
          <p class="text-sm text-gold font-medium tracking-wide mb-2">${loc}</p>
          <h3 class="font-serif text-2xl text-navy mb-3">${title}</h3>
          <p class="text-muted mb-6">${formatPrice(prop.price)}</p>
          <div class="flex items-center justify-between pt-4 border-t border-mid/40 text-sm text-navy/80">
            <span class="flex items-center gap-2">${specIcon('beds')} ${prop.bedrooms || '-'} <span class="sr-only">Hab.</span></span>
            <span class="flex items-center gap-2">${specIcon('baths')} ${prop.bathrooms || '-'} <span class="sr-only">Baños</span></span>
            <span class="flex items-center gap-2">${specIcon('area')} ${prop.m2 || '-'} m²</span>
          </div>
        </div>
      </a>`;
    return card;
  }

  /* ── Animate grid cards ──────────────────────────────────────── */
  function animateGrid(containerEl) {
    if (!window.IntersectionObserver) return;
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } });
    }, { threshold: 0.1 });
    containerEl.querySelectorAll('.fade-up').forEach(el => obs.observe(el));
  }

  /* ── Homepage: show 3 most recent properties ─────────────────── */
  function initHomePage() {
    const grid = document.getElementById('featured-props');
    if (!grid) return;

    const featured = allProperties.slice(0, 3);
    if (featured.length === 0) return;

    grid.innerHTML = '';
    featured.forEach(p => grid.appendChild(buildCard(p)));
    animateGrid(grid);
  }

  /* ── Properties page: full grid with filters ─────────────────── */
  function renderGrid(containerEl, properties, filter) {
    containerEl.innerHTML = '';
    const filtered = (filter === 'all') ? properties : properties.filter(p => p.status === filter);

    const nr = document.getElementById('no-results');
    if (filtered.length === 0) {
      if (nr) nr.style.display = 'block';
      return;
    }
    if (nr) nr.style.display = 'none';
    filtered.forEach(p => containerEl.appendChild(buildCard(p)));
    animateGrid(containerEl);
  }

  function initFilters(containerEl, properties) {
    const btns = document.querySelectorAll('.filter-btn');
    if (!btns.length) return;

    btns.forEach(btn => {
      btn.addEventListener('click', () => {
        btns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const filter = btn.getAttribute('data-filter') || 'all';
        renderGrid(containerEl, properties, filter);
      });
    });
  }

  /* ── Property Detail Page ─────────────────────────────────────── */
  function initDetailPage() {
    const params = new URLSearchParams(window.location.search);
    let id = params.get('id');
    if (!id && window.location.pathname.includes('/proyecto/')) {
      id = window.location.pathname.split('/').filter(Boolean).pop();
    }
    if (!id) return;

    const prop = allProperties.find(p => p.id === id);
    if (!prop) return;

    const currentLang = localStorage.getItem('lorenzo_lang') || 'es';
    
    let title = prop.title || '';
    if (typeof prop.title === 'object' && prop.title !== null) {
      title = prop.title[currentLang] || prop.title['es'] || '';
    } else if (prop.title_key) {
      title = t(prop.title_key) || prop.title;
    }

    let loc = prop.location || '';
    if (typeof prop.location === 'object' && prop.location !== null) {
      loc = prop.location[currentLang] || prop.location['es'] || '';
    } else if (prop.location_key) {
      loc = t(prop.location_key) || prop.location;
    }

    // Description (multilang)
    let desc = '';
    if (prop.description && typeof prop.description === 'object') {
      desc = prop.description[currentLang] || prop.description['es'] || '';
    } else if (typeof prop.description === 'string') {
      desc = prop.description;
    } else if (prop.description_key) {
      desc = t(prop.description_key) || '';
    }

    document.title = title + ' | Constructora Rodríguez Javier';

    const set = (sel, val, html = false) => {
      const el = document.querySelector(sel);
      if (!el) return;
      html ? el.innerHTML = val : el.textContent = val;
    };

    const show = (id) => { const el = document.getElementById(id); if (el) el.classList.remove('hidden'); };
    const hide = (id) => { const el = document.getElementById(id); if (el) el.classList.add('hidden'); };

    // ── Basic fields
    set('#detail-title', title);
    set('#detail-title-h1', title);
    set('#detail-location', loc);

    const priceStr = formatPrice(prop.price);
    set('#detail-price', priceStr);
    set('#detail-price-inline', priceStr);

    // ── Property type
    if (prop.property_type) {
      const typeDict = {
        es: { "Casa": "Casa", "Villa": "Villa", "Apartamento": "Apartamento", "Penthouse": "Penthouse", "Proyecto": "Proyecto", "Solar": "Solar", "Edificio": "Edificio", "Local": "Local" },
        en: { "Casa": "House", "Villa": "Villa", "Apartamento": "Apartment", "Penthouse": "Penthouse", "Proyecto": "Project", "Solar": "Lot", "Edificio": "Building", "Local": "Commercial" },
        fr: { "Casa": "Maison", "Villa": "Villa", "Apartamento": "Appartement", "Penthouse": "Penthouse", "Proyecto": "Projet", "Solar": "Terrain", "Edificio": "Bâtiment", "Local": "Commercial" },
        ht: { "Casa": "Kay", "Villa": "Villa", "Apartamento": "Apatman", "Penthouse": "Penthouse", "Proyecto": "Pwojè", "Solar": "Tè", "Edificio": "Bilding", "Local": "Komèsyal" }
      };
      const translatedType = typeDict[currentLang]?.[prop.property_type] || prop.property_type;
      set('#detail-type', translatedType);
      show('detail-type');
      set('#sidebar-type', translatedType);
      show('sb-type-row');
    }

    // ── Spec cards: show only if value exists
    if (prop.m2) {
      set('#detail-m2', prop.m2 + ' m²');
      set('#sidebar-m2', prop.m2 + ' m²');
      show('spec-m2');
      show('sb-m2-row');
    }
    if (prop.solar_m2) {
      set('#detail-solar', prop.solar_m2 + ' m²');
      set('#sidebar-solar', prop.solar_m2 + ' m²');
      show('spec-solar');
      show('sb-solar-row');
    }
    if (prop.bedrooms) { set('#detail-beds', prop.bedrooms); show('spec-beds'); }
    if (prop.bathrooms) { set('#detail-baths', prop.bathrooms); show('spec-baths'); }
    if (prop.parking)   { set('#detail-park', prop.parking); show('spec-park'); }
    if (prop.floors)    { set('#detail-floors', prop.floors); show('spec-floors'); }

    if (prop.year_built) {
      set('#detail-year', prop.year_built);
      set('#sidebar-year', prop.year_built);
      show('spec-year');
      show('sb-year-row');
    }

    if (prop.price_per_m2) {
      set('#detail-price-m2', 'USD ' + Number(prop.price_per_m2).toLocaleString() + '/m²');
      set('#sidebar-price-m2-val', 'USD ' + Number(prop.price_per_m2).toLocaleString());
      show('price-per-m2-block');
      show('sidebar-price-m2');
    }

    if (prop.hoa_fee) {
      set('#detail-hoa', 'USD ' + Number(prop.hoa_fee).toLocaleString() + '/mes');
      set('#sidebar-hoa-val', 'USD ' + Number(prop.hoa_fee).toLocaleString() + '/mes');
      show('spec-hoa');
      show('sb-hoa-row');
    }

    // ── Tags
    if (prop.tags && prop.tags.length > 0) {
      const tagsEl = document.getElementById('detail-tags');
      if (tagsEl) {
        tagsEl.innerHTML = prop.tags.map(tag =>
          `<span class="bg-off-white border border-mid/30 text-navy text-xs px-3 py-1.5 rounded-full font-medium">${tag}</span>`
        ).join('');
        show('detail-tags-container');
      }
    }

    // ── Amenidades
    const AMENIDADES = [
      { key: 'pool',        icon: '🏊', label: 'Piscina' },
      { key: 'gym',         icon: '💪', label: 'Gimnasio' },
      { key: 'elevator',    icon: '🛗', label: 'Elevador' },
      { key: 'security_24h',icon: '🔒', label: 'Seguridad 24h' },
      { key: 'balcony',     icon: '🌿', label: 'Balcón' },
      { key: 'terrace',     icon: '🌅', label: 'Terraza' },
      { key: 'garden',      icon: '🌳', label: 'Jardín' },
      { key: 'ac',          icon: '❄️', label: 'Aire Acond.' },
      { key: 'furnished',   icon: '🛋️', label: 'Amueblado' },
    ];
    const activeAmenidades = AMENIDADES.filter(a => prop[a.key]);
    if (activeAmenidades.length > 0) {
      const amenEl = document.getElementById('detail-amenidades');
      if (amenEl) {
        amenEl.innerHTML = activeAmenidades.map(a =>
          `<span class="flex items-center gap-1.5 bg-gold/10 border border-gold/20 text-navy text-sm px-3 py-1.5 rounded-full">
             <span>${a.icon}</span><span class="font-medium">${a.label}</span>
           </span>`
        ).join('');
        show('amenidades-block');
      }
    }

    // ── WhatsApp dynamic link
    const waLink = document.getElementById('wa-link');
    if (waLink) {
      const waNumber = prop.whatsapp_number ? prop.whatsapp_number.replace(/\D/g, '') : '16468831869';
      const waMsg = encodeURIComponent('Hola, me interesa la propiedad: ' + title);
      waLink.href = `https://wa.me/${waNumber}?text=${waMsg}`;
    }

    // ── Contact phone
    if (prop.whatsapp_number) {
      set('#contact-phone', prop.whatsapp_number);
    }

    // ── Google Maps link
    const mapLink = document.getElementById('map-link');
    if (mapLink) {
      if (prop.google_maps_url) {
        mapLink.href = prop.google_maps_url;
      } else if (loc) {
        mapLink.href = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(loc);
      }
      show('map-block');
    }

    // ── Status badge
    const badgeEl = document.getElementById('detail-badge');
    if (badgeEl) badgeEl.innerHTML = statusBadge(prop.status, false);

    // ── Description with rich formatting
    const descEl = document.querySelector('#detail-desc');
    if (descEl && desc) {
      let html = '';
      let inList = false;
      desc.split('\n').forEach(line => {
        const txt = line.trim();
        if (!txt) return;
        if (txt.startsWith('•') || txt.startsWith('-')) {
          if (!inList) { html += '<ul class="mb-8 space-y-3">'; inList = true; }
          html += `<li class="flex items-start gap-3">
                     <span class="text-gold mt-1 shrink-0"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg></span>
                     <span class="text-muted leading-relaxed text-[14px]">${txt.substring(1).trim()}</span>
                   </li>`;
        } else {
          if (inList) { html += '</ul>'; inList = false; }
          if (txt.match(/^(✨|💳|📅)/)) {
            html += `<h3 class="text-xl font-serif text-navy mt-10 mb-4 flex items-center gap-3 border-b border-mid/20 pb-3">${txt}</h3>`;
          } else if (txt.startsWith('📍')) {
            html += `<p class="text-muted leading-relaxed mb-4 text-[14px]">${txt}</p>`;
          } else if (txt.startsWith('📲')) {
            html += `<p class="text-navy font-medium leading-relaxed mb-6 text-[14px] bg-navy/5 p-4 rounded-lg border border-navy/10">${txt}</p>`;
          } else {
            html += `<p class="text-muted leading-relaxed mb-6 text-[14px]">${txt}</p>`;
          }
        }
      });
      if (inList) html += '</ul>';
      descEl.innerHTML = html;
    }

    // ── Image carousel
    const carousel = document.getElementById('detail-carousel');
    const thumbs   = document.getElementById('detail-thumbs');
    if (carousel && prop.image_urls && prop.image_urls.length > 0) {
      carousel.innerHTML = '';
      prop.image_urls.forEach((url, i) => {
        const img = document.createElement('img');
        img.src = url;
        img.alt = title;
        img.loading = 'lazy';
        img.className = 'w-full h-full object-cover';
        img.style.display = i === 0 ? 'block' : 'none';
        img.style.transition = 'opacity 0.4s ease';
        carousel.appendChild(img);
      });
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
                if (idx === i) requestAnimationFrame(() => { im.style.opacity = '1'; });
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
  }

  /* ── Supabase Loader (uses fetch — no SDK dependency) ────────── */
  async function loadFromSupabase() {
    const headers = { 'apikey': SUPA_KEY, 'Authorization': 'Bearer ' + SUPA_KEY };
    try {
      const res = await fetch(SUPA_URL + '/rest/v1/properties?select=*&order=created_at.desc', { headers });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.json();

      if (Array.isArray(data) && data.length > 0) {
        allProperties = data.map(p => {
          p.id = p.slug;
          // Keep title and location as objects if they are multilang, 
          // we'll resolve them in buildCard and initDetailPage dynamically.
          if (Array.isArray(p.image_urls)) {
            p.image_urls = p.image_urls.map(img =>
              (img.startsWith('http') || img.startsWith('/assets'))
                ? img
                : SUPA_URL + '/storage/v1/object/public/property-images/' + img
            );
          }
          return p;
        });
      }
    } catch (e) {
      console.warn('Supabase load error:', e);
      // allProperties stays as FALLBACK_PROPERTIES
    }
  }

  /* ── Init ─────────────────────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', async () => {
    await loadFromSupabase();

    const path = window.location.pathname.replace(/\/$/, '');
    const pathParts = path.split('/').filter(Boolean);
    const page = pathParts[0] || '';

    if (page === '' || page === 'index' || page === 'index.html') {
      initHomePage();
    }

    if (page === 'properties' || page === 'properties.html') {
      const grid = document.getElementById('props-grid');
      if (grid) {
        renderGrid(grid, allProperties, 'all');
        initFilters(grid, allProperties);
      }
    }

    if (page === 'proyecto' || page === 'proyecto.html') {
      initDetailPage();
    }

    // Re-render on language switch
    const origSwitch = window.switchLanguage;
    window.switchLanguage = function(lang) {
      if (typeof origSwitch === 'function') origSwitch(lang);
      if (page === '' || page === 'index' || page === 'index.html') initHomePage();
      if (page === 'properties' || page === 'properties.html') {
        const grid = document.getElementById('props-grid');
        const active = document.querySelector('.filter-btn.active');
        const filter = active ? (active.getAttribute('data-filter') || 'all') : 'all';
        if (grid) renderGrid(grid, allProperties, filter);
      }
      if (page === 'proyecto' || page === 'proyecto.html') initDetailPage();
    };
  });

})();