/* ==========================================================================
   script.js — KASHAN.ALI · GAME DEV PORTFOLIO
   Warfare HUD Theme · Vanilla JS · Zero Dependencies
   ========================================================================== */

'use strict';

/* --------------------------------------------------------------------------
   §1 · Utilities
   -------------------------------------------------------------------------- */
const $  = (sel, scope = document) => scope.querySelector(sel);
const $$ = (sel, scope = document) => [...scope.querySelectorAll(sel)];
const onReady = cb =>
  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', cb)
    : cb();

/* --------------------------------------------------------------------------
   §2 · Boot Sequence — fake terminal loading screen
   -------------------------------------------------------------------------- */
function initBoot() {
  const boot     = $('#boot');
  const linesEl  = $('#bootLines');
  const barEl    = $('#bootBar');
  if (!boot) return;

  const lines = [
    'LOADING PORTFOLIO SYSTEM...',
    'CHECKING UNITY SDK............OK',
    'VERIFYING GAME ASSETS.........OK',
    'MOUNTING ANDROID MODULES......OK',
    'INITIALIZING HUD COMPONENTS...OK',
    'ESTABLISHING CONNECTION........OK',
    'DEPLOYING INTERFACE...........DONE',
  ];

  let lineIdx = 0;
  let progress = 0;

  /* Type each boot line one by one */
  const typeLine = () => {
    if (lineIdx >= lines.length) {
      // All lines done — expand bar to 100% then dismiss
      barEl.style.width = '100%';
      setTimeout(() => boot.classList.add('done'), 700);
      return;
    }

    const p   = document.createElement('p');
    p.textContent = '> ';
    linesEl.appendChild(p);

    const text    = lines[lineIdx];
    let   charIdx = 0;

    const typeChar = () => {
      if (charIdx < text.length) {
        p.textContent = '> ' + text.slice(0, ++charIdx);
        setTimeout(typeChar, 22);
      } else {
        // Colour the trailing status
        if (text.includes('DONE')) p.style.color = '#a8ff00';
        else if (text.includes('OK')) p.style.color = '#ff4800';

        // Advance progress bar
        progress = Math.min(100, progress + 100 / lines.length);
        barEl.style.width = progress + '%';

        lineIdx++;
        setTimeout(typeLine, 80);
      }
    };

    typeChar();
  };

  // Brief pause before starting
  setTimeout(typeLine, 300);
}

/* --------------------------------------------------------------------------
   §3 · Custom Cursor — tracks mouse, scales on hover
   -------------------------------------------------------------------------- */
function initCursor() {
  const cursor = $('#cursor');
  if (!cursor || window.matchMedia('(hover:none)').matches) {
    if (cursor) cursor.style.display = 'none';
    return;
  }

  let mx = 0, my = 0;   // Target position
  let cx = 0, cy = 0;   // Current (lerped) position

  /* Snap on mousemove, lerp in rAF */
  document.addEventListener('mousemove', e => {
    mx = e.clientX;
    my = e.clientY;
  });

  const lerp = (a, b, t) => a + (b - a) * t;

  const loop = () => {
    cx = lerp(cx, mx, 0.14);
    cy = lerp(cy, my, 0.14);
    cursor.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, -50%)`;
    requestAnimationFrame(loop);
  };
  loop();

  /* Grow ring on interactive elements */
  const ring = $('.cursor__ring', cursor);
  const dot  = $('.cursor__dot',  cursor);

  $$('a, button, .fbtn, .badge, .gcard, .xp-card').forEach(el => {
    el.addEventListener('mouseenter', () => {
      ring.style.transform = 'translate(-50%,-50%) scale(1.8)';
      ring.style.borderColor = '#a8ff00';
      dot.style.background   = '#a8ff00';
      dot.style.boxShadow    = '0 0 10px rgba(168,255,0,0.5)';
    });
    el.addEventListener('mouseleave', () => {
      ring.style.transform = '';
      ring.style.borderColor = '';
      dot.style.background   = '';
      dot.style.boxShadow    = '';
    });
  });
}

/* --------------------------------------------------------------------------
   §4 · Navigation — scroll-compact + hamburger + active-link tracker
   -------------------------------------------------------------------------- */
function initNav() {
  const nav       = $('#navbar');
  const burger    = $('#hamburger');
  const navLinks  = $('#navLinks');
  const links     = $$('.nav__link');

  /* Compact on scroll */
  const onScroll = () => nav.classList.toggle('is-scrolled', window.scrollY > 60);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* Hamburger open/close */
  burger.addEventListener('click', () => {
    const open = burger.classList.toggle('is-open');
    burger.setAttribute('aria-expanded', String(open));
    navLinks.classList.toggle('is-open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  });

  /* Close on link click (mobile) */
  links.forEach(link => {
    link.addEventListener('click', () => {
      burger.classList.remove('is-open');
      burger.setAttribute('aria-expanded', 'false');
      navLinks.classList.remove('is-open');
      document.body.style.overflow = '';
    });
  });

  /* Active link via IntersectionObserver */
  const sections = $$('section[id], footer[id]');
  const sectionObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const id   = e.target.id;
      const hit  = links.find(l => l.getAttribute('href') === `#${id}`);
      links.forEach(l => l.classList.remove('is-active'));
      if (hit) hit.classList.add('is-active');
    });
  }, { rootMargin: '-40% 0px -55% 0px' });

  sections.forEach(s => sectionObs.observe(s));
}

