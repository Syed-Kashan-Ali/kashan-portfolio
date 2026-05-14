/* ==========================================================================
   script.js — Kashan Ali · Aurora Noir Portfolio
   Modules: Nav · Particles · Counters · Reveal · Filter · FAQ · Parallax
   ========================================================================== */
'use strict';

const $  = (s, r=document) => r.querySelector(s);
const $$ = (s, r=document) => [...r.querySelectorAll(s)];
const onReady = cb => document.readyState==='loading'
  ? document.addEventListener('DOMContentLoaded', cb) : cb();

/* ── §1 Scroll Progress Bar ─────────────────────────────────────────────── */
function initScrollProgress() {
  const bar = $('#scrollProgress');
  if (!bar) return;
  window.addEventListener('scroll', () => {
    const pct = window.scrollY / (document.body.scrollHeight - window.innerHeight) * 100;
    bar.style.width = Math.min(pct, 100) + '%';
  }, { passive: true });
}

/* ── §2 Navigation ──────────────────────────────────────────────────────── */
function initNav() {
  const nav     = $('#navbar');
  const burger  = $('#hamburger');
  const links   = $('#navLinks');
  const navLinks= $$('.nav__link');

  // Compact on scroll
  window.addEventListener('scroll', () => {
    nav.classList.toggle('is-scrolled', window.scrollY > 60);
  }, { passive: true });

  // Hamburger
  burger.addEventListener('click', () => {
    const open = burger.classList.toggle('is-open');
    burger.setAttribute('aria-expanded', String(open));
    links.classList.toggle('is-open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  });

  // Close on link click
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      burger.classList.remove('is-open');
      burger.setAttribute('aria-expanded','false');
      links.classList.remove('is-open');
      document.body.style.overflow = '';
    });
  });

  // Active link via IntersectionObserver
  const sections = $$('section[id], footer[id]');
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const hit = navLinks.find(l => l.getAttribute('href') === `#${e.target.id}`);
      navLinks.forEach(l => l.classList.remove('is-active'));
      if (hit) hit.classList.add('is-active');
    });
  }, { rootMargin: '-40% 0px -55% 0px' });
  sections.forEach(s => obs.observe(s));
}

/* ── §3 Smooth Scroll with nav offset ──────────────────────────────────── */
function initSmoothScroll() {
  $$('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id = a.getAttribute('href').slice(1);
      const el = document.getElementById(id);
      if (!el) return;
      e.preventDefault();
      window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 80, behavior: 'smooth' });
    });
  });
}

/* ── §4 Scroll Reveal ───────────────────────────────────────────────────── */
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

