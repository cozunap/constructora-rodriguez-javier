/* js/components.js — Shared navigation, footer, WhatsApp widget, utilities */
(function () {
  'use strict';

  /* ── Icons ─────────────────────────────────────────────────── */
  const ICONS = {
    beds:    '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 9V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v4"/><path d="M2 11v5a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-5"/><path d="M2 11h20"/></svg>',
    baths:   '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6 6.5 3.5a1.5 1.5 0 0 0-1-.5C4.683 3 4 3.683 4 4.5V17a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5"/><line x1="10" y1="5" x2="8" y2="7"/><line x1="2" y1="12" x2="22" y2="12"/></svg>',
    park:    '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>',
    area:    '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="1"/><path d="M3 9h18M9 21V9"/></svg>',
    arrow:   '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>',
    wa:      '<svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor"><path d="M12.012 2c-5.506 0-9.988 4.482-9.988 9.988 0 1.76.459 3.473 1.332 4.978L2 22l5.234-1.373a9.927 9.927 0 0 0 4.778 1.217c5.506 0 9.988-4.482 9.988-9.988C22 6.482 17.518 2 12.012 2zm4.72 13.916c-.208.583-1.026 1.133-1.636 1.258-.52.106-1.196.187-3.488-.763-2.929-1.217-4.82-4.204-4.965-4.4a5.19 5.19 0 0 1-.989-2.775c0-1.467.77-2.196 1.04-2.467.27-.27.583-.343.78-.343.197 0 .395.002.562.01.176.009.416-.067.65.49.25.593.853 2.08.926 2.227.073.146.125.323.02.52-.104.208-.156.323-.312.5-.156.177-.323.395-.468.531-.166.156-.343.323-.146.666.197.333.884 1.457 1.894 2.352 1.3 1.155 2.394 1.51 2.738 1.676.343.167.541.135.739-.094.197-.229.853-1.009 1.082-1.353.229-.343.458-.291.77-.177.312.115 1.977.968 2.31 1.135.333.166.552.25.635.395.083.146.083.843-.125 1.427z"/></svg>',
    chevUp:  '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="18 15 12 9 6 15"/></svg>',
  };

  /* ── Detect current page ───────────────────────────────────── */
  const page = window.location.pathname.replace(/\/$/, '').split('/').pop() || 'index.html';

  /* ── Navigation HTML ───────────────────────────────────────── */
  function buildNav() {
    const isHome = page === '' || page === 'index.html';
    const darkClass = isHome ? 'nav-dark' : '';

    const links = [
      { href: 'index.html',      key: 'nav-home' },
      { href: 'properties.html', key: 'nav-properties' },
      { href: 'services.html',   key: 'nav-services' },
      { href: 'about.html',      key: 'nav-about' },
      { href: 'contact.html',    key: 'nav-contact' },
    ];

    const navLinks = links.map(l => {
      const active = page === l.href ? ' active' : '';
      return `<a href="${l.href}" class="${active}" data-i18n="${l.key}">${l.key}</a>`;
    }).join('');

    const el = document.createElement('nav');
    el.className = `site-nav ${darkClass}`;
    el.id = 'site-nav';
    el.innerHTML = `
      <div class="nav-inner">
        <a href="index.html" class="nav-logo" aria-label="Constructora Rodríguez Javier">
          <img src="assets/lorenzo-logo.webp" alt="Logo">
        </a>
        <div class="nav-links" id="nav-links">
          ${navLinks}
          <div class="lang-switcher">
            <button class="lang-btn active" data-lang="es" onclick="switchLanguage('es')">ES</button>
            <button class="lang-btn" data-lang="en" onclick="switchLanguage('en')">EN</button>
          </div>
          <a href="contact.html" class="btn btn-primary nav-cta" data-i18n="nav-cta">Cotizar</a>
        </div>
        <button class="nav-hamburger" id="nav-hamburger" aria-label="Menu" aria-expanded="false">
          <span></span><span></span><span></span>
        </button>
      </div>`;

    document.body.prepend(el);

    /* Scroll behaviour */
    const nav = document.getElementById('site-nav');
    function onScroll() {
      nav.classList.toggle('scrolled', window.scrollY > 40);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    /* Hamburger */
    const ham = document.getElementById('nav-hamburger');
    const menu = document.getElementById('nav-links');
    ham.addEventListener('click', () => {
      const open = menu.classList.toggle('open');
      ham.classList.toggle('open', open);
      ham.setAttribute('aria-expanded', open);
      document.body.classList.toggle('no-scroll', open);
    });
  }

  /* ── Footer HTML ───────────────────────────────────────────── */
  function buildFooter() {
    const el = document.createElement('footer');
    el.className = 'site-footer';
    el.innerHTML = `
      <div class="container">
        <div class="footer-grid">
          <div class="footer-brand">
            <a href="index.html" class="footer-logo"><img src="assets/lorenzo-logo.webp" alt="Logo"></a>
            <p data-i18n="footer-desc">Transformando espacios con calidad, puntualidad y excelencia en Santo Domingo.</p>
          </div>
          <div class="footer-col">
            <h4 data-i18n="footer-pages">Páginas</h4>
            <ul>
              <li><a href="index.html" data-i18n="nav-home">Inicio</a></li>
              <li><a href="properties.html" data-i18n="nav-properties">Propiedades</a></li>
              <li><a href="services.html" data-i18n="nav-services">Servicios</a></li>
              <li><a href="about.html" data-i18n="nav-about">Nosotros</a></li>
              <li><a href="contact.html" data-i18n="nav-contact">Contacto</a></li>
            </ul>
          </div>
          <div class="footer-col">
            <h4 data-i18n="footer-services-title">Servicios</h4>
            <ul>
              <li><a href="services.html" data-i18n="srv-interior-title">Diseño de Interiores</a></li>
              <li><a href="services.html" data-i18n="srv-civil-title">Construcción</a></li>
              <li><a href="services.html" data-i18n="srv-wood-title">Ebanistería</a></li>
              <li><a href="services.html" data-i18n="srv-project-title">Gestión de Obra</a></li>
            </ul>
          </div>
          <div class="footer-col">
            <h4 data-i18n="footer-contact-title">Contacto</h4>
            <ul>
              <li><a href="tel:+18299595350">+1 (829) 959-5350</a></li>
              <li><a href="mailto:info@crjavier.com">info@crjavier.com</a></li>
              <li><a href="#" data-i18n="footer-location">Santo Domingo, RD</a></li>
            </ul>
          </div>
        </div>
        <div class="footer-bottom">
          <p>&copy; <span id="footer-year"></span> Constructora Rodríguez Javier SRL. <span data-i18n="footer-rights">Todos los derechos reservados.</span></p>
          <p>Diseñado por <a href="https://cozuna.com" target="_blank">cozuna.com</a></p>
        </div>
      </div>`;
    document.body.appendChild(el);
    document.getElementById('footer-year').textContent = new Date().getFullYear();
  }

  /* ── WhatsApp Widget ───────────────────────────────────────── */
  function buildWA() {
    const el = document.createElement('div');
    el.className = 'wa-widget';
    el.innerHTML = `
      <div class="wa-box" id="wa-box">
        <div class="wa-box-header">
          <div class="wa-avatar">👷</div>
          <div>
            <h4 data-i18n="wa-header">Chat de Soporte</h4>
            <span data-i18n="wa-subheader">Responde en minutos</span>
          </div>
        </div>
        <div class="wa-box-body">
          <div class="wa-bubble" data-i18n="wa-welcome">¡Hola! 👋 ¿En qué podemos ayudarte?</div>
          <a href="https://wa.me/18299595350?text=Hola%2C%20me%20interesa%20conocer%20m%C3%A1s%20sobre%20sus%20propiedades."
             target="_blank" class="btn" id="wa-start">
            <span data-i18n="wa-btn">Iniciar Chat</span>
          </a>
        </div>
      </div>
      <button class="wa-toggle" id="wa-toggle" aria-label="WhatsApp">${ICONS.wa}</button>`;
    document.body.appendChild(el);

    const toggle = document.getElementById('wa-toggle');
    const box    = document.getElementById('wa-box');
    toggle.addEventListener('click', () => box.classList.toggle('open'));
  }

  /* ── Back to top ───────────────────────────────────────────── */
  function buildBackToTop() {
    const btn = document.createElement('button');
    btn.className = 'back-to-top';
    btn.id = 'back-to-top';
    btn.setAttribute('aria-label', 'Back to top');
    btn.innerHTML = ICONS.chevUp;
    document.body.appendChild(btn);
    window.addEventListener('scroll', () => {
      btn.classList.toggle('visible', window.scrollY > 400);
    }, { passive: true });
    btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  /* ── Fade-up animation ─────────────────────────────────────── */
  function initFadeUp() {
    const els = document.querySelectorAll('.fade-up');
    if (!els.length) return;
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } });
    }, { threshold: 0.12 });
    els.forEach(el => obs.observe(el));
  }

  /* ── Init ──────────────────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', () => {
    buildNav();
    buildFooter();
    buildWA();
    buildBackToTop();
    initFadeUp();
  });

  /* ── Expose icons for other scripts ───────────────────────── */
  window.SITE_ICONS = ICONS;
})();
