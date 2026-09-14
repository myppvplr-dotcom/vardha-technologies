'use strict';

/* ---------- mobile menu ---------- */
const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#navigation');

function setMenu(open) {
  if (!navigation || !menuButton) return;
  navigation.classList.toggle('is-open', open);
  menuButton.setAttribute('aria-expanded', String(open));
}

if (menuButton && navigation) {
  setMenu(false);
  menuButton.addEventListener('click', () => {
    setMenu(menuButton.getAttribute('aria-expanded') !== 'true');
  });
  navigation.addEventListener('click', (event) => {
    if (event.target.closest('a')) setMenu(false);
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') {
      setMenu(false);
      menuButton.focus();
    }
  });
}

/* ---------- sticky header shadow + back-to-top ---------- */
const header = document.querySelector('.header');
const toTop = document.querySelector('#toTop');

function onScroll() {
  const y = window.scrollY || 0;
  if (header) header.classList.toggle('is-scrolled', y > 8);
  if (toTop) toTop.classList.toggle('is-visible', y > 700);
}
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();
if (toTop) toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

/* ---------- reveal on scroll ---------- */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal, .stagger').forEach((el) => revealObserver.observe(el));

/* ---------- animated stat counters ---------- */
const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    counterObserver.unobserve(el);
    const target = Number(el.dataset.count || 0);
    const suffix = el.dataset.suffix || '';
    const duration = 1200;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
}, { threshold: 0.6 });
document.querySelectorAll('[data-count]').forEach((el) => counterObserver.observe(el));

/* ---------- hero artifact tilt ---------- */
const heroArt = document.querySelector('#heroArt');
if (heroArt && window.matchMedia('(pointer: fine)').matches) {
  heroArt.addEventListener('mousemove', (event) => {
    const rect = heroArt.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    heroArt.style.transform = `perspective(900px) rotateY(${x * 4}deg) rotateX(${-y * 4}deg)`;
  });
  heroArt.addEventListener('mouseleave', () => {
    heroArt.style.transform = '';
  });
}

/* ---------- hero product showcase carousel ---------- */
const showcase = document.querySelector('#showcase');
if (showcase) {
  const slides = Array.from(showcase.querySelectorAll('.slide'));
  const dots = Array.from(showcase.querySelectorAll('.show-dots button'));
  const prev = showcase.querySelector('.show-btn.prev');
  const next = showcase.querySelector('.show-btn.next');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let current = 0;
  let timer = null;

  function go(index) {
    current = (index + slides.length) % slides.length;
    slides.forEach((s, i) => s.classList.toggle('is-active', i === current));
    dots.forEach((d, i) => d.setAttribute('aria-selected', String(i === current)));
  }

  function stop() {
    if (timer) { window.clearInterval(timer); timer = null; }
  }

  function start() {
    stop();
    if (reduceMotion.matches || document.hidden) return;
    timer = window.setInterval(() => go(current + 1), 4000);
  }

  if (prev) prev.addEventListener('click', () => { go(current - 1); start(); });
  if (next) next.addEventListener('click', () => { go(current + 1); start(); });
  dots.forEach((d, i) => d.addEventListener('click', () => { go(i); start(); }));
  showcase.addEventListener('mouseenter', stop);
  showcase.addEventListener('mouseleave', start);
  showcase.addEventListener('focusin', stop);
  showcase.addEventListener('focusout', start);
  document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));
  if (typeof reduceMotion.addEventListener === 'function') {
    reduceMotion.addEventListener('change', start);
  }
  go(0);
  start();
}

/* ---------- product filters ---------- */
const filters = document.querySelectorAll('.filter');
const families = document.querySelectorAll('.family');
const filterCount = document.querySelector('#filterCount');

function applyFilter(key) {
  let visibleCards = 0;
  families.forEach((family) => {
    const match = key === 'all' || family.dataset.family === key;
    family.classList.toggle('is-hidden', !match);
    if (match) {
      visibleCards += family.querySelectorAll('.card').length;
      // replay stagger when a hidden family returns
      family.querySelectorAll('.stagger').forEach((s) => {
        s.classList.remove('is-visible');
        requestAnimationFrame(() => requestAnimationFrame(() => s.classList.add('is-visible')));
      });
    }
  });
  if (filterCount) {
    filterCount.textContent = key === 'all'
      ? `Showing all ${visibleCards} products across 6 families.`
      : `Showing ${visibleCards} products.`;
  }
}

filters.forEach((button) => {
  button.addEventListener('click', () => {
    filters.forEach((b) => {
      b.classList.remove('is-active');
      b.setAttribute('aria-selected', 'false');
    });
    button.classList.add('is-active');
    button.setAttribute('aria-selected', 'true');
    applyFilter(button.dataset.filter);
  });
});
applyFilter('all');

/* ---------- product links pre-select the enquiry dropdown ---------- */
document.querySelectorAll('[data-product]').forEach((link) => {
  link.addEventListener('click', () => {
    const select = document.querySelector('#solution');
    if (!select) return;
    const wanted = link.dataset.product;
    const option = Array.from(select.options).find((o) => o.text === wanted);
    if (option) select.value = option.value || option.text;
  });
});

/* ---------- footer year ---------- */
const year = document.querySelector('#year');
if (year) year.textContent = String(new Date().getFullYear());

/* ---------- enquiry via email (mailto, no server) ---------- */
const form = document.querySelector('#enquiry-form');
const status = document.querySelector('#form-status');
const ENQUIRY_TO = 'Vardhatechnologies@gmail.com';

if (form) {
  form.setAttribute('novalidate', 'novalidate');
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    const value = (key) => String(data.get(key) || '').trim();
    if (!value('name') || !value('company') || !value('requirements') || !value('email')) {
      if (status) status.textContent = 'Please fill your name, company, email and requirements.';
      return;
    }
    const subject = `Enquiry: ${value('solution')} — ${value('company')}`;
    const body = [
      'New enquiry from vardhatechnologies website',
      '',
      `Name: ${value('name')}`,
      `Company: ${value('company')}`,
      `Email: ${value('email')}`,
      `Product of interest: ${value('solution')}`,
      '',
      'Requirements:',
      value('requirements')
    ].join('\n');
    const href = `mailto:${ENQUIRY_TO}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    if (href.length > 1800 && status) {
      status.textContent = 'Your requirements text is very long for an email link. Please shorten it a little, or email us directly at ' + ENQUIRY_TO + '.';
      return;
    }
    window.location.href = href;
    if (status) status.textContent = 'Opening your email app with the enquiry addressed to us — just press send.';
  });
}
