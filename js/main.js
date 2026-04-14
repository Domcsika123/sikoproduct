(function () {
  'use strict';

  window.toggleMenu = function () {
    const nav = document.getElementById('navLinks');
    if (nav) nav.classList.toggle('open');
  };

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------- Scroll-reveal animations ----------
  const revealEls = document.querySelectorAll('.anim');
  if (revealEls.length) {
    if (reduced || !('IntersectionObserver' in window)) {
      revealEls.forEach((el) => el.classList.add('is-visible'));
    } else {
      const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            revealObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
      revealEls.forEach((el) => revealObserver.observe(el));
    }
  }

  // ---------- Auto-stagger for grids ----------
  document.querySelectorAll('[data-stagger]').forEach((parent) => {
    const step = parseFloat(parent.dataset.stagger) || 0.1;
    Array.from(parent.children).forEach((child, i) => {
      if (child.classList.contains('anim') && !child.style.getPropertyValue('--d')) {
        child.style.setProperty('--d', (i * step).toFixed(2) + 's');
      }
    });
  });

  // ---------- Stat counter ----------
  const nums = document.querySelectorAll('.stats-grid .num');
  if (!nums.length) return;

  const parseTarget = (el) => {
    const suffixEl = el.querySelector('span');
    const suffix = suffixEl ? suffixEl.outerHTML : '';
    const raw = el.textContent.replace(/[^0-9]/g, '');
    const target = parseInt(raw, 10) || 0;
    return { target, suffix };
  };

  const state = new Map();
  nums.forEach((el) => {
    const { target, suffix } = parseTarget(el);
    state.set(el, { target, suffix, done: false });
    el.innerHTML = '0' + suffix;
  });

  if (reduced) {
    nums.forEach((el) => {
      const s = state.get(el);
      el.innerHTML = s.target + s.suffix;
    });
    return;
  }

  const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

  const animate = (el) => {
    const s = state.get(el);
    if (!s || s.done) return;
    s.done = true;
    const duration = 4704;
    const start = performance.now();
    const step = (now) => {
      const t = Math.min((now - start) / duration, 1);
      const value = Math.round(easeOutCubic(t) * s.target);
      el.innerHTML = value + s.suffix;
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  if (!('IntersectionObserver' in window)) {
    nums.forEach(animate);
    return;
  }

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animate(entry.target);
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });

  nums.forEach((el) => counterObserver.observe(el));
})();
