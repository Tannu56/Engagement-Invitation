/* =========================================================================
   LUXURY DOUBLE ENGAGEMENT INVITATION — SCRIPT
   Vanilla JS only. Organized into small independent modules.
   ========================================================================= */
(() => {
  'use strict';

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* =====================================================================
     1. LOADER
     ===================================================================== */
  const loader = $('#loader');
  window.addEventListener('load', () => {
    setTimeout(() => loader.classList.add('hide'), 1400);
  });
  // fallback in case load event is slow/blocked
  setTimeout(() => loader.classList.add('hide'), 3200);

  /* =====================================================================
     2. ENVELOPE PARTICLE FIELD
     ===================================================================== */
  const envParticles = $('#envParticles');
  const NUM_ENV_PARTICLES = prefersReducedMotion ? 0 : 45;
  for (let i = 0; i < NUM_ENV_PARTICLES; i++) {
    const s = document.createElement('span');
    const left = Math.random() * 100;
    const dur = 6 + Math.random() * 10;
    const delay = Math.random() * 8;
    const size = 1 + Math.random() * 2;
    s.style.left = left + 'vw';
    s.style.bottom = '-10px';
    s.style.width = s.style.height = size + 'px';
    s.style.animationDuration = dur + 's';
    s.style.animationDelay = delay + 's';
    envParticles.appendChild(s);
  }

  /* =====================================================================
     3. ENVELOPE OPEN SEQUENCE
     ===================================================================== */
  const envelopeStage = $('#envelopeStage');
  const envelopeWrap = $('#envelopeWrap');
  const envelope = $('#envelope');
  const envelopeSeal = $('#envelopeSeal');
  const envelopeHint = $('#envelopeHint');
  const site = $('#site');
  const bgMusic = $('#bgMusic');
  const musicBtn = $('#musicBtn');

  let opened = false;
  function openInvitation() {
    if (opened) return;
    opened = true;
    envelopeHint.style.opacity = '0';
    envelope.classList.add('cracked');

    setTimeout(() => {
      envelope.classList.add('opened');
      envelopeWrap.classList.add('glow');
      tryPlayMusic();
    }, 550);

    setTimeout(() => {
      envelopeStage.classList.add('zoom');
    }, 1900);

    setTimeout(() => {
      envelopeStage.classList.add('hide');
      site.classList.add('visible');
      site.removeAttribute('aria-hidden');
      document.body.style.overflow = 'auto';
      initSiteAnimations();
    }, 3000);
  }

  envelopeSeal.addEventListener('click', openInvitation);
  envelopeSeal.addEventListener('touchend', (e) => { e.preventDefault(); openInvitation(); }, { passive: false });
  document.body.style.overflow = 'hidden';

  function tryPlayMusic() {
    bgMusic.volume = 0;
    const p = bgMusic.play();
    if (p && p.catch) p.catch(() => {/* autoplay might be blocked; user can tap music button */});
    let v = 0;
    const fade = setInterval(() => {
      v += 0.05;
      bgMusic.volume = Math.min(v, 0.5);
      if (v >= 0.5) clearInterval(fade);
    }, 120);
    musicBtn.classList.add('playing');
  }

  musicBtn.addEventListener('click', () => {
    if (bgMusic.paused) {
      bgMusic.play().catch(() => {});
      musicBtn.classList.add('playing');
    } else {
      bgMusic.pause();
      musicBtn.classList.remove('playing');
    }
  });

  /* =====================================================================
     4. AMBIENT CANVAS — sparkle / bokeh particle engine (runs always, subtle)
     ===================================================================== */
  const canvas = $('#ambient-canvas');
  const ctx = canvas.getContext('2d');
  let W, H, DPR;
  function resizeCanvas() {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = canvas.width = innerWidth * DPR;
    H = canvas.height = innerHeight * DPR;
    canvas.style.width = innerWidth + 'px';
    canvas.style.height = innerHeight + 'px';
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  const sparkles = [];
  const SPARKLE_COUNT = prefersReducedMotion ? 0 : 60;
  for (let i = 0; i < SPARKLE_COUNT; i++) {
    sparkles.push({
      x: Math.random() * innerWidth,
      y: Math.random() * innerHeight,
      r: Math.random() * 1.4 + 0.3,
      vy: (Math.random() * 0.15 + 0.03),
      vx: (Math.random() - 0.5) * 0.08,
      tw: Math.random() * Math.PI * 2,
      twSpeed: Math.random() * 0.02 + 0.008,
      hue: Math.random() > 0.5 ? '212,175,122' : '245,239,230'
    });
  }

  function drawAmbient() {
    ctx.clearRect(0, 0, W, H);
    sparkles.forEach(p => {
      p.tw += p.twSpeed;
      p.y -= p.vy * DPR;
      p.x += p.vx * DPR;
      if (p.y < -10) { p.y = innerHeight + 10; p.x = Math.random() * innerWidth; }
      const alpha = (Math.sin(p.tw) + 1) / 2 * 0.6 + 0.15;
      ctx.beginPath();
      ctx.fillStyle = `rgba(${p.hue},${alpha})`;
      ctx.arc(p.x * DPR, p.y * DPR, p.r * DPR, 0, Math.PI * 2);
      ctx.fill();
    });
    requestAnimationFrame(drawAmbient);
  }
  if (!prefersReducedMotion) requestAnimationFrame(drawAmbient);

  /* =====================================================================
     5. CURSOR GLOW + MAGNETIC BUTTONS + RIPPLE
     ===================================================================== */
  const cursorGlow = $('#cursorGlow');
  window.addEventListener('pointermove', (e) => {
    cursorGlow.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%,-50%)`;
  });
  $$('button, a, .flip-card__glass, .schedule__card, .gallery__item').forEach(el => {
    el.addEventListener('mouseenter', () => cursorGlow.classList.add('glow--big'));
    el.addEventListener('mouseleave', () => cursorGlow.classList.remove('glow--big'));
  });

  $$('.btn, .music-btn, .envelope__seal').forEach(btn => {
    btn.classList.add('magnetic');
    btn.addEventListener('mousemove', (e) => {
      const r = btn.getBoundingClientRect();
      const mx = e.clientX - r.left - r.width / 2;
      const my = e.clientY - r.top - r.height / 2;
      btn.style.transform = `translate(${mx * 0.12}px, ${my * 0.25}px)`;
    });
    btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
  });

  $$('.btn--gold').forEach(btn => {
    btn.addEventListener('click', function (e) {
      const ripple = this.querySelector('.btn__ripple');
      if (!ripple) return;
      const r = this.getBoundingClientRect();
      ripple.style.left = (e.clientX - r.left) + 'px';
      ripple.style.top = (e.clientY - r.top) + 'px';
      ripple.style.width = ripple.style.height = '10px';
      ripple.classList.remove('animate');
      void ripple.offsetWidth;
      ripple.classList.add('animate');
    });
  });

  /* =====================================================================
     6. SCROLL PROGRESS + NAV DOTS
     ===================================================================== */
  const scrollFill = $('#scrollFill');
  const navLinks = $$('#navDots a');
  const sections = navLinks.map(a => document.querySelector(a.getAttribute('href')));

  function onScroll() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - innerHeight;
    scrollFill.style.width = (docHeight > 0 ? (scrollTop / docHeight) * 100 : 0) + '%';

    let activeIdx = 0;
    sections.forEach((sec, i) => {
      if (sec && sec.getBoundingClientRect().top < innerHeight * 0.5) activeIdx = i;
    });
    navLinks.forEach((a, i) => a.classList.toggle('active', i === activeIdx));
  }
  window.addEventListener('scroll', onScroll, { passive: true });

  /* =====================================================================
     7. TEXT LETTER-REVEAL PREP (split data-text into spans)
     ===================================================================== */
  $$('.reveal-letters').forEach(el => {
    const text = el.getAttribute('data-text') || el.textContent;
    el.innerHTML = '';
    let i = 0;
    text.split('').forEach(ch => {
      const span = document.createElement('span');
      span.className = 'ch';
      span.textContent = ch === ' ' ? '\u00A0' : ch;
      span.style.animationDelay = (i * 0.035) + 's';
      el.appendChild(span);
      i++;
    });
  });

  /* =====================================================================
     8. SCROLL REVEAL OBSERVER (sections, cards, letters)
     ===================================================================== */
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
      }
    });
  }, { threshold: 0.2 });

  function initSiteAnimations() {
    $$('.reveal, .reveal-letters, .gallery__item').forEach(el => revealObserver.observe(el));
    // hero content is already visible immediately
    $$('.hero .reveal-letters').forEach(el => el.classList.add('in'));
    onScroll();
  }

  /* =====================================================================
     9. FLOATING DECORATIONS (petals, dust, fireflies)
     ===================================================================== */
  const decoLayer = $('#decoLayer');
  if (!prefersReducedMotion) {
    for (let i = 0; i < 16; i++) {
      const petal = document.createElement('span');
      petal.className = 'petal';
      petal.style.left = Math.random() * 100 + 'vw';
      petal.style.animationDuration = (10 + Math.random() * 14) + 's';
      petal.style.animationDelay = (Math.random() * 14) + 's';
      decoLayer.appendChild(petal);
    }
    for (let i = 0; i < 24; i++) {
      const dust = document.createElement('span');
      dust.className = 'dust';
      dust.style.left = Math.random() * 100 + 'vw';
      dust.style.top = Math.random() * 100 + 'vh';
      dust.style.animationDuration = (4 + Math.random() * 6) + 's';
      dust.style.animationDelay = (Math.random() * 6) + 's';
      decoLayer.appendChild(dust);
    }
    for (let i = 0; i < 10; i++) {
      const fly = document.createElement('span');
      fly.className = 'firefly';
      fly.style.left = Math.random() * 100 + 'vw';
      fly.style.top = (20 + Math.random() * 70) + 'vh';
      fly.style.animationDuration = (5 + Math.random() * 6) + 's';
      fly.style.animationDelay = (Math.random() * 6) + 's';
      decoLayer.appendChild(fly);
    }
  }

  /* =====================================================================
     10. COUNTDOWN — with flip/pulse digit change
     ===================================================================== */
  const EVENT_DATE = new Date('2026-08-14T17:00:00+05:30').getTime();
  const cards = $$('.flip-card');
  const prevValues = { days: null, hours: null, minutes: null, seconds: null };

  function pad(n) { return String(n).padStart(2, '0'); }

  function updateCountdown() {
    const now = Date.now();
    const diff = Math.max(0, EVENT_DATE - now);

    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    const values = { days, hours, minutes, seconds };

    cards.forEach(card => {
      const unit = card.getAttribute('data-unit');
      const digitsEl = card.querySelector('[data-digits]');
      const val = pad(values[unit]);
      if (prevValues[unit] !== val) {
        digitsEl.textContent = val;
        digitsEl.classList.remove('pulse');
        void digitsEl.offsetWidth;
        digitsEl.classList.add('pulse');
        prevValues[unit] = val;
      }
    });
  }
  updateCountdown();
  setInterval(updateCountdown, 1000);

  /* =====================================================================
     11. SCRATCH CARD
     ===================================================================== */
  const scratchCanvas = $('#scratchCanvas');
  const scratchCtx = scratchCanvas.getContext('2d');
  const scratchCardEl = $('.scratch__card');
  const scratchConfetti = $('#scratchConfetti');
  const bellSound = $('#bellSound');
  let scratchRevealed = false;

  function initScratch() {
    const rect = scratchCardEl.getBoundingClientRect();
    scratchCanvas.width = rect.width;
    scratchCanvas.height = rect.height;

    const grad = scratchCtx.createLinearGradient(0, 0, rect.width, rect.height);
    grad.addColorStop(0, '#d9c39a');
    grad.addColorStop(0.5, '#c9a668');
    grad.addColorStop(1, '#d9c39a');
    scratchCtx.fillStyle = grad;
    scratchCtx.fillRect(0, 0, rect.width, rect.height);

    scratchCtx.font = `600 ${Math.max(16, rect.width * 0.06)}px Poppins, sans-serif`;
    scratchCtx.fillStyle = 'rgba(58,47,34,0.55)';
    scratchCtx.textAlign = 'center';
    scratchCtx.fillText('✨ Special Date ✨', rect.width / 2, rect.height / 2);
    scratchCtx.font = `italic 300 ${Math.max(12, rect.width * 0.032)}px 'Cormorant Garamond', serif`;
    scratchCtx.fillText('scratch here', rect.width / 2, rect.height / 2 + Math.max(20, rect.width * 0.05));
  }
  initScratch();
  window.addEventListener('resize', () => { if (!scratchRevealed) initScratch(); });

  function scratchAt(x, y) {
    scratchCtx.globalCompositeOperation = 'destination-out';
    scratchCtx.beginPath();
    scratchCtx.arc(x, y, 26, 0, Math.PI * 2);
    scratchCtx.fill();
  }

  function getScratchPercent() {
    const data = scratchCtx.getImageData(0, 0, scratchCanvas.width, scratchCanvas.height).data;
    let transparent = 0;
    const total = data.length / 4;
    for (let i = 3; i < data.length; i += 4 * 20) { // sample every 20th pixel for perf
      if (data[i] === 0) transparent++;
    }
    return transparent / (total / 20);
  }

  function revealScratch() {
    if (scratchRevealed) return;
    scratchRevealed = true;
    scratchCanvas.style.transition = 'opacity .6s ease';
    scratchCanvas.style.opacity = '0';
    burstConfetti();
    bellSound.play().catch(() => {});
  }

  function burstConfetti() {
    scratchConfetti.innerHTML = '';
    scratchConfetti.classList.add('burst');
    const colors = ['#D4AF7A', '#F0C987', '#C9967A', '#FAF6EF'];
    for (let i = 0; i < 40; i++) {
      const s = document.createElement('span');
      s.style.left = Math.random() * 100 + '%';
      s.style.background = colors[Math.floor(Math.random() * colors.length)];
      s.style.animationDelay = (Math.random() * 0.4) + 's';
      s.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
      scratchConfetti.appendChild(s);
    }
  }

  let isScratching = false;
  function getPos(e) {
    const rect = scratchCanvas.getBoundingClientRect();
    const cx = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
    const cy = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;
    return { x: cx, y: cy };
  }
  function handleScratchMove(e) {
    if (!isScratching || scratchRevealed) return;
    const { x, y } = getPos(e);
    scratchAt(x, y);
    if (getScratchPercent() > 0.55) revealScratch();
  }
  scratchCanvas.addEventListener('mousedown', () => isScratching = true);
  window.addEventListener('mouseup', () => isScratching = false);
  scratchCanvas.addEventListener('mousemove', handleScratchMove);
  scratchCanvas.addEventListener('touchstart', () => isScratching = true, { passive: true });
  scratchCanvas.addEventListener('touchend', () => isScratching = false);
  scratchCanvas.addEventListener('touchmove', (e) => { handleScratchMove(e); }, { passive: true });

  /* =====================================================================
     12. GALLERY — generated luxury art-cards (canvas gradients, no external images)
     ===================================================================== */
  const galleryGrid = $('#galleryGrid');
  const galleryData = [
    { title: 'The Ring Ceremony', h: 300 },
    { title: 'Golden Hour Portraits', h: 220 },
    { title: 'Floral Arch', h: 260 },
    { title: 'Candlelit Dinner', h: 200 },
    { title: 'Mahima & Sumit', h: 280 },
    { title: 'Saloni & Pawan', h: 240 },
    { title: 'Garden Pathways', h: 210 },
    { title: 'Crystal Chandeliers', h: 290 }
  ];

  function paintArtCanvas(canvasEl, seed) {
    const w = 480, h = canvasEl.dataset.h * 1;
    canvasEl.width = w; canvasEl.height = h;
    const c = canvasEl.getContext('2d');
    const palette = [
      ['#1a140d', '#3a2c1c'], ['#0f0c09', '#2c2013'], ['#211609', '#4a3620']
    ];
    const [c1, c2] = palette[seed % palette.length];
    const grad = c.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, c1); grad.addColorStop(1, c2);
    c.fillStyle = grad; c.fillRect(0, 0, w, h);

    // soft bokeh circles
    for (let i = 0; i < 14; i++) {
      const r = 10 + Math.random() * 46;
      const x = Math.random() * w, y = Math.random() * h;
      const rg = c.createRadialGradient(x, y, 0, x, y, r);
      rg.addColorStop(0, 'rgba(212,175,122,0.22)');
      rg.addColorStop(1, 'rgba(212,175,122,0)');
      c.fillStyle = rg;
      c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill();
    }
    // gold line accents
    c.strokeStyle = 'rgba(240,201,135,0.5)';
    c.lineWidth = 1.5;
    c.beginPath();
    c.moveTo(0, h * (0.3 + seed * 0.05));
    c.bezierCurveTo(w * 0.3, h * 0.1, w * 0.7, h * 0.9, w, h * (0.5 - seed * 0.03));
    c.stroke();

    // vignette
    const vg = c.createRadialGradient(w/2, h/2, h*0.2, w/2, h/2, h*0.9);
    vg.addColorStop(0, 'rgba(0,0,0,0)');
    vg.addColorStop(1, 'rgba(0,0,0,0.55)');
    c.fillStyle = vg; c.fillRect(0, 0, w, h);
  }

  galleryData.forEach((item, i) => {
    const div = document.createElement('div');
    div.className = 'gallery__item';
    div.innerHTML = `
      <div class="gallery__item-inner">
        <canvas data-h="${item.h}"></canvas>
        <div class="gallery__shine"></div>
        <div class="gallery__caption">${item.title}</div>
      </div>`;
    galleryGrid.appendChild(div);
    const canvasEl = div.querySelector('canvas');
    paintArtCanvas(canvasEl, i);
    div.addEventListener('click', () => openLightbox(canvasEl, item.title));
  });

  const lightbox = $('#lightbox');
  const lightboxFrame = $('#lightboxFrame');
  const lightboxClose = $('#lightboxClose');
  function openLightbox(canvasEl, title) {
    lightboxFrame.innerHTML = '';
    const clone = document.createElement('canvas');
    clone.width = canvasEl.width; clone.height = canvasEl.height;
    clone.getContext('2d').drawImage(canvasEl, 0, 0);
    lightboxFrame.appendChild(clone);
    lightbox.classList.add('open');
  }
  lightboxClose.addEventListener('click', () => lightbox.classList.remove('open'));
  lightbox.addEventListener('click', (e) => { if (e.target === lightbox) lightbox.classList.remove('open'); });

  /* =====================================================================
     13. RSVP FORM
     ===================================================================== */
  const rsvpForm = $('#rsvpForm');
  const rsvpSuccess = $('#rsvpSuccess');
  rsvpForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!rsvpForm.checkValidity()) {
      rsvpForm.reportValidity();
      return;
    }
    rsvpForm.style.transition = 'opacity .4s ease, transform .4s ease';
    rsvpForm.style.opacity = '0';
    rsvpForm.style.transform = 'translateY(-10px)';
    setTimeout(() => {
      rsvpForm.style.display = 'none';
      rsvpSuccess.classList.add('show');
    }, 400);
  });

  /* =====================================================================
     14. FOOTER EASTER EGG — blessing overlay
     ===================================================================== */
  const footerLogo = $('#footerLogo');
  const blessingOverlay = $('#blessingOverlay');
  footerLogo.addEventListener('click', () => {
    blessingOverlay.classList.add('show');
    setTimeout(() => blessingOverlay.classList.remove('show'), 3200);
  });
  blessingOverlay.addEventListener('click', () => blessingOverlay.classList.remove('show'));

})();
