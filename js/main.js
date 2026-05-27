/* ============================================================
   TMH — Cinematic Animation System
   GSAP ScrollTrigger · ScrollSmoother · Text splits ·
   Hero timeline · Stagger grids · Parallax · Magnetic ·
   3D tilt · Three.js particles
   ============================================================ */

// Hover-device detection — only devices with real hover get :hover effects
(function () {
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    document.documentElement.classList.add('hover-device');
  }
})();

document.addEventListener('DOMContentLoaded', function () {
  'use strict';

  var isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isHoverDevice = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var hasGSAP = typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined';
  if (hasGSAP) document.documentElement.classList.add('gsap-active');
  // Safety timeout: if gsap-active elements are still invisible after 3s,
  // remove the class so CSS hidden rules no longer apply. This prevents
  // permanent invisibility when ScrollTrigger fails to fire on mobile.
  setTimeout(function () {
    if (document.documentElement.classList.contains('gsap-active')) {
      var hiddenCount = document.querySelectorAll('.reveal, .gsap-hidden, .stagger-item').length;
      var visibleCount = 0;
      document.querySelectorAll('.reveal, .gsap-hidden, .stagger-item').forEach(function (el) {
        var style = window.getComputedStyle(el);
        if (parseFloat(style.opacity) > 0.1) visibleCount++;
      });
      // If fewer than 20% of hidden elements have become visible, force-show everything
      if (hiddenCount > 0 && visibleCount / hiddenCount < 0.2) {
        document.documentElement.classList.remove('gsap-active');
      }
    }
  }, 3000);
  var EASE = 'power4.out';
  var EASE_SPRING = 'back.out(1.4)';
  var DURATION = 0.9;

  // ============================================================
  // 0. SCROLL SMOOTHER — GSAP native smooth scroll
  // ============================================================
  ;(function () {
    if (isReduced || typeof ScrollSmoother === 'undefined' || !hasGSAP) return;

    var wrapper = document.getElementById('smooth-wrapper');
    var content = document.getElementById('smooth-content');
    if (!wrapper || !content) return;

    ScrollSmoother.create({
      wrapper: wrapper,
      content: content,
      smooth: 1.2,
      effects: true
    });
  })();

  // ============================================================
  // 1A. THREE.JS — WebGL particle torus-knot (hero background)
  // ============================================================
  ;(function () {
    if (isReduced || typeof THREE === 'undefined') return;
    var canvas = document.getElementById('webgl-canvas');
    if (!canvas || canvas.querySelector('canvas')) return;

    var scene = new THREE.Scene();
    var w = window.innerWidth;
    var h = window.innerHeight;
    var camera = new THREE.PerspectiveCamera(60, w / h, 0.1, 100);
    camera.position.z = 26;

    var renderer = new THREE.WebGLRenderer({
      alpha: true, antialias: true
    });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0); // transparent background
    canvas.appendChild(renderer.domElement);

    var KNOT_COUNT = 5000;
    var BG_COUNT = 1500;
    var TOTAL = KNOT_COUNT + BG_COUNT;
    var positions = new Float32Array(TOTAL * 3);
    var colors = new Float32Array(TOTAL * 3);

    var R = 7.5, r = 2.4;

    // Torus-knot particles (cyan-blue)
    for (var i = 0; i < KNOT_COUNT; i++) {
      var t = Math.random() * 2 * Math.PI;
      var theta = t * 2;
      var phi = t * 3;
      var cx = (R + r * Math.cos(phi)) * Math.cos(theta);
      var cy = (R + r * Math.cos(phi)) * Math.sin(theta);
      var cz = r * Math.sin(phi);
      var n = 0.4 + Math.random() * 1.0;
      positions[i * 3] = cx + (Math.random() - 0.5) * n;
      positions[i * 3 + 1] = cy + (Math.random() - 0.5) * n;
      positions[i * 3 + 2] = cz + (Math.random() - 0.5) * n;

      var mix = Math.random();
      colors[i * 3] = 0.05 + 0.12 * mix;       // R: 0.05-0.17
      colors[i * 3 + 1] = 0.78 + 0.22 * (1 - mix); // G: 0.78-1.0
      colors[i * 3 + 2] = 0.88 + 0.12 * mix;      // B: 0.88-1.0
    }

    // Ambient background particles (dimmer, scattered)
    for (var j = 0; j < BG_COUNT; j++) {
      var idx = (KNOT_COUNT + j) * 3;
      var radius = 5 + Math.random() * 18;
      var theta2 = Math.random() * 2 * Math.PI;
      var phi2 = Math.acos(2 * Math.random() - 1);
      positions[idx] = radius * Math.sin(phi2) * Math.cos(theta2);
      positions[idx + 1] = radius * Math.sin(phi2) * Math.sin(theta2);
      positions[idx + 2] = radius * Math.cos(phi2);

      var dim = 0.15 + Math.random() * 0.35;
      colors[idx] = 0.04 * dim;
      colors[idx + 1] = 0.50 * dim;
      colors[idx + 2] = 0.70 * dim;
    }

    var geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geom.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    var mat = new THREE.PointsMaterial({
      size: 0.28,
      vertexColors: true,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true
    });

    var pts = new THREE.Points(geom, mat);
    scene.add(pts);

    var mouseX = 0, mouseY = 0;
    var curX = 0, curY = 0;

    function onMove(e) {
      mouseX = (e.clientX / window.innerWidth) * 2 - 1;
      mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
    }
    canvas.addEventListener('mousemove', onMove);

    function animate() {
      requestAnimationFrame(animate);
      curX += (mouseX - curX) * 0.03;
      curY += (mouseY - curY) * 0.03;
      pts.rotation.x += 0.0004 + curY * 0.0025;
      pts.rotation.y += 0.0008 + curX * 0.0025;
      renderer.render(scene, camera);
    }
    animate();

    function resize() {
      var nw = window.innerWidth;
      var nh = window.innerHeight;
      if (nw === 0 || nh === 0) return;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    }
    window.addEventListener('resize', resize);
    setTimeout(resize, 300);

    // Log success for debugging
    console.log('TMH WebGL: ' + TOTAL + ' particles initialized');
  })();

  // ============================================================
  // 1B. HERO LOAD SEQUENCE (cinematic timeline)
  // ============================================================
  ;(function () {
    if (isReduced || !hasGSAP) return;

    var hero = document.querySelector('.hero');
    if (!hero) return;

    var tl = gsap.timeline({
      defaults: { ease: EASE, duration: DURATION }
    });

    // 1a. Badge slides down
    tl.fromTo('.hero-badge', { opacity: 0, y: -18 }, { opacity: 1, y: 0, duration: 0.5 }, 0.15);

    // 1b. Headline word-by-word reveal
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

    // 1c. Subheadline fades + lifts
    tl.fromTo('.hero p', { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.6 }, '-=0.15');

    // 1d. CTA buttons scale in
    tl.fromTo('.hero-actions a', {
      opacity: 0, scale: 0.92
    }, {
      opacity: 1, scale: 1,
      duration: 0.55,
      stagger: 0.1,
      ease: EASE_SPRING
    }, '-=0.25');

    // 1e. Right-column cards float in (GPU-safe: opacity + x only)
    tl.fromTo('.hero-card-1', {
      opacity: 0, x: 40
    }, {
      opacity: 1, x: 0,
      duration: 0.9,
      ease: EASE
    }, '-=0.1');
    tl.fromTo('.hero-card-2', {
      opacity: 0, x: -30
    }, {
      opacity: 1, x: 0,
      duration: 0.9,
      ease: EASE
    }, '-=0.05');
  })();

  // ============================================================
  // 2. SCROLL REVEALS — Framer Motion–style sections with weight
  // ============================================================
  // NOTE: Section-level fromTo was REMOVED because it set ALL sections
  // to opacity:0 before ScrollTrigger fired. On mobile, this masked
  // child .reveal animations (parent_opacity × child_opacity = 0),
  // making every page except the footer invisible. Child .reveal
  // and [data-gsap="fade-lift"] animations handle entrances instead.
  ;(function () {
    if (isReduced || !hasGSAP) return;

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

    // Reveal classes — text, labels, headings, timeline items, etc.
    // Each .reveal element gets its own ScrollTrigger with variant-
    // specific from state. This prevents the "invisible content" bug
    // where .reveal { opacity: 0 } in CSS had no GSAP animation to
    // undo it — content stayed invisible on every page.
    var revealClasses = '.reveal, .reveal-spring, .reveal-scale, .reveal-left, .reveal-right';
    document.querySelectorAll(revealClasses).forEach(function (el) {
      var from;
      if (el.classList.contains('reveal-spring')) from = { opacity: 0, y: 50, scale: 0.97 };
      else if (el.classList.contains('reveal-scale')) from = { opacity: 0, scale: 0.92 };
      else if (el.classList.contains('reveal-left')) from = { opacity: 0, x: -60 };
      else if (el.classList.contains('reveal-right')) from = { opacity: 0, x: 60 };
      else from = { opacity: 0, y: 40 };

      var delay = parseFloat(el.getAttribute('data-delay')) || 0;
      gsap.fromTo(el, from, {
        opacity: 1, y: 0, x: 0, scale: 1,
        duration: 0.9,
        delay: delay,
        ease: EASE,
        scrollTrigger: {
          trigger: el,
          start: 'top 88%',
          toggleActions: 'play none none none',
          once: true
        }
      });
    });

    // GSAP-hidden classes — same pattern for inline fade-lift elements
    document.querySelectorAll('.gsap-hidden, .gsap-hidden-left, .gsap-hidden-right, .gsap-hidden-scale').forEach(function (el) {
      var from;
      if (el.classList.contains('gsap-hidden-left')) from = { opacity: 0, x: -40 };
      else if (el.classList.contains('gsap-hidden-right')) from = { opacity: 0, x: 40 };
      else if (el.classList.contains('gsap-hidden-scale')) from = { opacity: 0, scale: 0.92 };
      else from = { opacity: 0, y: 50 };

      gsap.fromTo(el, from, {
        opacity: 1, y: 0, x: 0, scale: 1,
        duration: 0.9,
        ease: EASE,
        scrollTrigger: {
          trigger: el,
          start: 'top 88%',
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
    // GPU-safe: only transform and opacity
    document.querySelectorAll('.contact-map, [data-reveal="float"]').forEach(function (el) {
      gsap.fromTo(el, {
        opacity: 0,
        y: 80,
        scale: 0.96
      }, {
        opacity: 1,
        y: 0,
        scale: 1,
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

  })();

  // ============================================================
  // 8. MAGNETIC BUTTONS — smooth cursor follow (hover devices only)
  // ============================================================
  ;(function () {
    if (isReduced || !isHoverDevice) return;
    var btns = document.querySelectorAll('.btn');
    if (!btns.length) return;

    var magData = [];
    var magRaf = null;

    btns.forEach(function (btn, i) {
      magData[i] = { dx: 0, dy: 0, active: false };
      btn.addEventListener('mousemove', function (e) {
        var rect = btn.getBoundingClientRect();
        var x = e.clientX - rect.left - rect.width / 2;
        var y = e.clientY - rect.top - rect.height / 2;
        var dist = Math.sqrt(x * x + y * y);
        var maxDist = Math.max(rect.width, rect.height);
        var strength = Math.min(1, dist / (maxDist / 2));
        var pull = 10 * (1 - strength);
        magData[i].dx = (x / (rect.width / 2) * pull);
        magData[i].dy = (y / (rect.height / 2) * pull);
        magData[i].active = true;
        if (!magRaf) {
          magRaf = requestAnimationFrame(function magFlush() {
            magRaf = null;
            for (var j = 0; j < magData.length; j++) {
              if (magData[j].active) {
                btns[j].style.transform = 'translate(' + magData[j].dx + 'px, ' + magData[j].dy + 'px)';
                magData[j].active = false;
              }
            }
          });
        }
      });

      btn.addEventListener('mouseleave', function () {
        magData[i].active = false;
        btn.style.transform = '';
      });
    });
  })();

  // ============================================================
  // 9. 3D TILT ON HOVER (cards) — hover devices only
  // ============================================================
  ;(function () {
    if (isReduced || !isHoverDevice) return;
    var cards = document.querySelectorAll('.tilt-card');
    if (!cards.length) return;

    var tiltData = [];
    var tiltRaf = null;

    cards.forEach(function (card, i) {
      tiltData[i] = { x: 0, y: 0, active: false };
      card.addEventListener('mousemove', function (e) {
        var rect = card.getBoundingClientRect();
        tiltData[i].x = (e.clientX - rect.left) / rect.width;
        tiltData[i].y = (e.clientY - rect.top) / rect.height;
        tiltData[i].active = true;
        if (!tiltRaf) {
          tiltRaf = requestAnimationFrame(function tiltFlush() {
            tiltRaf = null;
            for (var j = 0; j < tiltData.length; j++) {
              if (tiltData[j].active) {
                var p = tiltData[j];
                var tx = (p.y - 0.5) * -12;
                var ty = (p.x - 0.5) * 12;
                cards[j].style.transform = 'perspective(800px) rotateX(' + tx + 'deg) rotateY(' + ty + 'deg) translateZ(4px)';
                tiltData[j].active = false;
              }
            }
          });
        }
      });

      card.addEventListener('mouseleave', function () {
        tiltData[i].active = false;
        card.style.transform = '';
      });
    });
  })();

  // ============================================================
  // 10. CURSOR GLOW — hover devices only
  // ============================================================
  ;(function () {
    if (isReduced || !isHoverDevice) return;
    var glow = document.querySelector('.cursor-glow');
    if (!glow) {
      glow = document.createElement('div');
      glow.className = 'cursor-glow';
      document.body.appendChild(glow);
    }

    var glowX = -200, glowY = -200, glowRaf = null;
    var timer;
    document.addEventListener('mousemove', function (e) {
      glowX = e.clientX;
      glowY = e.clientY;
      clearTimeout(timer);
      timer = setTimeout(function () { glow.style.opacity = '0'; }, 3000);
      if (!glowRaf) {
        glowRaf = requestAnimationFrame(function () {
          glowRaf = null;
          glow.style.opacity = '1';
          glow.style.left = glowX + 'px';
          glow.style.top = glowY + 'px';
        });
      }
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
  // 12. FLASHLIGHT CURSOR — radial gradient follows mouse in hero
  // ============================================================
  ;(function () {
    if (isReduced || !isHoverDevice) return;
    var hero = document.querySelector('.hero');
    var light = document.getElementById('heroFlashlight');
    if (!hero || !light) return;

    var lx = 0.5, ly = 0.5;
    var raf = null;

    hero.addEventListener('mousemove', function (e) {
      var rect = hero.getBoundingClientRect();
      lx = (e.clientX - rect.left) / rect.width;
      ly = (e.clientY - rect.top) / rect.height;
      if (!raf) {
        raf = requestAnimationFrame(function () {
          raf = null;
          var cx = lx * 100;
          var cy = ly * 100;
          light.style.background = 'radial-gradient(600px circle at ' + cx + '% ' + cy + '%, rgba(18,214,231,0.12), rgba(123,97,255,0.04) 40%, transparent 65%)';
        });
      }
    });
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
  // 17. SMOOTH SCROLL FOR ANCHOR LINKS
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
    if (!hasGSAP || isReduced || !isHoverDevice) return;

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
  // 21. GLASS CARD — magnetic learn link (hover devices only)
  // ============================================================
  ;(function () {
    if (isReduced || !isHoverDevice) return;

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
