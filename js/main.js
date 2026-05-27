/* ============================================================
   TMH — Cinematic Animation System
   Lenis · GSAP ScrollTrigger · Text splits · Hero timeline ·
   Stagger grids · Parallax · Magnetic · 3D tilt · Particles
   ============================================================ */

document.addEventListener('DOMContentLoaded', function () {
  'use strict';

  var isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasGSAP = typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined';
  var EASE = 'power4.out';
  var EASE_SPRING = 'back.out(1.4)';
  var DURATION = 0.9;

  // ============================================================
  // 0. LENIS SMOOTH SCROLL
  // ============================================================
  ;(function () {
    if (isReduced || !hasGSAP || typeof Lenis === 'undefined') return;

    var lenis = new Lenis({
      duration: 1.2,
      easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); },
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1
    });

    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add(function (time) {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);
  })();

  // ============================================================
  // 1. HERO LOAD SEQUENCE (cinematic timeline)
  // ============================================================
  ;(function () {
    if (isReduced || !hasGSAP) return;

    var hero = document.querySelector('.hero');
    if (!hero) return;

    var tl = gsap.timeline({
      defaults: { ease: EASE, duration: DURATION }
    });

    // 1a. Background glow fades in
    tl.fromTo('.hero-bg', { opacity: 0 }, { opacity: 1, duration: 0.8 }, 0);

    // 1b. Badge slides down
    tl.fromTo('.hero-badge', { opacity: 0, y: -18 }, { opacity: 1, y: 0, duration: 0.5 }, 0.15);

    // 1c. Headline word-by-word reveal
    var headline = hero.querySelector('h1');
    if (headline) {
      var words = headline.textContent.trim().split(/\s+/);
      headline.innerHTML = words.map(function (w) {
        return '<span class="hero-word">' + w + '</span>';
      }).join(' ');
      tl.fromTo('.hero-word', {
        opacity: 0, y: 40, rotateX: 20
      }, {
        opacity: 1, y: 0, rotateX: 0,
        duration: 0.75,
        stagger: 0.055,
        ease: EASE
      }, 0.25);
    }

    // 1d. Subheadline fades + lifts
    tl.fromTo('.hero p', { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.6 }, '-=0.15');

    // 1e. CTA buttons scale in
    tl.fromTo('.hero-actions .btn', {
      opacity: 0, scale: 0.92
    }, {
      opacity: 1, scale: 1,
      duration: 0.55,
      stagger: 0.1,
      ease: EASE_SPRING
    }, '-=0.25');

    // 1f. Hero visual (ring + dots) fades in
    tl.fromTo('.hero-visual', { opacity: 0, scale: 0.88 }, { opacity: 1, scale: 1, duration: 0.9 }, '-=0.4');

    // 1g. Floating dots drift in
    tl.fromTo('.hero-dot', { opacity: 0, scale: 0 }, {
      opacity: 1, scale: 1,
      duration: 0.5,
      stagger: 0.12,
      ease: EASE_SPRING
    }, '-=0.3');
  })();

  // ============================================================
  // 2. SCROLL REVEALS — Framer Motion–style sections with weight
  // ============================================================
  ;(function () {
    if (isReduced || !hasGSAP) return;

    // Major sections — enhanced y distance, longer duration
    var sections = document.querySelectorAll('.section, .page-hero, .cta-banner, .marquee-wrap, .dark-section');
    sections.forEach(function (el) {
      gsap.fromTo(el, { opacity: 0, y: 60 }, {
        opacity: 1, y: 0,
        duration: 1.0,
        ease: EASE,
        scrollTrigger: {
          trigger: el,
          start: 'top 88%',
          toggleActions: 'play none none none',
          once: true
        }
      });
    });

    // Data-attribute fade-lift (backward compat with existing HTML)
    document.querySelectorAll('[data-gsap="fade-lift"]').forEach(function (el) {
      var delay = parseFloat(el.getAttribute('data-delay')) || 0;
      gsap.fromTo(el, { opacity: 0, y: 50 }, {
        opacity: 1, y: 0,
        duration: 1.0,
        delay: delay,
        ease: EASE,
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          toggleActions: 'play none none none',
          once: true
        }
      });
    });
  })();

  // ============================================================
  // 3. DOMINO STAGGER — Framer Motion–style with scale
  // ============================================================
  ;(function () {
    if (isReduced || !hasGSAP) return;

    // Stagger grids: children fade + lift + scale down, domino stagger
    var gridSelectors = [
      '.grid-3', '.grid-4', '.grid-2', '.pricing-grid-alt',
      '.card-stagger', '.masonry', '.values-grid', '.team-grid',
      '.testimonial-grid', '.awards-grid', '.schedule-grid',
      '.contact-details'
    ];

    gridSelectors.forEach(function (sel) {
      document.querySelectorAll(sel).forEach(function (grid) {
        var items = grid.querySelectorAll(
          '.glass-card, .pricing-tier, .service-card, .feature-card, ' +
          '.value-card, .team-card, .testimonial-card, .award-card, ' +
          '.schedule-card, .masonry-item, .contact-detail-card, ' +
          '.program-card'
        );
        if (items.length < 2) return;
        gsap.fromTo(items, {
          opacity: 0, y: 50, scale: 0.95
        }, {
          opacity: 1, y: 0, scale: 1,
          duration: 0.85,
          stagger: 0.1,
          ease: EASE,
          scrollTrigger: {
            trigger: grid,
            start: 'top 85%',
            toggleActions: 'play none none none',
            once: true
          }
        });
      });
    });

    // Data-attribute stagger-grid
    document.querySelectorAll('[data-gsap="stagger-grid"]').forEach(function (grid) {
      var children = grid.children;
      if (children.length < 2) return;
      gsap.fromTo(children, {
        opacity: 0, y: 50, scale: 0.95
      }, {
        opacity: 1, y: 0, scale: 1,
        duration: 0.85,
        stagger: 0.1,
        ease: EASE,
        scrollTrigger: {
          trigger: grid,
          start: 'top 82%',
          toggleActions: 'play none none none',
          once: true
        }
      });
    });

    // Featured pricing tier: spring overshoot
    document.querySelectorAll('.pricing-tier.featured').forEach(function (el) {
      gsap.fromTo(el, {
        opacity: 0, y: 50, scale: 0.92
      }, {
        opacity: 1, y: 0, scale: 1.04,
        duration: 1,
        delay: 0.2,
        ease: EASE_SPRING,
        scrollTrigger: {
          trigger: el,
          start: 'top 82%',
          toggleActions: 'play none none none',
          once: true
        }
      });
    });
  })();

  // ============================================================
  // 4. TEXT MASKED REVEAL — word-by-word with overflow mask
  //    (Framer Motion "masked reveal" archetype:
  //     y: "100%", rotate: 2 → y: "0%", rotate: 0)
  // ============================================================
  ;(function () {
    if (isReduced || !hasGSAP) return;

    // Auto-detect: section headings + data-split + data-reveal="mask"
    var els = document.querySelectorAll(
      '.section h2, .page-hero h1, .dark-section h2, .cta-banner h2, [data-split], [data-reveal="mask"]'
    );

    // Deduplicate: element may match multiple selectors
    var seen = new Set();

    els.forEach(function (el) {
      if (seen.has(el)) return;
      seen.add(el);

      var text = el.textContent.trim();
      if (!text) return;

      // Skip if already processed (e.g. by hero timeline)
      if (el.querySelector('.reveal-mask')) return;

      // Wrap each word in reveal-mask > reveal-text
      var words = text.split(/\s+/);
      var wrapped = words.map(function (w) {
        return '<span class="reveal-mask"><span class="reveal-text">' + w + '</span></span>';
      }).join(' ');
      el.innerHTML = wrapped;

      // Animate: y "100%" + rotate 2 → y "0%" + rotate 0 (cinematic rolling reveal)
      gsap.fromTo(el.querySelectorAll('.reveal-text'), {
        y: '100%',
        rotate: 2,
        opacity: 0
      }, {
        y: '0%',
        rotate: 0,
        opacity: 1,
        duration: 1.0,
        stagger: 0.06,
        ease: EASE,
        scrollTrigger: {
          trigger: el,
          start: 'top 80%',
          toggleActions: 'play none none none',
          once: true
        }
      });
    });
  })();

  // ============================================================
  // 5. SLOW FLOAT — blur-in reveal for visuals / images
  //    (Framer Motion "slow float" archetype:
  //     opacity: 0, y: 80, filter: blur(10px) → reveal)
  // ============================================================
  ;(function () {
    if (isReduced || !hasGSAP) return;

    // Hero visuals, map, decorative blocks, and data-reveal="float"
    document.querySelectorAll('.hero-visual, .contact-map, [data-reveal="float"]').forEach(function (el) {
      gsap.fromTo(el, {
        opacity: 0,
        y: 80,
        scale: 0.96,
        filter: 'blur(10px)'
      }, {
        opacity: 1,
        y: 0,
        scale: 1,
        filter: 'blur(0px)',
        duration: 1.2,
        ease: EASE,
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          toggleActions: 'play none none none',
          once: true
        }
      });
    });
  })();

  // ============================================================
  // 6. WIPE REVEAL — section background wipes in from left
  //    (Framer Motion "wipe" archetype:
  //     scaleX: 0, transformOrigin: left → scaleX: 1)
  // ============================================================
  ;(function () {
    if (isReduced || !hasGSAP) return;

    document.querySelectorAll('.dark-section').forEach(function (el) {
      // Don't double-add
      if (el.querySelector('.wipe-cover')) return;

      var cover = document.createElement('div');
      cover.className = 'wipe-cover';
      el.insertBefore(cover, el.firstChild);

      gsap.fromTo(cover, { scaleX: 1 }, {
        scaleX: 0,
        duration: 1.2,
        ease: EASE,
        scrollTrigger: {
          trigger: el,
          start: 'top 88%',
          toggleActions: 'play none none none',
          once: true
        }
      });
    });

    // Also support data-reveal="wipe" on arbitrary elements
    document.querySelectorAll('[data-reveal="wipe"]').forEach(function (el) {
      gsap.fromTo(el, { scaleX: 0 }, {
        scaleX: 1,
        transformOrigin: 'left',
        duration: 1.0,
        ease: EASE,
        scrollTrigger: {
          trigger: el,
          start: 'top 90%',
          toggleActions: 'play none none none',
          once: true
        }
      });
    });
  })();

  // ============================================================
  // 7. PARALLAX SCROLL LAYERS (GSAP ScrollTrigger scrub)
  // ============================================================
  ;(function () {
    if (isReduced || !hasGSAP) return;

    document.querySelectorAll('[data-parallax]').forEach(function (el) {
      var speed = parseFloat(el.getAttribute('data-parallax')) || 0.15;
      gsap.to(el, {
        y: function () { return window.innerHeight * speed * 0.3; },
        ease: 'none',
        scrollTrigger: {
          trigger: el,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1.5
        }
      });
    });

    // Hero shapes parallax
    document.querySelectorAll('.hero-shape-1, .hero-shape-2, .hero-shape-3').forEach(function (el) {
      gsap.to(el, {
        y: function () { return window.innerHeight * 0.12; },
        ease: 'none',
        scrollTrigger: {
          trigger: el.closest('.hero') || document.body,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1.2
        }
      });
    });
  })();

  // ============================================================
  // 8. MAGNETIC BUTTONS — smooth cursor follow
  // ============================================================
  ;(function () {
    if (isReduced) return;
    var btns = document.querySelectorAll('.btn');
    if (!btns.length) return;

    btns.forEach(function (btn) {
      btn.addEventListener('mousemove', function (e) {
        var rect = btn.getBoundingClientRect();
        var x = e.clientX - rect.left - rect.width / 2;
        var y = e.clientY - rect.top - rect.height / 2;
        var dist = Math.sqrt(x * x + y * y);
        var maxDist = Math.max(rect.width, rect.height);
        var strength = Math.min(1, dist / (maxDist / 2));
        var pull = 10 * (1 - strength);
        btn.style.transform = 'translate(' + (x / (rect.width / 2) * pull) + 'px, ' + (y / (rect.height / 2) * pull) + 'px)';
      });

      btn.addEventListener('mouseleave', function () {
        btn.style.transform = '';
      });
    });
  })();

  // ============================================================
  // 9. 3D TILT ON HOVER (cards)
  // ============================================================
  ;(function () {
    if (isReduced) return;
    var cards = document.querySelectorAll('.tilt-card');
    if (!cards.length) return;

    cards.forEach(function (card) {
      card.addEventListener('mousemove', function (e) {
        var rect = card.getBoundingClientRect();
        var x = (e.clientX - rect.left) / rect.width;
        var y = (e.clientY - rect.top) / rect.height;
        var tiltX = (y - 0.5) * -12;
        var tiltY = (x - 0.5) * 12;
        card.style.transform = 'perspective(800px) rotateX(' + tiltX + 'deg) rotateY(' + tiltY + 'deg) translateZ(4px)';
      });

      card.addEventListener('mouseleave', function () {
        card.style.transform = '';
      });
    });
  })();

  // ============================================================
  // 10. CURSOR GLOW
  // ============================================================
  ;(function () {
    if (isReduced) return;
    var glow = document.querySelector('.cursor-glow');
    if (!glow) {
      glow = document.createElement('div');
      glow.className = 'cursor-glow';
      document.body.appendChild(glow);
    }

    var timer;
    document.addEventListener('mousemove', function (e) {
      glow.style.opacity = '1';
      glow.style.left = e.clientX + 'px';
      glow.style.top = e.clientY + 'px';
      clearTimeout(timer);
      timer = setTimeout(function () { glow.style.opacity = '0'; }, 3000);
    });

    document.addEventListener('mouseleave', function () {
      glow.style.opacity = '0';
    });
  })();

  // ============================================================
  // 11. SCROLL PROGRESS BAR
  // ============================================================
  ;(function () {
    if (isReduced) return;
    var bar = document.querySelector('.scroll-progress');
    if (!bar) {
      bar = document.createElement('div');
      bar.className = 'scroll-progress';
      document.body.appendChild(bar);
    }
    function updateBar() {
      var scrollTop = window.scrollY || window.pageYOffset;
      var docHeight = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.transform = 'scaleX(' + (docHeight > 0 ? scrollTop / docHeight : 0) + ')';
    }
    window.addEventListener('scroll', updateBar, { passive: true });
    updateBar();
  })();

  // ============================================================
  // 12. PARTICLE CANVAS (Hero)
  // ============================================================
  ;(function () {
    if (isReduced) return;
    var hero = document.querySelector('.hero');
    if (!hero) return;
    if (hero.querySelector('#particle-canvas')) return;

    var canvas = document.createElement('canvas');
    canvas.id = 'particle-canvas';
    canvas.style.cssText = 'position:absolute;inset:0;z-index:0;pointer-events:none;';
    hero.insertBefore(canvas, hero.firstChild);

    var ctx = canvas.getContext('2d');
    var W, H;
    var particles = [];
    var MAX = 45;
    var colors = ['12,214,231', '54,124,255', '123,97,255'];

    function resize() {
      W = canvas.width = hero.offsetWidth;
      H = canvas.height = hero.offsetHeight;
    }

    function createParticle() {
      return {
        x: Math.random() * W,
        y: Math.random() * H,
        r: 1.5 + Math.random() * 3,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4 - 0.15,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 0.15 + Math.random() * 0.35,
        life: Math.random(),
        lifeSpeed: 0.004 + Math.random() * 0.006
      };
    }

    for (var i = 0; i < MAX; i++) particles.push(createParticle());

    function draw() {
      ctx.clearRect(0, 0, W, H);
      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life += p.lifeSpeed;
        if (p.life > 1) p.life = 0;
        var fade = Math.sin(p.life * Math.PI);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(' + p.color + ',' + (p.alpha * fade) + ')';
        ctx.fill();
        // Connection lines
        for (var j = i + 1; j < particles.length; j++) {
          var p2 = particles[j];
          var dx = p.x - p2.x;
          var dy = p.y - p2.y;
          var dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 150) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = 'rgba(12,214,231,' + (0.03 * (1 - dist / 150)) + ')';
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
        // Wrap
        if (p.x < -10) p.x = W + 10;
        if (p.x > W + 10) p.x = -10;
        if (p.y < -10) p.y = H + 10;
        if (p.y > H + 10) p.y = -10;
      }
      requestAnimationFrame(draw);
    }

    resize();
    draw();
    window.addEventListener('resize', resize);
  })();

  // ============================================================
  // 13. COUNTER ANIMATION
  // ============================================================
  ;(function () {
    var counters = document.querySelectorAll('.stat-number');
    counters.forEach(function (el) {
      var target = parseFloat(el.getAttribute('data-target')) || 0;
      var suffix = el.getAttribute('data-suffix') || '';
      var prefix = el.getAttribute('data-prefix') || '';
      var duration = 2200;

      function animateCounter(entry) {
        if (!entry.isIntersecting) return;
        var startTime = performance.now();

        function update(now) {
          var t = Math.min((now - startTime) / duration, 1);
          var eased;
          if (t < 0.8) {
            eased = t / 0.8 * 0.9;
          } else {
            var p = (t - 0.8) / 0.2;
            eased = 0.9 + 0.1 * (1 - Math.pow(1 - p, 3));
          }
          var val = target * eased;
          if (t < 1) {
            el.textContent = prefix + Math.round(val).toLocaleString() + suffix;
            requestAnimationFrame(update);
          } else {
            el.textContent = prefix + Math.round(target).toLocaleString() + suffix;
          }
        }

        requestAnimationFrame(update);
        co.unobserve(el);
      }

      var co = new IntersectionObserver(function (entries) {
        entries.forEach(animateCounter);
      }, { threshold: 0.4 });
      co.observe(el);
    });
  })();

  // ============================================================
  // 14. NAV SCROLL BEHAVIOR
  // ============================================================
  ;(function () {
    var nav = document.querySelector('.nav');
    if (!nav) return;

    function updateNav() {
      nav.classList.toggle('nav-scrolled', window.scrollY > 50);
    }

    window.addEventListener('scroll', updateNav, { passive: true });
    updateNav();
  })();

  // ============================================================
  // 15. MOBILE NAV TOGGLE
  // ============================================================
  ;(function () {
    var toggle = document.querySelector('.nav-toggle');
    var navLinks = document.querySelector('.nav-links');
    if (!toggle || !navLinks) return;

    toggle.addEventListener('click', function () {
      navLinks.classList.toggle('open');
    });

    navLinks.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { navLinks.classList.remove('open'); });
    });

    document.addEventListener('click', function (e) {
      if (!e.target.closest('.nav-inner')) navLinks.classList.remove('open');
    });
  })();

  // ============================================================
  // 16. MARQUEE DUPLICATE
  // ============================================================
  ;(function () {
    var marquees = document.querySelectorAll('.marquee');
    marquees.forEach(function (m) {
      if (m.parentNode.querySelectorAll('.marquee').length === 1) {
        var clone = m.cloneNode(true);
        m.parentNode.appendChild(clone);
      }
    });
  })();

  // ============================================================
  // 17. SMOOTH SCROLL FOR ANCHOR LINKS (with Lenis)
  // ============================================================
  ;(function () {
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        var target = document.querySelector(this.getAttribute('href'));
        if (target) {
          e.preventDefault();
          window.scrollTo({
            top: target.getBoundingClientRect().top + window.scrollY - 80,
            behavior: 'smooth'
          });
        }
      });
    });
  })();

  // ============================================================
  // 18. FORM INTERACTIONS
  // ============================================================
  ;(function () {
    var form = document.querySelector('form');
    if (!form) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var btn = form.querySelector('button[type="submit"]');
      if (btn) {
        var original = btn.textContent;
        btn.textContent = '✓ Sent!';
        btn.style.background = '#22c55e';
        setTimeout(function () {
          btn.textContent = original;
          btn.style.background = '';
        }, 2500);
      }
    });

    document.querySelectorAll('.form-control').forEach(function (input) {
      input.addEventListener('focus', function () {
        this.style.borderColor = 'var(--accent)';
        this.style.boxShadow = '0 0 24px rgba(18,214,231,0.12)';
      });
      input.addEventListener('blur', function () {
        if (!this.value) {
          this.style.borderColor = '';
          this.style.boxShadow = '';
        }
      });
    });
  })();

  // ============================================================
  // 19. MASONRY LAYOUT FIX
  // ============================================================
  ;(function () {
    var masonry = document.querySelector('.masonry');
    if (!masonry) return;
    function fixMasonry() {
      masonry.style.transform = 'scale(1)';
    }
    window.addEventListener('resize', fixMasonry);
  })();

  // ============================================================
  // 20. PRICING TIER HOVER — scale featured properly
  // ============================================================
  ;(function () {
    if (!hasGSAP || isReduced) return;

    document.querySelectorAll('.pricing-tier').forEach(function (tier) {
      tier.addEventListener('mouseenter', function () {
        if (tier.classList.contains('featured')) {
          gsap.to(tier, { scale: 1.06, duration: 0.4, ease: 'power2.out' });
        }
      });
      tier.addEventListener('mouseleave', function () {
        if (tier.classList.contains('featured')) {
          gsap.to(tier, { scale: 1.04, duration: 0.4, ease: 'power2.out' });
        }
      });
    });
  })();

  // ============================================================
  // 21. GLASS CARD — magnetic learn link
  // ============================================================
  ;(function () {
    if (isReduced) return;

    document.querySelectorAll('.glass-card').forEach(function (card) {
      var link = card.querySelector('.learn-link');
      if (!link) return;
      card.addEventListener('mousemove', function (e) {
        var rect = card.getBoundingClientRect();
        var x = e.clientX - rect.left;
        var y = e.clientY - rect.top;
        var cx = rect.width / 2;
        var cy = rect.height / 2;
        var dx = (x - cx) / cx;
        var dy = (y - cy) / cy;
        var dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 0.85) {
          var intensity = 1 - dist;
          link.style.transform = 'translate(' + (dx * 6 * intensity) + 'px, ' + (dy * 4 * intensity) + 'px)';
        }
      });
      card.addEventListener('mouseleave', function () {
        link.style.transform = 'translate(0, 0)';
      });
    });
  })();

  // ============================================================
  // 22. REFRESH ScrollTrigger after layout settles
  // ============================================================
  if (hasGSAP) {
    setTimeout(function () { ScrollTrigger.refresh(); }, 400);
    window.addEventListener('load', function () { ScrollTrigger.refresh(); });
  }

});
