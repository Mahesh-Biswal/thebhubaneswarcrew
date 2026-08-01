/* ============================================================
   THE BHUBANESWAR CREW — animation.js
   ------------------------------------------------------------
   Visual effects & scroll-triggered animations:

   01. Reveal-on-scroll (IntersectionObserver + [data-animate])
   02. Cursor glow that trails the mouse (desktop only)
   03. Hero particle network canvas
   04. Hero parallax (mouse + scroll)
   ------------------------------------------------------------
   Depends on: jQuery 3.x (used for brevity where convenient).
   All effects gracefully disable for reduced-motion / touch.
   ============================================================ */

(function ($) {
  'use strict';

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ==========================================================
     01. REVEAL-ON-SCROLL
     Every element with a `data-animate` attribute is hidden by
     animations.css until it enters the viewport, then gets the
     `.is-visible` class. `data-delay` staggers the animation.
     ========================================================== */
  function initRevealOnScroll() {
    var elements = document.querySelectorAll('[data-animate]');

    if (!('IntersectionObserver' in window)) {
      /* Older browsers: just reveal everything immediately */
      elements.forEach(function (el) {
        el.classList.add('is-visible');
      });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var el = entry.target;

          /* Apply the stagger delay from the data-delay attribute */
          var delay = parseInt(el.getAttribute('data-delay'), 10);
          if (delay) {
            el.style.setProperty('--anim-delay', delay + 'ms');
          }

          el.classList.add('is-visible');
          observer.unobserve(el);
        }
      });
    }, {
      threshold: 0.12,
      rootMargin: '0px 0px -60px 0px'
    });

    elements.forEach(function (el) {
      observer.observe(el);
    });
  }

  /* ==========================================================
     02. CURSOR GLOW
     A soft radial light smoothly trails the mouse pointer.
     Runs on a requestAnimationFrame loop with easing (lerp)
     so the movement feels premium and fluid.
     ========================================================== */
  function initCursorGlow() {
    var glow = document.getElementById('cursorGlow');
    var hero = document.querySelector('.hero');

    /* Skip on touch devices or when reduced motion is preferred */
    if (!glow || prefersReducedMotion || !window.matchMedia('(hover: hover)').matches) {
      return;
    }

    var targetX = 0;
    var targetY = 0;
    var currentX = 0;
    var currentY = 0;
    var isActive = false;

    $(document).on('mousemove', function (event) {
      targetX = event.clientX;
      targetY = event.clientY;

      if (!isActive) {
        isActive = true;
        currentX = targetX;
        currentY = targetY;
        glow.classList.add('is-active');
      }
    });

    /* Fade the glow out when the pointer leaves the window */
    $(document).on('mouseleave', function () {
      isActive = false;
      glow.classList.remove('is-active');
    });

    /* Only animate the glow while the hero is on screen */
    var heroVisible = true;
    if (hero && 'IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        heroVisible = entries[0].isIntersecting;
      }, { threshold: 0 }).observe(hero);
    }

    (function cursorLoop() {
      /* Ease current position toward the target */
      currentX += (targetX - currentX) * 0.08;
      currentY += (targetY - currentY) * 0.08;

      if (isActive && heroVisible) {
        glow.style.transform = 'translate3d(' + currentX + 'px,' + currentY + 'px,0)';
      }

      requestAnimationFrame(cursorLoop);
    })();
  }

  /* ==========================================================
     03. HERO PARTICLE NETWORK
     A canvas of drifting particles connected by thin lines.
     Particles gently drift away from the mouse pointer.
     The loop pauses when the hero leaves the viewport.
     ========================================================== */
  function initParticles() {
    var canvas = document.getElementById('particleCanvas');
    if (!canvas) {
      return;
    }

    var ctx = canvas.getContext('2d');
    if (!ctx) {
      return;
    }

    var particles = [];
    var mouse = { x: null, y: null };
    var animationId = null;
    var running = true;

    /* Particle / line colour — derived from the brand accents */
    var COLORS = ['rgba(0,210,255,', 'rgba(59,130,246,', 'rgba(125,211,252,'];
    var LINK_DISTANCE = 130;
    var MOUSE_RADIUS = 150;

    /* ---- Resize the canvas to match the hero size ---- */
    function resizeCanvas() {
      var rect = canvas.parentElement.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    }

    /* ---- Create particles once, scaled to the hero area ---- */
    function createParticles() {
      var area = canvas.width * canvas.height;
      var count = Math.min(80, Math.max(24, Math.round(area / 14000)));

      particles = [];
      for (var i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.35,
          vy: (Math.random() - 0.5) * 0.35,
          r: Math.random() * 1.6 + 0.6,
          color: COLORS[Math.floor(Math.random() * COLORS.length)]
        });
      }
    }

    /* ---- Draw one animation frame ---- */
    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      /* Update + draw each particle */
      particles.forEach(function (p) {
        /* Mouse repulsion */
        if (mouse.x !== null) {
          var dx = p.x - mouse.x;
          var dy = p.y - mouse.y;
          var dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < MOUSE_RADIUS) {
            var force = (MOUSE_RADIUS - dist) / MOUSE_RADIUS;
            p.x += (dx / dist) * force * 1.4;
            p.y += (dy / dist) * force * 1.4;
          }
        }

        /* Movement + edge wrap */
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) { p.x = canvas.width; }
        if (p.x > canvas.width) { p.x = 0; }
        if (p.y < 0) { p.y = canvas.height; }
        if (p.y > canvas.height) { p.y = 0; }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color + '0.8)';
        ctx.fill();
      });

      /* Connecting lines between close particles */
      for (var i = 0; i < particles.length; i++) {
        for (var j = i + 1; j < particles.length; j++) {
          var a = particles[i];
          var b = particles[j];
          var dx = a.x - b.x;
          var dy = a.y - b.y;
          var dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < LINK_DISTANCE) {
            var alpha = (1 - dist / LINK_DISTANCE) * 0.16;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = 'rgba(0, 210, 255, ' + alpha + ')';
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }
    }

    /* ---- Animation loop (pauses off-screen) ---- */
    function loop() {
      if (!running) {
        return;
      }
      draw();
      animationId = requestAnimationFrame(loop);
    }

    function start() {
      if (animationId === null && !prefersReducedMotion) {
        loop();
      }
    }

    function stop() {
      if (animationId !== null) {
        cancelAnimationFrame(animationId);
        animationId = null;
      }
    }

    /* Pause/resume based on hero visibility */
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        if (entries[0].isIntersecting) {
          running = true;
          start();
        } else {
          running = false;
          stop();
        }
      }, { threshold: 0 }).observe(canvas);
    }

    /* Mouse tracking only works on devices with a pointer */
    if (window.matchMedia('(hover: hover)').matches) {
      $(canvas).on('mousemove', function (event) {
        var rect = canvas.getBoundingClientRect();
        mouse.x = event.clientX - rect.left;
        mouse.y = event.clientY - rect.top;
      });
      $(canvas).on('mouseleave', function () {
        mouse.x = null;
        mouse.y = null;
      });
    }

    /* Keep everything in sync on resize */
    $(window).on('resize', function () {
      resizeCanvas();
      createParticles();
      /* Redraw one static frame while off-screen for clarity */
      if (animationId === null) {
        draw();
      }
    });

    resizeCanvas();
    createParticles();

    /* Reduced motion: draw a single static frame, never animate */
    if (prefersReducedMotion) {
      draw();
    } else {
      start();
    }
  }

  /* ==========================================================
     04. HERO PARALLAX
     The hero content reacts subtly to the mouse and drifts
     upward with a gentle fade as the user scrolls away.
     ========================================================== */
  function initHeroParallax() {
    var content = document.querySelector('.hero-content');
    var hero = document.querySelector('.hero');

    if (!content || !hero || prefersReducedMotion || !window.matchMedia('(hover: hover)').matches) {
      return;
    }

    var mouseX = 0;
    var mouseY = 0;
    var currentX = 0;
    var currentY = 0;

    $(hero).on('mousemove', function (event) {
      var rect = hero.getBoundingClientRect();
      /* Normalize pointer position to -1..1 relative to the hero center */
      mouseX = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
      mouseY = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
    });

    $(hero).on('mouseleave', function () {
      mouseX = 0;
      mouseY = 0;
    });

    (function parallaxLoop() {
      currentX += (mouseX - currentX) * 0.05;
      currentY += (mouseY - currentY) * 0.05;

      /* Combine mouse parallax + scroll drift + fade out */
      var scrollY = $(window).scrollTop();
      var drift = Math.min(scrollY, 400) * 0.25;

      content.style.transform =
        'translate3d(' + (currentX * 14) + 'px,' + (currentY * 10 - drift) + 'px,0)';
      content.style.opacity = String(Math.max(1 - scrollY / 620, 0));

      requestAnimationFrame(parallaxLoop);
    })();
  }

  /* ==========================================================
     INIT — start everything when the DOM is ready
     ========================================================== */
  $(function () {
    initRevealOnScroll();
    initCursorGlow();
    initParticles();
    initHeroParallax();
  });

})(jQuery);