/* --------------------------------------------------------------------------
   §5 · Scroll Reveal — IntersectionObserver, fires once per element
   -------------------------------------------------------------------------- */
function initReveal() {
  const items = $$('.reveal-up');
  if (!items.length) return;

  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('in-view');
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  items.forEach(el => obs.observe(el));
}

/* --------------------------------------------------------------------------
   §6 · Live Clock — shown in the hero HUD top-bar
   -------------------------------------------------------------------------- */
function initClock() {
  const el = $('#liveClock');
  if (!el) return;

  const tick = () => {
    const now = new Date();
    const hh  = String(now.getHours()).padStart(2, '0');
    const mm  = String(now.getMinutes()).padStart(2, '0');
    const ss  = String(now.getSeconds()).padStart(2, '0');
    el.textContent = `${hh}:${mm}:${ss}`;
  };

  tick();
  setInterval(tick, 1000);
}

/* --------------------------------------------------------------------------
   §7 · Hex Grid Canvas — animated honeycomb background in hero
   -------------------------------------------------------------------------- */
function initHexCanvas() {
  const canvas = $('#hexCanvas');
  if (!canvas) return;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    canvas.style.display = 'none';
    return;
  }

  const ctx = canvas.getContext('2d');

  /* Config */
  const HEX_SIZE    = 28;     // Radius of each hexagon
  const GAP         = 3;      // Gap between hexagons
  const FIRE_CLR    = 'rgba(255,72,0,';
  const LIME_CLR    = 'rgba(168,255,0,';
  const PULSE_SPEED = 0.008;  // How fast hexes breathe

  let cols, rows, hexes = [];
  let raf;
  let time = 0;

  /* Flat-top hex geometry helper */
  const hexPoints = (cx, cy, r) => {
    const pts = [];
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i;        // 0°, 60°, 120° … flat-top
      pts.push([cx + r * Math.cos(angle), cy + r * Math.sin(angle)]);
    }
    return pts;
  };

  const resize = () => {
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    buildGrid();
  };

  const buildGrid = () => {
    hexes = [];
    const effectiveR  = HEX_SIZE + GAP;
    const hexW        = Math.sqrt(3) * effectiveR;
    const hexH        = 2 * effectiveR;
    cols = Math.ceil(canvas.width  / hexW) + 2;
    rows = Math.ceil(canvas.height / (hexH * 0.75)) + 2;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = col * hexW + (row % 2) * (hexW / 2) - hexW;
        const y = row * (hexH * 0.75) - hexH;

        /* Random phase so each hex breathes at different timing */
        hexes.push({
          x, y,
          phase:  Math.random() * Math.PI * 2,
          speed:  0.3 + Math.random() * 0.7,
          /* Occasional accent hexes that pulse lime */
          accent: Math.random() < 0.04,
        });
      }
    }
  };

  const drawHex = (pts, alpha, accent) => {
    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
    ctx.closePath();

    const clr = accent ? LIME_CLR : FIRE_CLR;
    ctx.strokeStyle = `${clr}${(alpha * 0.7).toFixed(3)})`;
    ctx.lineWidth   = 0.8;
    ctx.stroke();

    if (alpha > 0.4) {
      ctx.fillStyle = `${clr}${(alpha * 0.05).toFixed(3)})`;
      ctx.fill();
    }
  };

  const draw = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    time += PULSE_SPEED;

    hexes.forEach(h => {
      /* Sine wave pulse — each hex has a unique phase offset */
      const pulse = (Math.sin(time * h.speed + h.phase) + 1) / 2; // 0 → 1
      const alpha = 0.04 + pulse * 0.22;

      const pts = hexPoints(h.x, h.y, HEX_SIZE);
      drawHex(pts, alpha, h.accent);
    });

    raf = requestAnimationFrame(draw);
  };

  /* Pause when tab hidden */
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) cancelAnimationFrame(raf);
    else draw();
  });

  /* Debounced resize */
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => { resize(); }, 200);
  }, { passive: true });

  resize();
  draw();
}

