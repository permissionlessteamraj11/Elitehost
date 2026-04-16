/**
 * EliteHosting — Landing Page JS
 * Particles · Typed terminal · Scroll reveals · Counters · Tilt
 */
import { auth } from '../core/auth.js';

document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initNavScroll();
  initParticles();
  initTypedTerminal();
  initScrollReveal();
  initCounters();
  initHoverTilt();
  initFAQ();
  initStatsBar();

  // Redirect logged-in users' CTA
  if (auth.isLoggedIn()) {
    document.querySelectorAll('.cta-register').forEach(el => {
      el.textContent = 'Open Dashboard →';
      el.href = '/dashboard/index.html';
    });
  }
});

/* ── Navigation ─────────────────────────────────────────────────── */
function initNav() {
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('navLinks');

  hamburger?.addEventListener('click', () => {
    const open = mobileMenu?.classList.toggle('mobile-open');
    hamburger.setAttribute('aria-expanded', open ? 'true' : 'false');
    // Animate hamburger bars
    hamburger.classList.toggle('open', open);
  });

  // Close mobile menu on link click
  mobileMenu?.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      mobileMenu.classList.remove('mobile-open');
      hamburger?.classList.remove('open');
      hamburger?.setAttribute('aria-expanded', 'false');
    });
  });

  // Close on outside click
  document.addEventListener('click', e => {
    if (mobileMenu?.classList.contains('mobile-open') &&
        !mobileMenu.contains(e.target) && !hamburger?.contains(e.target)) {
      mobileMenu.classList.remove('mobile-open');
      hamburger?.classList.remove('open');
      hamburger?.setAttribute('aria-expanded', 'false');
    }
  });
}

function initNavScroll() {
  const nav = document.querySelector('.nav');
  window.addEventListener('scroll', () => {
    nav?.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });
}

