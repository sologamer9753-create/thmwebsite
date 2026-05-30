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
  // 0. LENIS — Smooth scroll (lightweight, zero wrapper req.)
  // ============================================================
  ;(function () {
    if (isReduced || typeof Lenis === 'undefined') return;

    var lenis = new Lenis({
      duration: 1.2,
      easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); },
      smooth: true,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Store globally for anchor-link scrolling
    window.__lenis = lenis;

    if (hasGSAP) {
      lenis.on('scroll', ScrollTrigger.update);
    }
  })();

  // ============================================================
  // 1A. THREE.JS — WebGL particle morph: Torus Knot → Cube
  // ============================================================
  ;(function () {
    if (isReduced || typeof THREE === 'undefined') return;
    var canvas = document.getElementById('webgl-canvas');
    if (!canvas || canvas.querySelector('canvas')) return;

    var particleCount = 5000;

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
    renderer.setClearColor(0x000000, 0);
    canvas.appendChild(renderer.domElement);

    // Shape A: Torus Knot — exactly 5000 vertices
    var knotGeom = new THREE.TorusKnotGeometry(6, 2, 199, 24);
    var knotPos = knotGeom.attributes.position.array;

    // Shape B: Box (segmented) — trim to particleCount
    var boxGeom = new THREE.BoxGeometry(12, 12, 12, 28, 28, 28);
    var boxPos = boxGeom.attributes.position.array;
    var boxCount = boxPos.length / 3;

    var positions = new Float32Array(particleCount * 3);
    var morphPos = new Float32Array(particleCount * 3);

    for (var i = 0; i < particleCount; i++) {
      var i3 = i * 3;
      positions[i3]     = knotPos[i3]     + (Math.random() - 0.5) * 0.6;
      positions[i3 + 1] = knotPos[i3 + 1] + (Math.random() - 0.5) * 0.6;
      positions[i3 + 2] = knotPos[i3 + 2] + (Math.random() - 0.5) * 0.6;
      var bi = (i % boxCount) * 3;
      morphPos[i3]     = boxPos[bi];
      morphPos[i3 + 1] = boxPos[bi + 1];
      morphPos[i3 + 2] = boxPos[bi + 2];
    }

    var geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geom.morphAttributes = {};
    geom.morphAttributes.position = [
      new THREE.BufferAttribute(morphPos, 3)
    ];

    var mat = new THREE.PointsMaterial({
      size: 0.15,
      color: 0x12D6E7,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true,
      morphTargets: true
    });

    var pts = new THREE.Points(geom, mat);
    pts.morphTargetInfluences = [0];
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
      pts.rotation.x += 0.001 + curY * 0.0025;
      pts.rotation.y += 0.001 + curX * 0.0025;
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

    // GSAP ScrollTrigger: morph Torus Knot → Cube on scroll
    if (hasGSAP && typeof ScrollTrigger !== 'undefined') {
      gsap.to(pts.morphTargetInfluences, {
        0: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: document.body,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 1.5
        }
      });
    }

    console.log('TMH WebGL: ' + particleCount + ' particles (morph: torus → cube)');
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
  // 9. 3D TILT ON HOVER (cards) & CURSOR SPOTLIGHT TRACKING
  // ============================================================
  ;(function () {
    if (isReduced) return;
    var cards = document.querySelectorAll('.tilt-card');
    if (!cards.length) return;

    var tiltData = [];
    var tiltRaf = null;

    cards.forEach(function (card, i) {
      // 1. Mouse/Cursor interactions (desktop)
      if (isHoverDevice) {
        tiltData[i] = { x: 0, y: 0, active: false };
        
        card.addEventListener('mousemove', function (e) {
          var rect = card.getBoundingClientRect();
          var px = (e.clientX - rect.left) / rect.width;
          var py = (e.clientY - rect.top) / rect.height;
          
          // Track relative cursor position for spotlight gradient in CSS
          card.style.setProperty('--mouse-x', (e.clientX - rect.left) + 'px');
          card.style.setProperty('--mouse-y', (e.clientY - rect.top) + 'px');
          
          tiltData[i].x = px;
          tiltData[i].y = py;
          tiltData[i].active = true;
          
          if (!tiltRaf) {
            tiltRaf = requestAnimationFrame(function tiltFlush() {
              tiltRaf = null;
              for (var j = 0; j < tiltData.length; j++) {
                if (tiltData[j].active) {
                  var p = tiltData[j];
                  var tx = (p.y - 0.5) * -16; // Up to 16 deg rotation
                  var ty = (p.x - 0.5) * 16;
                  // Combine translate, scale, and rotation seamlessly!
                  cards[j].style.transform = 'perspective(1000px) translateY(-8px) scale(1.03) rotateX(' + tx + 'deg) rotateY(' + ty + 'deg)';
                  tiltData[j].active = false;
                }
              }
            });
          }
        });

        card.addEventListener('mouseleave', function () {
          tiltData[i].active = false;
          card.style.transform = '';
          // Smoothly clear spotlight variables
          card.style.removeProperty('--mouse-x');
          card.style.removeProperty('--mouse-y');
        });
      }

      // 2. Touch interactions (mobile/tablet)
      card.addEventListener('touchstart', function (e) {
        var touch = e.touches[0];
        var rect = card.getBoundingClientRect();
        card.style.setProperty('--mouse-x', (touch.clientX - rect.left) + 'px');
        card.style.setProperty('--mouse-y', (touch.clientY - rect.top) + 'px');
      }, { passive: true });

      card.addEventListener('touchmove', function (e) {
        var touch = e.touches[0];
        var rect = card.getBoundingClientRect();
        card.style.setProperty('--mouse-x', (touch.clientX - rect.left) + 'px');
        card.style.setProperty('--mouse-y', (touch.clientY - rect.top) + 'px');
      }, { passive: true });
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
  // 14. NAV SCROLL BEHAVIOR — rAF-optimized hide/reveal
  // ============================================================
  ;(function () {
    var nav = document.querySelector('.nav');
    if (!nav) return;
    var lastScrollY = 0;
    var threshold = 100;
    var ticking = false;

    function updateNav() {
      var currentY = window.scrollY;
      var isMobileOpen = document.querySelector('.nav-links.open');

      if (isMobileOpen) {
        nav.style.transform = 'translateY(0)';
      } else if (currentY > threshold && currentY > lastScrollY) {
        nav.style.transform = 'translateY(-100%)';
      } else {
        nav.style.transform = 'translateY(0)';
      }

      lastScrollY = currentY;
      ticking = false;
    }

    function onScroll() {
      if (!ticking) {
        requestAnimationFrame(updateNav);
        ticking = true;
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    updateNav();
  })();

  // ============================================================
  // 15. MOBILE NAV TOGGLE
  // ============================================================
  ;(function () {
    var toggle = document.querySelector('.nav-toggle');
    var navLinks = document.querySelector('.nav-links');
    var nav = document.querySelector('.nav');
    if (!toggle || !navLinks) return;

    function updateScrollLock(open) {
      if (open) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
    }

    toggle.addEventListener('click', function () {
      var opening = !navLinks.classList.contains('open');
      navLinks.classList.toggle('open');
      updateScrollLock(opening);
      // When opening mobile menu, ensure nav is visible
      if (opening && nav) nav.style.transform = 'translateY(0)';
    });

    navLinks.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        navLinks.classList.remove('open');
        updateScrollLock(false);
      });
    });

    document.addEventListener('click', function (e) {
      if (!e.target.closest('.nav-inner')) {
        navLinks.classList.remove('open');
        updateScrollLock(false);
      }
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
  // 22. FOOTER MOTION AND MICRO-INTERACTIONS
  // ============================================================
  ;(function () {
    var footer = document.querySelector('.footer');
    if (!footer) return;

    if (!isReduced) {
      footer.classList.add('footer-animate-ready');

      // Helper to show the footer (idempotent)
      var showFooter = function () {
        if (!footer.classList.contains('footer-in-view')) {
          footer.classList.add('footer-in-view');
        }
      };

      if ('IntersectionObserver' in window) {
        var footerObserver = new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              showFooter();
              footerObserver.disconnect();
            }
          });
        }, { threshold: 0.01 }); // Fire when just 1% visible
        footerObserver.observe(footer);
      } else {
        showFooter();
      }

      // Failsafe: force footer visible after 3 seconds no matter what
      setTimeout(showFooter, 3000);
    } else {
      footer.classList.add('footer-in-view');
    }

    if (!isReduced && isHoverDevice) {
      var footerRaf = null;
      var footerX = 50;
      var footerY = 20;

      footer.addEventListener('mousemove', function (e) {
        var rect = footer.getBoundingClientRect();
        footerX = ((e.clientX - rect.left) / rect.width) * 100;
        footerY = ((e.clientY - rect.top) / rect.height) * 100;

        if (!footerRaf) {
          footerRaf = requestAnimationFrame(function () {
            footerRaf = null;
            var tiltY = (footerX - 50) * 0.035;
            var tiltX = (50 - footerY) * 0.025;
            footer.style.setProperty('--footer-x', footerX.toFixed(2) + '%');
            footer.style.setProperty('--footer-y', footerY.toFixed(2) + '%');
            footer.style.setProperty('--footer-tilt-x', tiltX.toFixed(2) + 'deg');
            footer.style.setProperty('--footer-tilt-y', tiltY.toFixed(2) + 'deg');
          });
        }
      });

      footer.addEventListener('mouseleave', function () {
        footer.style.setProperty('--footer-x', '50%');
        footer.style.setProperty('--footer-y', '20%');
        footer.style.setProperty('--footer-tilt-x', '0deg');
        footer.style.setProperty('--footer-tilt-y', '0deg');
      });
    }

    footer.querySelectorAll('.footer-newsletter').forEach(function (newsletter) {
      var input = newsletter.querySelector('input[type="email"]');
      var btn = newsletter.querySelector('button');
      if (!input || !btn) return;

      btn.addEventListener('click', function () {
        newsletter.classList.remove('is-error', 'is-success');

        if (!input.value || !input.checkValidity()) {
          newsletter.classList.add('is-error');
          input.focus();
          setTimeout(function () { newsletter.classList.remove('is-error'); }, 1300);
          return;
        }

        var original = btn.textContent;
        newsletter.classList.add('is-success');
        btn.textContent = 'Subscribed';
        input.value = '';

        setTimeout(function () {
          btn.textContent = original;
          newsletter.classList.remove('is-success');
        }, 2200);
      });
    });
  })();

  // ============================================================
  // 23. INTERACTIVE CLIENT NETWORK SYSTEM
  // ============================================================
  ;(function () {
    var container = document.querySelector('.client-network');
    if (!container) return;

    var wrapper = document.querySelector('.client-network-wrapper');
    var svg = container.querySelector('.client-network-lines');
    var core = container.querySelector('.network-core');
    var nodes = container.querySelectorAll('.network-node');
    var threads = container.querySelectorAll('.network-thread');

    if (!core || nodes.length === 0) return;

    // Center scroll on mobile devices so user starts at the middle (TMH)
    if (wrapper) {
      wrapper.scrollLeft = (container.offsetWidth - wrapper.clientWidth) / 2;
    }

    var width = container.offsetWidth;
    var height = container.offsetHeight;

    // Robust variable parser
    var getStyleVal = function (el, prop) {
      var val = el.style.getPropertyValue(prop);
      if (!val && el.style.cssText) {
        var match = new RegExp(prop + '\\s*:\\s*([^;\\s]+)').exec(el.style.cssText);
        if (match) val = match[1];
      }
      return parseFloat(val) || 50;
    };

    // Node state tracking
    var nodeData = [];
    nodes.forEach(function (node, index) {
      var xPct = getStyleVal(node, '--x');
      var yPct = getStyleVal(node, '--y');

      // Base position in pixels relative to container
      var baseX = (xPct / 100) * width;
      var baseY = (yPct / 100) * height;

      nodeData.push({
        el: node,
        threadEl: threads[index],
        baseX: baseX,
        baseY: baseY,
        x: baseX,
        y: baseY,
        vx: 0,
        vy: 0,
        floatSeedX: Math.random() * 100,
        floatSeedY: Math.random() * 100,
        floatSpeed: 0.0008 + Math.random() * 0.0006,
        isHovered: false
      });

      // Handle hover interactions
      node.addEventListener('mouseenter', function () {
        nodeData[index].isHovered = true;
        node.classList.add('active');
        if (nodeData[index].threadEl) {
          nodeData[index].threadEl.classList.add('active', 'pulse');
        }
      });

      node.addEventListener('mouseleave', function () {
        nodeData[index].isHovered = false;
        node.classList.remove('active');
        if (nodeData[index].threadEl) {
          nodeData[index].threadEl.classList.remove('active', 'pulse');
        }
      });
    });

    // Core position
    var coreX = width / 2;
    var coreY = height / 2;

    // Track mouse coordinates relative to container
    var mouseX = null;
    var mouseY = null;

    container.addEventListener('mousemove', function (e) {
      var rect = container.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
    });

    container.addEventListener('mouseleave', function () {
      mouseX = null;
      mouseY = null;
    });

    // Touch support for dragging nodes slightly & scrolling on mobile
    var startTouchX = 0;
    var startTouchY = 0;
    var startScrollLeft = 0;
    var isDraggingCanvas = false;

    container.addEventListener('touchstart', function (e) {
      if (e.touches.length === 1) {
        var touch = e.touches[0];
        var targetNode = e.target.closest('.network-node') || e.target.closest('.network-core');
        if (!targetNode) {
          isDraggingCanvas = true;
          startTouchX = touch.clientX;
          startTouchY = touch.clientY;
          if (wrapper) {
            startScrollLeft = wrapper.scrollLeft;
          }
        } else {
          // Touch on a node: trigger hover-like state
          nodes.forEach(function (n) { n.classList.remove('active'); });
          threads.forEach(function (t) { t.classList.remove('active', 'pulse'); });
          
          var idx = Array.prototype.indexOf.call(nodes, targetNode);
          if (idx !== -1) {
            nodeData[idx].isHovered = true;
            targetNode.classList.add('active');
            if (nodeData[idx].threadEl) {
              nodeData[idx].threadEl.classList.add('active', 'pulse');
            }
            setTimeout(function () {
              nodeData[idx].isHovered = false;
              targetNode.classList.remove('active');
              if (nodeData[idx].threadEl) {
                nodeData[idx].threadEl.classList.remove('active', 'pulse');
              }
            }, 2500); // highlight for 2.5s
          }
        }
      }
    }, { passive: true });

    container.addEventListener('touchmove', function (e) {
      if (isDraggingCanvas && e.touches.length === 1 && wrapper) {
        var touch = e.touches[0];
        var dx = touch.clientX - startTouchX;
        wrapper.scrollLeft = startScrollLeft - dx;
      }
    }, { passive: true });

    container.addEventListener('touchend', function () {
      isDraggingCanvas = false;
    });

    // Update dimensions on resize
    window.addEventListener('resize', function () {
      width = container.offsetWidth;
      height = container.offsetHeight;
      coreX = width / 2;
      coreY = height / 2;
      
      nodes.forEach(function (node, index) {
        var xPct = getStyleVal(node, '--x');
        var yPct = getStyleVal(node, '--y');
        nodeData[index].baseX = (xPct / 100) * width;
        nodeData[index].baseY = (yPct / 100) * height;
      });
    });

    var time = 0;
    function animateNetwork() {
      time = performance.now();

      // Core heartbeat scale (match the CSS animation scale for exact positioning)
      var coreScale = 1 + 0.04 * Math.sin(time * 0.003) * 0.5;

      nodeData.forEach(function (node, i) {
        // 1. Gently float/bob
        var floatX = Math.sin(time * node.floatSpeed + node.floatSeedX) * 12;
        var floatY = Math.cos(time * (node.floatSpeed * 1.2) + node.floatSeedY) * 12;

        // 2. Mouse attraction / repulsion
        var pushX = 0;
        var pushY = 0;
        if (mouseX !== null && mouseY !== null) {
          var dx = node.x - mouseX;
          var dy = node.y - mouseY;
          var dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist < 180) {
            // Push away slightly (repulsion)
            var force = (1 - dist / 180) * 22;
            pushX = (dx / (dist || 1)) * force;
            pushY = (dy / (dist || 1)) * force;
          }
        }

        // Target position
        var targetX = node.baseX + floatX + pushX;
        var targetY = node.baseY + floatY + pushY;

        // Spring physics interpolation for smooth motion
        node.vx += (targetX - node.x) * 0.08;
        node.vy += (targetY - node.y) * 0.08;
        node.vx *= 0.75; // damping
        node.vy *= 0.75;

        node.x += node.vx;
        node.y += node.vy;

        // Update DOM transform
        var offsetX = node.x - node.baseX;
        var offsetY = node.y - node.baseY;
        node.el.style.transform = 'translate(-50%, -50%) translate3d(' + offsetX.toFixed(1) + 'px, ' + offsetY.toFixed(1) + 'px, 0)';

        // 3. Draw curved SVG thread connecting core to node
        if (node.threadEl) {
          // Calculate start point on core boundary
          var angle = Math.atan2(node.y - coreY, node.x - coreX);
          // Core radius is 80px (since core width is 160px), adjusted for scale
          var coreRadius = 80 * coreScale;
          var startX = coreX + Math.cos(angle) * coreRadius;
          var startY = coreY + Math.sin(angle) * coreRadius;

          // End point on node boundary (approximate offset)
          var endX = node.x - Math.cos(angle) * 10;
          var endY = node.y - Math.sin(angle) * 10;

          // Bezier control points for wavy connection
          var dx = endX - startX;
          var dy = endY - startY;
          var L = Math.sqrt(dx * dx + dy * dy);
          
          // Perpendicular vector for wave offset
          var nx = -dy / (L || 1);
          var ny = dx / (L || 1);

          // Wave amplitude wiggles dynamically over time
          var wiggleFreq = 0.0022;
          var wiggleAmp = 0.16 + 0.04 * Math.sin(time * wiggleFreq + i * 1.5);
          var offsetDist = L * wiggleAmp;

          var cp1x = startX + dx * 0.33 + nx * offsetDist;
          var cp1y = startY + dy * 0.33 + ny * offsetDist;
          var cp2x = startX + dx * 0.67 - nx * offsetDist;
          var cp2y = startY + dy * 0.67 - ny * offsetDist;

          // S-curve Bezier path description
          var d = 'M' + startX.toFixed(1) + ',' + startY.toFixed(1) + 
                  ' C' + cp1x.toFixed(1) + ',' + cp1y.toFixed(1) + 
                  ' ' + cp2x.toFixed(1) + ',' + cp2y.toFixed(1) + 
                  ' ' + endX.toFixed(1) + ',' + endY.toFixed(1);
          
          node.threadEl.setAttribute('d', d);
        }
      });

      requestAnimationFrame(animateNetwork);
    }

    // Start animation loop
    requestAnimationFrame(animateNetwork);
  })();

  // ============================================================
  // 24. REFRESH ScrollTrigger after layout settles
  // ============================================================
  if (hasGSAP) {
    setTimeout(function () { ScrollTrigger.refresh(); }, 400);
    window.addEventListener('load', function () { ScrollTrigger.refresh(); });
  }

});

  // ============================================================
  // 24. SERVICES CLICK-TO-EXPAND & TYPEWRITER
  // ============================================================
  ;(function () {
    var serviceCards = document.querySelectorAll('.service-card');
    if (!serviceCards.length) return;

    // Typewriter state
    var typingIntervals = new Map();

    function typeText(container, text) {
      container.innerHTML = '<span class="typewriter-cursor"></span>';
      var cursor = container.querySelector('.typewriter-cursor');
      var i = 0;
      
      var interval = setInterval(function() {
        if (i < text.length) {
          var charSpan = document.createElement('span');
          charSpan.textContent = text.charAt(i);
          container.insertBefore(charSpan, cursor);
          i++;
        } else {
          clearInterval(interval);
        }
      }, 20); // 20ms per char for smooth fast typing
      
      return interval;
    }

    serviceCards.forEach(function(card) {
      card.addEventListener('click', function(e) {
        var isExpanded = card.classList.contains('expanded');
        
        // Close all cards first
        serviceCards.forEach(function(c) {
          c.classList.remove('expanded');
          var textContainer = c.querySelector('.typewriter-text');
          if (textContainer) {
            // Stop any ongoing typing
            var existingInterval = typingIntervals.get(c);
            if (existingInterval) clearInterval(existingInterval);
            textContainer.innerHTML = '';
          }
        });

        // If it wasn't expanded before, expand it now
        if (!isExpanded) {
          card.classList.add('expanded');
          var textContainer = card.querySelector('.typewriter-text');
          if (textContainer) {
            var fullText = textContainer.getAttribute('data-text') || '';
            var interval = typeText(textContainer, fullText);
            typingIntervals.set(card, interval);
          }
        }
      });
    });
  })();
