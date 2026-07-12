(function () {
  'use strict';

  /* ── Smooth scroll (Lenis-style) ── */
  class SmoothScroll {
    constructor() {
      this.current = window.scrollY;
      this.target = window.scrollY;
      this.ease = 0.08;
      this.running = false;
      this.maxScroll = 0;
      this.onScroll = this.onScroll.bind(this);
      this.onResize = this.onResize.bind(this);
      this.tick = this.tick.bind(this);
    }

    init() {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      this.onResize();
      window.addEventListener('scroll', this.onScroll, { passive: true });
      window.addEventListener('resize', this.onResize, { passive: true });
      this.running = true;
      requestAnimationFrame(this.tick);
    }

    onScroll() {
      this.target = window.scrollY;
    }

    onResize() {
      this.maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    }

    tick() {
      if (!this.running) return;
      this.current += (this.target - this.current) * this.ease;
      if (Math.abs(this.target - this.current) < 0.5) {
        this.current = this.target;
      }
      requestAnimationFrame(this.tick);
    }
  }

  const smooth = new SmoothScroll();
  smooth.init();

  /* ── Header ── */
  const header = document.getElementById('header');

  function updateHeader() {
    header.classList.toggle('is-scrolled', window.scrollY > 50);
  }

  window.addEventListener('scroll', updateHeader, { passive: true });
  updateHeader();

  /* ── Mobile menu ── */
  const menuBtn = document.querySelector('.menu-btn');
  const mobileMenu = document.querySelector('.mobile-menu');
  const mobileLinks = document.querySelectorAll('.mobile-menu__link');

  function toggleMenu(open) {
    const isOpen = open ?? !menuBtn.classList.contains('is-open');
    menuBtn.classList.toggle('is-open', isOpen);
    menuBtn.setAttribute('aria-expanded', isOpen);
    mobileMenu.classList.toggle('is-open', isOpen);
    mobileMenu.setAttribute('aria-hidden', !isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  }

  menuBtn.addEventListener('click', () => toggleMenu());
  mobileLinks.forEach((link) => link.addEventListener('click', () => toggleMenu(false)));

  /* ── Anchor navigation ── */
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const id = anchor.getAttribute('href');
      if (id === '#') return;
      const el = document.querySelector(id);
      if (!el) return;
      e.preventDefault();
      toggleMenu(false);
      const offset = header.offsetHeight + 20;
      const top = el.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  /* ── Scroll reveal ── */
  const animated = document.querySelectorAll('[data-animate]');

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -60px 0px' }
  );

  animated.forEach((el) => revealObserver.observe(el));

  /* ── Counter animation ── */
  function animateCount(el) {
    const target = parseInt(el.dataset.count, 10);
    const duration = 2200;
    const start = performance.now();

    function easeOut(t) {
      return 1 - Math.pow(1 - t, 4);
    }

    function frame(now) {
      const progress = Math.min((now - start) / duration, 1);
      const value = Math.floor(easeOut(progress) * target);
      el.textContent = value.toLocaleString('ru-RU');
      if (progress < 1) requestAnimationFrame(frame);
    }

    requestAnimationFrame(frame);
  }

  const counters = document.querySelectorAll('[data-count]');
  const counterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        animateCount(entry.target);
        counterObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.4 }
  );

  counters.forEach((el) => counterObserver.observe(el));

  /* ── Cursor glow ── */
  const cursor = document.querySelector('.cursor');

  if (cursor && window.matchMedia('(pointer: fine)').matches) {
    let mx = 0;
    let my = 0;
    let cx = 0;
    let cy = 0;

    document.body.classList.add('is-hovering');

    document.addEventListener('mousemove', (e) => {
      mx = e.clientX;
      my = e.clientY;
    });

    function loop() {
      cx += (mx - cx) * 0.07;
      cy += (my - cy) * 0.07;
      cursor.style.left = cx + 'px';
      cursor.style.top = cy + 'px';
      requestAnimationFrame(loop);
    }

    loop();
  }

  /* ── Magnetic buttons ── */
  if (window.matchMedia('(pointer: fine)').matches) {
    document.querySelectorAll('.magnetic').forEach((btn) => {
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        btn.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
      });

      btn.addEventListener('mouseleave', () => {
        btn.style.transform = '';
      });
    });
  }

  /* ── Parallax mesh on scroll ── */
  const meshes = document.querySelectorAll('.mesh');

  if (meshes.length && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    window.addEventListener('scroll', () => {
      const y = window.scrollY;
      meshes.forEach((mesh, i) => {
        const speed = 0.04 + i * 0.02;
        mesh.style.transform = `translateY(${y * speed}px)`;
      });
    }, { passive: true });
  }

  /* ── Project card tilt ── */
  if (window.matchMedia('(pointer: fine)').matches) {
    document.querySelectorAll('.project').forEach((card) => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = `perspective(800px) rotateY(${x * 4}deg) rotateX(${-y * 4}deg) translateY(-6px)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });
  }
})();