/* ── §5 Animated Counters ───────────────────────────────────────────────── */
function initCounters() {
  const els = $$('.counter');
  if (!els.length) return;

  const easeOut = p => 1 - Math.pow(2, -10 * p);

  const animate = (el, target, duration = 1800) => {
    const start = performance.now();
    const step  = now => {
      const p = Math.min((now - start) / duration, 1);
      el.textContent = p >= 1 ? target : Math.floor(easeOut(p) * target);
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  let fired = false;
  const obs = new IntersectionObserver(entries => {
    if (fired || !entries.some(e => e.isIntersecting)) return;
    fired = true;
    els.forEach((el, i) => {
      setTimeout(() => animate(el, parseInt(el.dataset.target, 10)), i * 120);
    });
    obs.disconnect();
  }, { threshold: 0.5 });

  const section = $('#stats');
  if (section) obs.observe(section);
}

/* ── §6 Particle Canvas (hero background) ───────────────────────────────── */
function initParticles() {
  const canvas = $('#particleCanvas');
  if (!canvas) return;
  if (window.matchMedia('(prefers-reduced-motion:reduce)').matches) { canvas.style.display='none'; return; }

  const ctx = canvas.getContext('2d');
  const COLORS = ['rgba(139,92,246,', 'rgba(236,72,153,', 'rgba(6,182,212,'];
  let W, H, particles=[], raf;

  const resize = () => {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  };

  const spawn = () => {
    particles = Array.from({ length: 50 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 1.6 + 0.4,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
    }));
  };

  const draw = () => {
    ctx.clearRect(0, 0, W, H);

    // Draw connections
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const d  = Math.hypot(dx, dy);
        if (d < 130) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(139,92,246,${(1 - d/130) * 0.15})`;
          ctx.lineWidth   = 0.8;
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }

    // Draw particles
    particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.color + '0.6)';
      ctx.fill();
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
    });

    raf = requestAnimationFrame(draw);
  };

  // Pause when hidden
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) cancelAnimationFrame(raf); else draw();
  });

  // Debounced resize
  let rt;
  window.addEventListener('resize', () => {
    clearTimeout(rt);
    rt = setTimeout(() => { resize(); spawn(); }, 200);
  }, { passive: true });

  resize(); spawn(); draw();
}

/* ── §7 Project Filter ──────────────────────────────────────────────────── */
function initFilter() {
  const btns  = $$('.fbtn');
  const cards = $$('.gcard');
  if (!btns.length) return;

  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      btns.forEach(b => { b.classList.remove('is-active'); b.setAttribute('aria-selected','false'); });
      btn.classList.add('is-active');
      btn.setAttribute('aria-selected','true');
      const filter = btn.dataset.filter;
      cards.forEach(card => {
        const cats = (card.dataset.category || '').split(' ');
        card.classList.toggle('is-hidden', !(filter === 'all' || cats.includes(filter)));
      });
    });
  });
}

/* ── §8 FAQ Accordion ───────────────────────────────────────────────────── */
function initFAQ() {
  const items = $$('.faq-item');
  if (!items.length) return;

  items.forEach(item => {
    const btn = $('.faq-q', item);
    const ans = $('.faq-a', item);
    if (!btn || !ans) return;

    btn.addEventListener('click', () => {
      const isOpen = item.classList.contains('is-open');

      // Close all
      items.forEach(i => {
        i.classList.remove('is-open');
        const a = $('.faq-a', i);
        const b = $('.faq-q', i);
        if (a) a.classList.remove('is-open');
        if (b) b.setAttribute('aria-expanded', 'false');
      });

      // Open clicked (if it was closed)
      if (!isOpen) {
        item.classList.add('is-open');
        ans.classList.add('is-open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });
}

/* ── §9 Hero Card Tilt ──────────────────────────────────────────────────── */
function initCardTilt() {
  if (window.matchMedia('(hover:none)').matches) return;
  if (window.matchMedia('(prefers-reduced-motion:reduce)').matches) return;

  $$('.hcard, .gcard, .acard, .stat-card, .proc-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r  = card.getBoundingClientRect();
      const dx = (e.clientX - r.left - r.width/2)  / (r.width/2);
      const dy = (e.clientY - r.top  - r.height/2) / (r.height/2);
      const MAX = card.classList.contains('hcard') ? 8 : 5;
      card.style.transform  = `perspective(900px) rotateX(${-dy*MAX}deg) rotateY(${dx*MAX}deg) translateY(-8px)`;
      card.style.transition = 'transform 0.08s linear';
    });
    card.addEventListener('mouseleave', () => {
      card.style.transition = 'transform 0.55s cubic-bezier(0.16,1,0.3,1)';
      card.style.transform  = '';
    });
  });
}

/* ── §10 Stagger Animations ─────────────────────────────────────────────── */
function initStagger() {
  // Timeline items
  $$('.tl-item').forEach((el, i) => { el.style.transitionDelay = `${i * 80}ms`; });

  // Stat cards
  $$('.stat-card').forEach((el, i) => { el.style.transitionDelay = `${i * 80}ms`; });

  // Process cards
  $$('.proc-card').forEach((el, i) => { el.style.transitionDelay = `${i * 90}ms`; });

  // About cards
  $$('.acard').forEach((el, i) => { el.style.transitionDelay = `${i * 70}ms`; });

  // Skill groups
  $$('.skill-group').forEach((el, i) => { el.style.transitionDelay = `${i * 100}ms`; });

  // FAQ items
  $$('.faq-item').forEach((el, i) => { el.style.transitionDelay = `${i * 60}ms`; });
}

/* ── §11 Aurora Orbs Mouse Parallax ────────────────────────────────────── */
function initAuroraParallax() {
  if (window.matchMedia('(prefers-reduced-motion:reduce)').matches) return;

  const orbs = $$('.aurora__orb');
  let mx = 0, my = 0, cx = 0, cy = 0;

  document.addEventListener('mousemove', e => {
    mx = (e.clientX / window.innerWidth  - 0.5) * 30;
    my = (e.clientY / window.innerHeight - 0.5) * 30;
  });

  const lerp = (a, b, t) => a + (b - a) * t;

  const tick = () => {
    cx = lerp(cx, mx, 0.04);
    cy = lerp(cy, my, 0.04);
    orbs.forEach((orb, i) => {
      const factor = (i + 1) * 0.4;
      orb.style.transform = `translate(${cx * factor}px, ${cy * factor}px)`;
    });
    requestAnimationFrame(tick);
  };
  tick();
}

/* ── §12 Hero badge typewriter ─────────────────────────────────────────── */
function initTypewriter() {
  // The hero title "Building Games Players Love" stays static
  // The hero sub already has full text
  // Add a subtle shimmer on the grad-text words
  const gradTexts = $$('.grad-text');
  gradTexts.forEach(el => {
    el.style.backgroundSize = '200%';
    el.style.backgroundPosition = '0%';
    let pos = 0;
    setInterval(() => {
      pos = (pos + 0.5) % 200;
      el.style.backgroundPosition = pos + '%';
    }, 30);
  });
}

/* ── §13 Currently section live indicator ──────────────────────────────── */
function initCurrently() {
  // Pulse dot already animates via CSS
  // Add subtle text shimmer to the "currently" label
  const label = $('.curr-label');
  if (!label) return;
}

/* ── §14 Boot — wire everything ─────────────────────────────────────────── */
onReady(() => {
  initScrollProgress();  // §1
  initNav();             // §2
  initSmoothScroll();    // §3
  initReveal();          // §4
  initCounters();        // §5
  initParticles();       // §6
  initFilter();          // §7
  initFAQ();             // §8
  initCardTilt();        // §9
  initStagger();         // §10
  initAuroraParallax();  // §11
  initTypewriter();      // §12
  initCurrently();       // §13
});
