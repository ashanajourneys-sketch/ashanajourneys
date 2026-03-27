/* ═══════════════════════════════════════════════════════════
   ASHANA JOURNEYS — main.js
   ES Module: Firebase (read-only) + UI effects
═══════════════════════════════════════════════════════════ */

import { initializeApp }                     from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, onSnapshot } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/* ── FIREBASE CONFIG ──────────────────────────────────────── */
const firebaseConfig = {
  apiKey: "AIzaSyAvMTGPX1NRdDWfBJVTwKFu1MX1-Junq7Y",
  authDomain: "ashana-journeys.firebaseapp.com",
  projectId: "ashana-journeys",
  storageBucket: "ashana-journeys.firebasestorage.app",
  messagingSenderId: "1056206455125",
  appId: "1:1056206455125:web:5e09ea23b28847dff06fdc",
  measurementId: "G-FNKGTSYC8C"
};

const app = initializeApp(firebaseConfig);
const db  = getFirestore(app);

/* ── FIRESTORE: TRIPS (read-only) ─────────────────────────── */
onSnapshot(collection(db, 'trips'), snap => {
  const grid = document.getElementById('trips-grid');
  if (!grid) return;
  grid.innerHTML = '';

  if (snap.empty) {
    grid.innerHTML = '<p class="empty-msg">No trips yet — check back soon!</p>';
    return;
  }

  snap.forEach(docSnap => {
    const t = docSnap.data();
    const card = document.createElement('div');
    card.className  = 'trip-card reveal-up';
    card.dataset.ghost = t.location || t.name || '';   // ghost watermark text

        card.innerHTML = `
      ${t.photo ? `<img src="${t.photo}" alt="${t.name}" style="width: 100%; height: 200px; object-fit: cover; border-radius: 4px; margin-bottom: 1.2rem; border: 1px solid rgba(255,255,255,0.05);"/>` : ''}
      <div class="trip-tag">Group Experience</div>
      <h3 class="trip-name">${t.name}</h3>
      <div class="trip-meta">
        <span>📍 ${t.location}</span>
        <span>📅 ${t.date}</span>
      </div>
      <a href="#" class="btn-join">Join Now →</a>
    `;

    grid.appendChild(card);
    revealObserver.observe(card);   // animate in when scrolled to
  });
});

/* ── FIRESTORE: MERCHANTS (read-only) ─────────────────────── */
onSnapshot(collection(db, 'merchants'), snap => {
  const grid       = document.getElementById('merch-grid');
  const staticCard = document.getElementById('tshirt-card');
  if (!grid) return;

  // Remove dynamic cards only, keep the static tshirt card
  Array.from(grid.children).forEach(el => {
    if (el !== staticCard) el.remove();
  });

  snap.forEach(docSnap => {
    const m    = docSnap.data();
    const card = document.createElement('div');
    card.className = 'merch-card reveal-up';

    card.innerHTML = `
      <div class="merch-img">
        <img src="${m.photo || ''}" alt="${m.name}"
             onerror="this.src='https://placehold.co/280x280/1e3a2f/c9952b?text=Item'"/>
      </div>
      <div class="merch-info">
        <h3>${m.name}</h3>
        <p class="merch-price">RM ${m.price}</p>
        <a href="#" class="btn-buy">Buy Now</a>
      </div>
    `;

    grid.appendChild(card);
    revealObserver.observe(card);
  });
});

/* ── SCROLL REVEAL ────────────────────────────────────────── */
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

// Observe all static reveal elements
document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right')
  .forEach(el => revealObserver.observe(el));

/* ── NAVIGATION ───────────────────────────────────────────── */
const nav = document.getElementById('nav');
let lastY = 0;

window.addEventListener('scroll', () => {
  const y = window.scrollY;

  // Glass effect on scroll
  nav.classList.toggle('scrolled', y > 55);

  // Auto-hide on scroll down, show on scroll up
  if (y > lastY && y > 220) {
    nav.classList.add('hidden');
  } else {
    nav.classList.remove('hidden');
  }
  lastY = y;
}, { passive: true });

/* ── MOBILE NAV ───────────────────────────────────────────── */
const hamburger = document.getElementById('nav-hamburger');
const mobileNav = document.getElementById('nav-mobile');

hamburger?.addEventListener('click', () => {
  const isOpen = mobileNav.classList.toggle('open');
  hamburger.classList.toggle('open', isOpen);
  hamburger.setAttribute('aria-expanded', isOpen);
  document.body.style.overflow = isOpen ? 'hidden' : '';
});