/* --------------------------------------------------------------------------
   §8 · Typewriter — cycles role strings with typing & deleting animation
   -------------------------------------------------------------------------- */
function initTypewriter() {
  const el = $('#typewriter');
  if (!el) return;

  const roles = [
    'GAMEPLAY PROGRAMMER',
    'UNITY SPECIALIST',
    'MOBILE OPTIMIZER',
    'GAME SYSTEMS DESIGNER',
    'ANDROID DEVELOPER',
    'LEVEL ARCHITECT',
  ];

  let ri = 0, ci = 0, deleting = false;

  const SPEED_TYPE   = 70;
  const SPEED_DELETE = 38;
  const PAUSE_FULL   = 2000;
  const PAUSE_NEXT   = 350;

  const tick = () => {
    const cur = roles[ri];

    if (!deleting) {
      el.textContent = cur.slice(0, ++ci);
      if (ci === cur.length) { deleting = true; return setTimeout(tick, PAUSE_FULL); }
    } else {
      el.textContent = cur.slice(0, --ci);
      if (ci === 0) {
        deleting = false;
        ri = (ri + 1) % roles.length;
        return setTimeout(tick, PAUSE_NEXT);
      }
    }

    setTimeout(tick, deleting ? SPEED_DELETE : SPEED_TYPE);
  };

  setTimeout(tick, 1400);   // Start after boot sequence clears
}

/* --------------------------------------------------------------------------
   §9 · Hero Stat Bar + Counter — animates width & counts up simultaneously
   -------------------------------------------------------------------------- */
