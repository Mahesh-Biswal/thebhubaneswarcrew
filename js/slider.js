/* ============================================================
   THE BHUBANESWAR CREW — slider.js
   ------------------------------------------------------------
   Auto-sliding testimonial carousel (#testimonialSlider).

   01. Auto-advance every 5 seconds
   02. Dot navigation (clickable, keyboard-accessible)
   03. Pause while the pointer hovers over the slider
   04. Pause when the slider is off-screen (performance)
   05. Basic touch/swipe support on mobile
   ------------------------------------------------------------
   Depends on: jQuery 3.x
   ============================================================ */

(function ($) {
  'use strict';

  var $slider   = $('#testimonialSlider');
  var $track    = $('#testimonialTrack');
  var $dots     = $slider.find('.testimonial-dot');
  var $slides   = $track.children('.testimonial-card');

  /* No slider on this page? Do nothing. */
  if (!$slider.length || !$slides.length) {
    return;
  }

  var currentIndex  = 0;
  var slideCount    = $slides.length;
  var autoplayDelay = 5000;   /* ms between slides */
  var autoplayTimer = null;
  var isPaused      = false;  /* hover / visibility pause */

  /* ==========================================================
     01. SLIDE TRANSITION
     Slides are laid out in a row; we translate the track by
     the index times 100% so exactly one slide is shown.
     ========================================================== */
  function goToSlide(index) {
    /* Wrap-around */
    currentIndex = (index + slideCount) % slideCount;

    $track.css('transform', 'translateX(' + (-currentIndex * 100) + '%)');

    /* Keep dots in sync */
    $dots.each(function (i) {
      var isActive = i === currentIndex;
      $(this).toggleClass('is-active', isActive);
      $(this).attr('aria-selected', String(isActive));
    });
  }

  function nextSlide() {
    goToSlide(currentIndex + 1);
  }

  /* ==========================================================
     02. AUTOPLAY
     ========================================================== */
  function startAutoplay() {
    stopAutoplay();
    autoplayTimer = setInterval(nextSlide, autoplayDelay);
  }

  function stopAutoplay() {
    if (autoplayTimer) {
      clearInterval(autoplayTimer);
      autoplayTimer = null;
    }
  }

  /* ==========================================================
     03. DOT NAVIGATION
     ========================================================== */
  $dots.on('click', function () {
    goToSlide($dots.index(this));
    restartAutoplay();
  });

  /* ==========================================================
     04. PAUSE ON HOVER
     ========================================================== */
  $slider.on('mouseenter touchstart', function () {
    isPaused = true;
    stopAutoplay();
  });

  $slider.on('mouseleave touchend', function () {
    isPaused = false;
    if ($sliderIsVisible) {
      startAutoplay();
    }
  });

  /* ==========================================================
     05. PAUSE WHEN OFF-SCREEN
     The slider only animates while it can actually be seen.
     ========================================================== */
  var $sliderIsVisible = true;

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      $sliderIsVisible = entries[0].isIntersecting;

      if ($sliderIsVisible && !isPaused) {
        startAutoplay();
      } else {
        stopAutoplay();
      }
    }, { threshold: 0.25 }).observe($slider[0]);
  }

  /* ==========================================================
     06. TOUCH SWIPE SUPPORT
     ========================================================== */
  var startX = null;
  var SWIPE_THRESHOLD = 45; /* px */

  $track.on('touchstart', function (event) {
    startX = event.originalEvent.touches[0].clientX;
  });

  $track.on('touchend', function (event) {
    if (startX === null) {
      return;
    }
    var endX = event.originalEvent.changedTouches[0].clientX;
    var delta = startX - endX;

    if (delta > SWIPE_THRESHOLD) {
      nextSlide();
      restartAutoplay();
    } else if (delta < -SWIPE_THRESHOLD) {
      goToSlide(currentIndex - 1);
      restartAutoplay();
    }

    startX = null;
  });

  /* ==========================================================
     HELPER + INIT
     ========================================================== */
  function restartAutoplay() {
    if (!$sliderIsVisible || isPaused) {
      return;
    }
    startAutoplay();
  }

  /* Respect users who prefer reduced motion: no auto sliding */
  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  goToSlide(0);

  if (!prefersReducedMotion) {
    startAutoplay();
  }

})(jQuery);