mobileNav?.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    mobileNav.classList.remove('open');
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  });
});

/* ── CUSTOM CURSOR ────────────────────────────────────────── */
const cursor      = document.getElementById('cursor');
const cursorTrail = document.getElementById('cursor-trail');

// Only activate on mouse-capable devices
if (cursor && cursorTrail && window.matchMedia('(pointer: fine)').matches) {
  let mx = 0, my = 0, tx = 0, ty = 0;

  document.addEventListener('mousemove', e => {
    mx = e.clientX;
    my = e.clientY;
    cursor.style.left = mx + 'px';
    cursor.style.top  = my + 'px';
  });

  // Trailing dot uses RAF for smooth lag
  (function loop() {
    tx += (mx - tx) * 0.13;
    ty += (my - ty) * 0.13;
    cursorTrail.style.left = tx + 'px';
    cursorTrail.style.top  = ty + 'px';
    requestAnimationFrame(loop);
  })();

  // Enlarge cursor on interactive elements
  const hoverSel = 'a, button, .trip-card, .merch-card, .pillar, .soc-card, .ts-scene';
  document.querySelectorAll(hoverSel).forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('hovered'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('hovered'));
  });

  document.addEventListener('mousedown', () => cursor.style.transform = 'translate(-50%,-50%) scale(0.75)');
  document.addEventListener('mouseup',   () => cursor.style.transform = 'translate(-50%,-50%) scale(1)');
}

/* ── MAGNETIC BUTTONS ─────────────────────────────────────── */
document.querySelectorAll('.btn-magnetic').forEach(btn => {
  let resetTimer;

  btn.addEventListener('mousemove', e => {
    const r  = btn.getBoundingClientRect();
    const dx = e.clientX - (r.left + r.width  / 2);
    const dy = e.clientY - (r.top  + r.height / 2);
    btn.style.transform    = `translate(${dx * 0.2}px, ${dy * 0.2}px)`;
    btn.style.transition   = 'transform 0.1s ease';
  });

  btn.addEventListener('mouseleave', () => {
    btn.style.transition   = 'transform 0.55s cubic-bezier(0.16,1,0.3,1)';
    btn.style.transform    = '';
    clearTimeout(resetTimer);
    resetTimer = setTimeout(() => { btn.style.transition = ''; }, 600);
  });
});

/* ── HERO PARALLAX ────────────────────────────────────────── */
const heroMtn     = document.querySelector('.hero-mtn');
const heroContent = document.querySelector('.hero-content');
const heroSection = document.getElementById('hero');

if (heroMtn && heroContent && heroSection) {
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    const vh = window.innerHeight;

    if (y < vh * 1.3) {
      heroMtn.style.transform      = `translateY(${y * 0.22}px)`;
      heroContent.style.transform  = `translateY(${y * 0.14}px)`;
      heroContent.style.opacity    = `${Math.max(0, 1 - y / (vh * 0.72))}`;
    }
  }, { passive: true });
}

/* ── 360° T-SHIRT ─────────────────────────────────────────── */
(function initTShirt() {
  const scene = document.getElementById('ts-scene');
  const inner = document.getElementById('ts-inner');
  if (!scene || !inner) return;

  let isDragging = false;
  let startX     = 0;
  let rotY       = 0;
  let autoRaf;

  // Auto-rotate
  function autoRotate() {
    if (!isDragging) {
      rotY += 0.28;
      inner.style.transform = `rotateY(${rotY}deg)`;
    }
    autoRaf = requestAnimationFrame(autoRotate);
  }
  autoRaf = requestAnimationFrame(autoRotate);

  function getX(e) { return e.touches ? e.touches[0].clientX : e.clientX; }

  function onStart(e) {
    isDragging = true;
    startX     = getX(e);
    scene.style.cursor = 'grabbing';
  }
  function onMove(e) {
    if (!isDragging) return;
    const x = getX(e);
    rotY   += (x - startX) * 0.5;
    startX  = x;
    inner.style.transform = `rotateY(${rotY}deg)`;
  }
  function onEnd() {
    isDragging = false;
    scene.style.cursor = 'grab';
  }

  scene.addEventListener('mousedown',  onStart);
  window.addEventListener('mousemove', onMove);
  window.addEventListener('mouseup',   onEnd);
  scene.addEventListener('touchstart', onStart, { passive: true });
  window.addEventListener('touchmove', onMove,  { passive: true });
  window.addEventListener('touchend',  onEnd);
})();
