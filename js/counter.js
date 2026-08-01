/* ============================================================
   THE BHUBANESWAR CREW — counter.js
   ------------------------------------------------------------
   Animated number counters for the community stats section.

   Each element with the class `.counter` is animated from 0 to
   its `data-target` value when it scrolls into view, with an
   optional `data-suffix` (e.g. "+") appended afterwards.

   Example markup:
     <span class="counter" data-target="1000" data-suffix="+">0</span>

   Behaviour:
   01. Animate only once, when first visible
   02. Eased counting (easeOutCubic) over ~2 seconds
   03. Instant final value if reduced-motion is preferred
   04. Safe fallback if IntersectionObserver is unavailable
   ------------------------------------------------------------
   Depends on: jQuery 3.x (used for DOM helpers).
   ============================================================ */

(function ($) {
  'use strict';

  var counters   = document.querySelectorAll('.counter');
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!counters.length) {
    return;
  }

  /* ==========================================================
     01. ANIMATE A SINGLE COUNTER
     Uses requestAnimationFrame with an easeOutCubic curve for
     a satisfying deceleration at the end of the count.
     ========================================================== */
  function animateCounter($el) {
    var target = parseInt($el.attr('data-target'), 10) || 0;
    var suffix = $el.attr('data-suffix') || '';
    var duration = 2000; /* ms */
    var startTime = null;

    function easeOutCubic(t) {
      /* 1 - (1 - t)^3 — fast start, gentle finish */
      return 1 - Math.pow(1 - t, 3);
    }

    function format(value) {
      /* Add a comma separator for numbers >= 1000 (e.g. 1,000) */
      return value.toLocaleString('en-IN') + suffix;
    }

    function step(timestamp) {
      if (startTime === null) {
        startTime = timestamp;
      }

      var progress = Math.min((timestamp - startTime) / duration, 1);
      var eased = easeOutCubic(progress);
      var value = Math.round(target * eased);

      $el.text(format(value));

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    }

    requestAnimationFrame(step);
  }

  /* ==========================================================
     02. REVEAL LOGIC
     ========================================================== */
  function revealCounter(el) {
    var $el = $(el);

    if (reducedMotion) {
      /* Instantly show the final value when reduced motion is set */
      $el.text((parseInt($el.attr('data-target'), 10) || 0).toLocaleString('en-IN') + ($el.attr('data-suffix') || ''));
      return;
    }

    animateCounter($el);
  }

  /* ---- Modern browsers: animate when the counter scrolls in ---- */
  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          revealCounter(entry.target);
          observer.unobserve(entry.target); /* run only once */
        }
      });
    }, {
      threshold: 0.4
    });

    counters.forEach(function (el) {
      observer.observe(el);
    });
  } else {
    /* ---- Older browsers: set final values straight away ---- */
    counters.forEach(function (el) {
      var $el = $(el);
      $el.text((parseInt($el.attr('data-target'), 10) || 0).toLocaleString('en-IN') + ($el.attr('data-suffix') || ''));
    });
  }

})(jQuery);