function initHeroStats() {
  const fills    = $$('.hstat__fill');
  const counters = $$('.count');
  if (!fills.length) return;

  /* easeOutExpo — snappy acceleration then smooth deceleration */
  const easeOutExpo = p => p === 1 ? 1 : 1 - Math.pow(2, -10 * p);

  const animateCount = (el, target, duration = 1600) => {
    const start = performance.now();
    const step  = now => {
      const progress = Math.min((now - start) / duration, 1);
      el.textContent = Math.floor(easeOutExpo(progress) * target);
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  let fired = false;

  const obs = new IntersectionObserver(entries => {
    if (fired || !entries.some(e => e.isIntersecting)) return;
    fired = true;

    /* Animate bars */
    fills.forEach(fill => {
      const targetW = fill.dataset.w || '0';
      requestAnimationFrame(() => { fill.style.width = targetW + '%'; });
    });

    /* Animate counters with slight stagger */
    counters.forEach((el, i) => {
      const target = parseInt(el.dataset.target, 10);
      setTimeout(() => animateCount(el, target), i * 150);
    });

    obs.disconnect();
  }, { threshold: 0.5 });

  const statsEl = $('.hero__stats');
  if (statsEl) obs.observe(statsEl);
}

/* --------------------------------------------------------------------------
   §10 · XP Skill Bars — same mechanic, triggered on skills section entry
   -------------------------------------------------------------------------- */
function initXPBars() {
  const fills = $$('.xpb-fill');
  if (!fills.length) return;

  let fired = false;

  const obs = new IntersectionObserver(entries => {
    if (fired || !entries.some(e => e.isIntersecting)) return;
    fired = true;

    fills.forEach((fill, i) => {
      const xp = fill.dataset.xp || '0';
      /* Stagger each bar by 80ms */
      setTimeout(() => {
        fill.style.width = xp + '%';
      }, i * 80);
    });

    obs.disconnect();
  }, { threshold: 0.3 });

  const section = $('#skills');
  if (section) obs.observe(section);
}

/* --------------------------------------------------------------------------
   §11 · Project Filter — instant show/hide with ARIA
   -------------------------------------------------------------------------- */
function initFilter() {
  const btns  = $$('.fbtn');
  const cards = $$('.gcard');
  if (!btns.length || !cards.length) return;

  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      btns.forEach(b => { b.classList.remove('is-active'); b.setAttribute('aria-selected','false'); });
      btn.classList.add('is-active');
      btn.setAttribute('aria-selected', 'true');

      const filter = btn.dataset.filter;

      cards.forEach(card => {
        const cats = (card.dataset.category || '').split(' ');
        const show = filter === 'all' || cats.includes(filter);
        card.classList.toggle('is-hidden', !show);
      });
    });
  });
}

/* --------------------------------------------------------------------------
   §12 · Smooth Scroll — offset for fixed nav height
   -------------------------------------------------------------------------- */
function initSmoothScroll() {
  const NAV_H = 80;
  $$('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id     = a.getAttribute('href').slice(1);
      const target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      window.scrollTo({
        top: target.getBoundingClientRect().top + window.scrollY - NAV_H,
        behavior: 'smooth',
      });
    });
  });
}

/* --------------------------------------------------------------------------
   §13 · Card Hover Tilt — subtle 3-D perspective on game cards
   -------------------------------------------------------------------------- */
function initCardTilt() {
  if (window.matchMedia('(hover:none)').matches) return;
  if (window.matchMedia('(prefers-reduced-motion:reduce)').matches) return;

  const MAX = 6; // Max tilt degrees

  $$('.gcard').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r  = card.getBoundingClientRect();
      const dx = (e.clientX - r.left - r.width  / 2) / (r.width  / 2);
      const dy = (e.clientY - r.top  - r.height / 2) / (r.height / 2);

      card.style.transform  = `perspective(800px) rotateX(${-dy*MAX}deg) rotateY(${dx*MAX}deg) translateY(-8px)`;
      card.style.transition = 'transform 0.08s linear';
    });

    card.addEventListener('mouseleave', () => {
      card.style.transition = 'transform 0.55s cubic-bezier(0.16,1,0.3,1)';
      card.style.transform  = '';
    });
  });
}

/* --------------------------------------------------------------------------
   §14 · Badge Stagger — skill badges pop in one by one on section entry
   -------------------------------------------------------------------------- */
function initBadgeStagger() {
  const badges = $$('.badge');
  if (!badges.length) return;

  /* Start invisible */
  badges.forEach(b => {
    b.style.opacity   = '0';
    b.style.transform = 'translateY(16px) scale(0.9)';
  });

  let fired = false;
  const obs = new IntersectionObserver(entries => {
    if (fired || !entries.some(e => e.isIntersecting)) return;
    fired = true;

    badges.forEach((b, i) => {
      setTimeout(() => {
        b.style.transition = 'opacity 0.4s ease, transform 0.4s cubic-bezier(0.16,1,0.3,1)';
        b.style.opacity    = '1';
        b.style.transform  = 'none';
      }, i * 55);
    });

    obs.disconnect();
  }, { threshold: 0.2 });

  const grid = $('.badges-grid');
  if (grid) obs.observe(grid);
}

/* --------------------------------------------------------------------------
   §15 · Timeline Stagger — XP items slide in with cascade delay
   -------------------------------------------------------------------------- */
