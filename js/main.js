/* =========================================================
   Barber Shop — interactions
   ========================================================= */
(() => {
  'use strict';

  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------------------------------------------------
     Preloader — counts real asset progress, never blocks
     --------------------------------------------------------- */
  const loader = $('#loader');
  const fill   = $('#loaderFill');
  const pctEl  = $('#loaderPct');

  const initLoader = () => {
    let pct = 0;
    const tick = setInterval(() => {
      pct = Math.min(pct + Math.random() * 16, 92);
      fill.style.width = pct + '%';
      pctEl.textContent = Math.round(pct) + '%';
    }, 140);

    const finish = () => {
      clearInterval(tick);
      fill.style.width = '100%';
      pctEl.textContent = '100%';
      setTimeout(() => {
        loader.classList.add('is-done');
        document.body.classList.remove('is-locked');
      }, 320);
    };

    document.body.classList.add('is-locked');
    if (document.readyState === 'complete') finish();
    else window.addEventListener('load', finish, { once: true });
    setTimeout(finish, 4500); // safety net
  };
  initLoader();

  /* ---------------------------------------------------------
     Header: solid on scroll + hide when scrolling down
     --------------------------------------------------------- */
  const header = $('#header');
  const progress = $('#scrollProgress');
  const toTop = $('#toTop');
  let lastY = window.scrollY;

  const onScrollUI = () => {
    const y = window.scrollY;
    header.classList.toggle('is-solid', y > 60);
    header.classList.toggle('is-hidden', y > 420 && y > lastY && !nav.classList.contains('is-open'));
    toTop.classList.toggle('is-on', y > 700);

    const max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
    lastY = y;
  };

  /* ---------------------------------------------------------
     Mobile menu
     --------------------------------------------------------- */
  const nav = $('#nav');
  const burger = $('#burger');
  const navLinks = $$('.nav__link');

  navLinks.forEach((l, i) => l.style.setProperty('--d', 60 + i * 55 + 'ms'));

  const closeMenu = () => {
    nav.classList.remove('is-open');
    burger.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Menu openen');
    document.body.classList.remove('is-locked');
  };

  burger.addEventListener('click', () => {
    const open = !nav.classList.contains('is-open');
    nav.classList.toggle('is-open', open);
    burger.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Menu sluiten' : 'Menu openen');
    document.body.classList.toggle('is-locked', open);
  });

  navLinks.forEach(l => l.addEventListener('click', closeMenu));

  /* ---------------------------------------------------------
     Reveal on scroll
     --------------------------------------------------------- */
  const revealIO = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.classList.add('is-in');
      revealIO.unobserve(e.target);
    });
  }, { threshold: 0.14, rootMargin: '0px 0px -8% 0px' });

  $$('.reveal').forEach(el => revealIO.observe(el));

  /* ---------------------------------------------------------
     Stat counters
     --------------------------------------------------------- */
  const countIO = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target;
      const target = +el.dataset.count;
      countIO.unobserve(el);

      const fmt = (n) => n.toLocaleString('nl-BE');
      if (reduced) { el.textContent = fmt(target); return; }

      const dur = 1400;
      const t0 = performance.now();
      const step = (now) => {
        const p = Math.min((now - t0) / dur, 1);
        el.textContent = fmt(Math.round(target * (1 - Math.pow(1 - p, 3))));
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
  }, { threshold: 0.6 });

  $$('[data-count]').forEach(el => countIO.observe(el));

  /* ---------------------------------------------------------
     Active nav link
     --------------------------------------------------------- */
  const sections = $$('main section[id]');
  const sectionIO = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const id = '#' + e.target.id;
      navLinks.forEach(l => l.classList.toggle('is-active', l.getAttribute('href') === id));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });

  sections.forEach(s => sectionIO.observe(s));

  /* ---------------------------------------------------------
     Parallax (hero media, video bands, about frame)
     --------------------------------------------------------- */
  const layers = [
    ...$$('.hero__media').map(el => ({ el, k: 0.22 })),
    ...$$('.band__media').map(el => ({ el, k: 0.14 })),
    ...$$('[data-parallax]').map(el => ({ el, k: parseFloat(el.dataset.parallax) })),
  ];

  const onScrollParallax = () => {
    const vh = window.innerHeight;
    layers.forEach(({ el, k }) => {
      const r = el.getBoundingClientRect();
      if (r.bottom < -200 || r.top > vh + 200) return;
      const mid = r.top + r.height / 2 - vh / 2;
      el.style.transform = `translate3d(0,${(-mid * k).toFixed(2)}px,0)`;
    });
  };

  /* ---------------------------------------------------------
     Single rAF scroll loop
     --------------------------------------------------------- */
  let queued = false;
  const onScroll = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      onScrollUI();
      if (!reduced) onScrollParallax();
      queued = false;
    });
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();

  /* ---------------------------------------------------------
     Hero video: keep it playing, optional sound
     --------------------------------------------------------- */
  const heroVideo = $('#heroVideo');
  const soundBtn = $('#soundToggle');

  const nudgeHero = () => heroVideo?.play?.().catch(() => {});
  nudgeHero();
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) nudgeHero();
  });
  ['click', 'touchstart', 'keydown'].forEach(evt =>
    window.addEventListener(evt, nudgeHero, { once: true, passive: true })
  );

  soundBtn?.addEventListener('click', () => {
    const muted = soundBtn.dataset.muted === 'true';
    heroVideo.muted = !muted;
    soundBtn.dataset.muted = String(!muted);
    soundBtn.setAttribute('aria-label', muted ? 'Geluid uitzetten' : 'Geluid aanzetten');
    if (muted) { heroVideo.volume = 0.7; nudgeHero(); }
  });

  /* ---------------------------------------------------------
     Videos that play only while in view
     --------------------------------------------------------- */
  const videoIO = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      const v = e.target;
      const card = v.closest('.reel');
      if (e.isIntersecting) {
        if (!v.dataset.warm) { v.preload = 'auto'; v.dataset.warm = '1'; }
        v.play().then(() => card?.classList.add('is-playing')).catch(() => {});
      } else {
        v.pause();
        card?.classList.remove('is-playing');
      }
    });
  }, { threshold: 0.3 });

  $$('[data-lazyvideo]').forEach(v => videoIO.observe(v));

  /* ---------------------------------------------------------
     Testimonial carousel — a real scroll container, so swiping,
     trackpad and shift+wheel work natively. On top of that:
     mouse dragging, arrow keys, arrow buttons and dots.
     --------------------------------------------------------- */
  const track = $('#quotes');
  const quotes = $$('.quote', track ?? document);
  const dotsWrap = $('#quoteDots');
  let qi = 0, qTimer;

  if (track && quotes.length && dotsWrap) {
    const band = track.closest('.band');

    const mark = (i) => {
      qi = Math.max(0, Math.min(i, quotes.length - 1));
      quotes.forEach((q, n) => q.classList.toggle('is-active', n === qi));
      $$('button', dotsWrap).forEach((d, n) =>
        d.setAttribute('aria-selected', String(n === qi)));
    };

    const goTo = (i, smooth = true) => {
      const n = (i + quotes.length) % quotes.length;
      track.scrollTo({
        left: quotes[n].offsetLeft - track.offsetLeft,
        behavior: smooth && !reduced ? 'smooth' : 'auto',
      });
      mark(n);
    };

    quotes.forEach((_, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('role', 'tab');
      b.setAttribute('aria-label', `Bericht ${i + 1}`);
      b.addEventListener('click', () => { goTo(i); pause(); });
      dotsWrap.append(b);
    });

    /* keep the active quote in sync while the user scrolls freely */
    let syncTimer;
    track.addEventListener('scroll', () => {
      clearTimeout(syncTimer);
      syncTimer = setTimeout(() => {
        const step = track.scrollWidth / quotes.length;
        mark(Math.round(track.scrollLeft / step));
      }, 90);
    }, { passive: true });

    /* click and drag with the mouse */
    let dragging = false, startX = 0, startLeft = 0, moved = 0;

    track.addEventListener('pointerdown', (e) => {
      if (e.pointerType === 'touch') return; // native touch scrolling is better
      dragging = true;
      moved = 0;
      startX = e.clientX;
      startLeft = track.scrollLeft;
      track.classList.add('is-dragging');
      try { track.setPointerCapture(e.pointerId); } catch { /* no active pointer */ }
      pause();
    });

    track.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      const dx = e.clientX - startX;
      moved = Math.abs(dx);
      track.scrollLeft = startLeft - dx;
    });

    const endDrag = () => {
      if (!dragging) return;
      dragging = false;
      track.classList.remove('is-dragging');
      const step = track.scrollWidth / quotes.length;
      goTo(Math.round(track.scrollLeft / step), true);
    };
    track.addEventListener('pointerup', endDrag);
    track.addEventListener('pointercancel', endDrag);

    /* vertical wheel over the carousel steps through the reviews,
       but only until the last one, so the page never feels stuck */
    let wheelLock = 0;
    track.addEventListener('wheel', (e) => {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return; // native horizontal scroll
      const next = qi + (e.deltaY > 0 ? 1 : -1);
      if (next < 0 || next > quotes.length - 1) return;    // let the page scroll on
      e.preventDefault();
      if (performance.now() < wheelLock) return;
      wheelLock = performance.now() + 420;
      goTo(next);
      pause();
    }, { passive: false });

    /* arrow buttons + keyboard */
    $('#quotePrev').addEventListener('click', () => { goTo(qi - 1); pause(); });
    $('#quoteNext').addEventListener('click', () => { goTo(qi + 1); pause(); });

    document.addEventListener('keydown', (e) => {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
      if (/^(INPUT|SELECT|TEXTAREA)$/.test(document.activeElement?.tagName)) return;
      const r = band.getBoundingClientRect();
      const inView = r.top < window.innerHeight * 0.7 && r.bottom > window.innerHeight * 0.3;
      if (!inView && document.activeElement !== track) return;
      e.preventDefault();
      goTo(qi + (e.key === 'ArrowRight' ? 1 : -1));
      pause();
    });

    /* auto-advance, but never while the visitor is busy with it */
    const play = () => {
      clearInterval(qTimer);
      if (reduced) return;
      qTimer = setInterval(() => goTo(qi + 1), 6000);
    };
    const pause = () => clearInterval(qTimer);

    mark(0);
    play();
    band.addEventListener('mouseenter', pause);
    band.addEventListener('mouseleave', play);
    track.addEventListener('focusin', pause);
    track.addEventListener('focusout', play);

    /* a resize changes the snap offsets, so re-align */
    window.addEventListener('resize', () => goTo(qi, false));

    /* swallow the click that ends a drag */
    track.addEventListener('click', (e) => { if (moved > 6) e.preventDefault(); });
  }

  /* ---------------------------------------------------------
     Lightbox
     --------------------------------------------------------- */
  const lb = $('#lightbox');
  const lbVideo = $('#lightboxVideo');
  let lastFocus = null;

  const openLb = (src) => {
    lastFocus = document.activeElement;
    lbVideo.src = src;
    lb.hidden = false;
    document.body.classList.add('is-locked');
    requestAnimationFrame(() => lb.classList.add('is-open'));
    lbVideo.play().catch(() => {});
    $('#lightboxClose').focus();
  };

  const closeLb = () => {
    lb.classList.remove('is-open');
    lbVideo.pause();
    setTimeout(() => {
      lb.hidden = true;
      lbVideo.removeAttribute('src');
      lbVideo.load();
      document.body.classList.remove('is-locked');
      lastFocus?.focus();
    }, 420);
  };

  $$('[data-lightbox]').forEach(btn =>
    btn.addEventListener('click', () => openLb(btn.dataset.lightbox)));

  $('#lightboxClose').addEventListener('click', closeLb);
  lb.addEventListener('click', (e) => { if (e.target === lb) closeLb(); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (!lb.hidden) closeLb();
      else if (nav.classList.contains('is-open')) closeMenu();
    }
  });

  /* ---------------------------------------------------------
     Instagram highlights are login-only, so the card links out.
     Drop an exported clip at assets/video/highlight-1.mp4 and the
     card upgrades itself into an autoplaying reel like the others.
     --------------------------------------------------------- */
  const HIGHLIGHT_SRC = 'assets/video/highlight-1.mp4';
  const highlightCard = $('.reel--link');

  if (highlightCard) {
    fetch(HIGHLIGHT_SRC, { method: 'HEAD' }).then(res => {
      if (!res.ok) return;

      const img = $('.reel__img', highlightCard);
      const video = document.createElement('video');
      video.className = 'reel__video';
      video.src = HIGHLIGHT_SRC;
      video.poster = img.getAttribute('src');
      video.muted = true;
      video.loop = true;
      video.preload = 'metadata';
      video.setAttribute('playsinline', '');
      video.dataset.lazyvideo = '';
      img.replaceWith(video);
      videoIO.observe(video);

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'reel__open';
      btn.setAttribute('aria-label', 'Open video: highlights');
      btn.innerHTML = '<span class="reel__play" aria-hidden="true"></span>';
      btn.addEventListener('click', () => openLb(HIGHLIGHT_SRC));
      $('.reel__open', highlightCard).replaceWith(btn);

      highlightCard.classList.remove('reel--link');
      const badge = $('.reel__badge', highlightCard);
      badge.textContent = 'Highlight';
      badge.classList.remove('reel__badge--ig');
      $('.reel__meta span', highlightCard).textContent = 'Uit onze Instagram highlights';
    }).catch(() => {});
  }

  /* ---------------------------------------------------------
     Magnetic cursor on media cards
     --------------------------------------------------------- */
  const cursor = $('#cursor');
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  if (fine && cursor) {
    let cx = 0, cy = 0, tx = 0, ty = 0, raf = null;

    const loop = () => {
      cx += (tx - cx) * 0.18;
      cy += (ty - cy) * 0.18;
      cursor.style.translate = `${cx}px ${cy}px`;
      raf = Math.abs(tx - cx) > 0.4 || Math.abs(ty - cy) > 0.4 ? requestAnimationFrame(loop) : null;
    };

    window.addEventListener('mousemove', (e) => {
      tx = e.clientX; ty = e.clientY;
      if (!raf) raf = requestAnimationFrame(loop);
    }, { passive: true });

    $$('[data-cursor]').forEach(el => {
      el.addEventListener('mouseenter', () => cursor.classList.add('is-on'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('is-on'));
    });
  }

  /* ---------------------------------------------------------
     Misc
     --------------------------------------------------------- */
  $('#year').textContent = new Date().getFullYear();
  toTop.addEventListener('click', () =>
    window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' }));
})();
