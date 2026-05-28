(function () {
  'use strict';

  var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var EASE = [0.16, 1, 0.3, 1];

  // ============================================================
  // NAVIGATION
  // ============================================================
  function initNav() {
    var nav = document.querySelector('.nav');
    if (!nav) return;
    function onScroll() { nav.classList.toggle('scrolled', window.scrollY > 50); }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  function initMobileNav() {
    var toggle = document.querySelector('.nav-toggle');
    var links = document.querySelector('.nav-links');
    if (!toggle || !links) return;
    var gsapAvail = typeof gsap !== 'undefined';
    if (gsapAvail && window.innerWidth <= 768) gsap.set(links, { opacity: 0, y: -20 });
    function close() {
      links.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      if (gsapAvail) {
        gsap.to(links, { opacity: 0, y: -20, duration: 0.35, ease: 'power2.in', onComplete: function () { document.body.classList.remove('nav-open'); } });
      } else {
        document.body.classList.remove('nav-open');
      }
    }
    function open() {
      document.body.classList.add('nav-open');
      toggle.setAttribute('aria-expanded', 'true');
      links.classList.add('open');
      if (gsapAvail) {
        gsap.fromTo(links, { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: 0.5, ease: EASE });
      }
    }
    toggle.addEventListener('click', function () {
      if (links.classList.contains('open')) close(); else open();
    });
    links.querySelectorAll('a').forEach(function (link) { link.addEventListener('click', close); });
    document.addEventListener('click', function (e) {
      if (!e.target.closest('.nav')) close();
    });
  }

  function initActiveNav() {
    var path = location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-links a').forEach(function (link) {
      link.classList.toggle('active', link.getAttribute('href') === path);
    });
  }

  function initSmoothAnchors() {
    document.addEventListener('click', function (e) {
      var link = e.target.closest('a[href^="#"]');
      if (!link) return;
      var target = document.querySelector(link.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  // ============================================================
  // REDUCED MOTION FALLBACK
  // ============================================================
  function initFallbackReveal() {
    var els = document.querySelectorAll('[data-reveal]');
    if (!els.length) return;
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var el = entry.target;
          el.style.opacity = '1';
          el.style.transform = 'none';
          el.style.filter = 'none';
          obs.unobserve(el);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });
    els.forEach(function (el) { obs.observe(el); });
  }

  // ============================================================
  // PREMIUM ANIMATION ENGINE
  // ============================================================
  function initPremiumAnimations() {
    if (REDUCED || typeof gsap === 'undefined') {
      initFallbackReveal();
      return;
    }

    try {
      gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

      // ---- ScrollSmoother smooth scroll ------------------------
      var smoother;
      if (document.getElementById('smooth-wrapper')) {
        smoother = ScrollSmoother.create({
          wrapper: '#smooth-wrapper',
          content: '#smooth-content',
          smooth: 1.5,
          effects: true,
        });
      }

      // ---- Scroll progress bar ----------------------------------
      var progressBar = document.createElement('div');
      progressBar.className = 'scroll-progress';
      document.body.appendChild(progressBar);
      gsap.to(progressBar, {
        scaleX: 1,
        ease: 'none',
        scrollTrigger: { scrub: 0.3, start: 'top top', end: 'bottom bottom' },
      });

      // ---- HERO PAGE LOAD TIMELINE -------------------------------
      (function initHeroTimeline() {
        var tl = gsap.timeline({ delay: 0.2 });
        tl
          .from('.hero-gradient, .hero-orb, .hero-grid-lines', { opacity: 0, duration: 1.6, ease: EASE })
          .from('.nav', { y: -80, opacity: 0, duration: 0.9, ease: EASE }, '-=1.1')
          .from('.hero-text .kicker', { y: 30, opacity: 0, duration: 0.7, ease: EASE }, '-=0.5')
          .from('.display-hero', { y: 60, opacity: 0, duration: 1.0, ease: EASE }, '-=0.3')
          .from('.hero-text .body-large', { y: 30, opacity: 0, duration: 0.8, ease: EASE }, '-=0.5')
          .from('.hero-actions .btn', { scale: 0.92, opacity: 0, duration: 0.7, stagger: 0.12, ease: EASE }, '-=0.4')
          .from('.hero-visual', { y: 40, opacity: 0, filter: 'blur(6px)', duration: 1.0, ease: EASE }, '-=0.6')
          .from('.hero-floating-icon', { opacity: 0, scale: 0.5, duration: 0.8, stagger: 0.08, ease: EASE }, '-=0.4');
      })();

      // ---- FRAMER MOTION SCROLL REVEAL PATTERNS ------------------
      document.querySelectorAll('[data-reveal="mask"]').forEach(function (el) {
        var child = el.firstElementChild;
        if (!child) return;
        gsap.fromTo(child, {
          y: '100%', rotation: 2, opacity: 0
        }, {
          y: '0%', rotation: 0, opacity: 1,
          duration: 1.0, ease: EASE,
          scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none none' },
        });
      });

      document.querySelectorAll('[data-reveal="stagger"]').forEach(function (el) {
        var children = Array.from(el.children);
        if (!children.length) return;
        var delay = parseFloat(el.getAttribute('data-stagger-delay')) || 0.1;
        var start = el.getAttribute('data-stagger-start') || 'top 86%';
        gsap.fromTo(children, {
          y: 40, scale: 0.95, opacity: 0
        }, {
          y: 0, scale: 1, opacity: 1,
          duration: 0.8, stagger: delay, ease: EASE,
          scrollTrigger: { trigger: el, start: start, toggleActions: 'play none none none' },
        });
      });

      document.querySelectorAll('[data-reveal="float"]').forEach(function (el) {
        gsap.fromTo(el, {
          y: 50, filter: 'blur(10px)', opacity: 0
        }, {
          y: 0, filter: 'blur(0px)', opacity: 1,
          duration: 1.0, ease: EASE,
          scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none none' },
        });
      });

      document.querySelectorAll('[data-reveal="wipe"]').forEach(function (el) {
        gsap.fromTo(el, { scaleX: 0 }, {
          scaleX: 1, duration: 0.9, ease: EASE,
          scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none none' },
        });
      });

      document.querySelectorAll('[data-reveal="fade"]').forEach(function (el) {
        gsap.fromTo(el, {
          y: 24, opacity: 0
        }, {
          y: 0, opacity: 1,
          duration: 0.7, ease: EASE,
          scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none none' },
        });
      });

      // ---- COUNTERS ---------------------------------------------
      document.querySelectorAll('.counter-number').forEach(function (el) {
        var target = parseInt(el.getAttribute('data-target') || '0', 10);
        if (!target) return;
        var suffix = el.querySelector('.accent') ? el.querySelector('.accent').textContent : '';
        var obj = { val: 0 };
        gsap.to(obj, {
          val: target, duration: 2.0, ease: 'power2.out',
          scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none none' },
          onUpdate: function () { el.innerHTML = Math.round(obj.val).toLocaleString() + (suffix ? '<span class="accent">' + suffix + '</span>' : ''); },
        });
      });

      // ---- PARALLAX ---------------------------------------------
      if (window.innerWidth >= 768) {
        document.querySelectorAll('.parallax-bg').forEach(function (el) {
          gsap.fromTo(el, { y: '-10%' }, {
            y: '10%', ease: 'none',
            scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: true },
          });
        });
      }

      // ---- IMMEDIATE VIEWPORT CHECK ------------------------------
      ScrollTrigger.refresh();
      setTimeout(function () {
        ScrollTrigger.refresh();
        document.querySelectorAll('[data-reveal]').forEach(function (el) {
          if (el.style.opacity === '0' || parseFloat(window.getComputedStyle(el).opacity) < 0.5) {
            var rect = el.getBoundingClientRect();
            if (rect.top < window.innerHeight && rect.bottom > 0) {
              gsap.set(el, { opacity: 1, y: 0, scale: 1, filter: 'none' });
            }
          }
        });
      }, 500);

      // ---- SUPPLEMENTARY INTERSECTION OBSERVER -------------------
      document.querySelectorAll('[data-reveal]').forEach(function (el) {
        if (el.dataset._revealObserved) return;
        el.dataset._revealObserved = '1';
        var obs = new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              var target = entry.target;
              if (target.style.opacity === '0' || parseFloat(window.getComputedStyle(target).opacity) < 0.5) {
                gsap.set(target, { opacity: 1, y: 0, scale: 1, filter: 'none' });
              }
              obs.unobserve(target);
            }
          });
        }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });
        obs.observe(el);
      });

      // ---- MAGNETIC BUTTONS --------------------------------------
      if (!window.matchMedia('(hover: none) and (pointer: coarse)').matches) {
        document.querySelectorAll('.btn').forEach(function (btn) {
          btn.classList.add('btn-magnetic');
          var mRaf = null, mX = 0, mY = 0;
          btn.addEventListener('mousemove', function (e) {
            var rect = this.getBoundingClientRect();
            mX = (e.clientX - rect.left - rect.width / 2) * 0.3;
            mY = (e.clientY - rect.top - rect.height / 2) * 0.3;
            if (!mRaf) {
              mRaf = requestAnimationFrame(function () {
                mRaf = null;
                gsap.to(btn, { x: mX, y: mY, duration: 0.6, ease: 'power2.out', overwrite: 'auto' });
              });
            }
          });
          btn.addEventListener('mouseleave', function () {
            cancelAnimationFrame(mRaf); mRaf = null;
            gsap.to(btn, { x: 0, y: 0, duration: 0.4, ease: 'power2.out', overwrite: 'auto' });
          });
        });
      }

    } catch (e) {
      initFallbackReveal();
    }
  }

  // ============================================================
  // THREE.JS PARTICLE SYSTEM
  // ============================================================
  function initParticles() {
    if (REDUCED || typeof THREE === 'undefined') return;
    var canvas = document.getElementById('webgl-canvas');
    if (!canvas) return;

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    var renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    var geometry = new THREE.BufferGeometry();
    var count = 2000;
    var positions = new Float32Array(count * 3);
    for (var i = 0; i < count * 3; i++) {
      positions[i] = (Math.random() - 0.5) * 10;
    }
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    var material = new THREE.PointsMaterial({
      color: 0xff2b2b,
      size: 0.02,
      transparent: true,
      opacity: 0.4,
      blending: THREE.AdditiveBlending,
    });

    var particles = new THREE.Points(geometry, material);
    scene.add(particles);
    camera.position.z = 5;

    function animate() {
      requestAnimationFrame(animate);
      particles.rotation.y += 0.0003;
      renderer.render(scene, camera);
    }
    animate();

    window.addEventListener('resize', function () {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }

  // ============================================================
  // INIT
  // ============================================================
  function init() {
    initNav();
    initMobileNav();
    initActiveNav();
    initSmoothAnchors();
    initPremiumAnimations();
    initParticles();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