function initTimelineStagger() {
  $$('.xp-item').forEach((el, i) => {
    el.style.transitionDelay = `${i * 90}ms`;
  });
}

/* --------------------------------------------------------------------------
   §16 · Achievement Stagger — about section cards slide in
   -------------------------------------------------------------------------- */
function initAchievementStagger() {
  const items = $$('.ach-item');
  if (!items.length) return;

  items.forEach(el => {
    el.style.opacity   = '0';
    el.style.transform = 'translateX(-20px)';
  });

  let fired = false;
  const obs = new IntersectionObserver(entries => {
    if (fired || !entries.some(e => e.isIntersecting)) return;
    fired = true;

    items.forEach((el, i) => {
      setTimeout(() => {
        el.style.transition = 'opacity 0.5s ease, transform 0.5s cubic-bezier(0.16,1,0.3,1)';
        el.style.opacity    = '1';
        el.style.transform  = 'none';
      }, i * 100);
    });

    obs.disconnect();
  }, { threshold: 0.2 });

  const wrap = $('.achievements');
  if (wrap) obs.observe(wrap);
}

/* --------------------------------------------------------------------------
   §17 · Glitch on demand — fires on logo hover
   -------------------------------------------------------------------------- */
function initLogoGlitch() {
  const logo = $('.nav__logo');
  if (!logo) return;

  logo.addEventListener('mouseenter', () => {
    logo.style.animation = 'none';
    logo.offsetHeight; // force reflow
    logo.style.color = '#a8ff00';
    setTimeout(() => { logo.style.color = ''; }, 200);
  });
}

/* --------------------------------------------------------------------------
   §18 · Parallax — hero name shifts slightly on scroll (subtle depth)
   -------------------------------------------------------------------------- */
function initParallax() {
  if (window.matchMedia('(prefers-reduced-motion:reduce)').matches) return;

  const name    = $('.hero__name');
  const content = $('.hero__content');

  const onScroll = () => {
    const scrollY = window.scrollY;
    if (name)    name.style.transform    = `translateY(${scrollY * 0.12}px)`;
    if (content) content.style.transform = `translateY(${scrollY * 0.06}px)`;
  };

  window.addEventListener('scroll', onScroll, { passive: true });
}

/* --------------------------------------------------------------------------
   §19 · Contact Box hover glow — fires border glow on cbox hover
   -------------------------------------------------------------------------- */
function initContactGlow() {
  $$('.cbox').forEach(box => {
    box.addEventListener('mouseenter', () => {
      const icon = box.querySelector('.cbox__icon');
      if (icon) icon.style.boxShadow = '0 0 18px rgba(255,72,0,0.5)';
    });
    box.addEventListener('mouseleave', () => {
      const icon = box.querySelector('.cbox__icon');
      if (icon) icon.style.boxShadow = '';
    });
  });
}

/* --------------------------------------------------------------------------
   §20 · Boot → then unlock page; Wire everything on DOMContentLoaded
   -------------------------------------------------------------------------- */
onReady(() => {
  /* Boot sequence plays first — rest of init happens immediately in parallel
     because the boot overlay sits on top and covers everything anyway.       */
  initBoot();

  initCursor();          // §3  — Custom crosshair cursor
  initNav();             // §4  — Navbar behaviour
  initReveal();          // §5  — Scroll-reveal
  initClock();           // §6  — Live clock in HUD bar
  initHexCanvas();       // §7  — Animated hex grid background
  initTypewriter();      // §8  — Typewriter role cycler
  initHeroStats();       // §9  — Hero HUD bars + counters
  initXPBars();          // §10 — Skill XP bar animation
  initFilter();          // §11 — Genre filter tabs
  initSmoothScroll();    // §12 — Smooth anchor scroll with nav offset
  initCardTilt();        // §13 — 3-D tilt on game cards
  initBadgeStagger();    // §14 — Badge pop-in stagger
  initTimelineStagger(); // §15 — Timeline cascade delay
  initAchievementStagger(); // §16 — Achievement slide-in
  initLogoGlitch();      // §17 — Logo glitch on hover
  initParallax();        // §18 — Hero parallax depth
  initContactGlow();     // §19 — Contact box icon glow
});