/* ── Particle System ─────────────────────────────────────────────── */
function initParticles() {
  const canvas = document.getElementById('particles');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let W, H, particles = [], animId;
  let mouseX = 0, mouseY = 0;

  const COLORS = [
    'rgba(0,212,255,',    // electric
    'rgba(0,255,163,',    // mint
    'rgba(124,58,237,',   // plasma
  ];

  function resize() {
    W = canvas.width = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
    mouseX = W / 2; mouseY = H / 2;
  }

  function mkParticle() {
    return {
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      size: Math.random() * 1.8 + 0.4,
      opacity: Math.random() * 0.45 + 0.08,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
    };
  }

  function init() {
    resize();
    particles = Array.from({ length: 90 }, mkParticle);
  }

  document.addEventListener('mousemove', e => {
    mouseX = e.clientX; mouseY = e.clientY;
  }, { passive: true });

  function draw() {
    ctx.clearRect(0, 0, W, H);

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      // Mouse repulsion
      const dx = mouseX - p.x, dy = mouseY - p.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 100 && dist > 0) {
        p.vx -= (dx / dist) * 0.04;
        p.vy -= (dy / dist) * 0.04;
      }
      p.vx *= 0.99; p.vy *= 0.99;
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0) p.x = W; else if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H; else if (p.y > H) p.y = 0;

      // Dot
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `${p.color}${p.opacity})`;
      ctx.fill();

      // Connections
      for (let j = i + 1; j < particles.length; j++) {
        const q = particles[j];
        const d = Math.hypot(p.x - q.x, p.y - q.y);
        if (d < 90) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y);
          ctx.strokeStyle = `rgba(0,212,255,${(1 - d / 90) * 0.07})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }

    animId = requestAnimationFrame(draw);
  }

  init();
  draw();
  window.addEventListener('resize', init, { passive: true });
}

/* ── Typed Terminal ──────────────────────────────────────────────── */
function initTypedTerminal() {
  const el = document.getElementById('heroTerminal');
  if (!el) return;

  const lines = [
    { text: '$ git push origin main',                         color: '#93C5FD' },
    { text: '⚡ EliteHosting detected: Node.js 20',          color: '#FFD60A' },
    { text: '📦 Installing 247 packages...',                  color: 'rgba(255,255,255,0.55)' },
    { text: '✓ npm install complete (8.2s)',                  color: '#00FFA3' },
    { text: '🐳 Building Docker image...',                    color: 'rgba(255,255,255,0.55)' },
    { text: '  ● Dockerfile generated automatically',         color: 'rgba(255,255,255,0.38)' },
    { text: '  ● Layer caching: 6/8 layers cached',          color: 'rgba(255,255,255,0.38)' },
    { text: '✓ Build completed in 22s',                       color: '#00FFA3' },
    { text: '🚀 Deploying to Mumbai (ap-south-1)...',         color: 'rgba(255,255,255,0.55)' },
    { text: '✓ Container running on port 3000',               color: '#00FFA3' },
    { text: '✓ SSL certificate issued',                       color: '#00FFA3' },
    { text: '✅ Live: https://myapi.raj.elitehosting.in',     color: '#00D4FF' },
    { text: '📱 Telegram: @elitehosting_bot notified',        color: '#A78BFA' },
  ];

  let lineIdx = 0;
  const cursor = document.createElement('span');
  cursor.className = 'terminal-cursor';

  async function typeLine() {
    if (lineIdx >= lines.length) {
      await sleep(2800);
      el.innerHTML = '';
      lineIdx = 0;
      typeLine();
      return;
    }

    const line = lines[lineIdx];
    const div = document.createElement('div');
    div.style.cssText = `color:${line.color};padding:1px 0;`;
    el.appendChild(div);
    el.appendChild(cursor);

    for (let i = 0; i <= line.text.length; i++) {
      div.textContent = line.text.slice(0, i);
      el.scrollTop = el.scrollHeight;
      await sleep(i === 0 ? 120 : Math.random() * 38 + 16);
    }

    lineIdx++;
    const gap = line.text.startsWith('  ') ? 80 : lineIdx < 3 ? 350 : 260;
    await sleep(gap);
    typeLine();
  }

  typeLine();
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

/* ── Scroll Reveal ──────────────────────────────────────────────── */
function initScrollReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  document.querySelectorAll('.reveal, .reveal-left, .reveal-right').forEach(el => observer.observe(el));
}

/* ── Animated Counters ──────────────────────────────────────────── */
function initCounters() {
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      obs.unobserve(entry.target);
      animateCounter(entry.target);
    });
  }, { threshold: 0.6 });

  document.querySelectorAll('[data-counter]').forEach(el => obs.observe(el));
}

function animateCounter(el) {
  const target = parseFloat(el.dataset.counter);
  const suffix = el.dataset.suffix || '';
  const prefix = el.dataset.prefix || '';
  const duration = 1800;
  const isFloat = String(target).includes('.');
  const start = Date.now();

  function tick() {
    const elapsed = Date.now() - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = target * eased;
    el.textContent = prefix + (isFloat ? current.toFixed(1) : Math.round(current).toLocaleString('en-IN')) + suffix;
    if (progress < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

/* ── Stats Bar ─────────────────────────────────────────────────── */
function initStatsBar() {
  // Add stagger to stats bar items
  document.querySelectorAll('.stats-bar .stat-item').forEach((el, i) => {
    el.style.animationDelay = `${i * 80}ms`;
  });
}

/* ── Hover Tilt ─────────────────────────────────────────────────── */
function initHoverTilt() {
  document.querySelectorAll('.tilt-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width  - 0.5;
      const y = (e.clientY - rect.top)  / rect.height - 0.5;
      card.style.transform =
        `perspective(700px) rotateY(${x * 7}deg) rotateX(${y * -7}deg) translateZ(4px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
}

/* ── FAQ Accordion ──────────────────────────────────────────────── */
function initFAQ() {
  document.querySelectorAll('.faq-item').forEach(item => {
    const trigger = item.querySelector('.faq-question');
    const body    = item.querySelector('.faq-answer');
    if (!trigger || !body) return;

    trigger.setAttribute('aria-expanded', 'false');
    trigger.addEventListener('click', () => {
      const open = item.classList.toggle('open');
      trigger.setAttribute('aria-expanded', String(open));
      body.style.maxHeight = open ? body.scrollHeight + 'px' : '0';
    });
  });
}
