/* js/app.js — Multi-page real estate site logic */
(function () {
  'use strict';

  /* ── Property Data ──────────────────────────────────────────── */
  const FALLBACK_PROPERTIES = [
    {
      id: 'fallback-1',
      title_key: 're-duran-title',
      location_key: 're-duran-loc',
      title: 'Residencial Duran',
      location: 'Residencial María Mercedes, Aut. San Isidro, SDE',
      price: 175000,
      m2: 150,
      bedrooms: 3,
      bathrooms: 3.5,
      parking: 2,
      status: 'en_desarrollo',
      image_urls: [
        'assets/images/projects/duran-2.webp',
        'assets/images/projects/duran-3.webp',
        'assets/images/projects/duran-4.webp',
        'assets/images/projects/duran-5.webp',
        'assets/images/projects/rodriguez-ii-1.webp',
        'assets/images/projects/rodriguez-ii-2.webp',
      ]
    },
    {
      id: 'fallback-2',
      title_key: 're-rod-title',
      location_key: 're-rod-loc',
      title: 'Residencial Rodríguez II',
      location: 'San Isidro, Santo Domingo Este',
      price: 175000,
      m2: 150,
      bedrooms: 3,
      bathrooms: 2.5,
      parking: 2,
      status: 'en_desarrollo',
      image_urls: [
        'assets/images/projects/rodriguez-ii-1.webp',
        'assets/images/projects/rodriguez-ii-2.webp',
        'assets/images/projects/duran-4.webp',
        'assets/images/projects/duran-5.webp',
      ]
    },
    {
      id: 'fallback-3',
      title_key: 're-c1-title',
      location_key: 're-c1-loc',
      title: 'Villa Marina & Golf',
      location: 'Casa de Campo, La Romana',
      price: 0,
      m2: 800,
      bedrooms: 6,
      bathrooms: 7.5,
      parking: 6,
      status: 'disponible',
      image_urls: [
        'assets/images/projects/duran-3.webp',
        'assets/images/projects/duran-2.webp',
      ]
    },
    {
      id: 'fallback-4',
      title_key: 're-c2-title',
      location_key: 're-c2-loc',
      title: 'Cap Cana Oceanfront Villa',
      location: 'Cap Cana, Punta Cana',
      price: 0,
      m2: 650,
      bedrooms: 5,
      bathrooms: 6.5,
      parking: 4,
      status: 'disponible',
      image_urls: [
        'assets/images/projects/rodriguez-ii-2.webp',
        'assets/images/projects/rodriguez-ii-1.webp',
      ]
    },
    {
      id: 'fallback-5',
      title_key: 're-c3-title',
      location_key: 're-c3-loc',
      title: 'Las Terrenas Beachside Penthouse',
      location: 'Playa Las Ballenas, Las Terrenas',
      price: 0,
      m2: 200,
      bedrooms: 3,
      bathrooms: 3.5,
      parking: 2,
      status: 'disponible',
      image_urls: [
        'assets/images/projects/duran-5.webp',
        'assets/images/projects/duran-4.webp',
      ]
    }
  ];

  let allProperties = [...FALLBACK_PROPERTIES];

  /* ── Helpers ─────────────────────────────────────────────────── */
  function t(key) {
    const lang = localStorage.getItem('lorenzo_lang') || 'es';
    return (window.translations && translations[lang] && translations[lang][key]) || key;
  }

  function formatPrice(price) {
    if (!price || price === 0) return t('price-consultar') || 'Precio a consultar';
    return 'USD ' + parseFloat(price).toLocaleString();
  }

  function statusBadge(status) {
    if (status === 'en_desarrollo') return `<span class="prop-card-badge gold">${t('tag-dev')}</span>`;
    return `<span class="prop-card-badge">${t('filter-sale') || 'En Venta'}</span>`;
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
    const title = t(prop.title_key) !== prop.title_key ? t(prop.title_key) : prop.title;
    const loc   = t(prop.location_key) !== prop.location_key ? t(prop.location_key) : prop.location;
    const img   = prop.image_urls && prop.image_urls[0] ? prop.image_urls[0] : 'assets/images/projects/duran-2.webp';

    const card = document.createElement('article');
    card.className = 'prop-card fade-up';
    card.setAttribute('data-status', prop.status);
    card.setAttribute('data-id', prop.id);
    card.innerHTML = `
      <a href="proyecto.html?id=${prop.id}" class="prop-detail-link" style="display:block;color:inherit">
        <div class="prop-card-img">
          <img src="${img}" alt="${title}" loading="lazy">
          ${statusBadge(prop.status)}
        </div>
        <div class="prop-card-body">
          <p class="prop-card-location">${loc}</p>
          <h3 class="prop-card-title">${title}</h3>
          <p class="prop-card-price">${formatPrice(prop.price)}</p>
          <div class="prop-card-specs">
            <span class="prop-card-spec">${specIcon('beds')} ${prop.bedrooms} ${t('spec-beds') || 'Hab.'}</span>
            <span class="prop-card-spec">${specIcon('baths')} ${prop.bathrooms} ${t('spec-baths') || 'Baños'}</span>
            <span class="prop-card-spec">${specIcon('area')} ${prop.m2} m²</span>
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

    const title     = t(prop.title_key) !== prop.title_key ? t(prop.title_key) : prop.title;
    const loc       = t(prop.location_key) !== prop.location_key ? t(prop.location_key) : prop.location;
    const descKey   = id === 'fallback-1' ? 're-duran-desc' : id === 'fallback-2' ? 're-rod-desc' : id === 'fallback-3' ? 're-c1-desc' : id === 'fallback-4' ? 're-c2-desc' : 're-c3-desc';
    const desc      = t(descKey);

    // Page title
    document.title = `${title} | Constructora Rodríguez Javier`;

    // Populate elements if they exist
    const set = (sel, val, html = false) => {
      const el = document.querySelector(sel);
      if (el) { html ? el.innerHTML = val : el.textContent = val; }
    };

    set('#detail-title', title);
    set('#detail-location', loc);
    set('#detail-price', formatPrice(prop.price));
    set('#detail-m2', prop.m2 + ' m²');
    set('#detail-beds', prop.bedrooms);
    set('#detail-baths', prop.bathrooms);
    set('#detail-park', prop.parking);

    // Description (preserve newlines)
    const descEl = document.querySelector('#detail-desc');
    if (descEl) {
      descEl.innerHTML = desc
        .split('\n')
        .map(line => line.trim() ? `<p style="margin-bottom:.5rem">${line}</p>` : '')
        .join('');
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
          btn.style.cssText = `border:2px solid ${i === 0 ? 'var(--gold)' : 'var(--mid)'};border-radius:2px;overflow:hidden;cursor:pointer;padding:0;background:none;`;
          btn.innerHTML = `<img src="${url}" alt="thumb" style="width:70px;height:52px;object-fit:cover;display:block;">`;
          btn.addEventListener('click', () => {
            carousel.querySelectorAll('img').forEach((im, idx) => im.style.display = idx === i ? 'block' : 'none');
            thumbs.querySelectorAll('button').forEach((b, idx) => b.style.borderColor = idx === i ? 'var(--gold)' : 'var(--mid)');
          });
          thumbs.appendChild(btn);
        });
      }
    }

    // Status badge on detail page
    const badgeEl = document.getElementById('detail-badge');
    if (badgeEl) badgeEl.innerHTML = statusBadge(prop.status);

    // Back link
    const backEl = document.querySelector('.detail-back');
    if (backEl) backEl.href = 'properties.html';
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
    const url  = localStorage.getItem('supabase_url') || 'https://rnkktolpevqpcyvessfn.supabase.co';
    const key  = localStorage.getItem('supabase_anon_key');
    if (!key || typeof supabase === 'undefined') return;
    try {
      const client = supabase.createClient(url, key);
      const { data, error } = await client.from('properties').select('*').order('created_at', { ascending: false });
      if (!error && data && data.length > 0) {
        allProperties = [...FALLBACK_PROPERTIES, ...data];
      }
    } catch (e) {
      console.warn('Supabase load error:', e);
    }
  }

  /* ── Init ─────────────────────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', async () => {
    await loadFromSupabase();

    const page = window.location.pathname.replace(/\/$/, '').split('/').pop() || 'index.html';

    if (page === 'index.html' || page === '') {
      initHomePage();
    }

    if (page === 'properties.html') {
      const grid = document.getElementById('props-grid');
      if (grid) {
        renderGrid(grid, allProperties, 'all');
        initFilters(grid, allProperties);
      }
    }

    if (page === 'proyecto.html') {
      initDetailPage();
    }

    // Re-render on lang switch
    const origSwitch = window.switchLanguage;
    window.switchLanguage = function(lang) {
      if (typeof origSwitch === 'function') origSwitch(lang);
      if (page === 'index.html' || page === '') initHomePage();
      if (page === 'properties.html') {
        const grid = document.getElementById('props-grid');
        const active = document.querySelector('.filter-btn.active');
        const filter = active ? (active.getAttribute('data-filter') || 'all') : 'all';
        if (grid) renderGrid(grid, allProperties, filter);
      }
      if (page === 'proyecto.html') initDetailPage();
    };
  });

})();