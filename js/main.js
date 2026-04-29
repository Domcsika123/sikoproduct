(function () {
  'use strict';

  const nav = document.getElementById('navLinks');
  const hamburger = document.getElementById('hamburger');
  const dropdownParents = nav ? Array.from(nav.querySelectorAll(':scope > li')).filter((li) => li.querySelector('.dropdown-menu')) : [];

  const closeMobileDropdowns = function () {
    dropdownParents.forEach((li) => li.classList.remove('open'));
  };

  const setMenuState = function (open) {
    if (!nav) return;
    nav.classList.toggle('open', open);
    if (hamburger) {
      hamburger.classList.toggle('open', open);
      hamburger.style.position = 'relative';
      hamburger.style.width = '32px';
      hamburger.style.height = '32px';
      const spans = hamburger.querySelectorAll('span');
      if (spans.length >= 3) {
        if (open) {
          spans[0].style.cssText = 'position:absolute !important; top:15px !important; left:4px !important; width:24px !important; height:2px !important; background: var(--charcoal, #16243d) !important; border-radius:1px !important; margin:0 !important; transform: rotate(45deg) !important; transform-origin: center !important; transition: transform 0.3s ease, top 0.3s ease, opacity 0.2s ease !important;';
          spans[1].style.cssText = 'position:absolute !important; top:15px !important; left:4px !important; width:24px !important; height:2px !important; background: var(--charcoal, #16243d) !important; border-radius:1px !important; margin:0 !important; opacity: 0 !important; transform: scaleX(0) !important; transition: transform 0.3s ease, opacity 0.2s ease !important;';
          spans[2].style.cssText = 'position:absolute !important; top:15px !important; left:4px !important; width:24px !important; height:2px !important; background: var(--charcoal, #16243d) !important; border-radius:1px !important; margin:0 !important; transform: rotate(-45deg) !important; transform-origin: center !important; transition: transform 0.3s ease, top 0.3s ease, opacity 0.2s ease !important;';
        } else {
          spans[0].style.cssText = '';
          spans[1].style.cssText = '';
          spans[2].style.cssText = '';
        }
      }
    }
    document.body.classList.toggle('menu-open', open);
    if (!open) closeMobileDropdowns();
  };

  window.toggleMenu = function () {
    if (!nav) return;
    setMenuState(!nav.classList.contains('open'));
  };

  dropdownParents.forEach((li) => {
    const trigger = li.querySelector(':scope > a');
    if (!trigger) return;

    trigger.addEventListener('click', function (event) {
      if (window.innerWidth > 768) return;
      if (!nav || !nav.classList.contains('open')) return;

      if (!li.classList.contains('open')) {
        event.preventDefault();
        dropdownParents.forEach((item) => {
          if (item !== li) item.classList.remove('open');
        });
        li.classList.add('open');
      }
    });
  });

  window.addEventListener('resize', function () {
    if (!nav) return;
    if (window.innerWidth > 768) {
      setMenuState(false);
    }
  });

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------- Auto-anim: add reveal classes to un-animated section content ----------
  // Selectors of "content" elements that should fade in.
  const autoAnimSelectors = [
    'h1', 'h2', 'h3', 'h4',
    'p',
    '.divider',
    '.section-label',
    '.section-title',
    '.section-subtitle',
    '.btn',
    '.card',
    '.dark-card',
    '.value-card',
    '.machine-card',
    '.timeline-item',
    '.about-img',
    '.about-img-placeholder',
    '.text-block',
    '.contact-info',
    '.contact-form',
    '.stat-item',
    '.feature-list',
    '.check-list',
    'ul.feature-list > li',
    'ul.check-list > li',
    'img'
  ].join(',');

  const isInsideAnim = (el) => {
    let p = el.parentElement;
    while (p && p !== document.body) {
      if (p.classList && p.classList.contains('anim')) return true;
      p = p.parentElement;
    }
    return false;
  };

  document.querySelectorAll('section, .stats-bar, footer').forEach((section) => {
    const candidates = section.querySelectorAll(autoAnimSelectors);
    let i = 0;
    candidates.forEach((el) => {
      if (el.classList.contains('anim')) return;
      if (isInsideAnim(el)) return;
      // Skip purely decorative / already-handled wrappers
      if (el.closest('header')) return;

      el.classList.add('anim', 'anim-fade');
      // Stagger only if no inline delay has been set
      if (!el.style.getPropertyValue('--d')) {
        const delay = Math.min(i * 0.06, 0.42);
        if (delay > 0) el.style.setProperty('--d', delay.toFixed(2) + 's');
      }
      i++;
    });
  });

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
